// DRV SWEEP-1121-2045: a test-flagged /api/analyze request gets a canned stub and
// never reaches Anthropic, the rate limiter, or the database; a normal request
// still calls Anthropic exactly as before.
import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const allowAnon = vi.fn();
const dbCalls = vi.fn();

vi.mock("@/lib/models", () => ({
  CLAUDE_MODEL: "m",
  getAnthropicClient: () => ({ messages: { create } }),
}));
vi.mock("@/lib/anon-rate-limit", () => ({
  allowAnon: (...a: unknown[]) => allowAnon(...a),
  RateLimitUnavailable: class extends Error {},
}));
vi.mock("@/lib/db", () => ({
  sql: () => {
    dbCalls();
    return async () => [];
  },
}));
vi.mock("@/lib/track", () => ({ trackServerEvent: vi.fn() }));

const SECRET = "s3cret";
const TEXT = "The quick brown fox jumps over the lazy dog. ".repeat(5);

function post(headers: Record<string, string> = {}, text = TEXT) {
  return new Request("https://doppelwriter.com/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ text }),
  });
}

beforeEach(() => {
  vi.resetModules();
  create.mockReset();
  allowAnon.mockReset();
  dbCalls.mockReset();
  allowAnon.mockResolvedValue({ allowed: true, hourly: 1, daily: 1 });
  create.mockResolvedValue({ content: [{ type: "text", text: '{"tone":{"primary":"x"}}' }] });
  process.env.SIGNAL_TEST_SECRET = SECRET;
});

describe("analyze test gate", () => {
  it("normal request calls Anthropic and the rate limiter", async () => {
    const { POST } = await import("./route");
    const res = await POST(post() as never);
    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalledTimes(1);
    expect(allowAnon).toHaveBeenCalledTimes(1);
  });

  it("test-flagged request returns a stub, no Anthropic, no db, no limiter", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ "x-sn-test-run": SECRET }) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stub).toBe(true);
    expect(body.tone?.primary).toBeTruthy();
    expect(typeof body.shareUrl).toBe("string");
    expect(create).not.toHaveBeenCalled();
    expect(dbCalls).not.toHaveBeenCalled();
    expect(allowAnon).not.toHaveBeenCalled();
  });

  it("test-flagged request still gets normal validation errors", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ "x-sn-test-run": SECRET }, "short") as never);
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("wrong header value is not test-flagged", async () => {
    const { POST } = await import("./route");
    await POST(post({ "x-sn-test-run": "nope" }) as never);
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe("analyze global daily cap (route)", () => {
  it("under cap: Anthropic called once and a global row written", async () => {
    const calls: unknown[][] = [];
    vi.doMock("@/lib/analyze-daily-cap", () => ({
      allowGlobalAnalyze: async (...a: unknown[]) => { calls.push(a); return true; },
    }));
    const { POST } = await import("./route");
    const res = await POST(post() as never);
    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(1);
    vi.doUnmock("@/lib/analyze-daily-cap");
  });

  it("at cap: 503 and Anthropic NOT called", async () => {
    vi.doMock("@/lib/analyze-daily-cap", () => ({ allowGlobalAnalyze: async () => false }));
    const { POST } = await import("./route");
    const res = await POST(post() as never);
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("Daily limit reached. Try again tomorrow.");
    expect(create).not.toHaveBeenCalled();
    vi.doUnmock("@/lib/analyze-daily-cap");
  });

  it("test-flagged: stub, global cap never consulted", async () => {
    const cap = vi.fn(async () => true);
    vi.doMock("@/lib/analyze-daily-cap", () => ({ allowGlobalAnalyze: cap }));
    const { POST } = await import("./route");
    const res = await POST(post({ "x-sn-test-run": SECRET }) as never);
    expect((await res.json()).stub).toBe(true);
    expect(cap).not.toHaveBeenCalled();
    vi.doUnmock("@/lib/analyze-daily-cap");
  });
});
