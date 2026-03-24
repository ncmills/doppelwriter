import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

// Only accessible by admin (nick@doppelwriter.com)
export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.email !== "nick@doppelwriter.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") || "7");

  const db = sql();

  const [users, newUsers, generations, edits, profiles, shares, upgrades, toneChecks, analyzerUses, topWriters, topUseCasePages, dailyActivity, retentionData] = await Promise.all([
    // Total users
    db`SELECT COUNT(*) as count FROM users`,
    // New users in period
    db`SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - ${days + ' days'}::interval`,
    // Generations in period
    db`SELECT COUNT(*) as count FROM usage_log WHERE action = 'generate' AND created_at > NOW() - ${days + ' days'}::interval`,
    // Edits in period
    db`SELECT COUNT(*) as count FROM usage_log WHERE action = 'edit' AND created_at > NOW() - ${days + ' days'}::interval`,
    // Profiles created in period
    db`SELECT COUNT(*) as count FROM style_profiles WHERE created_at > NOW() - ${days + ' days'}::interval AND is_curated = false`,
    // Shares in period
    db`SELECT COUNT(*) as count FROM shared_drafts WHERE created_at > NOW() - ${days + ' days'}::interval`,
    // Pro users
    db`SELECT COUNT(*) as count FROM users WHERE plan = 'pro'`,
    // Tone checker uses (from analytics_events)
    db`SELECT COUNT(*) as count FROM analytics_events WHERE event = 'tone_check' AND created_at > NOW() - ${days + ' days'}::interval`.catch(() => [{ count: 0 }]),
    // Analyzer uses
    db`SELECT COUNT(*) as count FROM analyzer_results WHERE created_at > NOW() - ${days + ' days'}::interval`,
    // Top writer profiles used (by generation count)
    db`SELECT sp.writer_name, COUNT(*) as uses
       FROM usage_log ul
       JOIN style_profiles sp ON sp.id = CAST(ul.action AS INTEGER)
       WHERE ul.created_at > NOW() - ${days + ' days'}::interval AND sp.writer_name IS NOT NULL
       GROUP BY sp.writer_name ORDER BY uses DESC LIMIT 10`.catch(() => []),
    // Top pages from analytics events
    db`SELECT page, COUNT(*) as views
       FROM analytics_events
       WHERE page IS NOT NULL AND created_at > NOW() - ${days + ' days'}::interval
       GROUP BY page ORDER BY views DESC LIMIT 10`.catch(() => []),
    // Daily activity (signups + generations)
    db`SELECT DATE(created_at) as day, COUNT(*) as count
       FROM usage_log WHERE created_at > NOW() - ${days + ' days'}::interval
       GROUP BY day ORDER BY day`,
    // Retention: users who came back after day 1
    db`SELECT COUNT(DISTINCT ul.user_id) as retained
       FROM usage_log ul
       JOIN users u ON u.id = ul.user_id
       WHERE u.created_at < NOW() - INTERVAL '1 day'
       AND ul.created_at > u.created_at + INTERVAL '1 day'
       AND ul.created_at > NOW() - ${days + ' days'}::interval`.catch(() => [{ retained: 0 }]),
  ]);

  return NextResponse.json({
    period: `${days}d`,
    totals: {
      users: Number(users[0].count),
      proUsers: Number(upgrades[0].count),
      newUsers: Number(newUsers[0].count),
    },
    activity: {
      generations: Number(generations[0].count),
      edits: Number(edits[0].count),
      profilesCreated: Number(profiles[0].count),
      shares: Number(shares[0].count),
      toneChecks: Number(toneChecks[0]?.count || 0),
      analyzerUses: Number(analyzerUses[0].count),
    },
    retention: {
      usersReturnedAfterDay1: Number(retentionData[0]?.retained || 0),
    },
    dailyActivity,
    topWriters,
    topPages: topUseCasePages,
  });
}
