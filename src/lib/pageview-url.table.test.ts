// SHARED REDACT-ALLOWLIST test table (REDACT-ALLOWLIST-1121), DoppelWriter rows.
import { describe, it, expect } from "vitest";
import { templateForPath, sanitizeUrl, sanitizeEvent, redactPath, redactUrlPath, ROUTE_TEMPLATES, PUBLISHED } from "./pageview-url";

const O = "https://doppelwriter.com";
const SECRET = "SECRETid123";

// Encoding cases applied to EACH id route. {R} = route prefix ("profile" or "s"), {S} = secret id.
const ID_CASES = (r: string, t: string): Array<[string, string]> => [
  [`/${r}%3F${SECRET}`, "/other"],
  [`/${r}%23${SECRET}`, "/other"],
  [`/${r}%09/${SECRET}`, "/other"],
  [`/${r}%20/${SECRET}`, "/other"],
  [`/${r};x/${SECRET}`, "/other"],
  [`/%E0%A4%A/${r}/${SECRET}`, "/other"],
  [`//host/${r}/${SECRET}`, "/other"],
  [`/${r}/%252e%252e/${SECRET}`, "/other"],
  [`/${r}/${SECRET}/..`, "/other"],
  [`/${r.toUpperCase()}/${SECRET}`, t],
  [`/${r}/${SECRET}`, t],
  [`/${r}/${SECRET}/`, t],
  [`/${r}%2F${SECRET}`, t],
  [`/${r}%252F${SECRET}`, t],
  [`/${r}/./${SECRET}`, t],
  [`/x/../${r}/${SECRET}`, t],
  [`\\${r}\\${SECRET}`, t],
  [`/${r}/${SECRET}/print`, "/other"],
  [`/${r}/${SECRET} x`, "/other"],
  [`/${r}/${SECRET}%00`, "/other"],
  [`/${r}/${SECRET}%25`, "/other"],
  [`/${r}/${"a".repeat(121)}`, "/other"],
  [`/api/${r}/${SECRET}`, "/other"],
  [`/${r}s/${SECRET}`, "/other"],
];

const PATH_TABLE: Array<[string, string]> = [
  ...ID_CASES("profile", "/profile/:id"),
  ...ID_CASES("s", "/s/:id"),
  ["/profile", "/other"],
  ["/s", "/other"],
  ["/write/mark-twain", "/write/:slug"],
  ["/write/business", "/write/business"],
  ["/write-like/conan-obrien", "/write-like/conan-obrien"], // published (ALLOWLIST-KEEP-DETAIL)
  ["/blog/how-to-write", "/blog/:slug"],
  ["/blog/rss.xml", "/blog/rss.xml"],
  ["/alternatives/hemingway-app", "/alternatives/:slug"],
  ["/analyze/some-author", "/analyze/:slug"],
  ["/for/founders", "/for/:slug"],
  ["/write/Some_Thing", "/other"],
  ["/", "/"],
  ["", "/"],
  ...ROUTE_TEMPLATES.filter((t) => !t.pattern.includes(":")).flatMap((t): Array<[string, string]> => [
    [t.pattern, t.pattern],
    [t.pattern.toUpperCase() + "/", t.pattern],
  ]),
];

const URL_TABLE: Array<[string, string]> = [
  ...["profile", "s"].flatMap((r): Array<[string, string]> => [
    [O + `/${r}%3F${SECRET}`, O + "/other"],
    [O + `/${r}%23${SECRET}`, O + "/other"],
    [O + `/${r}%09/${SECRET}`, O + "/other"],
    [O + `/${r}%20/${SECRET}`, O + "/other"],
    [O + `/${r};x/${SECRET}`, O + "/other"],
    [O + `/%E0%A4%A/${r}/${SECRET}`, O + "/other"],
    [O + `//host/${r}/${SECRET}`, O + "/other"],
    [O + `/${r}/%252e%252e/${SECRET}`, O + "/other"],
    [O + `/${r}/${SECRET}/..`, O + "/other"],
    [O + `/${r.toUpperCase()}/${SECRET}`, O + `/${r}/:id`],
    [O + `/${r}/${SECRET}?utm_source=g&k=${SECRET}#${SECRET}`, O + `/${r}/:id?utm_source=g`],
    [O + `/${r}/${SECRET}?ref=abc`, O + `/${r}/:id`],
    [`https://user:${SECRET}@doppelwriter.com/${r}/${SECRET}`, O + `/${r}/:id`],
    [`//doppelwriter.com/${r}/${SECRET}`, "/other"],
  ]),
  [O, O + "/"],
  [O + "/?a=1#/profile/" + SECRET, O + "/"],
  ["HTTPS://DOPPELWRITER.COM/S/" + SECRET, O + "/s/:id"],
  ["http://localhost:3000/profile/" + SECRET, "http://localhost:3000/profile/:id"],
  ["profile/" + SECRET, "/other"],
  ["javascript:" + SECRET, "/other"],
  ["$direct", "$direct"],
];

const FORBIDDEN = [SECRET, SECRET.toLowerCase(), "mark-twain", "hemingway-app", "how-to-write", "founders"];

function pathPart(out: string): string {
  const m = out.match(/^[a-z]+:\/\/[^/?#]*(.*)$/);
  return (m ? m[1] : out).split("?")[0];
}

describe("REDACT-ALLOWLIST: path table", () => {
  it.each(PATH_TABLE)("templateForPath(%j) -> %j", (input, expected) => {
    expect(templateForPath(input)).toBe(expected);
    if (input) expect(redactPath(input)).toBe(expected);
  });
});

describe("REDACT-ALLOWLIST: url table", () => {
  it.each(URL_TABLE)("sanitizeUrl(%j) -> %j", (input, expected) => {
    expect(sanitizeUrl(input)).toBe(expected);
    expect(redactUrlPath(input)).toBe(expected);
  });
});

describe("REDACT-ALLOWLIST: event props", () => {
  it("templates every url/path prop, title, $set and $set_once; cross-site referrer -> origin only", () => {
    const e = {
      properties: {
        $current_url: `${O}/profile/${SECRET}?token=s&ref=a#x`,
        $pathname: `/profile/${SECRET}`,
        title: "Alex's voice profile",
        $referrer: `${O}/profile%3F${SECRET}`,
        $initial_referrer: `https://www.google.com/search?q=${SECRET}`,
        $prev_pageview_url: `${O}/s/${SECRET}`,
        $prev_pageview_pathname: `/s/${SECRET}`,
        $session_entry_url: `${O}/s;x/${SECRET}`,
        $session_entry_pathname: `/s%20/${SECRET}`,
        $initial_current_url: `${O}/pricing`,
        $initial_pathname: "/pricing",
        step_index: 2,
      },
      $set: { $current_url: `${O}/s/${SECRET}`, $pathname: `/s/${SECRET}`, $referrer: `https://evil.example/s/${SECRET}?x=1` },
      $set_once: {
        $initial_current_url: `${O}/profile/${SECRET}/print`,
        $initial_pathname: `/profile/${SECRET}/print`,
        $initial_referrer: `https://www.doppelwriter.com/s/${SECRET}`,
        title: SECRET,
      },
    };
    sanitizeEvent(e);
    expect(e.properties).toEqual({
      $current_url: O + "/profile/:id",
      $pathname: "/profile/:id",
      title: "/profile/:id",
      $referrer: O + "/other",
      $initial_referrer: "https://www.google.com",
      $prev_pageview_url: O + "/s/:id",
      $prev_pageview_pathname: "/s/:id",
      $session_entry_url: O + "/other",
      $session_entry_pathname: "/other",
      $initial_current_url: O + "/pricing",
      $initial_pathname: "/pricing",
      step_index: 2,
    });
    expect(e.$set).toEqual({ $current_url: O + "/s/:id", $pathname: "/s/:id", $referrer: "https://evil.example" });
    expect(e.$set_once).toEqual({
      $initial_current_url: O + "/other",
      $initial_pathname: "/other",
      $initial_referrer: "https://www.doppelwriter.com/s/:id",
      title: "/other",
    });
    expect(JSON.stringify(e)).not.toMatch(/secretid123|token|evil\.example\/|google\.com\//i);
    sanitizeEvent(null);
  });

  it("title becomes the template on every page", () => {
    const p: Record<string, unknown> = { $current_url: O + "/write/mark-twain", title: "Write like Mark Twain" };
    sanitizeEvent({ properties: p });
    expect(p.title).toBe("/write/:slug");
  });
});

describe("REDACT-ALLOWLIST: invariant over the whole table", () => {
  it("no output carries a forbidden token or a char outside [a-z0-9/:_.-] in the path", () => {
    const outs = [
      ...PATH_TABLE.map(([i]) => templateForPath(i)),
      ...URL_TABLE.map(([i]) => sanitizeUrl(i)),
      ...URL_TABLE.map(([i]) => sanitizeUrl(i, undefined, true)),
    ];
    for (const out of outs) {
      for (const f of FORBIDDEN) expect(out).not.toContain(f);
      if (out === "$direct") continue;
      expect(pathPart(out)).toMatch(/^[a-z0-9/:_.-]*$/);
    }
  });
});

// ALLOWLIST-KEEP-DETAIL: published slugs (from the build-time list) come out concrete; nothing else does.
const S = SECRET;
const R = "/s/";
const pub = (tpl: string): string => {
  const v = (PUBLISHED[tpl] ?? []).find((x) => !/secret/.test(x));
  if (!v) throw new Error("no published slug for " + tpl);
  return v;
};
const WL = pub("/write-like/:slug");
const POST = pub("/blog/:slug");
const PUB_TABLE: Array<[string, string]> = [
  ["/write-like/" + WL, "/write-like/" + WL],
  ["/blog/" + POST, "/blog/" + POST],
  ["/BLOG/" + POST.toUpperCase(), "/blog/" + POST],
  ["/blog/" + POST + "/", "/blog/" + POST],
  ["/blog%2F" + POST, "/blog/" + POST],
  ["/x/../blog/" + POST, "/blog/" + POST],
  ...Object.keys(PUBLISHED).map((tpl): [string, string] => [tpl.replace(":" + tpl.split(":").pop(), PUBLISHED[tpl][0] ?? "x"), PUBLISHED[tpl].length ? tpl.replace(":" + tpl.split(":").pop(), PUBLISHED[tpl][0]) : tpl]),
  // Unpublished lookalikes -> template.
  ["/blog/" + POST + "-zz", "/blog/:slug"],
  ["/write-like/" + WL + "-zz", "/write-like/:slug"],
  ["/analyze/" + POST, "/analyze/:slug"], // user-content template: never concrete
  // Every encoding case on a published slug.
  ["/blog/" + POST + "%3F" + S, "/other"],
  ["/blog/" + POST + "%23" + S, "/other"],
  ["/blog%09/" + POST, "/other"],
  ["/blog%20/" + POST, "/other"],
  ["/blog;x/" + POST, "/other"],
  ["/%E0%A4%A/blog/" + POST, "/other"],
  ["//host/blog/" + POST, "/other"],
  ["/blog/%252e%252e/" + POST, "/other"], // normalises to /<post>: no such route
  ["/blog/" + POST + "/..", "/blog"],
  ["/blog/" + POST + "/" + S, "/other"],
  ["/blog/" + POST + "%00", "/other"],
  ["/blog/" + POST + "%25", "/other"],
  ["/blog/" + POST + "?token=" + S, "/blog/" + POST],
  // Share/profile ids stay masked even when the id equals a published slug.
  [R + WL, R + ":id"],
  [R + POST, R + ":id"],
  ["/profile/" + POST, "/profile/:id"],
];

describe("ALLOWLIST-KEEP-DETAIL: published slugs", () => {
  it.each(PUB_TABLE)("redactPath(%j) -> %j", (input, expected) => {
    expect(redactPath(input).split("?")[0]).toBe(expected);
  });
  it("absolute URL, title and props carry the concrete published path", () => {
    expect(sanitizeUrl(O + "/blog/" + POST + "?utm_source=g&token=" + S + "#" + S)).toBe(O + "/blog/" + POST + "?utm_source=g");
    const p: Record<string, unknown> = { $current_url: O + "/write-like/" + WL, title: "Raw title " + S, $pathname: "/write-like/" + WL };
    sanitizeEvent({ properties: p });
    expect(p).toEqual({ $current_url: O + "/write-like/" + WL, title: "/write-like/" + WL, $pathname: "/write-like/" + WL });
  });
  it("no published list for share/account/user-content templates; outputs stay in [a-z0-9/:_.-] with no secret", () => {
    for (const k of Object.keys(PUBLISHED)) expect(k).not.toMatch(/:id|analyze|my-trips|auth|login|admin|account|settings|embed|profile|share|\/s\//);
    for (const [i] of PUB_TABLE) {
      const out = redactPath(i).split("?")[0];
      expect(out).not.toMatch(/secret/i);
      expect(out).toMatch(/^[a-z0-9/:_.-]*$/);
    }
  });
});

// SWEEP-1121-2115: person props nested inside properties ($set / $set_once) get the same per-key rules as top-level props.
describe("REDACT-ALLOWLIST: invariant over the whole table, nested properties.$set / $set_once", () => {
  it("every table input in properties.$set.$current_url / $set_once.$initial_* -> same as top level, no forbidden token", () => {
    for (const [i] of [...PATH_TABLE, ...URL_TABLE]) {
      const u = i.startsWith("/") ? O + i : i;
      const set = { $current_url: u, $pathname: i, $referrer: u, title: i };
      const once = { $initial_current_url: u, $initial_pathname: i, $initial_referrer: u };
      const e = { properties: { $set: { ...set }, $set_once: { ...once }, keep: 1 } };
      const topSet = { properties: { ...set } };
      const topOnce = { properties: { ...once } };
      sanitizeEvent(e);
      sanitizeEvent(topSet);
      sanitizeEvent(topOnce);
      expect(e.properties.$set).toEqual(topSet.properties);
      expect(e.properties.$set_once).toEqual(topOnce.properties);
      expect(e.properties.keep).toBe(1);
      for (const f of FORBIDDEN) expect(JSON.stringify(e)).not.toContain(f);
    }
  });
  it("non-object nested $set / $set_once are left alone", () => {
    const e = { properties: { $set: "x", $set_once: ["y"] } as Record<string, unknown> };
    sanitizeEvent(e);
    expect(e.properties).toEqual({ $set: "x", $set_once: ["y"] });
  });
});
