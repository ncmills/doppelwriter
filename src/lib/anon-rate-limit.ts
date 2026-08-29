import { createHash } from "node:crypto";
import { sql } from "./db";

/**
 * A rate limit for the UNAUTHENTICATED, AI-spending routes — one that survives.
 *
 * WHAT THIS REPLACES (2026-08-29). `/api/demo`, `/api/analyze` and
 * `/api/analyze-tone` each call Anthropic with no auth, limited by
 *
 *     const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
 *
 * declared at module scope. On serverless that is a counter PER LAMBDA INSTANCE:
 * the effective limit is 3 x however many instances are warm, and every cold
 * start resets it to zero. It reads like a limit, it can never report that it
 * failed to be one, and the bill is Nick's. The site already had a durable
 * counter — `usage_log` via `checkUsage()` — but only on the signed-in path.
 *
 * `usage_log.user_id` is `REFERENCES users(id)`, so it cannot hold an anonymous
 * caller; this is its own table.
 *
 * TWO WINDOWS, because one is not enough: an hourly cap stops a burst, a daily
 * cap stops a patient attacker running the hourly cap around the clock.
 *
 * THE IP IS READ FROM THE PROXY, NOT FROM THE CALLER. The old code took
 * `x-forwarded-for`.split(",")[0] — the FIRST entry, which is whatever the client
 * sent if the platform appends rather than overwrites. `x-vercel-forwarded-for`
 * is set by Vercel and cannot be forged by the caller, so it is preferred; the
 * fallback takes the LAST entry of `x-forwarded-for` (the hop nearest us) rather
 * than the first (the hop nearest the attacker).
 *
 * IT FAILS CLOSED. A monitor that cannot reach its store should fail open — a
 * broken monitor must not stop the fleet. A spend limiter is the opposite: if we
 * cannot tell whether this caller has already spent, the safe answer is no.
 * `allowAnon` throws `RateLimitUnavailable` and the routes turn that into 503.
 */

export class RateLimitUnavailable extends Error {
  constructor(cause: unknown) {
    super(`rate-limit store unreachable: ${cause instanceof Error ? cause.message : cause}`);
    this.name = "RateLimitUnavailable";
  }
}

/** Per-route caps, keeping each route's original intent (3 / 5 / 10 per hour).
 *  The daily cap is 4x the hourly one: enough that a real person never meets it,
 *  low enough that running the hourly cap around the clock does not pay. */
export const ANON_LIMITS: Record<string, { hourly: number; daily: number }> = {
  demo: { hourly: 3, daily: 12 },
  analyze: { hourly: 5, daily: 20 },
  "analyze-tone": { hourly: 10, daily: 40 },
};
const FALLBACK_LIMIT = { hourly: 3, daily: 12 };

/** The caller's address, taken from headers the caller cannot set. */
export function anonKey(headers: Headers): string {
  const vercel = headers.get("x-vercel-forwarded-for")?.trim();
  const xff = headers.get("x-forwarded-for");
  // LAST entry: the hop nearest this server. The first entry is client-supplied
  // wherever the platform appends instead of overwriting.
  const nearest = xff?.split(",").map((s) => s.trim()).filter(Boolean).pop();
  const ip = vercel || nearest || headers.get("x-real-ip")?.trim() || "unknown";
  // Hashed: a rate-limit table has no business holding raw addresses.
  return createHash("sha256").update(`dw:${ip}`).digest("hex").slice(0, 32);
}

let schemaReady = false;

async function ensureSchema(db: ReturnType<typeof sql>) {
  if (schemaReady) return;
  await db`
    CREATE TABLE IF NOT EXISTS anon_usage (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL,
      route TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS anon_usage_key_time ON anon_usage (key, created_at DESC)`;
  schemaReady = true;
}

export interface AnonVerdict {
  allowed: boolean;
  hourly: number;
  daily: number;
  reason?: "hourly" | "daily";
}

/**
 * Record this call and say whether it was allowed.
 *
 * INSERT FIRST, THEN COUNT. Counting first and inserting after leaves a window
 * where concurrent lambdas all read "2 so far" and all proceed — precisely the
 * concurrency the in-memory version could not see. Inserting first means a burst
 * can over-run by at most the number of simultaneous requests, never unbounded.
 */
export async function allowAnon(
  headers: Headers,
  route: string,
  now: Date = new Date(),
): Promise<AnonVerdict> {
  const key = anonKey(headers);
  const cap = ANON_LIMITS[route] ?? FALLBACK_LIMIT;
  try {
    const db = sql();
    await ensureSchema(db);
    await db`INSERT INTO anon_usage (key, route, created_at) VALUES (${key}, ${route}, ${now.toISOString()})`;
    const [row] = await db`
      SELECT
        COUNT(*) FILTER (WHERE created_at > ${new Date(now.getTime() - 3600_000).toISOString()})::int AS hourly,
        COUNT(*) FILTER (WHERE created_at > ${new Date(now.getTime() - 86_400_000).toISOString()})::int AS daily
      FROM anon_usage WHERE key = ${key}
    `;
    const hourly = row?.hourly ?? 0;
    const daily = row?.daily ?? 0;
    if (hourly > cap.hourly) return { allowed: false, hourly, daily, reason: "hourly" };
    if (daily > cap.daily) return { allowed: false, hourly, daily, reason: "daily" };
    return { allowed: true, hourly, daily };
  } catch (e) {
    throw new RateLimitUnavailable(e);
  }
}

/** Old rows are noise; keep the table small. Best-effort, never fatal. */
export async function pruneAnonUsage(olderThanHours = 48): Promise<void> {
  try {
    const db = sql();
    await db`DELETE FROM anon_usage WHERE created_at < NOW() - (${olderThanHours} * INTERVAL '1 hour')`;
  } catch {
    // pruning is housekeeping; its failure must never affect a request
  }
}
