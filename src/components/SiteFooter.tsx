import Link from "next/link";
import { NetworkFooter } from "@/components/NetworkFooter";

/**
 * The site footer — one component, every page.
 *
 * Until 2026-08-18 this markup lived inline in src/app/page.tsx and NOWHERE
 * else. Twenty-five other page files hand-rolled a slim bar of their own —
 * "© DoppelWriter" plus Pricing / Privacy / Terms — so the three-column
 * footer, the cluster links and the contact address existed on the homepage
 * and on no other route. Measured on production:
 *
 *   curl https://doppelwriter.com/pricing | grep aissdi.com   ->  nothing
 *
 * That is the whole ~530-page pSEO surface — /write-like/*, /for/*, /vs/*,
 * /alternatives/*, /analyze/* — carrying zero links to the legal cluster it
 * belongs to, and no path back into the product beyond one pricing link.
 *
 * The cross-site list is NetworkFooter now, not the old CrossSiteList. That
 * component held a SECOND hardcoded copy of the cluster (aissdi,
 * idonthaveawill) while src/lib/network-sites.ts held the first — two lists
 * that had to agree and nothing making them. It also revealed its links with
 * an IntersectionObserver, so with JS off they were in the DOM and invisible.
 *
 * /embed/* keeps its own one-line attribution footer. Those pages render
 * inside somebody else's iframe; a full site footer there is not chrome, it
 * is a payload.
 */

const footerCols: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Voice Analyzer", href: "/analyze" },
      { label: "The Editor", href: "/write" },
      { label: "For Writers", href: "/for" },
      { label: "Pricing", href: "/pricing" },
      { label: "Guides", href: "/blog" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Wedding speech", href: "/write/wedding-speech" },
      { label: "Cover letter", href: "/write/cover-letter" },
      { label: "Newsletter", href: "/write/newsletter" },
      { label: "Blog post", href: "/write/blog-post" },
      { label: "LinkedIn post", href: "/write/linkedin-post" },
      // /write is the signed-in editor -- a logged-out visitor following this
      // link landed on /login, not on a list of templates. /templates is that list.
      { label: "All templates", href: "/templates" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs. ChatGPT", href: "/vs/chatgpt" },
      { label: "vs. Jasper", href: "/vs/jasper" },
      { label: "vs. Grammarly", href: "/vs/grammarly" },
      { label: "vs. Copy.ai", href: "/vs/copyai" },
      { label: "vs. Writesonic", href: "/vs/writesonic" },
      { label: "All alternatives", href: "/alternatives" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-fg)] bg-[var(--color-surface-raised)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Masthead */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 text-[var(--color-fg)]">
              <svg
                viewBox="0 0 64 64"
                className="h-7 w-7"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M 4 12 L 18 12 C 28 12 30 20 30 32 C 30 44 28 52 18 52 L 4 52 Z M 10 16 L 17 16 C 22 16 24 22 24 32 C 24 42 22 48 17 48 L 10 48 Z" />
                <rect x="30" y="12" width="2" height="40" />
                <path d="M 32 12 L 36 12 L 42 52 L 38 52 Z" />
                <path d="M 39 52 L 41 52 L 48 12 L 46 12 Z" />
                <path d="M 45 12 L 49 12 L 55 52 L 51 52 Z" />
                <path d="M 52 52 L 54 52 L 61 12 L 59 12 Z" />
              </svg>
              <span className="font-[family-name:var(--font-display)] font-bold text-xl tracking-[-0.02em]">
                DoppelWriter
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
              Voice-matched writing for people who still read.
            </p>
          </div>

          {/* 3 columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-fg-muted)] mb-5">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="ed-link text-[14px] text-[var(--color-fg)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* The cross-site strip. It was <CrossSiteList /> — a SECOND hardcoded
            copy of the cluster list, rendered only on the homepage, revealed by
            an IntersectionObserver so the links were invisible without JS.
            NetworkFooter reads src/lib/network-sites.ts, the list the blog pages
            already used, so there is one source now instead of two that had to
            agree and nothing making them. */}
        <div className="border-t border-[var(--color-border)] pt-8 mb-8">
          <NetworkFooter currentDomain="doppelwriter.com" />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--color-border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-fg-muted)]">
          <span>© {new Date().getFullYear()} DoppelWriter · All rights reserved</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="ed-link">Privacy</Link>
            <Link href="/terms" className="ed-link">Terms</Link>
            <a href="mailto:info@doppelwriter.com" className="ed-link">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
