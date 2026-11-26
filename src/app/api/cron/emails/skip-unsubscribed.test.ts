import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("email cron skips unsubscribed users", () => {
  const src = readFileSync(join(__dirname, "route.ts"), "utf8");
  it("selects only users not flagged email_unsubscribed", () => {
    expect(src).toContain("AND u.email_unsubscribed = FALSE");
  });
  it("ensures the column exists before querying", () => {
    expect(src.indexOf("ensureUnsubscribeColumn()")).toBeLessThan(src.indexOf("FROM users u"));
  });
});
