import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

interface AnalyzerResult {
  slug: string;
  input_preview: string;
  result: {
    sentenceLength: {
      average: number;
      shortest: number;
      longest: number;
      variation: "low" | "medium" | "high";
    };
    vocabulary: {
      level: "simple" | "moderate" | "advanced" | "sophisticated";
      uniqueWordRatio: number;
      signatureWords: string[];
    };
    tone: {
      primary: string;
      secondary: string;
      formality: number;
    };
    structure: {
      avgParagraphLength: string;
      usesFragments: boolean;
      listHeavy: boolean;
      preferredTransitions: string[];
    };
    personality: {
      description: string;
      strengths: string[];
      quirks: string[];
    };
    similarTo: string[];
  };
}

async function getResult(slug: string): Promise<AnalyzerResult | null> {
  const db = sql();
  const rows = await db`
    SELECT slug, input_preview, result FROM analyzer_results WHERE slug = ${slug} LIMIT 1
  `;
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    slug: row.slug as string,
    input_preview: row.input_preview as string,
    result: typeof row.result === "string" ? JSON.parse(row.result) : row.result,
  } as AnalyzerResult;
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getResult(slug);
  if (!data) return { title: "Not Found" };

  const { result } = data;
  const descSnippet = result.personality.description.slice(0, 60);
  const similarWriter = result.similarTo[0] || "a unique original";
  const description = `This writer's style resembles ${similarWriter}. Tone: ${result.tone.primary}. Vocabulary: ${result.vocabulary.level}. Analyze your own writing voice for free.`;

  return {
    title: `Writing Voice Analysis — ${descSnippet}`,
    description,
    openGraph: {
      title: `${result.tone.primary} voice similar to ${similarWriter} — Writing Voice Analysis`,
      description,
      url: `https://doppelwriter.com/analyze/${slug}`,
      type: "website",
      siteName: "DoppelWriter",
    },
    twitter: {
      card: "summary_large_image",
      title: `My writing voice: ${result.tone.primary}, similar to ${similarWriter}`,
      description: "Analyze your own writing voice for free at DoppelWriter",
    },
  };
}

export default async function SharedAnalysisPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getResult(slug);
  if (!data) notFound();

  const { result, input_preview } = data;
  const previewText =
    input_preview.length > 50 ? input_preview.slice(0, 50) + "..." : input_preview;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-literata)] font-bold text-lg"
          >
            DoppelWriter
          </Link>
          <Link
            href="/analyze"
            className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            Try Free
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-8 text-center">
        <h1 className="font-[family-name:var(--font-literata)] text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
          Writing Voice{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
            Analysis
          </span>
        </h1>
        <p className="text-sm text-stone-500">
          Based on a &ldquo;{previewText}&rdquo; writing sample
        </p>
      </section>

      {/* Results */}
      <section className="max-w-4xl mx-auto px-6 pb-16 space-y-6">
        {/* Voice Summary */}
        <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6">
          <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-3 text-amber-400">
            Voice Summary
          </h2>
          <p className="text-stone-300 leading-relaxed">
            {result.personality.description}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sentence Length */}
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
              Sentence Length
            </h3>
            <p className="text-2xl font-bold text-[#FAFAF9] mb-1">
              {result.sentenceLength.average}{" "}
              <span className="text-sm font-normal text-stone-500">avg words</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span>Variation:</span>
              <span
                className={
                  result.sentenceLength.variation === "high"
                    ? "text-amber-400"
                    : result.sentenceLength.variation === "medium"
                    ? "text-stone-300"
                    : "text-stone-500"
                }
              >
                {result.sentenceLength.variation}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Range: {result.sentenceLength.shortest}–{result.sentenceLength.longest}{" "}
              words
            </p>
          </div>

          {/* Vocabulary */}
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
              Vocabulary Level
            </h3>
            <p className="text-2xl font-bold text-[#FAFAF9] capitalize mb-1">
              {result.vocabulary.level}
            </p>
            <p className="text-sm text-stone-400">
              {Math.round(result.vocabulary.uniqueWordRatio * 100)}% unique words
            </p>
          </div>

          {/* Tone */}
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
              Tone
            </h3>
            <p className="text-lg font-bold text-[#FAFAF9] capitalize mb-1">
              {result.tone.primary}
              <span className="text-sm font-normal text-stone-500">
                {" "}
                / {result.tone.secondary}
              </span>
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>Casual</span>
                <span>Formal</span>
              </div>
              <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                  style={{
                    width: `${(result.tone.formality / 10) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-stone-600 mt-1 text-center">
                {result.tone.formality}/10
              </p>
            </div>
          </div>

          {/* Structure */}
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
              Structure
            </h3>
            <p className="text-sm text-stone-300 mb-1">
              Paragraphs:{" "}
              <span className="text-[#FAFAF9] font-medium">
                {result.structure.avgParagraphLength}
              </span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.structure.usesFragments && (
                <span className="text-xs px-2 py-0.5 bg-stone-800 rounded-full text-stone-400">
                  Uses fragments
                </span>
              )}
              {result.structure.listHeavy && (
                <span className="text-xs px-2 py-0.5 bg-stone-800 rounded-full text-stone-400">
                  List-heavy
                </span>
              )}
            </div>
            {result.structure.preferredTransitions.length > 0 && (
              <p className="text-xs text-stone-500 mt-2">
                Transitions:{" "}
                {result.structure.preferredTransitions.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Signature Words */}
        {result.vocabulary.signatureWords.length > 0 && (
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
              Signature Words
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.vocabulary.signatureWords.map((word) => (
                <span
                  key={word}
                  className="px-3 py-1.5 bg-amber-600/10 border border-amber-600/20 rounded-full text-amber-400 text-sm font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Similar To */}
        {result.similarTo.length > 0 && (
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
              This Writer Resembles
            </h3>
            <ul className="space-y-2">
              {result.similarTo.map((writer) => (
                <li
                  key={writer}
                  className="text-stone-300 text-sm leading-relaxed"
                >
                  <span className="text-[#FAFAF9] font-medium">{writer}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths & Quirks */}
        <div className="grid md:grid-cols-2 gap-4">
          {result.personality.strengths.length > 0 && (
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                Strengths
              </h3>
              <ul className="space-y-1.5">
                {result.personality.strengths.map((s) => (
                  <li
                    key={s}
                    className="text-sm text-stone-300 flex items-start gap-2"
                  >
                    <span className="text-amber-500 mt-0.5 shrink-0">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.personality.quirks.length > 0 && (
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                Quirks
              </h3>
              <ul className="space-y-1.5">
                {result.personality.quirks.map((q) => (
                  <li
                    key={q}
                    className="text-sm text-stone-300 flex items-start gap-2"
                  >
                    <span className="text-stone-600 mt-0.5 shrink-0">~</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <div className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-600/20 rounded-lg p-8 text-center">
          <h3 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-2">
            Analyze Your Own Writing Voice
          </h3>
          <p className="text-stone-400 mb-5 max-w-lg mx-auto">
            Paste any text and see your style broken down in seconds. Free, no
            signup required.
          </p>
          <Link
            href="/analyze"
            className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-lg transition-colors"
          >
            Analyze Your Writing — Free
          </Link>
        </div>

        {/* Secondary CTA */}
        <div className="text-center">
          <p className="text-stone-500 text-sm mb-3">
            Want AI that writes in your voice?
          </p>
          <Link
            href="/signup"
            className="inline-block px-6 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700/60 rounded-lg text-sm font-medium transition-colors"
          >
            Write in Your Voice with AI
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800/40 py-8 text-center">
        <p className="text-xs text-stone-600">
          <Link href="/" className="hover:text-stone-400 transition-colors">
            DoppelWriter
          </Link>{" "}
          — AI writing that sounds like you
        </p>
      </footer>
    </div>
  );
}
