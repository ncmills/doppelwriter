import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
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

  const { sql: dbSql } = await import("@/lib/db");
  const db = dbSql();

  const users = await db`
    SELECT id FROM users WHERE google_refresh_token IS NOT NULL
  `;

  let total = 0;
  for (const user of users) {
    try {
      const result = await syncGmail(user.id);
      total += result.synced;
    } catch (err) {
      console.error(`Gmail sync failed for user ${user.id}:`, err);
    }
  }

  return NextResponse.json({ usersProcessed: users.length, totalSynced: total });
}
