import { notFound } from "next/navigation";
import Link from "next/link";
import { CURATED_WRITERS } from "@/lib/writer-builder";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

function getWriter(slug: string) {
  return CURATED_WRITERS.find(
    (w) => w.name.toLowerCase().replace(/\s+/g, "-") === slug
  );
}

export function generateStaticParams() {
  return CURATED_WRITERS.map((w) => ({
    slug: w.name.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const writer = getWriter(slug);
  if (!writer) return {};

  const title = `Write Like ${writer.name} — AI Writing in ${writer.name}'s Voice`;
  const description = `Use DoppelWriter to write like ${writer.name}. ${writer.bio} Our AI captures their distinctive voice so you can draft emails, essays, and content in their style.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `https://doppelwriter.com/write-like/${slug}` },
    alternates: { canonical: `https://doppelwriter.com/write-like/${slug}` },
  };
}

export default async function WriteLikePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const writer = getWriter(slug);
  if (!writer) notFound();

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Write Like ${writer.name}`,
          description: `AI-powered writing in ${writer.name}'s style`,
          isPartOf: { "@type": "WebApplication", name: "DoppelWriter" },
        }}
      />

      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-literata)] font-bold text-lg">DoppelWriter</Link>
          <Link href="/signup" className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors">
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-amber-400 text-sm font-medium mb-3 uppercase tracking-wider">{writer.tag}</p>
        <h1 className="font-[family-name:var(--font-literata)] text-4xl sm:text-5xl font-bold mb-4">
          Write Like {writer.name}
        </h1>
        <p className="text-xl text-stone-400 mb-12 leading-relaxed">{writer.bio}</p>

        <section className="space-y-8 mb-12">
          <div>
            <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-3">
              What Makes {writer.name}&apos;s Writing Distinctive
            </h2>
            <p className="text-stone-400 leading-relaxed">
              DoppelWriter analyzes {writer.name}&apos;s published work at two levels: the micro layer
              (sentence rhythm, word choice, punctuation habits, function word patterns) and the macro
              layer (paragraph structure, argument flow, transitions, pacing). The result is a forensic
              style profile that captures not just what {writer.name} does, but what they never do.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-3">How It Works</h2>
            <ol className="space-y-3 text-stone-400">
              <li className="flex gap-3">
                <span className="text-amber-400 font-bold shrink-0">1.</span>
                Select {writer.name} as your writing voice from the Writers page
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 font-bold shrink-0">2.</span>
                Paste a draft to edit, or describe what you want to write
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 font-bold shrink-0">3.</span>
                DoppelWriter generates or edits in {writer.name}&apos;s voice with streaming output
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-3">Use Cases</h2>
            <ul className="space-y-2 text-stone-400">
              <li>Draft essays and blog posts in {writer.name}&apos;s voice</li>
              <li>Rewrite existing content with {writer.name}&apos;s style and rhythm</li>
              <li>Learn {writer.name}&apos;s writing techniques by seeing them applied to your ideas</li>
              <li>Combine {writer.name}&apos;s voice with your own personal profile for a hybrid style</li>
            </ul>
          </div>
        </section>

        <div className="flex gap-4 mb-16">
          <Link
            href="/signup"
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
          >
            Start Writing Like {writer.name}
          </Link>
          <Link href="/writers" className="px-8 py-3 border border-stone-700 hover:border-stone-500 rounded-lg text-stone-300 transition-colors">
            See All Writers
          </Link>
        </div>

        {/* Internal linking */}
        <section>
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-6">Other Writing Styles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CURATED_WRITERS.filter((w) => w.name !== writer.name)
              .slice(0, 6)
              .map((w) => (
                <Link
                  key={w.name}
                  href={`/write-like/${w.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors"
                >
                  <p className="font-medium text-sm">{w.name}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{w.bio}</p>
                </Link>
              ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-800/40 py-8 text-center text-xs text-stone-600">
        DoppelWriter
      </footer>
    </div>
  );
}
