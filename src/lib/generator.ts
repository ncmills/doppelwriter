import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "./models";
import { getVoiceSystemPrompt } from "./voice-prompt";

const client = new Anthropic();

// Optimal temperature for style-matched writing
const STYLE_TEMPERATURE = 0.7;

export async function* generateDraft(
  brief: string,
  profileId: number,
  options: {
    wordCount?: number;
    instructions?: string;
    researchContext?: string;
  } = {}
): AsyncGenerator<string> {
  const systemPrompt = await getVoiceSystemPrompt(profileId, "generate");
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
    system: [
      { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
    ],
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

  // Step 1: Generate an outline (neutral prompt — outlining is structural, not voice work)
  const outlineResponse = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    temperature: 0.5,
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

"${previousText.slice(-1200)}"

This final section covers: ${sections[i]}

Write ~${wordsPerSection} words. Close in the author's voice. Write ONLY the continuation — do not repeat what came before.`
        : `Continue this piece. You've written so far:

"${previousText.slice(-1200)}"

This next section covers: ${sections[i]}

Write ~${wordsPerSection} words. Maintain the voice and flow. Write ONLY the continuation — do not repeat what came before.`;

    const stream = client.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      temperature: STYLE_TEMPERATURE,
      system: [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
      ],
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
    // Low temperature for research — minimize hallucinations of facts/figures
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: `Research this topic. Provide key facts, data points, and context useful for writing about it. Be thorough and factual. Structure as bullet points grouped by subtopic.\n\nTopic: ${query}`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
