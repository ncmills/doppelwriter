import { NextRequest, NextResponse } from "next/server";
import { heartbeat } from "@/lib/heartbeat";
import { sql } from "@/lib/db";
import { generateProfile } from "@/lib/style-analyzer";

// Vercel cron or manual trigger — re-generates profiles that have accumulated
// enough new corrections to warrant a refresh. This is the auto-improvement loop.

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  // Verify cron secret or admin auth — reject if CRON_SECRET is not configured
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // A6b -- the beat below only reports failures this handler SURVIVED. Everything above it
  // ran unguarded: `sql()` and the profiles-needing-refresh query, and any module-level throw. When one of those failed, the handler threw, `heartbeat()` was never reached, and
  // ops_heartbeats gained no row -- which `check_cron_heartbeats` reads as NEVER-SEEN or stale,
  // i.e. "this cron did not run". A cron that ran and exploded and one that never fired looked
  // identical, and the louder failure was the quieter signal.
  //
  // Same shape as D41 one repo over: the alarm watched a state the real failure does not
  // produce. So a hard throw now beats, and is re-thrown -- Vercel must still see the 500, and
  // a monitoring write must never turn a failed cron into a successful-looking one.
  try {
    const db = sql();

    // Find profiles with 5+ unprocessed corrections since last profile update
    const profilesNeedingRefresh = await db`
      SELECT sp.id, sp.name, sp.updated_at,
        COUNT(vc.id)::int as correction_count
      FROM style_profiles sp
      JOIN voice_corrections vc ON vc.profile_id = sp.id
      WHERE vc.created_at > sp.updated_at
      GROUP BY sp.id, sp.name, sp.updated_at
      HAVING COUNT(vc.id) >= 3
      ORDER BY COUNT(vc.id) DESC
      LIMIT 10
    `;

    let refreshed = 0;
    let failed = 0;
    for (const profile of profilesNeedingRefresh) {
      try {
        await generateProfile(profile.id);
        refreshed++;
      } catch (err) {
        failed++;
        console.error(`Auto-improve failed for profile ${profile.id} (${profile.name}):`, err);
      }
    }

    await heartbeat("doppelwriter", "/api/profiles/auto-improve", {
      ok: failed === 0,
      error: failed ? `${failed} of ${profilesNeedingRefresh.length} profile refresh(es) failed` : undefined,
    });

    return NextResponse.json({
      checked: profilesNeedingRefresh.length,
      refreshed,
      profiles: profilesNeedingRefresh.map((p) => ({
        id: p.id,
        name: p.name,
        corrections: p.correction_count,
      })),
    });
  } catch (err) {
    await heartbeat("doppelwriter", "/api/profiles/auto-improve", { ok: false, error: err });
    throw err;
  }
}
