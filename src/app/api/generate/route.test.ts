// DRV-U6c: /api/generate rejects out-of-bounds wordCount, instructions and researchContext with 400
// before any profile lookup or generation happens.
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateDraft = vi.fn();
const verifyProfileAccess = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1" } }) }));
vi.mock("@/lib/generator", () => ({ generateDraft: (...a: unknown[]) => generateDraft(...a) }));
vi.mock("@/lib/usage", () => ({
  checkRateLimit: async () => ({ allowed: true }),
  checkUsage: async () => ({ allowed: true }),
  logUsage: async () => {},
  verifyProfileAccess: (...a: unknown[]) => verifyProfileAccess(...a),
}));
vi.mock("@/lib/track", () => ({ trackServerEvent: vi.fn() }));

async function post(extra: Record<string, unknown>) {
  const { POST } = await import("./route");
  const req = new Request("https://doppelwriter.com/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ brief: "hello", profileId: 1, ...extra }),
  });
  return POST(req as never);
}

beforeEach(() => {
  vi.resetModules();
  generateDraft.mockReset();
  verifyProfileAccess.mockReset();
  verifyProfileAccess.mockResolvedValue(false);
});

describe("/api/generate input bounds", () => {
  it.each([
    ["wordCount 0", { wordCount: 0 }],
    ["wordCount 49", { wordCount: 49 }],
    ["wordCount 5001", { wordCount: 5001 }],
    ["wordCount 1e9", { wordCount: 1e9 }],
    ["wordCount fractional", { wordCount: 500.5 }],
    ["wordCount string", { wordCount: "500" }],
    ["instructions too long", { instructions: "a".repeat(2001) }],
    ["instructions non-string", { instructions: { x: 1 } }],
    ["researchContext too long", { researchContext: "a".repeat(20001) }],
  ])("rejects %s with 400", async (_l, extra) => {
    const res = await post(extra);
    expect(res.status).toBe(400);
    expect(verifyProfileAccess).not.toHaveBeenCalled();
  });

  it.each([
    ["wordCount 50", { wordCount: 50 }],
    ["wordCount 5000", { wordCount: 5000 }],
    ["instructions at cap", { instructions: "a".repeat(2000) }],
    ["researchContext at cap", { researchContext: "a".repeat(20000) }],
  ])("accepts %s past validation", async (_l, extra) => {
    const res = await post(extra);
    expect(res.status).toBe(403); // reached profile check
    expect(verifyProfileAccess).toHaveBeenCalled();
  });
});
