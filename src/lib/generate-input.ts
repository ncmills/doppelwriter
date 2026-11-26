// Server-side bounds for generate/edit inputs. Pure, so it is testable without the app.
export const WORD_COUNT_MIN = 50;
export const WORD_COUNT_MAX = 5000;
export const INSTRUCTIONS_MAX = 5000;
export const DRAFT_MAX = 50000;
// Long-form outline path reads this much research; the route rejects more, so nothing is dropped silently.
export const RESEARCH_CONTEXT_MAX = 8000;

export type InputCheck = { ok: true } | { ok: false; error: string };

export function validateGenerateOptions(o: {
  wordCount?: unknown;
  instructions?: unknown;
  researchContext?: unknown;
}): InputCheck {
  if (o.wordCount !== undefined && o.wordCount !== null && o.wordCount !== "") {
    const n = o.wordCount;
    if (typeof n !== "number" || !Number.isInteger(n) || n < WORD_COUNT_MIN || n > WORD_COUNT_MAX) {
      return { ok: false, error: `wordCount must be a whole number from ${WORD_COUNT_MIN} to ${WORD_COUNT_MAX}` };
    }
  }
  if (o.instructions !== undefined && o.instructions !== null) {
    if (typeof o.instructions !== "string" || o.instructions.length > INSTRUCTIONS_MAX) {
      return { ok: false, error: "Instructions too long" };
    }
  }
  if (o.researchContext !== undefined && o.researchContext !== null) {
    if (typeof o.researchContext !== "string" || o.researchContext.length > RESEARCH_CONTEXT_MAX) {
      return { ok: false, error: "Research context too long" };
    }
  }
  return { ok: true };
}

export function validateEditInput(o: { instructions?: unknown }): InputCheck {
  if (o.instructions !== undefined && o.instructions !== null) {
    if (typeof o.instructions !== "string" || o.instructions.length > INSTRUCTIONS_MAX) {
      return { ok: false, error: "Instructions too long" };
    }
  }
  return { ok: true };
}
