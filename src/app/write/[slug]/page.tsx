import { notFound } from "next/navigation";
import Link from "next/link";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/lib/use-cases";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

function getUseCase(slug: string) {
  return USE_CASES.find((u) => u.slug === slug);
}

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const uc = getUseCase(slug);
  if (!uc) return {};

  const title = `Write My ${uc.title} — AI ${uc.title} Writer | DoppelWriter`;
  const description = `Write a ${uc.title.toLowerCase()} that sounds like you, not ChatGPT. DoppelWriter learns your voice from samples, then drafts a ${uc.title.toLowerCase()} in your natural style. Free to try.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `https://doppelwriter.com/write/${slug}` },
    alternates: { canonical: `https://doppelwriter.com/write/${slug}` },
  };
}

export default async function WritePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const uc = getUseCase(slug);
  if (!uc) notFound();

  const category = USE_CASE_CATEGORIES.find((c) => c.id === uc.category);
  const related = uc.relatedSlugs.map((s) => USE_CASES.find((u) => u.slug === s)).filter(Boolean);

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "HowTo",
              name: `How to Write a ${uc.title} with AI`,
              description: `Use DoppelWriter to create a ${uc.title.toLowerCase()} that sounds like you`,
              step: [
                { "@type": "HowToStep", name: "Describe what you need", text: `Tell DoppelWriter about your ${uc.title.toLowerCase()} — who it's for, the tone, and key details.` },
                { "@type": "HowToStep", name: "Share your writing voice", text: "Upload or paste examples of your writing so DoppelWriter captures your personal voice." },
                { "@type": "HowToStep", name: "Get your draft", text: `DoppelWriter generates a ${uc.title.toLowerCase()} that matches your natural voice and style.` },
              ],
              tool: { "@type": "SoftwareApplication", name: "DoppelWriter" },
            },
            ...(uc.faqs.length > 0
              ? [{
                  "@type": "FAQPage",
                  mainEntity: uc.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }]
              : []),
          ],
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
        <p className="text-amber-400 text-sm font-medium mb-3 uppercase tracking-wider">{category?.label}</p>
        <h1 className="font-[family-name:var(--font-literata)] text-4xl sm:text-5xl font-bold mb-4">
          Write My {uc.title}
        </h1>
        <p className="text-xl text-stone-400 mb-8 leading-relaxed">{uc.description}</p>

        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors mb-12"
        >
          Write My {uc.title} Now
        </Link>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-6">How It Works</h2>
          <div className="space-y-4">
            {[
              { n: "1", title: "Tell us what you need", desc: `Describe your ${uc.title.toLowerCase()} — who it's for, the tone you want, and any key details. Example: "${uc.samplePrompt}"` },
              { n: "2", title: "Share your writing voice", desc: "Upload a few emails, essays, or any writing samples. Or just record yourself talking. DoppelWriter analyzes your rhythm, vocabulary, and personality at a forensic level." },
              { n: "3", title: "Get a draft that sounds like you", desc: `DoppelWriter generates a ${uc.title.toLowerCase()} in your natural voice — not AI-sounding, not generic. Edit it, revise it, or use it as-is.` },
            ].map((step) => (
              <div key={step.n} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-medium mb-1">{step.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why DoppelWriter */}
        <section className="mb-12 bg-stone-900/50 border border-stone-800/40 rounded-lg p-6">
          <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-3">
            Why Not Just Use ChatGPT?
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-3">
            ChatGPT writes like ChatGPT. It uses words like &quot;delve,&quot; &quot;tapestry,&quot; and &quot;multifaceted&quot;
            at 150x the rate humans do. It sounds competent but generic — like a college intern who read too many
            business books.
          </p>
          <p className="text-stone-400 text-sm leading-relaxed">
            DoppelWriter is different. It analyzes your actual writing — your sentence rhythm, your word choices,
            your punctuation habits, even what you <em>never</em> say — and builds a voice model that&apos;s
            uniquely yours. The result sounds like you wrote it, because your voice is in every word.
          </p>
        </section>

        {/* FAQs */}
        {uc.faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {uc.faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="font-medium mb-2">{faq.q}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center mb-16 py-8">
          <p className="text-stone-500 text-sm mb-4">Sound like yourself, not ChatGPT.</p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
          >
            Write My {uc.title} Free
          </Link>
        </section>

        {/* Related use cases */}
        {related.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-6">Related</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {related.map((r) => r && (
                <Link
                  key={r.slug}
                  href={`/write/${r.slug}`}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors"
                >
                  <p className="font-medium text-sm">Write My {r.title}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-stone-800/40 py-8 text-center text-xs text-stone-600">
        DoppelWriter
      </footer>
    </div>
  );
}
