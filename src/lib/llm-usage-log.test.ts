import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logLlmUsage, logLlmStreamUsage } from "./llm-usage-log";

const KEYS = ["cacheR", "cacheW", "in", "model", "out", "route"];
let spy: { mock: { calls: unknown[][] }; mockRestore: () => void; mockImplementation: (f: () => void) => unknown };
beforeEach(() => {
  spy = vi.spyOn(console, "log").mockImplementation(() => {}) as unknown as typeof spy;
});
afterEach(() => spy.mockRestore());

describe("logLlmUsage", () => {
  it("prints exactly one llm_usage line with exactly the six keys", () => {
    logLlmUsage("/api/x", "m1", {
      input_tokens: 10,
      output_tokens: 20,
      cache_read_input_tokens: 3,
      cache_creation_input_tokens: 4,
    });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0][0] as string;
    expect(line.startsWith("llm_usage ")).toBe(true);
    const obj = JSON.parse(line.slice("llm_usage ".length));
    expect(Object.keys(obj).sort()).toEqual(KEYS);
    expect(obj).toEqual({ route: "/api/x", model: "m1", in: 10, out: 20, cacheR: 3, cacheW: 4 });
  });

  it("missing usage fields become 0", () => {
    logLlmUsage("/r", "m", { input_tokens: 5 });
    logLlmUsage("/r", "m", undefined);
    logLlmUsage("/r", "m", { output_tokens: null });
    for (const c of spy.mock.calls) {
      const o = JSON.parse((c[0] as string).slice(10));
      expect(Object.keys(o).sort()).toEqual(KEYS);
    }
    expect(JSON.parse((spy.mock.calls[0][0] as string).slice(10))).toMatchObject({ in: 5, out: 0, cacheR: 0, cacheW: 0 });
    expect(JSON.parse((spy.mock.calls[1][0] as string).slice(10))).toMatchObject({ in: 0, out: 0 });
  });

  it("extra usage fields and stray prompt text never appear", () => {
    const secret = "TOP-SECRET-PROMPT user@example.com";
    logLlmUsage("/r", "m", {
      input_tokens: 1,
      output_tokens: 2,
      prompt: secret,
      content: secret,
    } as never);
    // a prompt string passed where the usage object belongs
    logLlmUsage("/r", "m", secret as never);
    for (const c of spy.mock.calls) {
      expect(c[0] as string).not.toContain("TOP-SECRET");
      expect(c[0] as string).not.toContain("example.com");
      expect(Object.keys(JSON.parse((c[0] as string).slice(10))).sort()).toEqual(KEYS);
    }
  });

  it("a throwing console does not throw out of the helper", () => {
    spy.mockImplementation(() => {
      throw new Error("console broke");
    });
    expect(() => logLlmUsage("/r", "m", { input_tokens: 1 })).not.toThrow();
  });
});

describe("logLlmStreamUsage", () => {
  it("logs once from finalMessage usage", async () => {
    await logLlmStreamUsage("lib:s", "m", {
      finalMessage: async () => ({ usage: { input_tokens: 7, output_tokens: 8 } }),
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(JSON.parse((spy.mock.calls[0][0] as string).slice(10))).toMatchObject({ route: "lib:s", in: 7, out: 8 });
  });
  it("a rejecting finalMessage does not throw and logs nothing", async () => {
    await expect(
      logLlmStreamUsage("lib:s", "m", { finalMessage: async () => Promise.reject(new Error("x")) }),
    ).resolves.toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });
});
