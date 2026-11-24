import { describe, it, expect } from "vitest";
import { shouldSubmit } from "../../scripts/indexnow-gate";

const env = (e: Record<string, string>) => e as unknown as NodeJS.ProcessEnv;

describe("indexnow gate", () => {
  it("runs on a Vercel production build", () => {
    expect(shouldSubmit(env({ VERCEL_ENV: "production" }), []).run).toBe(true);
  });
  it("skips on a Vercel preview build", () => {
    expect(shouldSubmit(env({ VERCEL_ENV: "preview" }), []).run).toBe(false);
  });
  it("skips a local build (no VERCEL_ENV)", () => {
    const g = shouldSubmit(env({}), []);
    expect(g.run).toBe(false);
    expect(g.reason).toMatch(/local build/);
  });
  it("runs locally with --force", () => {
    expect(shouldSubmit(env({}), ["--force"]).run).toBe(true);
  });
  it("runs with INDEXNOW_FORCE=1", () => {
    expect(shouldSubmit(env({ INDEXNOW_FORCE: "1" }), []).run).toBe(true);
  });
});
