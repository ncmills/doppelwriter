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

// Opaque share/record ids never reach the vendor (SWEEP-1121-1725, IMF-PATH-REDACT-2): the id
// segment becomes :id, anything after it and the query are kept, the hash is always dropped.
// The path is normalised first (percent-decoding, case, doubled slashes, dot segments), the
// pageview `title` on a masked page becomes the masked path, and $set / $set_once get the same
// treatment. The full path stays first-party (Vercel request logs + Vercel Web Analytics).
const ID_ROUTE_PREFIXES: readonly (readonly string[])[] = [["profile"], ["s"]];

function decodeFully(s: string): string {
  let cur = s;
  for (let i = 0; i < 3; i++) {
    let next: string;
    try { next = decodeURIComponent(cur); } catch { break; }
    if (next === cur) break;
    cur = next;
  }
  return cur;
}

function normSegments(path: string): string[] {
  const out: string[] = [];
  for (const seg of decodeFully(path).toLowerCase().replace(/\\/g, "/").split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") { out.pop(); continue; }
    out.push(seg);
  }
  return out;
}

/** Masked form of a bare path (no query/hash), or null when it needs no masking. */
export function redactedPathFor(path: string): string | null {
  const segs = normSegments(path);
  for (const pre of ID_ROUTE_PREFIXES) {
    if (segs.length > pre.length && pre.every((p, i) => segs[i] === p)) {
      return "/" + [...pre, ":id", ...segs.slice(pre.length + 1)].join("/");
    }
  }
  return null;
}

export function stripHash(url: string): string {
  const hi = url.indexOf("#");
  return hi === -1 ? url : url.slice(0, hi);
}

/** Bare path with optional query: masked where needed; hash always dropped. */
export function redactPath(path: string): string {
  if (typeof path !== "string" || !path) return path;
  const noHash = stripHash(path);
  const qi = noHash.indexOf("?");
  const p = qi === -1 ? noHash : noHash.slice(0, qi);
  const query = qi === -1 ? "" : noHash.slice(qi);
  const cut = redactedPathFor(p);
  return (cut ?? p) + query;
}

const ORIGIN_RE = /^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)(.*)$/i;

/** Redact the path of an absolute URL or a bare path; query kept, hash dropped. */
export function redactUrlPath(url: string): string {
  if (typeof url !== "string" || !url) return url;
  const m = url.match(ORIGIN_RE);
  return m ? m[1] + redactPath(m[2]) : redactPath(url);
}

export const POSTHOG_URL_PROPS = [
  "$current_url",
  "$referrer",
  "$initial_referrer",
  "$prev_pageview_url",
  "$session_entry_url",
  "$initial_current_url",
] as const;
export const POSTHOG_PATH_PROPS = [
  "$pathname",
  "$prev_pageview_pathname",
  "$session_entry_pathname",
  "$initial_pathname",
] as const;

/** Query allowlist + path masking on every event's url/path props, in place.
 * posthog-js adds `title` (document.title) to $pageview; on a masked page it becomes the masked path. */
export function sanitizeEventProps(props: Record<string, unknown> | undefined): void {
  if (!props) return;
  if (typeof props.title === "string") {
    const cur = [props.$current_url, props.$pathname].find((v) => typeof v === "string") as string | undefined;
    const m = cur ? cur.match(ORIGIN_RE) : null;
    const path = (m ? m[2] : cur ?? "").split(/[?#]/)[0];
    const cut = path ? redactedPathFor(path) : null;
    if (cut !== null) props.title = cut;
  }
  for (const k of POSTHOG_URL_PROPS) {
    const v = props[k];
    if (typeof v === "string") props[k] = redactUrlPath(sanitizePageviewUrl(v));
  }
  for (const k of POSTHOG_PATH_PROPS) {
    const v = props[k];
    if (typeof v === "string") props[k] = redactPath(v);
  }
}

/** before_send body: properties plus $set / $set_once, in place. */
export function sanitizeEvent(event: { properties?: Record<string, unknown>; $set?: Record<string, unknown>; $set_once?: Record<string, unknown> } | null | undefined): void {
  if (!event) return;
  sanitizeEventProps(event.properties);
  sanitizeEventProps(event.$set);
  sanitizeEventProps(event.$set_once);
}
