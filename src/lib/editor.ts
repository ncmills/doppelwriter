import Anthropic from "@anthropic-ai/sdk";
import { diffWords } from "diff";
import { sql } from "./db";

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

async function getSystemPrompt(profileId: number): Promise<string> {
  const db = sql();
  const rows = await db`
    SELECT system_prompt, name FROM style_profiles WHERE id = ${profileId}
  `;
  if (rows[0]?.system_prompt) return rows[0].system_prompt;
  return `You are an expert editor. Improve the writing while preserving the author's voice and intent.

STYLE RULES:
Write in short, direct sentences when they serve the point. Use active voice.
Choose concrete words over abstract ones. Let verbs do the work, not nouns.
Vary sentence length for rhythm — short sentences for impact, longer ones for flow.`;
}

export async function* editDraft(
  draft: string,
  profileId: number,
  instructions?: string
): AsyncGenerator<string> {
  const systemPrompt = await getSystemPrompt(profileId);

  const userMessage = instructions
    ? `Edit this draft in the author's voice. Additional instructions: ${instructions}

Return ONLY the edited text. No commentary, no explanations, no preamble.

---

${draft}`
    : `Edit this draft in the author's voice. Improve clarity, flow, and impact while maintaining their exact style. Fix errors. Tighten loose sentences. Make it sound like THEM.

Return ONLY the edited text. No commentary, no explanations, no preamble.

---

${draft}`;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
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
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    temperature: STYLE_TEMPERATURE,
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
      model: "claude-sonnet-4-20250514",
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
  } catch {
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
