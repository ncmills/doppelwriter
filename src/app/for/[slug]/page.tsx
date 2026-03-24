import { notFound } from "next/navigation";
import Link from "next/link";
import { NICHES } from "@/lib/niches";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

const RELATED_NICHES: Record<string, string[]> = {
  "newsletter-writers": ["content-marketers", "ghostwriters", "fiction-writers"],
  "ghostwriters": ["newsletter-writers", "content-marketers", "fiction-writers"],
  "fiction-writers": ["newsletter-writers", "ghostwriters", "students"],
  "content-marketers": ["newsletter-writers", "ghostwriters", "cover-letters"],
  "students": ["cover-letters", "fiction-writers", "content-marketers"],
  "wedding-speeches": ["eulogies", "students", "cover-letters"],
  "eulogies": ["wedding-speeches", "students", "newsletter-writers"],
  "cover-letters": ["students", "content-marketers", "ghostwriters"],
};

const NICHE_WRITERS: Record<string, { slug: string; label: string }[]> = {
  "newsletter-writers": [
    { slug: "seth-godin", label: "Seth Godin" },
    { slug: "james-clear", label: "James Clear" },
    { slug: "maria-popova", label: "Maria Popova" },
  ],
  "ghostwriters": [
    { slug: "ernest-hemingway", label: "Ernest Hemingway" },
    { slug: "joan-didion", label: "Joan Didion" },
    { slug: "paul-graham", label: "Paul Graham" },
  ],
  "fiction-writers": [
    { slug: "ernest-hemingway", label: "Ernest Hemingway" },
    { slug: "toni-morrison", label: "Toni Morrison" },
    { slug: "haruki-murakami", label: "Haruki Murakami" },
  ],
  "content-marketers": [
    { slug: "seth-godin", label: "Seth Godin" },
    { slug: "paul-graham", label: "Paul Graham" },
    { slug: "james-clear", label: "James Clear" },
  ],
  "students": [
    { slug: "george-orwell", label: "George Orwell" },
    { slug: "joan-didion", label: "Joan Didion" },
    { slug: "james-baldwin", label: "James Baldwin" },
  ],
  "wedding-speeches": [
    { slug: "david-sedaris", label: "David Sedaris" },
    { slug: "nora-ephron", label: "Nora Ephron" },
  ],
  "eulogies": [
    { slug: "mary-oliver", label: "Mary Oliver" },
    { slug: "joan-didion", label: "Joan Didion" },
  ],
  "cover-letters": [
    { slug: "james-clear", label: "James Clear" },
    { slug: "paul-graham", label: "Paul Graham" },
    { slug: "cal-newport", label: "Cal Newport" },
  ],
};

function getNiche(slug: string) {
  return NICHES.find((n) => n.slug === slug);
}

export function generateStaticParams() {
  return NICHES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const niche = getNiche(slug);
  if (!niche) return {};

  return {
    title: niche.metaTitle,
    description: niche.metaDescription,
    keywords: niche.keywords,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `https://doppelwriter.com/for/${niche.slug}`,
      siteName: "DoppelWriter",
      title: niche.metaTitle,
      description: niche.metaDescription,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: niche.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: niche.metaTitle,
      description: niche.metaDescription,
    },
    alternates: { canonical: `https://doppelwriter.com/for/${niche.slug}` },
  };
}

export default async function NichePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const niche = getNiche(slug);
  if (!niche) notFound();

  const isSensitive = niche.slug === "eulogies";

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: niche.title,
          description: niche.metaDescription,
          url: `https://doppelwriter.com/for/${niche.slug}`,
          publisher: {
            "@type": "Organization",
            name: "DoppelWriter",
            url: "https://doppelwriter.com",
          },
          isPartOf: { "@type": "WebApplication", name: "DoppelWriter" },
        }}
      />
      {niche.faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: niche.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }}
        />
      )}

      {/* Nav */}
      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-literata)] font-bold text-lg">
            DoppelWriter
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            Try Free
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="py-20 md:py-28 text-center px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-[family-name:var(--font-literata)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {niche.title}
            </h1>
            <p className="text-lg md:text-xl text-stone-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              {niche.heroSubtitle}
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
            >
              {niche.ctaText}
            </Link>
            <p className="text-stone-600 text-xs mt-3">Free to start. No credit card required.</p>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-16 md:py-20 px-6 bg-stone-900/30">
          <div className="max-w-5xl mx-auto">
            <p className="text-amber-400 text-sm font-medium uppercase tracking-wider mb-3">
              The problem
            </p>
            <h2 className="font-[family-name:var(--font-literata)] text-3xl md:text-4xl font-bold mb-10">
              {isSensitive ? "Why this is so hard" : "Sound familiar?"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {niche.painPoints.map((pain, i) => (
                <div
                  key={i}
                  className="bg-[#0C0A09] border border-stone-800/40 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-red-400/80 text-lg mt-0.5 shrink-0">&times;</span>
                    <p className="text-stone-300 leading-relaxed">{pain}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How DoppelWriter Helps */}
        <section className="py-16 md:py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-amber-400 text-sm font-medium uppercase tracking-wider mb-3">
              The solution
            </p>
            <h2 className="font-[family-name:var(--font-literata)] text-3xl md:text-4xl font-bold mb-10">
              How DoppelWriter helps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {niche.howItHelps.map((help, i) => (
                <div
                  key={i}
                  className="bg-stone-900/40 border border-stone-800/40 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-amber-400 font-bold text-lg mt-0.5 shrink-0">
                      {i + 1}.
                    </span>
                    <p className="text-stone-300 leading-relaxed">{help}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You Can Write */}
        <section className="py-16 md:py-20 px-6 bg-stone-900/30">
          <div className="max-w-5xl mx-auto">
            <p className="text-amber-400 text-sm font-medium uppercase tracking-wider mb-3">
              Use cases
            </p>
            <h2 className="font-[family-name:var(--font-literata)] text-3xl md:text-4xl font-bold mb-10">
              What you can write
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {niche.useCases.map((useCase, i) => (
                <div
                  key={i}
                  className="bg-[#0C0A09] border border-stone-800/40 rounded-lg px-5 py-4 flex items-center gap-3"
                >
                  <span className="text-amber-400 shrink-0">&#10003;</span>
                  <span className="text-stone-300 text-sm">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Placeholder */}
        <section className="py-16 md:py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-stone-900/40 border border-stone-800/40 rounded-2xl p-8 md:p-12">
              <svg
                className="w-10 h-10 text-amber-600/40 mx-auto mb-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
              </svg>
              <p className="text-stone-300 text-lg md:text-xl leading-relaxed italic font-[family-name:var(--font-literata)]">
                {niche.testimonialPlaceholder.replace(/^"|"$/g, "")}
              </p>
              <p className="text-stone-600 text-sm mt-6">
                {isSensitive ? "A DoppelWriter user" : "Early DoppelWriter user"}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 px-6 bg-stone-900/30">
          <div className="max-w-3xl mx-auto">
            <p className="text-amber-400 text-sm font-medium uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="font-[family-name:var(--font-literata)] text-3xl md:text-4xl font-bold mb-10">
              Common questions
            </h2>
            <div className="space-y-6">
              {niche.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-[#0C0A09] border border-stone-800/40 rounded-xl p-6"
                >
                  <h3 className="font-medium text-lg mb-3">{faq.q}</h3>
                  <p className="text-stone-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related — cross-links to other niches, writers, and tools */}
        <section className="py-16 md:py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-amber-400 text-sm font-medium uppercase tracking-wider mb-3">
              Explore more
            </p>
            <h2 className="font-[family-name:var(--font-literata)] text-3xl md:text-4xl font-bold mb-10">
              Related
            </h2>

            {/* Other niches */}
            {RELATED_NICHES[niche.slug] && (
              <div className="mb-8">
                <h3 className="font-medium text-stone-300 mb-4">DoppelWriter for other writers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {RELATED_NICHES[niche.slug].map((s) => {
                    const related = NICHES.find((n) => n.slug === s);
                    if (!related) return null;
                    return (
                      <Link
                        key={s}
                        href={`/for/${s}`}
                        className="bg-[#0C0A09] border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group"
                      >
                        <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">{related.title.replace("DoppelWriter for ", "")}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Writer voices for this niche */}
            {NICHE_WRITERS[niche.slug] && (
              <div className="mb-8">
                <h3 className="font-medium text-stone-300 mb-4">Popular voices for your niche</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {NICHE_WRITERS[niche.slug].map((w) => (
                    <Link
                      key={w.slug}
                      href={`/write-like/${w.slug}`}
                      className="bg-[#0C0A09] border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group"
                    >
                      <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write Like {w.label}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Analyzer tool */}
            <div>
              <h3 className="font-medium text-stone-300 mb-4">Tools</h3>
              <Link
                href="/analyze"
                className="inline-block bg-[#0C0A09] border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group"
              >
                <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Voice Analyzer</p>
                <p className="text-xs text-stone-500 mt-1">Paste your writing and see your style fingerprint</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 md:py-28 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-[family-name:var(--font-literata)] text-3xl md:text-4xl font-bold mb-4">
              {isSensitive
                ? "We're here when you're ready"
                : "Ready to start writing?"}
            </h2>
            <p className="text-stone-400 mb-8 text-lg">
              {isSensitive
                ? "Take your time. DoppelWriter is here whenever you need it."
                : "5 free uses per month. No credit card. See the difference voice-matched AI makes."}
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
            >
              {niche.ctaText}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/40 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-600">
            &copy; {new Date().getFullYear()} DoppelWriter
          </span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-stone-500 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="text-xs text-stone-500 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-stone-500 hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
