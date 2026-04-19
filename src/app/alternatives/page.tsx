import type { Metadata } from "next";
import Link from "next/link";
import { ALTERNATIVES } from "@/lib/alternatives";
import { JsonLd } from "@/components/JsonLd";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "DoppelWriter Alternatives & Competitors — Compare AI Writing Tools",
  description:
    "Compare DoppelWriter to ChatGPT, Jasper, Grammarly, Copy.ai, Writesonic, QuillBot, Wordtune, and Rytr. See why writers switch to voice-matching AI.",
  keywords: [
    "doppelwriter alternatives",
    "AI writing tool comparison",
    "best AI writing tools",
    "chatgpt alternative for writing",
    "jasper alternative",
    "grammarly alternative",
    "AI voice matching tools",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com/alternatives",
    siteName: "DoppelWriter",
    title: "DoppelWriter Alternatives & Competitors",
    description:
      "Compare DoppelWriter to every major AI writing tool. See the differences that matter.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DoppelWriter Alternatives" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoppelWriter Alternatives & Competitors",
    description:
      "Compare DoppelWriter to ChatGPT, Jasper, Grammarly, and more. See why writers switch.",
  },
  alternates: { canonical: "https://doppelwriter.com/alternatives" },
};

export default function AlternativesIndexPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://doppelwriter.com" },
      { "@type": "ListItem", position: 2, name: "Alternatives", item: "https://doppelwriter.com/alternatives" },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DoppelWriter Alternatives & Competitors",
    description:
      "Compare DoppelWriter to every major AI writing tool and see the differences that matter.",
    url: "https://doppelwriter.com/alternatives",
    publisher: {
      "@type": "Organization",
      name: "DoppelWriter",
      url: "https://doppelwriter.com",
    },
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={collectionLd} />

      {/* Nav */}
      <nav className="border-b border-[var(--color-rule)] sticky top-0 bg-[var(--color-paper)]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-display)] font-bold text-lg flex items-center gap-0">
            <Logo className="h-[0.86em] w-auto mr-0.5 text-[var(--color-accent)]" />
            <span className="hidden sm:inline">DoppelWriter</span>
            <span className="sm:hidden">DW</span>
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] transition-colors"
          >
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold mb-4">
            DoppelWriter Alternatives & Competitors
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-ink-soft)] max-w-2xl mx-auto">
            Honest comparisons of DoppelWriter vs every major AI writing tool. See
            what each tool does best — and where voice-matching makes the difference.
          </p>
        </section>

        {/* Alternatives Grid */}
        <section className="pb-16">
          <div className="grid sm:grid-cols-2 gap-6">
            {ALTERNATIVES.map((alt) => (
              <Link
                key={alt.slug}
                href={`/alternatives/${alt.slug}`}
                className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 transition-colors hover:border-[var(--color-ink)] group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold group-hover:text-[var(--color-accent)] transition-colors">
                    {alt.competitor}
                  </h2>
                  <span className="text-[var(--color-ink-mute)] text-sm">{alt.competitorPrice}</span>
                </div>
                <p className="text-[var(--color-ink-soft)] text-sm leading-relaxed mb-3">
                  {alt.tagline}
                </p>
                <p className="text-[var(--color-ink-mute)] text-xs">
                  {alt.competitorLimitation}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* VS Pages */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-6">
            Detailed comparisons
          </h2>
          <p className="text-[var(--color-ink-soft)] mb-6">
            Want a full feature-by-feature breakdown? Read the in-depth comparisons:
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/vs/chatgpt" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs ChatGPT</p>
            </Link>
            <Link href="/vs/jasper" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs Jasper</p>
            </Link>
            <Link href="/vs/grammarly" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs Grammarly</p>
            </Link>
            <Link href="/vs/copyai" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs Copy.ai</p>
            </Link>
            <Link href="/vs/writesonic" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs Writesonic</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center border-t border-[var(--color-rule)]">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
            Try DoppelWriter free
          </h2>
          <p className="text-[var(--color-ink-soft)] mb-8">
            5 uses per month. No credit card. See how your writing sounds when AI actually
            matches your voice.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium text-lg transition-colors"
          >
            Start Writing Free
          </Link>
          <p className="text-[var(--color-ink-mute)] text-xs mt-3">No credit card required</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-rule)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[var(--color-ink-mute)]">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors">Terms</Link>
          </div>
          <a
            href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry"
            className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-accent)] transition-colors"
          >
            Enterprise &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
