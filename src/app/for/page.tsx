import Link from "next/link";
import { NICHES } from "@/lib/niches";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DoppelWriter For... — AI Writing for Every Niche",
  description:
    "See who DoppelWriter is built for — newsletter writers, ghostwriters, fiction authors, content marketers, students, and more. AI writing that matches your voice, whatever you write.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com/for",
    siteName: "DoppelWriter",
    title: "DoppelWriter For... — AI Writing for Every Niche",
    description:
      "See who DoppelWriter is built for. AI writing that matches your voice, whatever you write.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DoppelWriter For..." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoppelWriter For... — AI Writing for Every Niche",
    description:
      "See who DoppelWriter is built for. AI writing that matches your voice, whatever you write.",
  },
  alternates: { canonical: "https://doppelwriter.com/for" },
};

const NICHE_DESCRIPTIONS: Record<string, string> = {
  "newsletter-writers": "Keep your voice consistent across every edition — even on deadline day.",
  "ghostwriters": "Switch between client voices in seconds. No more \"this doesn't sound like me.\"",
  "fiction-writers": "Distinct character voices across 80K words. Write in styles you admire.",
  "content-marketers": "One brand voice, every writer, every channel. Scale without voice drift.",
  "students": "Find your writing voice and make it stronger. Stand out for the right reasons.",
  "wedding-speeches": "Write a speech that sounds like you — funny, heartfelt, and real.",
  "eulogies": "Find the right words when it matters most. We're here to help.",
  "cover-letters": "Cover letters that sound like a real person, not a prompt.",
};

export default function ForIndexPage() {
  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "DoppelWriter For...",
          description: "Landing pages for specific DoppelWriter audiences and use cases.",
          url: "https://doppelwriter.com/for",
          isPartOf: { "@type": "WebApplication", name: "DoppelWriter" },
          numberOfItems: NICHES.length,
        }}
      />

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

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-[family-name:var(--font-literata)] text-4xl md:text-5xl font-bold mb-4">
          DoppelWriter For...
        </h1>
        <p className="text-xl text-stone-400 mb-12 max-w-2xl leading-relaxed">
          AI writing that matches your voice. Whatever you write, whoever you write for.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {NICHES.map((niche) => (
            <Link
              key={niche.slug}
              href={`/for/${niche.slug}`}
              className="group bg-stone-900/50 border border-stone-800/40 rounded-xl p-6 hover:border-amber-600/40 transition-colors"
            >
              <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
                {niche.title}
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed">
                {NICHE_DESCRIPTIONS[niche.slug] ?? niche.heroSubtitle}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-stone-500 mb-4">Don&apos;t see your niche?</p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
          >
            Try DoppelWriter Free
          </Link>
          <p className="text-stone-600 text-xs mt-3">
            DoppelWriter works for any kind of writing. These are just starting points.
          </p>
        </div>
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
