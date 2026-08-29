/**
 * The limit must survive what the old one could not: a second lambda instance.
 *
 * Until 2026-08-29 `/api/demo`, `/api/analyze` and `/api/analyze-tone` each held
 * `const rateLimitMap = new Map()` at module scope, in front of an
 * unauthenticated Anthropic call. On serverless that is a counter per instance —
 * the real ceiling was 3 x however many were warm, and a cold start reset it to
 * zero. The failure was invisible: the code looks like a limit and can never
 * report that it is not one.
 *
 * So the test that matters is not "does it count to three". It is "does it still
 * count to three when the module is loaded again", which is what a second
 * instance is. `vi.resetModules()` gives a genuinely fresh module registry while
 * the fake database below stays put, exactly like Postgres does.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// One store, outside the module registry — the database.
let rows: { key: string; route: string; created_at: string }[] = [];
let failNext = false;

vi.mock("./db", () => ({
  sql: () => {
    const tag = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      if (failNext) throw new Error("connection refused");
      const text = strings.join("?");
      if (/CREATE TABLE|CREATE INDEX/i.test(text)) return [];
      if (/INSERT INTO anon_usage/i.test(text)) {
        const [key, route, created_at] = values as string[];
        rows.push({ key, route, created_at });
        return [];
      }
      if (/DELETE FROM anon_usage/i.test(text)) { rows = []; return []; }
      if (/SELECT/i.test(text) && /anon_usage/i.test(text)) {
        const [hourAgo, dayAgo, key] = values as string[];
        const mine = rows.filter((r) => r.key === key);
        return [{
          hourly: mine.filter((r) => r.created_at > hourAgo).length,
          daily: mine.filter((r) => r.created_at > dayAgo).length,
        }];
      }
      return [];
    };
    return tag;
  },
}));

const HEADERS = new Headers({ "x-vercel-forwarded-for": "203.0.113.7" });

async function freshModule() {
  vi.resetModules();               // a new lambda instance
  return import("./anon-rate-limit");
}

beforeEach(() => { rows = []; failNext = false; });

describe("anon rate limit", () => {
  it("allows up to the route's hourly cap", async () => {
    const { allowAnon } = await freshModule();
    for (let i = 0; i < 3; i++) {
      expect((await allowAnon(HEADERS, "demo")).allowed).toBe(true);
    }
    expect((await allowAnon(HEADERS, "demo")).allowed).toBe(false);
  });

  it("THE POINT: the cap holds across a second module load", async () => {
    // Instance A serves the three allowed calls.
    const a = await freshModule();
    for (let i = 0; i < 3; i++) expect((await a.allowAnon(HEADERS, "demo")).allowed).toBe(true);

    // Instance B is a cold start: brand-new module state, same database.
    const b = await freshModule();
    const verdict = await b.allowAnon(HEADERS, "demo");
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toBe("hourly");
  });

  it("POSITIVE CONTROL: an in-memory Map does NOT hold across a module load", async () => {
    // The shape that shipped, so the test above is shown to be measuring the
    // difference rather than passing for some other reason.
    const makeInstance = () => {
      const map = new Map<string, number>();
      return (ip: string) => { const n = (map.get(ip) ?? 0) + 1; map.set(ip, n); return n <= 3; };
    };
    const a = makeInstance();
    for (let i = 0; i < 3; i++) expect(a("ip")).toBe(true);
    expect(a("ip")).toBe(false);          // instance A is correctly full
    const b = makeInstance();             // ...and a cold start lets it straight through
    expect(b("ip")).toBe(true);
  });

  it("the daily cap stops an attacker who waits out each hour", async () => {
    const { allowAnon } = await freshModule();
    const t0 = new Date("2026-08-29T00:00:00Z").getTime();
    let allowed = 0;
    for (let h = 0; h < 8; h++) {
      for (let i = 0; i < 3; i++) {
        const at = new Date(t0 + h * 3600_000 + i * 1000);
        if ((await allowAnon(HEADERS, "demo", at)).allowed) allowed++;
      }
    }
    expect(allowed).toBe(12);             // ANON_LIMITS.demo.daily, not 24
  });

  it("FAILS CLOSED when the store is unreachable", async () => {
    const { allowAnon, RateLimitUnavailable } = await freshModule();
    failNext = true;
    await expect(allowAnon(HEADERS, "demo")).rejects.toBeInstanceOf(RateLimitUnavailable);
  });

  it("keys on a header the caller cannot forge, and not on the first XFF hop", async () => {
    const { anonKey } = await freshModule();
    const spoofed = new Headers({
      "x-forwarded-for": "1.2.3.4, 203.0.113.7",     // first hop is client-supplied
      "x-vercel-forwarded-for": "203.0.113.7",
    });
    const trusted = new Headers({ "x-vercel-forwarded-for": "203.0.113.7" });
    expect(anonKey(spoofed)).toBe(anonKey(trusted));

    // With no Vercel header, the LAST hop is used — the one nearest this server.
    const appended = new Headers({ "x-forwarded-for": "1.2.3.4, 203.0.113.7" });
    expect(anonKey(appended)).toBe(anonKey(trusted));
    // ...so rotating the client-controlled first hop does not move the key.
    const rotated = new Headers({ "x-forwarded-for": "9.9.9.9, 203.0.113.7" });
    expect(anonKey(rotated)).toBe(anonKey(trusted));
  });

  it("does not store the raw address", async () => {
    const { anonKey } = await freshModule();
    expect(anonKey(HEADERS)).not.toContain("203.0.113.7");
    expect(anonKey(HEADERS)).toMatch(/^[0-9a-f]{32}$/);
  });
});
