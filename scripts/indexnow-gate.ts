// Should this build ping IndexNow?
//
// The submit script fetches the LIVE production sitemap and tells Bing/Yandex to recrawl it, so
// running it from a preview deploy or a laptop build is an outbound side effect with no build of
// its own behind it. `postbuild` runs on every `next build` in every environment, which meant
// every local build and every PR preview submitted the production sitemap. Gate it on a real
// production deploy, with an explicit escape hatch for the manual `npm run indexnow` / `deploy`.
export function shouldSubmit(
  env: NodeJS.ProcessEnv,
  argv: string[]
): { run: boolean; reason: string } {
  if (argv.includes("--force") || env.INDEXNOW_FORCE === "1") {
    return { run: true, reason: "forced explicitly (--force / INDEXNOW_FORCE=1)" };
  }
  if (env.VERCEL_ENV === "production") {
    return { run: true, reason: "Vercel production deploy" };
  }
  if (env.VERCEL_ENV) {
    return { run: false, reason: `Vercel ${env.VERCEL_ENV} deploy — only production submits` };
  }
  return { run: false, reason: "local build (no VERCEL_ENV) — use --force to submit anyway" };
}
