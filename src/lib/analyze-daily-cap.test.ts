import { beforeEach, describe, expect, it, vi } from "vitest";

let rows: { key: string; route: string }[] = [];
let failNext = false;
vi.mock("./db", () => ({
  sql: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    if (failNext) throw new Error("connection refused");
    const text = strings.join("?");
    if (/INSERT INTO anon_usage/i.test(text)) {
      rows.push({ key: values[0] as string, route: values[1] as string });
      return [];
    }
    if (/SELECT COUNT/i.test(text)) return [{ n: rows.filter((r) => r.key === values[0]).length }];
    return [];
  },
}));

beforeEach(() => { rows = []; failNext = false; delete process.env.ANALYZE_DAILY_CAP; vi.resetModules(); });

describe("analyze global daily cap", () => {
  it("allows under the cap and writes a per-UTC-day row", async () => {
    const m = await import("./analyze-daily-cap");
    expect(await m.allowGlobalAnalyze(new Date("2026-11-21T23:59:00Z"), 2)).toBe(true);
    expect(rows).toEqual([{ key: "dw:global:analyze:2026-11-21", route: "analyze-global" }]);
  });
  it("refuses at the cap and writes nothing", async () => {
    const m = await import("./analyze-daily-cap");
    const d = new Date("2026-11-21T10:00:00Z");
    expect(await m.allowGlobalAnalyze(d, 2)).toBe(true);
    expect(await m.allowGlobalAnalyze(d, 2)).toBe(true);
    expect(await m.allowGlobalAnalyze(d, 2)).toBe(false);
    expect(rows).toHaveLength(2);
  });
  it("a new UTC day starts at zero", async () => {
    const m = await import("./analyze-daily-cap");
    expect(await m.allowGlobalAnalyze(new Date("2026-11-21T10:00:00Z"), 1)).toBe(true);
    expect(await m.allowGlobalAnalyze(new Date("2026-11-22T00:00:01Z"), 1)).toBe(true);
  });
  it("store unreachable -> RateLimitUnavailable", async () => {
    const m = await import("./analyze-daily-cap");
    failNext = true;
    await expect(m.allowGlobalAnalyze()).rejects.toThrow(/unreachable/);
  });
  it("env override parses", async () => {
    process.env.ANALYZE_DAILY_CAP = "50";
    expect((await import("./analyze-daily-cap")).ANALYZE_DAILY_CAP).toBe(50);
  });
  it("bad env falls back to default", async () => {
    const m = await import("./analyze-daily-cap");
    for (const bad of ["", "abc", "0", "-5", "1.5", "10x", undefined]) {
      expect(m.parseDailyCap(bad)).toBe(200);
    }
  });
});
