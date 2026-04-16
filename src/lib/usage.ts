import { sql } from "./db";
import { PLANS, type PlanKey } from "./stripe";

export interface UsageInfo {
  allowed: boolean;
  throttled: boolean;
  used: number;
  limit: number;
  plan: PlanKey;
  reason?: "unverified" | "limit";
}

export async function checkUsage(userId: string): Promise<UsageInfo> {
  const db = sql();

  const [result] = await db`
    SELECT
      u.plan,
      u.email_verified,
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

  if (!result?.email_verified && plan === "free") {
    return { allowed: false, throttled: false, used, limit, plan, reason: "unverified" };
  }

  if (plan === "free") {
    return { allowed: used < limit, throttled: false, used, limit, plan, reason: used < limit ? undefined : "limit" };
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

export interface ProfileLimitInfo {
  allowed: boolean;
  current: number;
  limit: number;
  plan: PlanKey;
}

export async function checkProfileLimit(userId: string): Promise<ProfileLimitInfo> {
  const db = sql();
  const [row] = await db`
    SELECT
      u.plan,
      (SELECT COUNT(*)::int FROM style_profiles WHERE user_id = ${userId} AND (is_curated IS FALSE OR is_curated IS NULL)) as current
    FROM users u
    WHERE u.id = ${userId}
  `;
  const plan = (row?.plan || "free") as PlanKey;
  const limitRaw = PLANS[plan].personalProfiles;
  const limit = Number.isFinite(limitRaw) ? (limitRaw as number) : Number.MAX_SAFE_INTEGER;
  const current = row?.current || 0;
  return { allowed: current < limit, current, limit, plan };
}

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
}

export async function checkRateLimit(userId: string): Promise<RateLimitInfo> {
  const db = sql();
  const [result] = await db`
    SELECT COUNT(*)::int as cnt FROM usage_log
    WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '1 minute'
  `;
  const count = result?.cnt || 0;
  const limit = 20;
  return { allowed: count < limit, remaining: Math.max(0, limit - count) };
}

export async function logUsage(userId: string, action: string): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO usage_log (user_id, action)
    VALUES (${userId}, ${action})
  `;
}
