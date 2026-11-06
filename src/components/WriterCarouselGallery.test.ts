import { describe, it, expect } from "vitest";
import { FEATURED_WRITERS, PAGE_SIZE } from "./WriterCarouselGallery";
import { HERO_VOICE_SAMPLES } from "@/lib/voice-samples";

describe("WriterCarouselGallery / HomepageCinematic photo overlap", () => {
  it("first page of FEATURED_WRITERS shares no writer with HERO_VOICE_SAMPLES", () => {
    // Both render on the homepage. If the same writer appears in both, the
    // same /public/writers/{slug} photo renders twice above the fold.
    const heroNames = new Set(HERO_VOICE_SAMPLES.map((s) => s.writer));
    const firstPage = FEATURED_WRITERS.slice(0, PAGE_SIZE).map((w) => w.name);

    const overlap = firstPage.filter((name) => heroNames.has(name));
    expect(overlap).toEqual([]);
  });

  it("positive control: overlap detection actually fires on a duplicated set", () => {
    const heroNames = new Set(HERO_VOICE_SAMPLES.map((s) => s.writer));
    const riggedFirstPage = [HERO_VOICE_SAMPLES[0].writer, "Someone Else", "Another One", "Yet Another"];
    const overlap = riggedFirstPage.filter((name) => heroNames.has(name));
    expect(overlap.length).toBeGreaterThan(0);
  });
});
