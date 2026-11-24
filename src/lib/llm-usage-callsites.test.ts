// Call-site proof: one non-stream (generator.research) and one stream (generator.generateDraft)
// each emit exactly one llm_usage line with the right route + model, and streamed text is unchanged.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const stream = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: (...a: unknown[]) => create(...a), stream: (...a: unknown[]) => stream(...a) };
  },
}));
vi.mock("./models", () => ({ CLAUDE_MODEL: "model-under-test", getAnthropicClient: () => ({}) }));
vi.mock("./voice-prompt", () => ({ getVoiceSystemPrompt: async () => "SYSTEM" }));

let spy: { mock: { calls: unknown[][] }; mockRestore: () => void; mockImplementation: (f: () => void) => unknown };
beforeEach(() => {
  spy = vi.spyOn(console, "log").mockImplementation(() => {}) as unknown as typeof spy;
  create.mockReset();
  stream.mockReset();
});
afterEach(() => spy.mockRestore());

const usageLines = () =>
  spy.mock.calls.map((c) => c[0]).filter((l): l is string => typeof l === "string" && l.startsWith("llm_usage "));

describe("call sites", () => {
  it("non-stream: research() logs one line, returns the text unchanged", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: "FACTS" }],
      usage: { input_tokens: 11, output_tokens: 22, cache_read_input_tokens: 1, cache_creation_input_tokens: 2 },
    });
    const { research } = await import("./generator");
    expect(await research("secret topic")).toBe("FACTS");
    const lines = usageLines();
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0].slice(10))).toEqual({
      route: "lib:generator.research", model: "model-under-test", in: 11, out: 22, cacheR: 1, cacheW: 2,
    });
    expect(lines[0]).not.toContain("secret topic");
  });

  it("stream: generateDraft() logs one line after the stream; client text unchanged", async () => {
    const events = ["Hel", "lo ", "world"].map((t) => ({
      type: "content_block_delta", delta: { type: "text_delta", text: t },
    }));
    stream.mockReturnValue({
      async *[Symbol.asyncIterator]() { for (const e of events) yield e; },
      finalMessage: async () => ({ usage: { input_tokens: 5, output_tokens: 9 } }),
    });
    const { generateDraft } = await import("./generator");
    let out = "";
    for await (const chunk of generateDraft("secret brief", 1)) out += chunk;
    expect(out).toBe("Hello world");
    const lines = usageLines();
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0].slice(10))).toEqual({
      route: "lib:generator.generateDraft", model: "model-under-test", in: 5, out: 9, cacheR: 0, cacheW: 0,
    });
    expect(lines[0]).not.toContain("secret brief");
  });
});
