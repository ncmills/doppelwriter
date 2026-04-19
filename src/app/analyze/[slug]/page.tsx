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
      <nav className="border-b border-[var(--color-rule)] sticky top-0 bg-[var(--color-paper)]/90 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] font-bold text-lg"
          >
            DoppelWriter
          </Link>
          <Link
            href="/analyze"
            className="text-sm px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] transition-colors"
          >
            Try Free
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
          Writing Voice{" "}
          <span className="italic text-[var(--color-accent)]">
            Analysis
          </span>
        </h1>
        <p className="text-sm text-[var(--color-ink-mute)]">
          Based on a &ldquo;{previewText}&rdquo; writing sample
        </p>
      </section>

      {/* Results */}
      <section className="max-w-4xl mx-auto px-6 pb-16 space-y-6">
        {/* Voice Summary */}
        <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-3 text-[var(--color-accent)]">
            Voice Summary
          </h2>
          <p className="text-[var(--color-ink)] leading-relaxed">
            {result.personality.description}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sentence Length */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
            <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">
              Sentence Length
            </h3>
            <p className="text-2xl font-bold text-[var(--color-ink)] mb-1">
              {result.sentenceLength.average}{" "}
              <span className="text-sm font-normal text-[var(--color-ink-mute)]">avg words</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <span>Variation:</span>
              <span
                className={
                  result.sentenceLength.variation === "high"
                    ? "text-[var(--color-accent)]"
                    : result.sentenceLength.variation === "medium"
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-ink-mute)]"
                }
              >
                {result.sentenceLength.variation}
              </span>
            </div>
            <p className="text-xs text-[var(--color-ink-mute)] mt-1">
              Range: {result.sentenceLength.shortest}–{result.sentenceLength.longest}{" "}
              words
            </p>
          </div>

          {/* Vocabulary */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
            <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">
              Vocabulary Level
            </h3>
            <p className="text-2xl font-bold text-[var(--color-ink)] capitalize mb-1">
              {result.vocabulary.level}
            </p>
            <p className="text-sm text-[var(--color-ink-soft)]">
              {Math.round(result.vocabulary.uniqueWordRatio * 100)}% unique words
            </p>
          </div>

          {/* Tone */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
            <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">
              Tone
            </h3>
            <p className="text-lg font-bold text-[var(--color-ink)] capitalize mb-1">
              {result.tone.primary}
              <span className="text-sm font-normal text-[var(--color-ink-mute)]">
                {" "}
                / {result.tone.secondary}
              </span>
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-[var(--color-ink-mute)] mb-1">
                <span>Casual</span>
                <span>Formal</span>
              </div>
              <div className="h-2 bg-[var(--color-rule)] rounded-[2px] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-ink)] rounded-[2px]"
                  style={{
                    width: `${(result.tone.formality / 10) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[var(--color-ink-mute)] mt-1 text-center">
                {result.tone.formality}/10
              </p>
            </div>
          </div>

          {/* Structure */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
            <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">
              Structure
            </h3>
            <p className="text-sm text-[var(--color-ink)] mb-1">
              Paragraphs:{" "}
              <span className="text-[var(--color-ink)] font-medium">
                {result.structure.avgParagraphLength}
              </span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.structure.usesFragments && (
                <span className="text-xs px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink-soft)]">
                  Uses fragments
                </span>
              )}
              {result.structure.listHeavy && (
                <span className="text-xs px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink-soft)]">
                  List-heavy
                </span>
              )}
            </div>
            {result.structure.preferredTransitions.length > 0 && (
              <p className="text-xs text-[var(--color-ink-mute)] mt-2">
                Transitions:{" "}
                {result.structure.preferredTransitions.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Signature Words */}
        {result.vocabulary.signatureWords.length > 0 && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
            <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
              Signature Words
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.vocabulary.signatureWords.map((word) => (
                <span
                  key={word}
                  className="px-3 py-1.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-accent)] text-sm font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Similar To */}
        {result.similarTo.length > 0 && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
            <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
              This Writer Resembles
            </h3>
            <ul className="space-y-2">
              {result.similarTo.map((writer) => (
                <li
                  key={writer}
                  className="text-[var(--color-ink)] text-sm leading-relaxed"
                >
                  <span className="text-[var(--color-ink)] font-medium">{writer}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths & Quirks */}
        <div className="grid md:grid-cols-2 gap-4">
          {result.personality.strengths.length > 0 && (
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
              <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
                Strengths
              </h3>
              <ul className="space-y-1.5">
                {result.personality.strengths.map((s) => (
                  <li
                    key={s}
                    className="text-sm text-[var(--color-ink)] flex items-start gap-2"
                  >
                    <span className="text-[var(--color-accent)] mt-0.5 shrink-0">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.personality.quirks.length > 0 && (
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
              <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
                Quirks
              </h3>
              <ul className="space-y-1.5">
                {result.personality.quirks.map((q) => (
                  <li
                    key={q}
                    className="text-sm text-[var(--color-ink)] flex items-start gap-2"
                  >
                    <span className="text-[var(--color-ink-mute)] mt-0.5 shrink-0">~</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-8 text-center">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-2">
            Analyze Your Own Writing Voice
          </h3>
          <p className="text-[var(--color-ink-soft)] mb-5 max-w-lg mx-auto">
            Paste any text and see your style broken down in seconds. Free, no
            signup required.
          </p>
          <Link
            href="/analyze"
            className="inline-block px-8 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-semibold text-lg transition-colors"
          >
            Analyze Your Writing — Free
          </Link>
        </div>

        {/* Secondary CTA */}
        <div className="text-center">
          <p className="text-[var(--color-ink-mute)] text-sm mb-3">
            Want AI that writes in your voice?
          </p>
          <Link
            href="/signup"
            className="inline-block px-6 py-2.5 bg-[var(--color-paper-deep)] hover:bg-[var(--color-paper)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] rounded-[2px] text-sm font-medium transition-colors"
          >
            Write in Your Voice with AI
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-rule)] py-8 text-center">
        <p className="text-xs text-[var(--color-ink-mute)]">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
            DoppelWriter
          </Link>{" "}
          — AI writing that sounds like you
        </p>
      </footer>
    </div>
  );
}
