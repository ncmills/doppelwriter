// Query-string allowlist for URLs sent to PostHog (MAX-DATA-NO-COOKIES ruling).
// Capture source and landing page, never anything else from the query.
// "ref" is deliberately NOT allowed: it is the DoppelWriter referral code (held for ruling).
export const POSTHOG_QUERY_ALLOWLIST: ReadonlySet<string> = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
]);

/** Filter a query string (with or without leading "?") down to allowlisted keys. */
export function filterQuery(search: string): string {
  const out = new URLSearchParams();
  new URLSearchParams(search).forEach((v, k) => {
    if (POSTHOG_QUERY_ALLOWLIST.has(k)) out.append(k, v);
  });
  return out.toString();
}

/** Filter the query of an absolute or relative URL string. Hash is preserved. */
export function sanitizePageviewUrl(url: string): string {
  if (typeof url !== "string" || !url) return url;
  const qi = url.indexOf("?");
  if (qi === -1) return url;
  const hi = url.indexOf("#", qi);
  const base = url.slice(0, qi);
  const search = url.slice(qi + 1, hi === -1 ? undefined : hi);
  const hash = hi === -1 ? "" : url.slice(hi);
  const kept = filterQuery(search);
  return base + (kept ? "?" + kept : "") + hash;
}
