import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const inserts: unknown[][] = [];
const create = vi.fn();
vi.mock("./db", () => ({
  sql: () => (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.join("?");
    if (text.includes("SELECT id FROM style_profiles")) return Promise.resolve([]);
    if (text.includes("INSERT INTO style_profiles")) {
      inserts.push(values);
      return Promise.resolve([{ id: 1 }]);
    }
    return Promise.resolve([]);
  },
}));
vi.mock("./models", () => ({ CLAUDE_MODEL: "m", getAnthropicClient: () => ({ messages: { create: (...a: unknown[]) => create(...a) } }) }));
vi.mock("./llm-usage-log", () => ({ logLlmUsage: () => undefined }));
vi.mock("./style-analyzer", () => ({ buildMultiLayerPrompt: () => "PROMPT" }));

import { buildWriterProfile } from "./writer-builder";
import { MODEL_MEMORY_NOTE, profileSourceNote } from "./profile-source";

beforeEach(() => {
  inserts.length = 0;
  create.mockReset();
  create.mockResolvedValue({ content: [{ type: "text", text: '{"tone":"dry"}' }], usage: {} });
});
afterEach(() => vi.unstubAllEnvs());

const storedJson = () => inserts[0].find((v) => typeof v === "string" && v.startsWith("{")) as string;

describe("curated profile source disclosure", () => {
  it("fallback path (no TAVILY_API_KEY): profile is stamped model_memory and renders the disclosure", async () => {
    vi.stubEnv("TAVILY_API_KEY", "");
    await buildWriterProfile("Test Writer", "bio");
    expect(JSON.parse(storedJson()).source).toBe("model_memory");
    expect(profileSourceNote(storedJson())).toBe(MODEL_MEMORY_NOTE);
  });
  it("normal path (web content): no disclosure added", async () => {
    vi.stubEnv("TAVILY_API_KEY", "k");
    vi.stubGlobal("fetch", async () => ({ json: async () => ({ results: [{ title: "T", raw_content: "text" }] }) }));
    await buildWriterProfile("Test Writer", "bio");
    expect(JSON.parse(storedJson()).source).toBe("web");
    expect(profileSourceNote(storedJson())).toBeNull();
    vi.unstubAllGlobals();
  });
  it("legacy profiles without a source stamp show nothing", () => {
    expect(profileSourceNote('{"tone":"x"}')).toBeNull();
    expect(profileSourceNote(null)).toBeNull();
  });
});
