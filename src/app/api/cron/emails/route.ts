import { NextRequest, NextResponse } from "next/server";
import { heartbeat } from "@/lib/heartbeat";
import { sql } from "@/lib/db";
import { SEQUENCES, sendSequenceEmail } from "@/lib/email-sequences";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = sql();
  const now = new Date();

  // Get all free users who signed up in the last 8 days (covers the full sequence)
  const users = await db`
    SELECT u.id, u.email, u.name, u.plan, u.created_at,
      (SELECT COUNT(*)::int FROM usage_log WHERE user_id = u.id AND created_at > date_trunc('month', NOW())) as used,
      (SELECT COUNT(*)::int FROM style_profiles WHERE user_id = u.id AND is_curated = FALSE) as profiles
    FROM users u
    WHERE u.plan = 'free'
    AND u.email_verified = TRUE
    AND u.created_at > NOW() - INTERVAL '9 days'
    AND u.created_at < NOW() - INTERVAL '20 hours'
  `;

  let sent = 0;
  let failed = 0;

  // Batch-fetch all sent sequences to avoid N+1 queries
  const userIds = users.map((u) => u.id);
  const allSent = userIds.length > 0
    ? await db`SELECT user_id, sequence_key FROM email_sequence_sends WHERE user_id = ANY(${userIds})`
    : [];
  const sentMap = new Map<string, Set<string>>();
  for (const row of allSent) {
    if (!sentMap.has(row.user_id)) sentMap.set(row.user_id, new Set());
    sentMap.get(row.user_id)!.add(row.sequence_key);
  }

  // A6b -- the beat below only reports failures this handler SURVIVED. Everything above it
  // ran unguarded: the db handle and the scheduled-email query, and any module-level throw. When one of those failed, the handler threw, `heartbeat()` was never reached, and
  // ops_heartbeats gained no row -- which `check_cron_heartbeats` reads as NEVER-SEEN or stale,
  // i.e. "this cron did not run". A cron that ran and exploded and one that never fired looked
  // identical, and the louder failure was the quieter signal.
  //
  // Same shape as D41 one repo over: the alarm watched a state the real failure does not
  // produce. So a hard throw now beats, and is re-thrown -- Vercel must still see the 500, and
  // a monitoring write must never turn a failed cron into a successful-looking one.
  try {
    for (const user of users) {
      const signupDate = new Date(user.created_at);
      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

      const sentKeys = sentMap.get(user.id) ?? new Set<string>();

      for (const seq of SEQUENCES) {
        // Skip if already sent or not yet time
        if (sentKeys.has(seq.key)) continue;
        if (daysSinceSignup < seq.dayOffset) continue;

        // Check condition if any
        if (seq.condition) {
          const shouldSend = seq.condition({ used: user.used, hasProfile: user.profiles > 0 });
          if (!shouldSend) continue;
        }

        try {
          await sendSequenceEmail(user.email, seq, user.name || undefined);
          await db`
            INSERT INTO email_sequence_sends (user_id, sequence_key)
            VALUES (${user.id}, ${seq.key})
            ON CONFLICT DO NOTHING
          `;
          sent++;
        } catch {
          // Individual email failure shouldn't stop the cron
          failed++;
        }
      }
    }

    await heartbeat("doppelwriter", "/api/cron/emails", {
      ok: failed === 0,
      error: failed ? `${failed} sequence email send(s) failed` : undefined,
    });

    return NextResponse.json({ sent, checked: users.length, failed });
  } catch (err) {
    await heartbeat("doppelwriter", "/api/cron/emails", { ok: false, error: err });
    throw err;
  }
}
