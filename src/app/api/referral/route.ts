import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = sql();
  const userId = session.user.id;

  const [user] = await db`SELECT referral_code FROM users WHERE id = ${userId}`;
  if (!user?.referral_code) {
    return NextResponse.json({ error: "No referral code" }, { status: 404 });
  }

  const [countRow] = await db`
    SELECT COUNT(*)::int as count FROM referrals WHERE referrer_id = ${userId}
  `;
  const count = countRow?.count || 0;

  // Total bonus from all referral relationships (both as referrer and referred)
  const [bonusRow] = await db`
    SELECT COUNT(*)::int as count FROM referrals
    WHERE (referrer_id = ${userId} OR referred_id = ${userId})
    AND bonus_applied = TRUE
  `;
  const bonus = (bonusRow?.count || 0) * 5;

  return NextResponse.json({
    code: user.referral_code,
    count,
    bonus,
  });
}
