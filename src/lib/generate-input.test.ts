import { describe, expect, it, vi } from "vitest";
import { validateGenerateOptions, validateEditInput, RESEARCH_CONTEXT_MAX } from "./generate-input";
import { applyVoiceOverrides } from "./voice-prompt";

vi.mock("./db", () => ({ sql: () => async () => [] }));

describe("generate input bounds", () => {
  it("rejects garbage wordCount", () => {
    for (const w of [-5, 0.5, NaN, 1e9, 10, "lots", Infinity, 5001]) {
      expect(validateGenerateOptions({ wordCount: w }).ok).toBe(false);
    }
  });
  it("accepts absent and in-range wordCount", () => {
    expect(validateGenerateOptions({}).ok).toBe(true);
    expect(validateGenerateOptions({ wordCount: 50 }).ok).toBe(true);
    expect(validateGenerateOptions({ wordCount: 5000 }).ok).toBe(true);
  });
  it("bounds instructions and researchContext", () => {
    expect(validateGenerateOptions({ instructions: "x".repeat(5001) }).ok).toBe(false);
    expect(validateGenerateOptions({ researchContext: "x".repeat(RESEARCH_CONTEXT_MAX + 1) }).ok).toBe(false);
    expect(validateGenerateOptions({ researchContext: "x".repeat(RESEARCH_CONTEXT_MAX) }).ok).toBe(true);
    expect(validateEditInput({ instructions: "x".repeat(5001) }).ok).toBe(false);
    expect(validateEditInput({ instructions: "fine" }).ok).toBe(true);
  });
});

describe("slider strength is graded", () => {
  it("9 differs from 6, and 1 from 4", () => {
    for (const k of ["formality", "sentence_length", "creativity", "humor", "emotion"]) {
      expect(applyVoiceOverrides("P", { [k]: 9 })).not.toBe(applyVoiceOverrides("P", { [k]: 6 }));
      expect(applyVoiceOverrides("P", { [k]: 1 })).not.toBe(applyVoiceOverrides("P", { [k]: 4 }));
    }
    expect(applyVoiceOverrides("P", { humor: 5 })).toBe("P");
  });
});
