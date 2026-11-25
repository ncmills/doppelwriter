import { sql } from "./db";
import { RateLimitUnavailable } from "./anon-rate-limit";

/**
 * GLOBAL daily cap on the anonymous /api/analyze route (DRV DB-AND-SECRET-PATH).
 * The per-visitor limiter bounds one address; this bounds the whole route, so
 * many addresses together cannot run up the Anthropic bill. Reuses anon_usage
 * (no new table): one row per allowed call under a per-UTC-day key.
 * Setting: env ANALYZE_DAILY_CAP if a positive integer, else the default.
 */
export const DEFAULT_ANALYZE_DAILY_CAP = 200;

export function parseDailyCap(raw: string | undefined): number {
  if (raw === undefined || !/^\s*\d+\s*$/.test(raw)) return DEFAULT_ANALYZE_DAILY_CAP;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : DEFAULT_ANALYZE_DAILY_CAP;
}

export const ANALYZE_DAILY_CAP = parseDailyCap(process.env.ANALYZE_DAILY_CAP);

export function globalAnalyzeKey(now: Date = new Date()): string {
  return `dw:global:analyze:${now.toISOString().slice(0, 10)}`;
}

/**
 * Count today's global calls; if under the cap, record this one and allow.
 * Fails closed: store errors throw RateLimitUnavailable (route answers 503).
 * Count-then-insert can over-run by at most the number of simultaneous requests.
 */
export async function allowGlobalAnalyze(
  now: Date = new Date(),
  cap: number = ANALYZE_DAILY_CAP,
): Promise<boolean> {
  const key = globalAnalyzeKey(now);
  try {
    const db = sql();
    const [row] = await db`SELECT COUNT(*)::int AS n FROM anon_usage WHERE key = ${key}`;
    if ((row?.n ?? 0) >= cap) return false;
    await db`INSERT INTO anon_usage (key, route, created_at) VALUES (${key}, ${"analyze-global"}, ${now.toISOString()})`;
    return true;
  } catch (e) {
    throw new RateLimitUnavailable(e);
  }
}
