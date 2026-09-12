// Guards for the /templates hub.
//
// The failure this reproduces: the per-template pages (/write/[slug]) and the
// five category pages shipped without an index above them, and the two links
// that promised one -- "All templates" in the footer, "See templates" on the
// homepage -- both pointed at /write, the signed-in editor. A logged-out
// visitor following either got redirected to /login. So: the hub must exist,
// must be reachable without a session, must be in the sitemap, and every
// template must actually appear on it (the hub groups by category, so a use
// case with an unknown category would render nowhere at all).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isPublicPath } from "@/lib/public-paths";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/lib/use-cases";

const ROOT = join(__dirname, "..", "..", "..");
const read = (...p: string[]) => readFileSync(join(ROOT, ...p), "utf8");

describe("/templates hub", () => {
  it("is reachable without a session", () => {
    expect(isPublicPath("/templates")).toBe(true);
  });

  it("does not open unrelated paths (negative control)", () => {
    expect(isPublicPath("/templatesx")).toBe(false);
    expect(isPublicPath("/settings")).toBe(false);
  });

  it("is listed in the XML sitemap", () => {
    expect(read("src", "app", "sitemap.ts")).toContain("${baseUrl}/templates");
  });

  it("is listed in the HTML sitemap", () => {
    expect(read("src", "app", "sitemap-html", "page.tsx")).toContain('href: "/templates"');
  });

  it('the footer "All templates" link points at the hub, not the signed-in editor', () => {
    expect(read("src", "components", "SiteFooter.tsx")).toMatch(
      /label: "All templates", href: "\/templates"/,
    );
  });

  it('the homepage "See templates" card points at the hub, not the signed-in editor', () => {
    const home = read("src", "app", "page.tsx");
    const card = home.slice(home.indexOf("${TEMPLATE_COUNT} Templates"));
    expect(card.slice(0, card.indexOf('cta: "See templates"'))).toContain('href: "/templates"');
  });
});

describe("template data the hub renders", () => {
  it("has templates and categories to render (positive control)", () => {
    expect(USE_CASES.length).toBeGreaterThan(0);
    expect(USE_CASE_CATEGORIES.length).toBeGreaterThan(0);
  });

  it("files every template under a known category, so none is invisible on the hub", () => {
    const known = new Set(USE_CASE_CATEGORIES.map((c) => c.id));
    const orphans = USE_CASES.filter((u) => !known.has(u.category)).map((u) => u.slug);
    expect(orphans).toEqual([]);
  });

  it("gives every category at least one template", () => {
    const empty = USE_CASE_CATEGORIES.filter(
      (c) => !USE_CASES.some((u) => u.category === c.id),
    ).map((c) => c.id);
    expect(empty).toEqual([]);
  });
});
