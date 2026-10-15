// Object icon shown in place of a portrait when a curated writer has no free
// photo (scripts/sync-writer-photos.ts found none on Wikipedia/Commons). The
// object comes from the writer's category, so a newly added curated writer
// gets one automatically. Pure module so it can be unit-tested.

import { CATEGORIES, CURATED_WRITERS } from "./writer-data";

export type ObjectIconKey = (typeof CATEGORIES)[number]["icon"] | "quill";

// Single-stroke paths on a 32x32 grid, drawn in currentColor.
export const OBJECT_ICON_PATHS: Record<ObjectIconKey, string[]> = {
  pen: ["M8 24 L20 12 L24 16 L12 28 L7 29 Z", "M20 12 L23 9 L27 13 L24 16", "M7 29 L10 26"],
  briefcase: ["M5 12 H27 V26 H5 Z", "M12 12 V8 H20 V12", "M5 18 H27", "M15 18 V20 H17 V18"],
  mic: ["M12 6 Q12 3 16 3 Q20 3 20 6 V15 Q20 19 16 19 Q12 19 12 15 Z", "M8 14 Q8 23 16 23 Q24 23 24 14", "M16 23 V28", "M11 28 H21"],
  landmark: ["M4 12 L16 5 L28 12 Z", "M7 12 V24", "M13 12 V24", "M19 12 V24", "M25 12 V24", "M4 24 H28", "M3 28 H29"],
  scroll: ["M8 6 H24 Q27 6 27 9 Q27 12 24 12", "M8 6 Q5 6 5 9 V23 Q5 26 8 26 H22", "M24 12 V23 Q24 26 21 26", "M10 12 H20", "M10 16 H20", "M10 20 H17"],
  book: ["M16 8 Q11 5 4 6 V25 Q11 24 16 27 Q21 24 28 25 V6 Q21 5 16 8 Z", "M16 8 V27"],
  newspaper: ["M5 7 H23 V26 H8 Q5 26 5 23 Z", "M23 12 H27 V23 Q27 26 24 26", "M9 11 H19", "M9 15 H14 V21 H9 Z", "M16 15 H19", "M16 18 H19", "M16 21 H19"],
  laugh: ["M16 5 A11 11 0 1 0 16.01 5", "M11 13 Q12 11 13 13", "M19 13 Q20 11 21 13", "M10 18 H22 Q21 24 16 24 Q11 24 10 18 Z"],
  brain: ["M16 7 Q12 4 9 7 Q5 8 6 12 Q3 15 6 18 Q5 23 10 24 Q13 27 16 24 Z", "M16 7 Q20 4 23 7 Q27 8 26 12 Q29 15 26 18 Q27 23 22 24 Q19 27 16 24", "M16 7 V24", "M10 13 Q12 14 12 17", "M22 13 Q20 14 20 17"],
  microscope: ["M14 4 L19 6 L15 16 L10 14 Z", "M12 15 L11 18", "M18 11 Q24 13 23 20", "M23 20 Q22 24 17 24", "M8 28 H26", "M14 24 H20 V28"],
  quill: ["M26 4 Q12 6 9 22 L8 28", "M26 4 Q24 16 11 20", "M9 22 L14 17", "M5 28 H17"],
};

const ICON_BY_CATEGORY: Record<string, ObjectIconKey> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.icon]),
);

const CATEGORY_BY_WRITER: Record<string, string> = Object.fromEntries(
  CURATED_WRITERS.map((w) => [w.name, w.category]),
);

export function objectIconFor(name: string): ObjectIconKey {
  return ICON_BY_CATEGORY[CATEGORY_BY_WRITER[name] ?? ""] ?? "quill";
}
