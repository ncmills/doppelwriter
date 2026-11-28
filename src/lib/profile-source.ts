// Where a curated profile's raw material came from. Stamped into profile_json at build time
// (writer-builder.ts) so the profile page can say so plainly. Pure: safe in client components.

export type ProfileSource = "web" | "model_memory";

export const MODEL_MEMORY_NOTE =
  "This profile was built from the model's general knowledge of this writer, not from a fresh read of their published work.";

// Profiles built before 2026-11-28 carry no source stamp and show no note.
export function profileSourceNote(profileJson: unknown): string | null {
  let obj: unknown = profileJson;
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch {
      return null;
    }
  }
  if (obj && typeof obj === "object" && (obj as { source?: unknown }).source === "model_memory") {
    return MODEL_MEMORY_NOTE;
  }
  return null;
}
