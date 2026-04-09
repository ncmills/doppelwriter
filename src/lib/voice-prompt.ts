import { sql } from "./db";

// ── Shared Voice Prompt System ─────────────────────────────────────────────
// Single source of truth for building voice-aware system prompts.
// Used by both the generator (write from brief) and editor (transform existing text).

const GENERATION_PREAMBLE = `You are ghostwriting as a specific author. Every sentence you write must be indistinguishable from their own work. Do NOT write like a generic AI. Do NOT use words like "delve", "tapestry", "multifaceted", "landscape", "moreover", "furthermore", "in conclusion", or any corporate/academic filler. Write like a HUMAN — specifically, the human described below.

Match their exact patterns: sentence rhythm, word choices, punctuation habits, paragraph structure, tone, personality. If they use em dashes, you use em dashes. If they write short punchy sentences, you write short punchy sentences. If they're funny, be funny. If they're formal, be formal.

Here is the author's voice profile:

`;

const TRANSFORM_PREAMBLE = `CRITICAL INSTRUCTION: You are a voice transformation engine. When given text to edit, you must AGGRESSIVELY rewrite it so the output reads as if the author described below wrote it from scratch. This is NOT light editing. You must:

1. REPLACE generic/bland word choices with words this author would actually use
2. RESTRUCTURE sentences to match this author's rhythm — their sentence lengths, cadence, and flow
3. CHANGE paragraph structure to match their style — how they open, build, and close paragraphs
4. ADD the author's characteristic phrases, constructions, and quirks where they naturally fit
5. REMOVE anything this author would never write — corporate language, clichés, AI-isms
6. TRANSFORM the tone to match the author's personality — formal/casual, serious/playful, etc.

The IDEAS and FACTS should stay the same. The VOICE must completely change. Every sentence should sound like this specific author wrote it. If the input reads like generic corporate writing and the author writes punchy conversational prose, the output should be punchy conversational prose.

Here is the author's voice profile:

`;

const FALLBACK_STYLE = `
STYLE RULES:
Write in short, direct sentences when they serve the point. Use active voice.
Choose concrete words over abstract ones. Let verbs do the work, not nouns.
Vary sentence length for rhythm — short sentences for impact, longer ones for flow.`;

export function applyVoiceOverrides(prompt: string, overrides: Record<string, number>): string {
  if (!overrides || Object.keys(overrides).length === 0) return prompt;

  const mods: string[] = [];
  if (overrides.formality !== undefined && overrides.formality !== 5) {
    mods.push(overrides.formality > 5
      ? `Write MORE formally than the base profile. Formality level: ${overrides.formality}/10.`
      : `Write MORE casually than the base profile. Formality level: ${overrides.formality}/10.`);
  }
  if (overrides.sentence_length !== undefined && overrides.sentence_length !== 5) {
    mods.push(overrides.sentence_length > 5
      ? `Use LONGER, more complex sentences than the base profile suggests.`
      : `Use SHORTER, punchier sentences than the base profile suggests.`);
  }
  if (overrides.creativity !== undefined && overrides.creativity !== 5) {
    mods.push(overrides.creativity > 5
      ? `Be MORE creative and metaphorical than the base profile. Use more vivid imagery.`
      : `Be MORE literal and restrained than the base profile. Fewer metaphors, more direct.`);
  }
  if (overrides.humor !== undefined && overrides.humor !== 5) {
    mods.push(overrides.humor > 5
      ? `Inject MORE humor, wit, and levity than the base profile suggests.`
      : `Be MORE serious and measured than the base profile. Minimize humor.`);
  }
  if (overrides.emotion !== undefined && overrides.emotion !== 5) {
    mods.push(overrides.emotion > 5
      ? `Be MORE emotionally expressive and personal than the base profile.`
      : `Be MORE detached and analytical than the base profile. Less emotional expression.`);
  }

  return mods.length > 0 ? prompt + "\n\n═══ USER VOICE ADJUSTMENTS ═══\n" + mods.join("\n") : prompt;
}

export type PromptMode = "generate" | "transform";

export async function getVoiceSystemPrompt(
  profileId: number,
  mode: PromptMode
): Promise<string> {
  const db = sql();
  const rows = await db`
    SELECT system_prompt, name, voice_overrides FROM style_profiles WHERE id = ${profileId}
  `;

  const preamble = mode === "generate" ? GENERATION_PREAMBLE : TRANSFORM_PREAMBLE;
  const overrides = rows[0]?.voice_overrides || {};

  const basePrompt = rows[0]?.system_prompt
    ? preamble + rows[0].system_prompt
    : preamble + `Author: ${rows[0]?.name || "Unknown"}\n${FALLBACK_STYLE}`;

  return applyVoiceOverrides(basePrompt, overrides);
}
