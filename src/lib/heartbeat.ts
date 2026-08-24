// heartbeat-helper.ts — canonical cron heartbeat helper (framework-agnostic, zero deps).
//
// This is the SOURCE-OF-TRUTH copy that lives in Second Nick. To use it in a site repo,
// COPY this file into the site (e.g. `src/lib/heartbeat.ts`) and import it from the cron route:
//
//   import { heartbeat } from "@/lib/heartbeat";
//   // on success:
//   await heartbeat("tour-de-fore", "/api/cron/sync-orders", { ok: true });
//   // on failure:
//   await heartbeat("tour-de-fore", "/api/cron/sync-orders", { ok: false, error: String(err) });
//
// It upserts one row into the standalone `ops_heartbeats` Supabase table via the PostgREST
// REST API using a service-role key. It reads TWO env vars (set them in each site's Vercel
// project — they point at the DEDICATED heartbeat Supabase project, NOT the leads DB):
//
//   HEARTBEAT_SUPABASE_URL   e.g. https://xxxxxxxx.supabase.co
//   HEARTBEAT_SUPABASE_KEY   the heartbeat project's service-role key
//
// DESIGN NOTES
//   - If either env var is unset, heartbeat() is a silent no-op (safe to merge before the
//     table/env exist; nothing breaks).
//   - It NEVER throws and NEVER blocks the cron's real work — all failures are swallowed.
//     Call it right before you return, or in your catch block; a heartbeat failure must not
//     turn a healthy cron run into a 500.
//   - On failure it does NOT send last_success_at, so the stored last_success_at keeps
//     reflecting the last time the job actually worked (that's what staleness is measured on).
//   - Uses global fetch (Node 18+/Vercel runtime) — no @supabase/supabase-js dependency.

export interface HeartbeatOpts {
  /** true if the cron run completed its real work successfully. */
  ok: boolean;
  /** error detail to store when ok=false (stringified + truncated). */
  error?: unknown;
}

const REST_TIMEOUT_MS = 5000;

/**
 * Report a cron run to the standalone ops_heartbeats store. Best-effort, never throws.
 * @param site      repo slug, must match the name Second Nick's monitor uses (its repo dir), e.g. "tour-de-fore"
 * @param cronPath  the vercel.json cron path, e.g. "/api/cron/sync-orders"
 */
export async function heartbeat(
  site: string,
  cronPath: string,
  opts: HeartbeatOpts
): Promise<void> {
  const base = process.env.HEARTBEAT_SUPABASE_URL;
  const key = process.env.HEARTBEAT_SUPABASE_KEY;
  if (!base || !key) return; // unconfigured -> no-op

  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    site,
    cron_path: cronPath,
    last_status: opts.ok ? "ok" : "error",
    last_error: opts.ok ? null : String(opts.error ?? "unknown").slice(0, 1000),
    updated_at: now,
  };
  // Only stamp last_success_at on success, so it preserves the true last-good time on failure.
  if (opts.ok) row.last_success_at = now;

  try {
    await fetch(
      `${base.replace(/\/$/, "")}/rest/v1/ops_heartbeats?on_conflict=site,cron_path`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(row),
        signal: AbortSignal.timeout(REST_TIMEOUT_MS),
      }
    );
    // Intentionally ignore the response status — heartbeat is fire-and-forget.
  } catch {
    // Never let a monitoring write break the cron.
  }
}

/**
 * Convenience wrapper: run `work`, heartbeat ok on success / error on throw, and re-throw
 * so the route's own error handling still runs. Optional — plain heartbeat() calls are fine.
 */
export async function withHeartbeat<T>(
  site: string,
  cronPath: string,
  work: () => Promise<T>
): Promise<T> {
  try {
    const result = await work();
    await heartbeat(site, cronPath, { ok: true });
    return result;
  } catch (err) {
    await heartbeat(site, cronPath, { ok: false, error: err });
    throw err;
  }
}
