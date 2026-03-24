import { sql } from "./db";
import { PLANS, type PlanKey } from "./stripe";

export interface UsageInfo {
  allowed: boolean;
  throttled: boolean;
  used: number;
  limit: number;
  plan: PlanKey;
}

export async function checkUsage(userId: string): Promise<UsageInfo> {
  const db = sql();

  const [user] = await db`SELECT plan FROM users WHERE id = ${userId}`;
  const plan = (user?.plan || "free") as PlanKey;
  const baseLimit = PLANS[plan].monthlyLimit;

  // Count referral bonuses (5 per referral) — table may not exist yet
  let referralBonus = 0;
  try {
    const [bonusRow] = await db`
      SELECT COUNT(*)::int as count FROM referrals
      WHERE (referrer_id = ${userId} OR referred_id = ${userId})
      AND bonus_applied = TRUE
    `;
    referralBonus = (bonusRow?.count || 0) * 5;
  } catch {
    // referrals table doesn't exist yet — no bonus
  }
  const limit = baseLimit + referralBonus;

  const [row] = await db`
    SELECT COUNT(*)::int as count FROM usage_log
    WHERE user_id = ${userId}
    AND created_at > date_trunc('month', NOW())
  `;
  const used = row?.count || 0;

  if (plan === "free") {
    // Hard cap for free users
    return { allowed: used < limit, throttled: false, used, limit, plan };
  }

  // Pro users: soft cap — always allowed, but throttled past limit
  return {
    allowed: true,
    throttled: used >= limit,
    used,
    limit,
    plan,
  };
}

export async function logUsage(userId: string, action: string): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO usage_log (user_id, action)
    VALUES (${userId}, ${action})
  `;
}
