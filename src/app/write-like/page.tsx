import type { Metadata } from "next";
import Link from "next/link";
import { CURATED_WRITERS } from "@/lib/writer-builder";
import { CATEGORIES } from "@/lib/writer-data";
import { JsonLd } from "@/components/JsonLd";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Write Like Famous Authors — 140+ AI Voice Profiles",
  description:
    "Browse 140+ famous writer voice profiles. Write like Hemingway, Paul Graham, Obama, Toni Morrison, and more. DoppelWriter clones their style so you can generate content in any iconic voice.",
  keywords: [
    "write like famous authors",
    "AI writing voice profiles",
    "write like hemingway",
    "write like paul graham",
    "famous writer AI",
    "voice cloning writers",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com/write-like",
    siteName: "DoppelWriter",
    title: "Write Like Famous Authors — 140+ AI Voice Profiles",
    description:
      "Browse 140+ famous writer voice profiles and generate content in any iconic voice.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Write Like Famous Authors" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Write Like Famous Authors — 140+ AI Voice Profiles",
    description:
      "Browse 140+ famous writer voice profiles. Write like Hemingway, Paul Graham, Obama, and more.",
  },
  alternates: { canonical: "https://doppelwriter.com/write-like" },
};

function writerSlug(name: string) {
  return name.toLowerCase().replace(/['']/g, "").replace(/\s+/g, "-");
}

const CATEGORY_ICONS: Record<string, string> = {
  pen: "\u270F\uFE0F",
  briefcase: "\uD83D\uDCBC",
  mic: "\uD83C\uDF99\uFE0F",
  landmark: "\uD83C\uDFDB\uFE0F",
  scroll: "\uD83D\uDCDC",
  book: "\uD83D\uDCDA",
  newspaper: "\uD83D\uDCF0",
  laugh: "\uD83D\uDE02",
  brain: "\uD83E\uDDE0",
  microscope: "\uD83D\uDD2C",
};

export default function WriteLikeIndexPage() {
  const writersByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    writers: CURATED_WRITERS.filter((w) => w.category === cat.id),
  }));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://doppelwriter.com" },
      { "@type": "ListItem", position: 2, name: "Write Like Famous Authors", item: "https://doppelwriter.com/write-like" },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Write Like Famous Authors",
    description: "Browse 140+ famous writer voice profiles and generate content in any iconic voice.",
    url: "https://doppelwriter.com/write-like",
    publisher: {
      "@type": "Organization",
      name: "DoppelWriter",
      url: "https://doppelwriter.com",
    },
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAFAF9]">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={collectionLd} />

      {/* Nav */}
      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-literata)] font-bold text-lg flex items-center gap-0">
            <Logo className="h-[0.86em] w-auto mr-0.5 text-amber-600" />
            <span className="hidden sm:inline">DoppelWriter</span>
            <span className="sm:hidden">DW</span>
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center">
          <h1 className="font-[family-name:var(--font-literata)] text-4xl md:text-5xl font-bold mb-4">
            Write Like Famous Authors
          </h1>
          <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto">
            140+ curated voice profiles. Pick an iconic writer, paste your topic,
            and generate content that matches their style — forensically.
          </p>
        </section>

        {/* Categories */}
        {writersByCategory.map((cat) => (
          <section key={cat.id} className="pb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{CATEGORY_ICONS[cat.icon] ?? ""}</span>
              <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold">
                <Link
                  href={`/write-like/${cat.id}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {cat.label}
                </Link>
              </h2>
              <span className="text-stone-600 text-sm">({cat.writers.length})</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cat.writers.map((writer) => (
                <Link
                  key={writer.name}
                  href={`/write-like/${writerSlug(writer.name)}`}
                  className="bg-stone-900/40 border border-stone-800/40 rounded-xl p-5 hover:border-amber-600/40 transition-colors group"
                >
                  <p className="font-medium group-hover:text-amber-400 transition-colors mb-1">
                    {writer.name}
                  </p>
                  <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">
                    {writer.bio}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="py-16 text-center border-t border-stone-800/40">
          <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold mb-4">
            Write like anyone. Sound like yourself.
          </h2>
          <p className="text-stone-400 mb-8 max-w-xl mx-auto">
            Pick a famous voice to learn from, or upload your own writing and let
            DoppelWriter clone your personal style. 5 free uses per month.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
          >
            Start Writing Free
          </Link>
          <p className="text-stone-600 text-xs mt-3">No credit card required</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/40 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-600">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-stone-500 hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-stone-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-stone-500 hover:text-white transition-colors">Terms</Link>
          </div>
          <a
            href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry"
            className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
          >
            Enterprise &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
