import Anthropic from "@anthropic-ai/sdk";
import { diffWords } from "diff";
import { sql } from "./db";
import { CLAUDE_MODEL } from "./models";

const client = new Anthropic();

// Optimal temperature for style-matched writing (research: 0.6-0.8 sweet spot)
const STYLE_TEMPERATURE = 0.7;

export interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function computeDiff(original: string, edited: string): DiffChunk[] {
  return diffWords(original, edited).map((part) => ({
    value: part.value,
    added: part.added || undefined,
    removed: part.removed || undefined,
  }));
}

const VOICE_TRANSFORM_PREAMBLE = `CRITICAL INSTRUCTION: You are a voice transformation engine. When given text to edit, you must AGGRESSIVELY rewrite it so the output reads as if the author described below wrote it from scratch. This is NOT light editing. You must:

1. REPLACE generic/bland word choices with words this author would actually use
2. RESTRUCTURE sentences to match this author's rhythm — their sentence lengths, cadence, and flow
3. CHANGE paragraph structure to match their style — how they open, build, and close paragraphs
4. ADD the author's characteristic phrases, constructions, and quirks where they naturally fit
5. REMOVE anything this author would never write — corporate language, clichés, AI-isms
6. TRANSFORM the tone to match the author's personality — formal/casual, serious/playful, etc.

The IDEAS and FACTS should stay the same. The VOICE must completely change. Every sentence should sound like this specific author wrote it. If the input reads like generic corporate writing and the author writes punchy conversational prose, the output should be punchy conversational prose.

Here is the author's voice profile:

`;

function applyVoiceOverrides(prompt: string, overrides: Record<string, number>): string {
  if (!overrides || Object.keys(overrides).length === 0) return prompt;

  const mods: string[] = [];
  if (overrides.formality !== undefined && overrides.formality !== 5) {
    mods.push(overrides.formality > 5
      ? `OVERRIDE: Write MORE formally than the base profile. Formality level: ${overrides.formality}/10.`
      : `OVERRIDE: Write MORE casually than the base profile. Formality level: ${overrides.formality}/10.`);
  }
  if (overrides.sentence_length !== undefined && overrides.sentence_length !== 5) {
    mods.push(overrides.sentence_length > 5
      ? `OVERRIDE: Use LONGER sentences than the base profile suggests. Favor flowing, complex constructions.`
      : `OVERRIDE: Use SHORTER sentences than the base profile suggests. Be more punchy and direct.`);
  }
  if (overrides.creativity !== undefined && overrides.creativity !== 5) {
    mods.push(overrides.creativity > 5
      ? `OVERRIDE: Be MORE creative and metaphorical than the base profile. Use more vivid imagery and unexpected word choices.`
      : `OVERRIDE: Be MORE restrained and literal than the base profile. Fewer metaphors, more direct expression.`);
  }
  if (overrides.humor !== undefined && overrides.humor !== 5) {
    mods.push(overrides.humor > 5
      ? `OVERRIDE: Inject MORE humor, wit, and levity than the base profile suggests.`
      : `OVERRIDE: Be MORE serious and measured than the base profile. Minimize humor.`);
  }
  if (overrides.emotion !== undefined && overrides.emotion !== 5) {
    mods.push(overrides.emotion > 5
      ? `OVERRIDE: Be MORE emotionally expressive and personal than the base profile.`
      : `OVERRIDE: Be MORE detached and analytical than the base profile. Less emotional expression.`);
  }

  return mods.length > 0 ? prompt + "\n\n═══ USER VOICE ADJUSTMENTS ═══\n" + mods.join("\n") : prompt;
}

async function getSystemPrompt(profileId: number): Promise<string> {
  const db = sql();
  const rows = await db`
    SELECT system_prompt, name, voice_overrides FROM style_profiles WHERE id = ${profileId}
  `;
  const overrides = rows[0]?.voice_overrides || {};
  const basePrompt = rows[0]?.system_prompt
    ? VOICE_TRANSFORM_PREAMBLE + rows[0].system_prompt
    : VOICE_TRANSFORM_PREAMBLE + `Author: ${rows[0]?.name || "Unknown"}

STYLE RULES:
Write in short, direct sentences when they serve the point. Use active voice.
Choose concrete words over abstract ones. Let verbs do the work, not nouns.
Vary sentence length for rhythm — short sentences for impact, longer ones for flow.`;

  return applyVoiceOverrides(basePrompt, overrides);
}

export async function* editDraft(
  draft: string,
  profileId: number,
  instructions?: string
): AsyncGenerator<string> {
  const systemPrompt = await getSystemPrompt(profileId);

  // Strip HTML tags if present (from .docx uploads) so the AI works with clean text
  const cleanDraft = draft.replace(/<[^>]+>/g, (tag) => {
    if (tag.match(/<br\s*\/?>/i)) return "\n";
    if (tag.match(/<\/?(p|div|h[1-6]|blockquote|li)\b/i)) return "\n";
    return "";
  }).replace(/\n{3,}/g, "\n\n").trim();

  const baseInstruction = `Transform this text into the author's voice. Keep the same ideas, but rewrite EVERY sentence. Change the word choices, sentence rhythms, paragraph structure, and tone to match the author's profile above.

Do NOT preserve the original phrasing. Do NOT keep sentences that don't sound like this author. Rewrite aggressively — the reader should not be able to tell this was ever written by someone else.${instructions ? `\n\nAdditional instructions: ${instructions}` : ""}

Return ONLY the rewritten text. No commentary, no explanations, no preamble.

---

${cleanDraft}`;

  const userMessage = baseInstruction;

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

export async function* reviseDraft(
  original: string,
  currentEdit: string,
  feedback: string,
  profileId: number
): AsyncGenerator<string> {
  const systemPrompt = await getSystemPrompt(profileId);

  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    temperature: STYLE_TEMPERATURE,
    system: systemPrompt,
    messages: [
      { role: "user", content: `Transform this text into the author's voice. Rewrite every sentence. Return ONLY the rewritten text:\n\n${original}` },
      { role: "assistant", content: currentEdit },
      { role: "user", content: `Revise based on this feedback: ${feedback}\n\nReturn ONLY the complete revised text. No commentary. Continue writing in the author's voice.` },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

// ── Edit Feedback Loop ──────────────────────────────────────────────────────

export async function recordCorrection(
  userId: string,
  profileId: number,
  aiOutput: string,
  userVersion: string,
  correctionType: "manual_edit" | "accept" | "revision_feedback",
  revisionFeedback?: string
): Promise<void> {
  if (!aiOutput || !userVersion) return;

  const db = sql();

  if (correctionType === "accept" && aiOutput === userVersion) {
    await db`
      INSERT INTO voice_corrections (user_id, profile_id, original_text, corrected_text, correction_type, lesson)
      VALUES (${userId}, ${profileId}, ${aiOutput.slice(0, 500)}, ${userVersion.slice(0, 500)}, 'accept', 'Output accepted as-is — voice was accurate')
    `;
    return;
  }

  let lesson = "";
  try {
    const analysis = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `A user edited AI-generated text. Analyze what they changed and WHY in 1-2 concise sentences. Focus on style preferences — what should the AI do differently next time?

Frame your lesson POSITIVELY (what TO do, not what to avoid). Example: "Use shorter, punchier sentences" instead of "Don't write long sentences."

AI WROTE: "${aiOutput.slice(0, 800)}"
USER CHANGED TO: "${userVersion.slice(0, 800)}"
${revisionFeedback ? `USER'S FEEDBACK: "${revisionFeedback}"` : ""}

Respond with ONLY the lesson. No preamble.`,
        },
      ],
    });
    lesson = analysis.content[0].type === "text" ? analysis.content[0].text : "";
  } catch (err) {
    console.error(`Lesson extraction failed for profile ${profileId}:`, err);
    lesson = revisionFeedback || "Manual edit recorded";
  }

  await db`
    INSERT INTO voice_corrections (user_id, profile_id, original_text, corrected_text, correction_type, lesson)
    VALUES (${userId}, ${profileId}, ${aiOutput.slice(0, 2000)}, ${userVersion.slice(0, 2000)}, ${correctionType}, ${lesson})
  `;
}

export async function getCorrectionsCount(userId: string, profileId: number): Promise<number> {
  const db = sql();
  const [row] = await db`
    SELECT COUNT(*)::int as count FROM voice_corrections
    WHERE user_id = ${userId} AND profile_id = ${profileId}
  `;
  return row?.count || 0;
}
