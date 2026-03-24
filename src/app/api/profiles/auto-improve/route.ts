import { NextRequest, NextResponse } from "next/server";
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

  const db = sql();

  // Find profiles with 5+ unprocessed corrections since last profile update
  const profilesNeedingRefresh = await db`
    SELECT sp.id, sp.name, sp.updated_at,
      COUNT(vc.id)::int as correction_count
    FROM style_profiles sp
    JOIN voice_corrections vc ON vc.profile_id = sp.id
    WHERE vc.created_at > sp.updated_at
    GROUP BY sp.id, sp.name, sp.updated_at
    HAVING COUNT(vc.id) >= 5
    ORDER BY COUNT(vc.id) DESC
    LIMIT 10
  `;

  let refreshed = 0;
  for (const profile of profilesNeedingRefresh) {
    try {
      await generateProfile(profile.id);
      refreshed++;
    } catch (err) {
      console.error(`Auto-improve failed for profile ${profile.id} (${profile.name}):`, err);
    }
  }

  return NextResponse.json({
    checked: profilesNeedingRefresh.length,
    refreshed,
    profiles: profilesNeedingRefresh.map((p) => ({
      id: p.id,
      name: p.name,
      corrections: p.correction_count,
    })),
  });
}
