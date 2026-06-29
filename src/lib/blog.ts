// Blog content layer — reads MDX posts from /content/blog at build time.
// Posts are golf-travel editorial (TDF): destination guides, course reviews,
// trip reports, gear picks. No audience split; no tool taxonomy.
// Ported from ssdi-platform/src/lib/blog.ts (audience/tool machinery removed).
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface Citation {
  /** Display name of the source, e.g. "USGA — Rules of Golf". */
  label: string;
  /** Canonical published URL (must resolve in a normal browser). */
  url: string;
}

export interface PostFrontmatter {
  title: string;
  /** One-line meta description / dek. */
  description: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  /** ISO date, e.g. 2026-06-25. */
  datePublished: string;
  dateModified?: string;
  citations: Citation[];
  /** Slugs of related posts for the related-reading rail. */
  related?: string[];
  /** Reading time override; otherwise estimated from body length (words/220). */
  readingMinutes?: number;
  draft?: boolean;
}

export interface Post extends PostFrontmatter {
  slug: string;
  /** Raw MDX body (frontmatter stripped). */
  content: string;
  readingMinutes: number;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function readPostFile(fileName: string): Post {
  const slug = fileName.replace(/\.mdx?$/, '');
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), 'utf8');
  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;
  return {
    ...fm,
    slug,
    content,
    dateModified: fm.dateModified ?? fm.datePublished,
    readingMinutes: fm.readingMinutes ?? estimateReadingMinutes(content),
  };
}

let _cache: Post[] | null = null;

/** All published posts, newest first. Drafts excluded in production. */
export function getAllPosts(): Post[] {
  if (_cache) return _cache;
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f));
  const posts = files
    .map(readPostFile)
    .filter((p) => process.env.NODE_ENV === 'development' || !p.draft)
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished));
  _cache = posts;
  return posts;
}

/** Look up a single post by slug. Returns undefined if not found or is a draft in production. */
export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/**
 * Resolve `related` slugs to posts; if not enough, backfill with recent posts.
 * The originating post is always excluded from results.
 */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const explicit = (post.related ?? [])
    .map((s) => getPost(s))
    .filter((p): p is Post => Boolean(p) && p!.slug !== post.slug);
  if (explicit.length >= limit) return explicit.slice(0, limit);
  const fill = getAllPosts()
    .filter((p) => p.slug !== post.slug && !explicit.some((e) => e.slug === p.slug))
    .slice(0, limit - explicit.length);
  return [...explicit, ...fill];
}
