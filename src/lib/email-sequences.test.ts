import { describe, expect, it, vi } from "vitest";

vi.mock("./email", () => ({ sendOrThrow: vi.fn() }));
vi.mock("./db", () => ({ sql: vi.fn(), ensureUnsubscribeColumn: vi.fn() }));

process.env.AUTH_SECRET = "test-secret";

import { SEQUENCES } from "./email-sequences";
import { unsubscribeToken, verifyUnsubscribeToken, unsubscribeUrl } from "./unsubscribe";

const day5 = SEQUENCES.find((s) => s.key === "day5_scarcity")!;
const subject = (used: number) => (typeof day5.subject === "function" ? day5.subject({ used }) : day5.subject);

describe("day-5 scarcity email", () => {
  it("does not send at used=3", () => {
    expect(day5.condition!({ used: 3, hasProfile: false })).toBe(false);
  });
  it.each([15, 18])("sends at used=%i and quotes that exact count", (used) => {
    expect(day5.condition!({ used, hasProfile: false })).toBe(true);
    expect(subject(used)).toContain(`${used} of 20`);
    expect(day5.html("Ann", "a@b.co", { used })).toContain(`used ${used} of your 20`);
  });
});

describe("sequence copy", () => {
  it("has no day-7 coupon email and no WELCOME"+"50 promise", () => {
    expect(SEQUENCES.find((s) => s.key === "day7_discount")).toBeUndefined();
    expect(JSON.stringify(SEQUENCES.map((s) => s.html("x", "a@b.co", { used: 15 })))).not.toContain("WELCOME"+"50");
  });
  it("day-1 has no 'Watch the magic' and one /write link", () => {
    const html = SEQUENCES[0].html("x", "a@b.co");
    expect(html).not.toContain("Watch the magic");
    expect(html.match(/\/write"/g)).toHaveLength(1);
  });
  it("every email carries a signed unsubscribe link", () => {
    for (const s of SEQUENCES) {
      const html = s.html("x", "a@b.co", { used: 15 });
      expect(html).toContain(`/unsubscribe?email=a%40b.co&token=${unsubscribeToken("a@b.co")}`);
    }
  });
});

describe("unsubscribe token", () => {
  it("verifies for the right email only", () => {
    const t = unsubscribeToken("a@b.co");
    expect(verifyUnsubscribeToken("a@b.co", t)).toBe(true);
    expect(verifyUnsubscribeToken("other@b.co", t)).toBe(false);
    expect(verifyUnsubscribeToken("a@b.co", "deadbeef")).toBe(false);
    expect(verifyUnsubscribeToken("a@b.co", "")).toBe(false);
  });
  it("is unusable with no secret", () => {
    const old = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    expect(unsubscribeToken("a@b.co")).toBeNull();
    expect(unsubscribeUrl("https://x", "a@b.co")).not.toContain("token=");
    process.env.AUTH_SECRET = old;
  });
});
