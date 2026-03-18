import Anthropic from "@anthropic-ai/sdk";
import { diffWords } from "diff";
import { sql } from "./db";

const client = new Anthropic();

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

async function getSystemPrompt(profileId: number): Promise<string> {
  const db = sql();
  const rows = await db`
    SELECT system_prompt, name FROM style_profiles WHERE id = ${profileId}
  `;
  if (rows[0]?.system_prompt) return rows[0].system_prompt;
  return `You are an expert editor. Improve the writing while preserving the author's voice and intent.

ANTI-AI-ISM RULES:
Never use "Moreover," "Furthermore," "Additionally," "In conclusion," "It's worth noting," "Delve," "Crucial," "Landscape," "Leverage."
Never over-explain. Prefer short sentences when they work. Use verbs, not nominalizations.`;
}

export async function* editDraft(
  draft: string,
  profileId: number,
  instructions?: string
): AsyncGenerator<string> {
  const systemPrompt = await getSystemPrompt(profileId);

  const userMessage = instructions
    ? `Edit this draft in the author's voice. Additional instructions: ${instructions}

Return ONLY the edited text. No commentary, no explanations, no "here's the edited version" preamble.

---

${draft}`
    : `Edit this draft in the author's voice. Improve clarity, flow, and impact while maintaining their exact style. Fix errors. Tighten loose sentences. Make it sound like THEM, not like AI.

Return ONLY the edited text. No commentary, no explanations, no preamble.

---

${draft}`;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
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
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      { role: "user", content: `Edit this draft in the author's voice. Return ONLY the edited text:\n\n${original}` },
      { role: "assistant", content: currentEdit },
      { role: "user", content: `Revise based on this feedback: ${feedback}\n\nReturn ONLY the complete revised text. No commentary.` },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

// ── Edit Feedback Loop ──────────────────────────────────────────────────────
// When a user manually edits AI output, store the correction to improve
// future generations for this profile.

export async function recordCorrection(
  userId: string,
  profileId: number,
  originalText: string,
  correctedText: string
): Promise<void> {
  if (!originalText || !correctedText || originalText === correctedText) return;

  const db = sql();
  await db`
    INSERT INTO voice_corrections (user_id, profile_id, original_text, corrected_text)
    VALUES (${userId}, ${profileId}, ${originalText.slice(0, 2000)}, ${correctedText.slice(0, 2000)})
  `;
}
