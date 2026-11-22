/**
 * Automated-traffic flag, ported VERBATIM (same header, same env var) from
 * maid-of-honor-hq/src/lib/signals-server.ts#isTestRequest. DoppelWriter had no
 * detector before 2026-11-21 (DRV SWEEP-1121-2045).
 *
 * SECRET-GATED: with SIGNAL_TEST_SECRET unset this is false for every request,
 * so a real visitor can never mark themselves as a test.
 */
export function isTestRequest(req: Request): boolean {
  const secret = process.env.SIGNAL_TEST_SECRET;
  if (!secret) return false;
  return req.headers.get("x-sn-test-run") === secret;
}
