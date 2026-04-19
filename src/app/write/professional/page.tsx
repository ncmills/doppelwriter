import Link from "next/link";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/lib/use-cases";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

const CATEGORY_ID = "professional";
const CATEGORY_LABEL = "Professional Emails & Letters";
const INTRO = "Cover letters, LinkedIn posts, cold emails, and career writing that sounds like a real professional — you — not a template from the internet.";

const useCases = USE_CASES.filter((u) => u.category === CATEGORY_ID);
const otherCategories = USE_CASE_CATEGORIES.filter((c) => c.id !== CATEGORY_ID);

export const metadata: Metadata = {
  title: `${CATEGORY_LABEL} Writing Tools — AI Writer`,
  description: `AI-powered ${CATEGORY_LABEL.toLowerCase()} writing tools that sound like you, not ChatGPT. DoppelWriter learns your voice and helps you write ${CATEGORY_LABEL.toLowerCase()} content in your natural style.`,
  openGraph: {
    title: `${CATEGORY_LABEL} Writing Tools — AI Writer`,
    description: `AI-powered ${CATEGORY_LABEL.toLowerCase()} writing tools that sound like you, not ChatGPT.`,
    url: `https://doppelwriter.com/write/${CATEGORY_ID}`,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: `https://doppelwriter.com/write/${CATEGORY_ID}` },
};

export default function CategoryPage() {
  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: `${CATEGORY_LABEL} Writing Tools`,
              description: INTRO,
              url: `https://doppelwriter.com/write/${CATEGORY_ID}`,
              isPartOf: { "@type": "WebApplication", name: "DoppelWriter" },
              numberOfItems: useCases.length,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://doppelwriter.com" },
                { "@type": "ListItem", position: 2, name: "Writing Tools", item: "https://doppelwriter.com/write" },
                { "@type": "ListItem", position: 3, name: CATEGORY_LABEL },
              ],
            },
          ],
        }}
      />

      <nav className="border-b border-[var(--color-rule)] sticky top-0 bg-[var(--color-paper)]/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-display)] font-bold text-lg">DoppelWriter</Link>
          <Link href="/signup" className="text-sm px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-lg transition-colors">
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-ink-mute)] mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/write" className="hover:text-[var(--color-ink)] transition-colors">Writing Tools</Link>
          <span>/</span>
          <span className="text-[var(--color-ink-soft)]">{CATEGORY_LABEL}</span>
        </nav>

        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4">
          {CATEGORY_LABEL} Writing Tools
        </h1>
        <p className="text-xl text-[var(--color-ink-soft)] mb-12 leading-relaxed max-w-3xl">{INTRO}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {useCases.map((uc) => (
            <Link
              key={uc.slug}
              href={`/write/${uc.slug}`}
              className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-lg p-5 hover:border-[var(--color-ink)] transition-colors"
            >
              <p className="font-medium mb-1">Write My {uc.title}</p>
              <p className="text-sm text-[var(--color-ink-soft)] line-clamp-2">{uc.description}</p>
            </Link>
          ))}
        </div>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-6">Other Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherCategories.map((c) => (
              <Link
                key={c.id}
                href={`/write/${c.id}`}
                className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-lg p-4 hover:border-[var(--color-ink)] transition-colors text-center"
              >
                <p className="font-medium text-sm">{c.label}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-rule)] py-8 text-center text-xs text-[var(--color-ink-mute)]">
        DoppelWriter
      </footer>
    </div>
  );
}
