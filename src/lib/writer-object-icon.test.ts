import { describe, expect, it } from "vitest";
import { CATEGORIES, CURATED_WRITERS } from "./writer-data";
import { WRITER_PHOTOS } from "./writer-photos";
import { OBJECT_ICON_PATHS, objectIconFor } from "./writer-object-icon";

describe("writer object icon", () => {
  it("gives every curated writer its category's object, never the generic quill", () => {
    for (const w of CURATED_WRITERS) {
      const cat = CATEGORIES.find((c) => c.id === w.category);
      expect(cat, `${w.name} has unknown category ${w.category}`).toBeDefined();
      expect(objectIconFor(w.name)).toBe(cat!.icon);
    }
  });

  it("falls back to the quill for a name that is not curated", () => {
    expect(objectIconFor("Somebody Not In The Catalog")).toBe("quill");
  });

  it("has drawn paths for every icon key", () => {
    for (const c of CATEGORIES) expect(OBJECT_ICON_PATHS[c.icon].length).toBeGreaterThan(0);
    expect(OBJECT_ICON_PATHS.quill.length).toBeGreaterThan(0);
  });

  it("covers the writers who have no free portrait today", () => {
    const missing = CURATED_WRITERS.filter((w) => !WRITER_PHOTOS[w.name]).map((w) => w.name);
    for (const n of missing) expect(objectIconFor(n)).not.toBe("quill");
  });
});
