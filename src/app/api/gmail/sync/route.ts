import { NextRequest, NextResponse } from "next/server";
import { heartbeat } from "@/lib/heartbeat";
import { auth } from "@/lib/auth";
import { syncGmail } from "@/lib/gmail-sync";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await syncGmail(session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Gmail sync error:", err);
    return NextResponse.json({ error: "Gmail sync failed" }, { status: 500 });
  }
}

// Vercel cron calls this — syncs all users with connected Gmail
export async function GET(request: NextRequest) {
  // Verify cron secret — reject if CRON_SECRET is not configured
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // A6b -- the beat below only reports failures this handler SURVIVED. Everything above it
  // ran unguarded: the `@/lib/db` import and the users query, and any module-level throw. When one of those failed, the handler threw, `heartbeat()` was never reached, and
  // ops_heartbeats gained no row -- which `check_cron_heartbeats` reads as NEVER-SEEN or stale,
  // i.e. "this cron did not run". A cron that ran and exploded and one that never fired looked
  // identical, and the louder failure was the quieter signal.
  //
  // Same shape as D41 one repo over: the alarm watched a state the real failure does not
  // produce. So a hard throw now beats, and is re-thrown -- Vercel must still see the 500, and
  // a monitoring write must never turn a failed cron into a successful-looking one.
  try {
    const { sql: dbSql } = await import("@/lib/db");
    const db = dbSql();

    const users = await db`
      SELECT id FROM users WHERE google_refresh_token IS NOT NULL
    `;

    let total = 0;
    let failed = 0;
    for (const user of users) {
      try {
        const result = await syncGmail(user.id);
        total += result.synced;
      } catch (err) {
        failed++;
        console.error(`Gmail sync failed for user ${user.id}:`, err);
      }
    }

    await heartbeat("doppelwriter", "/api/gmail/sync", {
      ok: failed === 0,
      error: failed ? `${failed} of ${users.length} user sync(s) failed` : undefined,
    });

    return NextResponse.json({ usersProcessed: users.length, totalSynced: total, failed });
  } catch (err) {
    await heartbeat("doppelwriter", "/api/gmail/sync", { ok: false, error: err });
    throw err;
  }
}
