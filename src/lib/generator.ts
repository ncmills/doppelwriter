import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";
import { CLAUDE_MODEL } from "./models";

const client = new Anthropic();

// Optimal temperature for style-matched writing
const STYLE_TEMPERATURE = 0.7;

const VOICE_GENERATION_PREAMBLE = `You are ghostwriting as a specific author. Every sentence you write must be indistinguishable from their own work. Do NOT write like a generic AI. Do NOT use words like "delve", "tapestry", "multifaceted", "landscape", "moreover", "furthermore", "in conclusion", or any corporate/academic filler. Write like a HUMAN — specifically, the human described below.

Match their exact patterns: sentence rhythm, word choices, punctuation habits, paragraph structure, tone, personality. If they use em dashes, you use em dashes. If they write short punchy sentences, you write short punchy sentences. If they're funny, be funny. If they're formal, be formal.

Here is the author's voice profile:

`;

function applyVoiceOverrides(prompt: string, overrides: Record<string, number>): string {
  if (!overrides || Object.keys(overrides).length === 0) return prompt;
  const mods: string[] = [];
  if (overrides.formality !== undefined && overrides.formality !== 5)
    mods.push(overrides.formality > 5
      ? `Write MORE formally. Formality: ${overrides.formality}/10.`
      : `Write MORE casually. Formality: ${overrides.formality}/10.`);
  if (overrides.sentence_length !== undefined && overrides.sentence_length !== 5)
    mods.push(overrides.sentence_length > 5
      ? `Use LONGER, more complex sentences.`
      : `Use SHORTER, punchier sentences.`);
  if (overrides.creativity !== undefined && overrides.creativity !== 5)
    mods.push(overrides.creativity > 5
      ? `Be MORE creative and metaphorical.`
      : `Be MORE literal and restrained.`);
  if (overrides.humor !== undefined && overrides.humor !== 5)
    mods.push(overrides.humor > 5 ? `Inject MORE humor and wit.` : `Be MORE serious. Less humor.`);
  if (overrides.emotion !== undefined && overrides.emotion !== 5)
    mods.push(overrides.emotion > 5 ? `Be MORE emotionally expressive.` : `Be MORE detached and analytical.`);
  return mods.length > 0 ? prompt + "\n\n═══ USER VOICE ADJUSTMENTS ═══\n" + mods.join("\n") : prompt;
}

async function getSystemPrompt(profileId: number): Promise<string> {
  const db = sql();
  const rows = await db`
    SELECT system_prompt, name, voice_overrides FROM style_profiles WHERE id = ${profileId}
  `;
  const overrides = rows[0]?.voice_overrides || {};
  const basePrompt = rows[0]?.system_prompt
    ? VOICE_GENERATION_PREAMBLE + rows[0].system_prompt
    : VOICE_GENERATION_PREAMBLE + `Author: ${rows[0]?.name || "Unknown"}

STYLE RULES:
Write in short, direct sentences when they serve the point. Use active voice.
Choose concrete words over abstract ones. Let verbs do the work, not nouns.
Vary sentence length for rhythm — short sentences for impact, longer ones for flow.`;

  return applyVoiceOverrides(basePrompt, overrides);
}

export async function* generateDraft(
  brief: string,
  profileId: number,
  options: {
    wordCount?: number;
    instructions?: string;
    researchContext?: string;
  } = {}
): AsyncGenerator<string> {
  const systemPrompt = await getSystemPrompt(profileId);
  const targetWords = options.wordCount || 500;

  // For longer pieces (>800 words), use chunked generation with style reinforcement
  if (targetWords > 800) {
    yield* generateLongForm(brief, systemPrompt, options);
    return;
  }

  let userMessage = `Write a first draft based on this brief. Write ONLY the draft — no meta-commentary, no preamble, no sign-off.

BRIEF: ${brief}`;

  if (options.researchContext) {
    userMessage += `\n\nRESEARCH CONTEXT (use as source material, incorporate naturally):\n${options.researchContext}`;
  }
  if (options.wordCount) {
    userMessage += `\n\nTARGET LENGTH: ~${options.wordCount} words.`;
  }
  if (options.instructions) {
    userMessage += `\n\nADDITIONAL INSTRUCTIONS: ${options.instructions}`;
  }

  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    temperature: STYLE_TEMPERATURE,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

// Chunked generation for long-form content — prevents voice drift
// Research shows voice degrades after ~800 tokens without reinforcement
async function* generateLongForm(
  brief: string,
  systemPrompt: string,
  options: { wordCount?: number; instructions?: string; researchContext?: string }
): AsyncGenerator<string> {
  const targetWords = options.wordCount || 1500;

  // Step 1: Generate an outline
  const outlineResponse = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    temperature: 0.5,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Plan a ${targetWords}-word piece on this topic. Return ONLY a numbered list of 3-6 section headings/points, each with a 1-sentence description of what to cover. No prose, just the outline.

TOPIC: ${brief}
${options.instructions ? `\nINSTRUCTIONS: ${options.instructions}` : ""}
${options.researchContext ? `\nRESEARCH CONTEXT: ${options.researchContext.slice(0, 2000)}` : ""}`,
      },
    ],
  });

  const outline = outlineResponse.content[0].type === "text" ? outlineResponse.content[0].text : "";

  // Step 2: Generate each section with fresh style reinforcement
  const sections = outline.split("\n").filter((line) => line.trim().match(/^\d/));
  const wordsPerSection = Math.round(targetWords / Math.max(sections.length, 1));

  let previousText = "";

  for (let i = 0; i < sections.length; i++) {
    const isFirst = i === 0;
    const isLast = i === sections.length - 1;

    const sectionPrompt = isFirst
      ? `Write the opening section (~${wordsPerSection} words) for a piece about: ${brief}

This section covers: ${sections[i]}

Write ONLY this section. Open strong in the author's voice. No titles or headers unless the style calls for them.`
      : isLast
        ? `Continue and conclude this piece. You've written so far:

"${previousText.slice(-500)}"

This final section covers: ${sections[i]}

Write ~${wordsPerSection} words. Close in the author's voice. Write ONLY the continuation — do not repeat what came before.`
        : `Continue this piece. You've written so far:

"${previousText.slice(-500)}"

This next section covers: ${sections[i]}

Write ~${wordsPerSection} words. Maintain the voice and flow. Write ONLY the continuation — do not repeat what came before.`;

    const stream = client.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      temperature: STYLE_TEMPERATURE,
      system: systemPrompt, // Fresh style context for each chunk
      messages: [{ role: "user", content: sectionPrompt }],
    });

    let sectionText = "";
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        sectionText += event.delta.text;
        yield event.delta.text;
      }
    }

    // Only keep the tail — we use slice(-500) in prompts anyway, so no need
    // to accumulate the full text in memory for long pieces
    previousText = (previousText + sectionText).slice(-1500);

    // Add paragraph break between sections (unless the model already did)
    if (!sectionText.endsWith("\n\n") && !isLast) {
      yield "\n\n";
      previousText += "\n\n";
    }
  }
}

export async function research(query: string): Promise<string> {
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Research this topic. Provide key facts, data points, and context useful for writing about it. Be thorough and factual. Structure as bullet points grouped by subtopic.\n\nTopic: ${query}`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
