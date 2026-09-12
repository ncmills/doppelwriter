import type { Metadata } from "next";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/lib/use-cases";
import { buildOpenGraph } from "@/lib/og/metadata";

/**
 * The public index of every writing template.
 *
 * The per-template pages (/write/[slug]) and the five category pages
 * (/write/personal, /write/business, ...) have existed for a long time; the
 * hub above them did not. "All templates" in the footer and "See templates" on
 * the homepage both pointed at /write -- which is the signed-in editor, so a
 * logged-out visitor following either link got bounced to /login instead of a
 * list of templates. This page is that list.
 *
 * Every number and every link below is derived from USE_CASES at render time,
 * so the hub cannot drift from the pages that actually exist.
 */

const TEMPLATE_COUNT = USE_CASES.length;

// One line per category, describing the category itself. No counts, no claims
// -- the figures on this page all come from the data.
const CATEGORY_BLURBS: Record<string, string> = {
  personal:
    "Toasts, letters, the message you have rewritten eleven times. Sounding like yourself is the whole job.",
  professional:
    "The ask, the follow-up, the polite no. Email that lands, in your own register.",
  business:
    "Proposals, updates, pages. Company writing that doesn't read like it came off a shelf.",
  content:
    "Essays, posts, scripts, newsletters. The long stuff, in the voice people subscribed for.",
  formal:
    "Notices, complaints, requests. Correct without going stiff.",
};

export const metadata: Metadata = {
  title: `${TEMPLATE_COUNT} AI Writing Templates — Every Draft in Your Own Voice`,
  description: `Browse all ${TEMPLATE_COUNT} DoppelWriter templates — wedding speeches, cover letters, newsletters, proposals, formal letters and more. Each one drafted in your voice, not a generic AI one.`,
  keywords: [
    "AI writing templates",
    "AI writing prompts",
    "write my wedding speech",
    "AI cover letter",
    "AI email writer",
  ],
  openGraph: buildOpenGraph({
    url: "/templates",
    title: `${TEMPLATE_COUNT} AI Writing Templates — Every Draft in Your Own Voice`,
    description: `Every writing task DoppelWriter has a template for, grouped by what you're writing.`,
  }),
  twitter: {
    card: "summary_large_image",
    title: `${TEMPLATE_COUNT} AI Writing Templates`,
    description: `Every writing task DoppelWriter has a template for, grouped by what you're writing.`,
  },
  alternates: { canonical: "https://doppelwriter.com/templates" },
};

export default function TemplatesIndexPage() {
  const groups = USE_CASE_CATEGORIES.map((cat) => ({
    ...cat,
    blurb: CATEGORY_BLURBS[cat.id] ?? "",
    cases: USE_CASES.filter((u) => u.category === cat.id),
  })).filter((g) => g.cases.length > 0);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://doppelwriter.com" },
      { "@type": "ListItem", position: 2, name: "Templates", item: "https://doppelwriter.com/templates" },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DoppelWriter Writing Templates",
    numberOfItems: USE_CASES.length,
    itemListElement: USE_CASES.map((uc, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: uc.title,
      url: `https://doppelwriter.com/write/${uc.slug}`,
    })),
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DoppelWriter Writing Templates",
    description:
      "Every writing task DoppelWriter has a template for, grouped by what you're writing.",
    url: "https://doppelwriter.com/templates",
    isPartOf: { "@type": "WebApplication", name: "DoppelWriter" },
    numberOfItems: USE_CASES.length,
  };

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={itemListLd} />
      <JsonLd data={collectionLd} />

      <LandingNav />

      <main id="main-content" className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Hero */}
        <section className="py-16 sm:py-24">
          <nav
            aria-label="Breadcrumb"
            className="text-sm text-[var(--color-fg-muted)] mb-6 flex items-center gap-1.5 flex-wrap"
          >
            <Link href="/" className="hover:text-[var(--color-fg)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Templates</span>
          </nav>

          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-fg-muted)] mb-3">
            The Assignments
          </p>
          <h1 className="font-[family-name:var(--font-display)] font-bold text-[40px] sm:text-[56px] leading-[1.03] tracking-[-0.02em] mb-4 max-w-3xl">
            {TEMPLATE_COUNT} writing templates.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
            Every writing task DoppelWriter has a starting point for, grouped by what
            you&apos;re actually writing. Pick one, pick a voice, and the draft comes back
            sounding like you wrote it.
          </p>
          <p className="text-[13px] text-[var(--color-fg-muted)] mt-4">
            {TEMPLATE_COUNT} templates across {groups.length} categories.
          </p>
        </section>

        <hr className="rule" />

        {/* Category jump links */}
        <section className="py-8">
          <div className="flex flex-wrap gap-3">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] px-4 py-2 text-sm transition-colors hover:border-[var(--color-fg)]"
              >
                {g.label}{" "}
                <span className="text-[var(--color-fg-muted)]">{g.cases.length}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Every template, grouped */}
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="py-10 scroll-mt-20">
            <div className="border-t border-[var(--color-fg)] pt-5 mb-8 max-w-2xl">
              <div className="flex items-baseline justify-between gap-6 mb-2">
                <h2 className="font-[family-name:var(--font-display)] text-[26px] sm:text-[30px] leading-tight">
                  {g.label}
                </h2>
                <span className="text-[13px] text-[var(--color-fg-muted)] whitespace-nowrap">
                  {g.cases.length} templates
                </span>
              </div>
              <p className="text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
                {g.blurb}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.cases.map((uc) => (
                <Link
                  key={uc.slug}
                  href={`/write/${uc.slug}`}
                  className="group bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] p-5 transition-colors hover:border-[var(--color-fg)]"
                >
                  <p className="font-medium mb-1 group-hover:text-[var(--color-brand)] transition-colors">
                    {uc.title}
                  </p>
                  <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
                    {uc.description}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-5">
              <Link
                href={`/write/${g.id}`}
                className="ed-link ed-link-accent text-[13px] uppercase tracking-[0.15em]"
              >
                {g.label} overview &rarr;
              </Link>
            </div>
          </section>
        ))}

        <hr className="rule" />

        {/* CTA */}
        <section className="py-16 sm:py-24 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
            Nothing here fits?
          </h2>
          <p className="text-[var(--color-fg-muted)] mb-8 max-w-xl mx-auto leading-relaxed">
            The templates are starting points, not limits. Describe what you need in the
            editor and DoppelWriter drafts it in whichever voice you pick.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-[var(--color-fg)] text-[var(--color-surface)] hover:bg-[var(--color-brand)] rounded-[2px] font-medium text-lg transition-colors"
          >
            Start Writing Free
          </Link>
          <p className="text-[var(--color-fg-muted)] text-xs mt-3">No credit card required</p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
