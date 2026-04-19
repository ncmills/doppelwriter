import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LandingNav from "@/components/LandingNav";
import { JsonLd } from "@/components/JsonLd";
import { ALTERNATIVES, getAlternative } from "@/lib/alternatives";

export function generateStaticParams() {
  return ALTERNATIVES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const alt = getAlternative(slug);
  if (!alt) return {};

  const title = `Best ${alt.competitor} Alternative for Personal Voice`;
  const description = `Looking for a ${alt.competitor} alternative? DoppelWriter matches your personal writing voice — not generic AI output. ${alt.tagline}`;

  return {
    title,
    description,
    keywords: [
      `${alt.competitor.toLowerCase()} alternative`,
      `best ${alt.competitor.toLowerCase()} alternative`,
      `${alt.competitor.toLowerCase()} alternative for writing`,
      `${alt.competitor.toLowerCase()} vs doppelwriter`,
      "AI writing tool voice matching",
      "AI that writes like me",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `https://doppelwriter.com/alternatives/${slug}`,
      siteName: "DoppelWriter",
      title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${alt.competitor} Alternative — DoppelWriter` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: `https://doppelwriter.com/alternatives/${slug}` },
  };
}

const VS_PAGE_MAP: Record<string, string> = {
  chatgpt: "chatgpt",
  jasper: "jasper",
  grammarly: "grammarly",
  "copy-ai": "copyai",
  writesonic: "writesonic",
};

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const alt = getAlternative(slug);
  if (!alt) notFound();

  const otherAlternatives = ALTERNATIVES.filter((a) => a.slug !== slug);
  const vsSlug = VS_PAGE_MAP[slug];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://doppelwriter.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Alternatives",
        item: "https://doppelwriter.com/alternatives",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${alt.competitor} Alternative`,
        item: `https://doppelwriter.com/alternatives/${slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbLd} />

      <LandingNav />

      <main className="max-w-4xl mx-auto px-6">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center">
          <p className="text-[var(--color-accent)] text-sm font-medium tracking-wide uppercase mb-4">
            {alt.competitor} Alternative
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold mb-4">
            Looking for a {alt.competitor} Alternative?
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-ink-soft)] max-w-2xl mx-auto">
            {alt.tagline}
          </p>
        </section>

        {/* Reasons Grid */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-8 text-center">
            Why writers switch from {alt.competitor}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {alt.reasons.map((reason, i) => (
              <div
                key={i}
                className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6"
              >
                <h3 className="font-medium text-lg mb-2">{reason.title}</h3>
                <p className="text-[var(--color-ink-soft)] text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-8 text-center">
            {alt.competitor} vs DoppelWriter at a glance
          </h2>
          <div className="overflow-x-auto rounded-[2px] border border-[var(--color-rule)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-deep)]">
                  <th className="text-left px-5 py-4 font-medium text-[var(--color-ink-soft)] w-1/3">Feature</th>
                  <th className="text-left px-5 py-4 font-medium text-[var(--color-ink-soft)] w-1/3">{alt.competitor}</th>
                  <th className="text-left px-5 py-4 font-medium text-[var(--color-accent)] w-1/3">DoppelWriter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-rule)]">
                <tr className="bg-[var(--color-paper-deep)]">
                  <td className="px-5 py-4 font-medium">Voice matching</td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">Generic tone selectors</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">Forensic voice profile from your writing samples</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Learns from edits</td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">No</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">Yes — gets better with every correction</td>
                </tr>
                <tr className="bg-[var(--color-paper-deep)]">
                  <td className="px-5 py-4 font-medium">Famous writer voices</td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">No</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">140+ curated profiles</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Price</td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">{alt.competitorPrice}</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                    Free (5/mo) or <span className="text-[var(--color-accent)] font-medium">$19/mo</span> Pro
                  </td>
                </tr>
                <tr className="bg-[var(--color-paper-deep)]">
                  <td className="px-5 py-4 font-medium">Key limitation</td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">{alt.competitorLimitation}</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">Built for voice — not a general-purpose tool</td>
                </tr>
              </tbody>
            </table>
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

        {/* Cross-links: VS page */}
        {vsSlug && (
          <section className="pb-12">
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 text-center">
              <p className="text-[var(--color-ink-soft)] text-sm mb-3">Want a detailed feature-by-feature comparison?</p>
              <Link
                href={`/vs/${vsSlug}`}
                className="text-[var(--color-accent)] hover:text-[var(--color-ink)] font-medium transition-colors"
              >
                Read DoppelWriter vs {alt.competitor} &rarr;
              </Link>
            </div>
          </section>
        )}

        {/* Cross-links: Other alternatives */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">
            Other alternatives
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherAlternatives.map((a) => (
              <Link
                key={a.slug}
                href={`/alternatives/${a.slug}`}
                className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)]"
              >
                <p className="font-medium text-sm">{a.competitor} Alternative</p>
                <p className="text-[var(--color-ink-mute)] text-xs mt-1">{a.competitorLimitation.split(" — ")[0]}</p>
              </Link>
            ))}
          </div>
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
