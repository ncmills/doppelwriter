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

  const [result] = await db`
    SELECT
      u.plan,
      (SELECT COUNT(*)::int FROM usage_log WHERE user_id = ${userId} AND created_at > date_trunc('month', NOW())) as used,
      COALESCE((SELECT COUNT(*)::int FROM referrals WHERE (referrer_id = ${userId} OR referred_id = ${userId}) AND bonus_applied = TRUE), 0) as referral_count
    FROM users u
    WHERE u.id = ${userId}
  `;

  const plan = (result?.plan || "free") as PlanKey;
  const baseLimit = PLANS[plan].monthlyLimit;
  const referralBonus = (result?.referral_count || 0) * 5;
  const limit = baseLimit + referralBonus;
  const used = result?.used || 0;

  if (plan === "free") {
    return { allowed: used < limit, throttled: false, used, limit, plan };
  }

  return {
    allowed: true,
    throttled: used >= limit,
    used,
    limit,
    plan,
  };
}

export async function verifyProfileAccess(userId: string, profileId: number): Promise<boolean> {
  const db = sql();
  const [profile] = await db`
    SELECT id FROM style_profiles
    WHERE id = ${profileId}
    AND (user_id = ${userId} OR is_curated = TRUE)
  `;
  return !!profile;
}

export async function logUsage(userId: string, action: string): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO usage_log (user_id, action)
    VALUES (${userId}, ${action})
  `;
}
