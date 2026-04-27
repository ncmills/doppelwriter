import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = sql();
  const userId = session.user.id;

  const [row] = await db`
    SELECT
      u.referral_code,
      (SELECT COUNT(*)::int FROM referrals WHERE referrer_id = ${userId}) AS count,
      (SELECT COUNT(*)::int FROM referrals
        WHERE (referrer_id = ${userId} OR referred_id = ${userId})
        AND bonus_applied = TRUE) AS bonus_count
    FROM users u
    WHERE u.id = ${userId}
  `;

  if (!row?.referral_code) {
    return NextResponse.json({ error: "No referral code" }, { status: 404 });
  }

  return NextResponse.json({
    code: row.referral_code,
    count: row.count || 0,
    bonus: (row.bonus_count || 0) * 5,
  });
}
