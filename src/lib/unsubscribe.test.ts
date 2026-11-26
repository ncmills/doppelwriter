import { beforeEach, describe, expect, it, vi } from "vitest";

const queries: string[] = [];
vi.mock("./db", () => ({
  ensureUnsubscribeColumn: vi.fn(async () => {}),
  sql: () => (s: TemplateStringsArray) => {
    queries.push(s.join("?"));
    return Promise.resolve([]);
  },
}));
process.env.AUTH_SECRET = "test-secret";
import { applyUnsubscribe, unsubscribeToken } from "./unsubscribe";

describe("applyUnsubscribe", () => {
  beforeEach(() => { queries.length = 0; });
  it("valid token sets the flag", async () => {
    expect(await applyUnsubscribe("a@b.co", unsubscribeToken("a@b.co"))).toBe(true);
    expect(queries.join()).toContain("SET email_unsubscribed = TRUE");
  });
  it("bad or missing token writes nothing", async () => {
    expect(await applyUnsubscribe("a@b.co", "nope")).toBe(false);
    expect(await applyUnsubscribe("a@b.co", null)).toBe(false);
    expect(queries).toHaveLength(0);
  });
});
