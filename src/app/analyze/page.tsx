"use client";

import { useState } from "react";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import { trackVoiceAnalyzerUsed } from "@/lib/analytics";

interface Analysis {
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
  shareUrl?: string;
}

export default function AnalyzePage() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleAnalyze() {
    setError("");
    setAnalysis(null);
    setShareUrl("");
    setCopied(false);

    if (text.length < 100) {
      setError("Please paste at least 100 characters of writing.");
      return;
    }

    if (text.length > 10000) {
      setError("Text must be 10,000 characters or fewer.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.status === 429) {
        setError("Rate limit reached. Try again in an hour.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      setAnalysis(data);
      trackVoiceAnalyzerUsed();
      if (data.shareUrl) setShareUrl(data.shareUrl);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <LandingNav />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-10 sm:pb-12 text-center">
        <h1 className="font-[family-name:var(--font-literata)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          Analyze Your{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
            Writing Voice
          </span>
        </h1>
        <p className="text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed">
          Paste any text — we&apos;ll break down your style in seconds. Free, no signup.
        </p>
      </section>

      {/* Input */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste at least 100 characters of your writing..."
            className="w-full min-h-[250px] bg-stone-900/50 border border-stone-800/60 rounded-lg p-4 text-[#FAFAF9] placeholder:text-stone-600 resize-y focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30 transition-colors font-[family-name:var(--font-geist-sans)] text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-stone-500">
              {text.length.toLocaleString()} / 10,000 characters
              {text.length > 0 && text.length < 100 && (
                <span className="text-amber-500 ml-2">
                  {100 - text.length} more needed
                </span>
              )}
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || text.length < 100}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 rounded-lg font-medium transition-colors text-sm"
            >
              {loading ? "Analyzing..." : "Analyze My Writing"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800/40 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </section>

      {/* Loading skeleton */}
      {loading && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="space-y-4">
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-stone-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-stone-800/60 rounded w-full mb-2" />
              <div className="h-3 bg-stone-800/60 rounded w-4/5" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 animate-pulse"
                >
                  <div className="h-3 bg-stone-800 rounded w-1/2 mb-3" />
                  <div className="h-6 bg-stone-800/60 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-stone-800/60 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {analysis && !loading && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
          {/* Voice Summary */}
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6">
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-3 text-amber-400">
              Voice Summary
            </h2>
            <p className="text-stone-300 leading-relaxed">
              {analysis.personality.description}
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
                {analysis.sentenceLength.average}{" "}
                <span className="text-sm font-normal text-stone-500">avg words</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-stone-400">
                <span>Variation:</span>
                <span
                  className={
                    analysis.sentenceLength.variation === "high"
                      ? "text-amber-400"
                      : analysis.sentenceLength.variation === "medium"
                      ? "text-stone-300"
                      : "text-stone-500"
                  }
                >
                  {analysis.sentenceLength.variation}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Range: {analysis.sentenceLength.shortest}–{analysis.sentenceLength.longest} words
              </p>
            </div>

            {/* Vocabulary */}
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
                Vocabulary Level
              </h3>
              <p className="text-2xl font-bold text-[#FAFAF9] capitalize mb-1">
                {analysis.vocabulary.level}
              </p>
              <p className="text-sm text-stone-400">
                {Math.round(analysis.vocabulary.uniqueWordRatio * 100)}% unique words
              </p>
            </div>

            {/* Tone */}
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
                Tone
              </h3>
              <p className="text-lg font-bold text-[#FAFAF9] capitalize mb-1">
                {analysis.tone.primary}
                <span className="text-sm font-normal text-stone-500">
                  {" "}/ {analysis.tone.secondary}
                </span>
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>Casual</span>
                  <span>Formal</span>
                </div>
                <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
                    style={{ width: `${(analysis.tone.formality / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-stone-600 mt-1 text-center">
                  {analysis.tone.formality}/10
                </p>
              </div>
            </div>

            {/* Structure */}
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
                Structure
              </h3>
              <p className="text-sm text-stone-300 mb-1">
                Paragraphs: <span className="text-[#FAFAF9] font-medium">{analysis.structure.avgParagraphLength}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.structure.usesFragments && (
                  <span className="text-xs px-2 py-0.5 bg-stone-800 rounded-full text-stone-400">
                    Uses fragments
                  </span>
                )}
                {analysis.structure.listHeavy && (
                  <span className="text-xs px-2 py-0.5 bg-stone-800 rounded-full text-stone-400">
                    List-heavy
                  </span>
                )}
              </div>
              {analysis.structure.preferredTransitions.length > 0 && (
                <p className="text-xs text-stone-500 mt-2">
                  Transitions: {analysis.structure.preferredTransitions.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Signature Words */}
          {analysis.vocabulary.signatureWords.length > 0 && (
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                Signature Words
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.vocabulary.signatureWords.map((word) => (
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
          {analysis.similarTo.length > 0 && (
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                Your Writing Resembles
              </h3>
              <ul className="space-y-2">
                {analysis.similarTo.map((writer) => (
                  <li key={writer} className="text-stone-300 text-sm leading-relaxed">
                    <span className="text-[#FAFAF9] font-medium">{writer}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths & Quirks */}
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.personality.strengths.length > 0 && (
              <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
                <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                  Strengths
                </h3>
                <ul className="space-y-1.5">
                  {analysis.personality.strengths.map((s) => (
                    <li key={s} className="text-sm text-stone-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.personality.quirks.length > 0 && (
              <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
                <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                  Quirks
                </h3>
                <ul className="space-y-1.5">
                  {analysis.personality.quirks.map((q) => (
                    <li key={q} className="text-sm text-stone-300 flex items-start gap-2">
                      <span className="text-stone-600 mt-0.5 shrink-0">~</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Share Your Voice Card */}
          {shareUrl && (
            <div className="bg-gradient-to-br from-stone-900/80 to-stone-900/40 border border-amber-600/20 rounded-xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <h3 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-2">
                  Share Your{" "}
                  <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                    Voice Card
                  </span>
                </h3>
                <p className="text-stone-400 text-sm">
                  Your link generates a visual card when shared on social media
                </p>
              </div>

              {/* Card Preview */}
              <div className="bg-[#0C0A09] border border-stone-800/60 rounded-lg p-5 mb-6 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-amber-600">DoppelWriter</span>
                  <span className="text-xs text-stone-600 uppercase tracking-widest">Voice Analysis</span>
                </div>
                <div className="mb-3">
                  <p className="text-2xl font-extrabold capitalize tracking-tight">{analysis.tone.primary}</p>
                  <p className="text-sm text-stone-500 capitalize">with a {analysis.tone.secondary} edge</p>
                </div>
                {analysis.similarTo[0] && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-stone-600 uppercase tracking-wider">Writes like</span>
                    <span className="text-sm font-bold text-amber-500">
                      {analysis.similarTo[0].split(" — ")[0]?.split(" – ")[0]?.trim()}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-stone-800 rounded text-stone-400 capitalize">{analysis.vocabulary.level} vocabulary</span>
                  <span className="text-xs px-2 py-0.5 bg-stone-800 rounded text-stone-400">{analysis.tone.formality}/10 formality</span>
                  <span className="text-xs px-2 py-0.5 bg-stone-800 rounded text-stone-400">{analysis.sentenceLength.average} avg words/sentence</span>
                </div>
              </div>

              {/* Share buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    const fullUrl = `https://doppelwriter.com${shareUrl}`;
                    navigator.clipboard.writeText(fullUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    copied
                      ? "bg-amber-600 text-white"
                      : "bg-stone-800 hover:bg-stone-700 border border-stone-700/60"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Just analyzed my writing voice — apparently I write like ${analysis.similarTo[0]?.split(" — ")[0]?.split(" – ")[0]?.trim() || "a unique original"}! 🖊️\n\nAnalyze yours free:\nhttps://doppelwriter.com${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700/60 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `https://doppelwriter.com${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700/60 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Share on LinkedIn
                </a>
              </div>
            </div>
          )}

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-600/20 rounded-lg p-5 sm:p-8 text-center">
            <h3 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-2">
              Want to generate text in this voice?
            </h3>
            <p className="text-stone-400 mb-5 max-w-lg mx-auto">
              DoppelWriter can clone your writing style and generate new content that sounds like you wrote it.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
            >
              Create Your Voice Profile — Free
            </Link>
          </div>
        </section>
      )}

      {/* Footer spacer when no results */}
      {!analysis && !loading && <div className="pb-24" />}
    </div>
  );
}
