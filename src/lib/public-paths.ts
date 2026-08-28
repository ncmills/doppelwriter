// Paths the auth middleware lets through WITHOUT a session. Pure module (no
// next-auth / db imports) so the predicate the middleware actually runs can be
// unit-tested -- see public-paths.test.ts, which asserts every cron in
// vercel.json is matched here.
//
// Contract for /api/* entries: a route listed here MUST authenticate itself.
// Vercel crons carry `Authorization: Bearer $CRON_SECRET` and no cookie, so a
// cron path that is NOT listed here never reaches its handler -- middleware
// 307s it to /login and the in-route CRON_SECRET guard never executes. That
// was D95 (2026-08-28): /api/cron/emails passed via the "/api/cron" prefix,
// while /api/gmail/sync and /api/profiles/auto-improve 307'd every night.

export const publicPaths = [
  "/",
  "/pricing",
  "/login",
  "/signup",
  "/write-like",
  "/write",
  "/privacy",
  "/terms",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/auth/verify",
  "/api/stripe/webhook",
  "/api/gmail/callback",
  "/api/init", // protected by CRON_SECRET or session check internally
  "/api/demo",
  "/s",
  "/vs",
  // Vercel crons (vercel.json). Each self-guards on CRON_SECRET; the test in
  // public-paths.test.ts asserts every registered cron is matched here.
  "/api/cron",
  "/api/gmail/sync", // GET = cron (CRON_SECRET), POST = session
  "/api/profiles/auto-improve", // cron (CRON_SECRET) or session
  "/api/subscribe",
  "/blog",
  "/analyze",
  "/api/analyze",
  "/for",
  "/how-it-works",
  "/alternatives",
  "/tools",
  "/sitemap-html",
  "/embed",
  "/preview",
  "/style-guide", // noindex design-system reference — public so it's viewable without login
];

/** True when `pathname` is one of the public paths or nested under one. */
export function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
