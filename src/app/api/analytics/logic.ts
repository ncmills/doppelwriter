/**
 * Shapes a query result row-set into a single metric value, distinguishing
 * "the query failed" (rows === null, from the `.catch()` fallback below)
 * from "the query succeeded and the real value is 0".
 *
 * A failed query must never be reported as a disguised 0 — the admin
 * analytics JSON marks it `null` ("unavailable") instead, so a consumer can
 * tell a real zero apart from a DB blip.
 */
export function metricOrUnavailable(
  rows: Array<Record<string, unknown>> | null,
  key: string
): number | null {
  if (rows === null) return null;
  return Number(rows[0]?.[key] ?? 0);
}
