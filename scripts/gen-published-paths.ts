// SHARED ALLOWLIST-KEEP-DETAIL generator: builds src/generated/published-paths.json, the build-time list of
// PUBLISHED public content slugs per route template. pageview-url.ts sends the concrete path only when the
// slug is in this list; anything else stays the template. Runs as part of prebuild; the committed copy only
// needs to exist for tsc/tests (a stale copy reports a new page as its template, never leaks).
// Per-site part: the SOURCES block below, built from the same data the pages use in generateStaticParams.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { USE_CASES } from "../src/lib/use-cases";
import { NICHES } from "../src/lib/niches";
import { ALTERNATIVES } from "../src/lib/alternatives";
import { BLOG_POSTS } from "../src/lib/blog-posts";
import { CURATED_WRITERS, CATEGORIES } from "../src/lib/writer-data";

const ROOT = path.resolve(__dirname, "..");

/** Mirrors src/lib/blog.ts getAllPosts (drafts excluded; blog.ts imports server-only so it is mirrored here). */
function mdxBlogSlugs(): string[] {
  const dir = path.join(ROOT, "content", "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .filter((f) => !(matter(fs.readFileSync(path.join(dir, f), "utf8")).data as { draft?: boolean }).draft)
    .map((f) => f.replace(/\.mdx?$/, ""));
}

/** Mirrors writerSlug() in write-like/[slug]/page.tsx. */
const writerSlug = (name: string) => name.toLowerCase().replace(/['’]/g, "").replace(/\s+/g, "-");

// Per-site: template -> slugs, each from the page's own generateStaticParams source.
// NOT listed on purpose: /analyze/:slug (rows read from the DB, user-submitted text: no generateStaticParams),
// /profile/:id and /s/:id (opaque ids).
const SOURCES: Record<string, string[]> = {
  "/alternatives/:slug": ALTERNATIVES.map((a) => a.slug),
  "/blog/:slug": [...BLOG_POSTS.map((p) => p.slug), ...mdxBlogSlugs()],
  "/for/:slug": NICHES.map((n) => n.slug),
  "/write-like/:slug": [...CATEGORIES.map((c) => c.id), ...CURATED_WRITERS.map((w) => writerSlug(w.name))],
  "/write/:slug": USE_CASES.map((u) => u.slug),
};

// SHARED: slugs only, lowercase, [a-z0-9-]{1,120} per param (multi-param values joined by "/"), sorted, deduped.
const SLUG = /^[a-z0-9-]{1,120}(\/[a-z0-9-]{1,120})*$/;
const out: Record<string, string[]> = {};
for (const [tpl, raw] of Object.entries(SOURCES).sort(([a], [b]) => a.localeCompare(b))) {
  out[tpl] = [...new Set(raw.map((s) => String(s).toLowerCase()))].filter((s) => SLUG.test(s)).sort();
}
const file = path.join(ROOT, "src", "generated", "published-paths.json");
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, "{\n" + Object.entries(out).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}\n");
console.log(`gen-published-paths: ${Object.entries(out).map(([k, v]) => `${k}=${v.length}`).join(" ")}`);
