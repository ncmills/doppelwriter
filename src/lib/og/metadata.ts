import type { Metadata } from "next";

/**
 * Canonical Open Graph builder.
 *
 * WHY THIS EXISTS
 * ---------------
 * In the Next.js App Router a page-level `openGraph` object REPLACES the root
 * layout's `openGraph` — it does not merge with it. So every page that declared
 * its own `openGraph` block silently dropped `siteName`, `locale` and `type`,
 * and (see below) often its image too. Building every block through this helper
 * keeps those fields from drifting away again page by page.
 *
 * THE `images` ASYMMETRY — READ BEFORE EDITING
 * -------------------------------------------
 * Image files are the one exception to "replace, don't merge". Next merges the
 * `opengraph-image.*` file collected for a segment into that segment's own
 * `openGraph` object only when the object does not already declare `images`
 * (`resolve-metadata`: `if (openGraph && !source.openGraph.hasOwnProperty('images'))`).
 *
 * The check is `hasOwnProperty`, not a truthiness test. `images: undefined` is
 * still an own property and still blocks the merge. That is why
 * `hasRouteImage: true` uses a conditional spread to leave the key GENUINELY
 * ABSENT rather than setting it to `undefined`.
 *
 * Pass `hasRouteImage: true` for any route whose own segment ships a colocated
 * `opengraph-image` file. As of this writing those are:
 *   - src/app/write/[slug]/opengraph-image.tsx
 *   - src/app/analyze/[slug]/opengraph-image.tsx
 *   - src/app/write-like/[slug]/opengraph-image.tsx
 * Adding a static `images` entry to any of those would override their
 * per-route dynamic card with the generic site card.
 */

export const SITE_NAME = "DoppelWriter";
export const SITE_URL = "https://doppelwriter.com";

/**
 * The root dynamic OG card rendered by `src/app/opengraph-image.tsx`.
 * 1200x630 — correct for `twitter:card = summary_large_image`.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "DoppelWriter — AI Writing That Sounds Like You",
} as const;

type OgImage = { url: string; width: number; height: number; alt: string };

type BuildOpenGraphInput = {
  title: string;
  description: string;
  /** Route path (`/pricing`) or an absolute URL. Must be THIS route, not the site root. */
  url: string;
  type?: "website" | "article";
  /**
   * True when this route's own segment has a colocated `opengraph-image` file.
   * Omits the `images` key entirely so Next merges that file in. See the note above.
   */
  hasRouteImage?: boolean;
  /** Override the default site card. Ignored when `hasRouteImage` is true. */
  images?: OgImage[];
  /** `type: "article"` only. */
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

/** Normalise a path or absolute URL to an absolute canonical URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function buildOpenGraph(input: BuildOpenGraphInput): Metadata["openGraph"] {
  const {
    title,
    description,
    url,
    type = "website",
    hasRouteImage = false,
    images,
    publishedTime,
    modifiedTime,
    authors,
  } = input;

  const base = {
    locale: "en_US",
    siteName: SITE_NAME,
    title,
    description,
    url: absoluteUrl(url),
    // Conditional spread — `images` must be ABSENT, never `undefined`, when the
    // route has its own opengraph-image file. Next checks `hasOwnProperty`.
    ...(hasRouteImage ? {} : { images: images ?? [DEFAULT_OG_IMAGE] }),
  };

  if (type === "article") {
    return {
      ...base,
      type: "article",
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors ? { authors } : {}),
    };
  }

  return { ...base, type: "website" };
}
