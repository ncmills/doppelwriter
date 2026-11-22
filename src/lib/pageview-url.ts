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

/** Filter the query of an absolute or relative URL string. Hash is preserved.
 * Pre-pass only: before_send (sanitizeEvent) chooses the path from the allowlist. */
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

// Per-site configuration (DoppelWriter). Templates come from src/app routes on origin/main (4caca79).
// A param segment is written ":name"; it matches [a-z0-9-]{1,120} only. Matching is exact.
export const SAME_SITE_HOSTS: ReadonlySet<string> = new Set(["doppelwriter.com", "www.doppelwriter.com", "localhost"]);

const STATIC_ROUTES = [
  "/",
  "/alternatives",
  "/analyze",
  "/blog",
  "/blog/rss.xml",
  "/create/personal",
  "/embed",
  "/embed/tone-checker",
  "/embed/voice-analyzer",
  "/for",
  "/forgot-password",
  "/home",
  "/how-it-works",
  "/login",
  "/merge",
  "/onboarding",
  "/preview/cinematic",
  "/preview/film",
  "/pricing",
  "/privacy",
  "/reset-password",
  "/settings",
  "/signup",
  "/sitemap-html",
  "/style-guide",
  "/terms",
  "/tools/email-tone-checker",
  "/vs/chatgpt",
  "/vs/copyai",
  "/vs/grammarly",
  "/vs/jasper",
  "/vs/writesonic",
  "/write",
  "/write-like",
  "/write/business",
  "/write/content",
  "/write/formal",
  "/write/personal",
  "/write/professional",
];

export const ROUTE_TEMPLATES: ReadonlyArray<{ pattern: string; template: string }> = [
  ...STATIC_ROUTES.map((p) => ({ pattern: p, template: p })),
  // Opaque share/profile ids never leave.
  { pattern: "/profile/:id", template: "/profile/:id" },
  { pattern: "/s/:id", template: "/s/:id" },
  { pattern: "/alternatives/:slug", template: "/alternatives/:slug" },
  { pattern: "/analyze/:slug", template: "/analyze/:slug" },
  { pattern: "/blog/:slug", template: "/blog/:slug" },
  { pattern: "/for/:slug", template: "/for/:slug" },
  { pattern: "/write-like/:slug", template: "/write-like/:slug" },
  { pattern: "/write/:slug", template: "/write/:slug" },
];

// ---------------------------------------------------------------------------
// SHARED REDACT-ALLOWLIST helper: copy verbatim per repo; only ROUTE_TEMPLATES and SAME_SITE_HOSTS differ
// (REDACT-ALLOWLIST-1121). The path sent to the vendor is CHOSEN from ROUTE_TEMPLATES, never made by
// cutting pieces out of the raw string. Anything that does not normalise cleanly and match exactly
// becomes the fixed string "/other". Hash is always dropped; query keeps POSTHOG_QUERY_ALLOWLIST keys
// only; `title` becomes the template; cross-site referrers keep origin only. Full paths stay
// first-party (Vercel request logs + Vercel Web Analytics).
// ---------------------------------------------------------------------------

export const OTHER_PATH = "/other";
const PARAM_SEGMENT = /^[a-z0-9-]{1,120}$/;
const MAX_DECODE_ROUNDS = 8;
// Control chars, any whitespace, ";", a leftover "%", "?" or "#" inside the decoded path part -> /other.
const FORBIDDEN_IN_PATH = /[\u0000-\u001f\u007f-\u009f\s;%?#]/u;

/** Normalised segments of a bare path, or null when it must become /other. */
function normalisedSegments(path: string): string[] | null {
  let cur = path;
  let stable = false;
  for (let i = 0; i < MAX_DECODE_ROUNDS; i++) {
    let next: string;
    try { next = decodeURIComponent(cur); } catch { return null; }
    if (next === cur) { stable = true; break; }
    cur = next;
  }
  if (!stable || FORBIDDEN_IN_PATH.test(cur)) return null;
  const out: string[] = [];
  for (const seg of cur.toLowerCase().replace(/\\/g, "/").split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") { out.pop(); continue; }
    out.push(seg);
  }
  return out;
}

const COMPILED_TEMPLATES = ROUTE_TEMPLATES.map((t) => ({
  segs: t.pattern.split("/").filter(Boolean),
  template: t.template,
}));

/** Always a template string from ROUTE_TEMPLATES, or "/other". Input is a bare path (no query/hash). */
export function templateForPath(path: string): string {
  if (typeof path !== "string") return OTHER_PATH;
  const segs = normalisedSegments(path);
  if (!segs) return OTHER_PATH;
  for (const t of COMPILED_TEMPLATES) {
    if (t.segs.length !== segs.length) continue;
    let ok = true;
    for (let i = 0; i < segs.length && ok; i++) {
      ok = t.segs[i].startsWith(":") ? PARAM_SEGMENT.test(segs[i]) : t.segs[i] === segs[i];
    }
    if (ok) return t.template;
  }
  return OTHER_PATH;
}

/** Split raw "path?query#hash"; hash discarded. */
function splitPathQuery(s: string): { path: string; query: string } {
  const hi = s.indexOf("#");
  const noHash = hi === -1 ? s : s.slice(0, hi);
  const qi = noHash.indexOf("?");
  return qi === -1 ? { path: noHash, query: "" } : { path: noHash.slice(0, qi), query: noHash.slice(qi + 1) };
}

/** Template + allowlisted query for a bare path (optionally carrying query/hash). */
export function sanitizePath(path: string): string {
  if (typeof path !== "string") return OTHER_PATH;
  const { path: p, query } = splitPathQuery(path);
  const kept = filterQuery(query);
  return templateForPath(p) + (kept ? "?" + kept : "");
}

const ABS_URL_RE = /^([a-z][a-z0-9+.-]*):\/\/([^/?#\\]*)(.*)$/i;

function parseAbsolute(url: string): { origin: string; host: string; rest: string } | null {
  const m = url.match(ABS_URL_RE);
  if (!m) return null;
  const scheme = m[1].toLowerCase();
  const authority = m[2].slice(m[2].lastIndexOf("@") + 1).toLowerCase(); // userinfo never leaves
  if (!/^[a-z0-9.-]+(:[0-9]{1,5})?$/.test(authority)) return null;
  return { origin: scheme + "://" + authority, host: authority.split(":")[0], rest: m[3] };
}

/**
 * Sanitise an absolute URL or a bare path.
 * originOnlyIfCrossSite (referrers): a host outside sameSiteHosts keeps scheme+host only.
 * "$direct" (PostHog's no-referrer marker) passes through; anything unparseable -> "/other".
 */
export function sanitizeUrl(
  url: string,
  sameSiteHosts: ReadonlySet<string> = SAME_SITE_HOSTS,
  originOnlyIfCrossSite = false,
): string {
  if (typeof url !== "string" || !url) return url;
  if (url === "$direct") return url;
  const abs = parseAbsolute(url);
  if (abs) {
    if (originOnlyIfCrossSite && !sameSiteHosts.has(abs.host)) return abs.origin;
    return abs.origin + sanitizePath(abs.rest || "/");
  }
  if (url.startsWith("/") && !url.startsWith("//")) return sanitizePath(url);
  return OTHER_PATH;
}

export const POSTHOG_URL_PROPS = [
  "$current_url",
  "$referrer",
  "$initial_referrer",
  "$prev_pageview_url",
  "$session_entry_url",
  "$initial_current_url",
] as const;
export const POSTHOG_REFERRER_PROPS: ReadonlySet<string> = new Set(["$referrer", "$initial_referrer"]);
export const POSTHOG_PATH_PROPS = [
  "$pathname",
  "$prev_pageview_pathname",
  "$session_entry_pathname",
  "$initial_pathname",
] as const;

/** Template of the page an event was captured on (used for `title`). */
function currentTemplate(props: Record<string, unknown>): string {
  const cur = [props.$current_url, props.$pathname].find((v) => typeof v === "string") as string | undefined;
  if (!cur) return OTHER_PATH;
  const abs = parseAbsolute(cur);
  if (!abs && !(cur.startsWith("/") && !cur.startsWith("//"))) return OTHER_PATH;
  return templateForPath(splitPathQuery(abs ? abs.rest || "/" : cur).path);
}

/** Allowlist every url/path prop and `title`, in place. */
export function sanitizeEventProps(props: Record<string, unknown> | undefined): void {
  if (!props) return;
  if ("title" in props) props.title = currentTemplate(props);
  for (const k of POSTHOG_URL_PROPS) {
    const v = props[k];
    if (typeof v === "string") props[k] = sanitizeUrl(v, SAME_SITE_HOSTS, POSTHOG_REFERRER_PROPS.has(k));
  }
  for (const k of POSTHOG_PATH_PROPS) {
    const v = props[k];
    if (typeof v === "string") props[k] = sanitizePath(v);
  }
}

/** before_send body: properties plus $set / $set_once, in place. */
export function sanitizeEvent(event: { properties?: Record<string, unknown>; $set?: Record<string, unknown>; $set_once?: Record<string, unknown> } | null | undefined): void {
  if (!event) return;
  sanitizeEventProps(event.properties);
  sanitizeEventProps(event.$set);
  sanitizeEventProps(event.$set_once);
}

// Thin wrappers kept for existing callers.
/** Bare path (optional query/hash) -> template + allowlisted query. */
export function redactPath(path: string): string {
  if (typeof path !== "string" || !path) return path;
  return sanitizePath(path);
}
/** Absolute URL or bare path -> origin + template + allowlisted query. */
export function redactUrlPath(url: string): string {
  return sanitizeUrl(url);
}
// ---------------------------------------------------------------------------
// end SHARED REDACT-ALLOWLIST helper
// ---------------------------------------------------------------------------
