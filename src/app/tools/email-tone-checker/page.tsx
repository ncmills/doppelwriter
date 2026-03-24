"use client";

import { useState } from "react";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import { trackToneCheckerUsed } from "@/lib/analytics";

interface ToneAnalysis {
  overall: string;
  scores: {
    warmth: number;
    formality: number;
    confidence: number;
    clarity: number;
  };
  observations: string[];
  suggestion: string;
}

const SCORE_LABELS: { key: keyof ToneAnalysis["scores"]; label: string; lowLabel: string; highLabel: string }[] = [
  { key: "warmth", label: "Warmth", lowLabel: "Cold", highLabel: "Warm" },
  { key: "formality", label: "Formality", lowLabel: "Casual", highLabel: "Formal" },
  { key: "confidence", label: "Confidence", lowLabel: "Hesitant", highLabel: "Assertive" },
  { key: "clarity", label: "Clarity", lowLabel: "Vague", highLabel: "Crystal clear" },
];

function scoreColor(score: number): string {
  if (score <= 3) return "from-red-500 to-red-400";
  if (score <= 5) return "from-amber-500 to-amber-400";
  if (score <= 7) return "from-yellow-400 to-green-400";
  return "from-green-500 to-emerald-400";
}

function overallToneColor(overall: string): string {
  const lower = overall.toLowerCase();
  if (lower.includes("passive-aggressive") || lower.includes("hostile") || lower.includes("cold"))
    return "text-red-400";
  if (lower.includes("warm") || lower.includes("friendly") || lower.includes("enthusiastic"))
    return "text-emerald-400";
  if (lower.includes("professional") || lower.includes("confident") || lower.includes("direct"))
    return "text-amber-400";
  if (lower.includes("apologetic") || lower.includes("hesitant") || lower.includes("uncertain"))
    return "text-yellow-400";
  return "text-amber-400";
}

export default function EmailToneCheckerPage() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    setAnalysis(null);

    if (text.length < 10) {
      setError("Please paste at least 10 characters to analyze.");
      return;
    }

    if (text.length > 5000) {
      setError("Email must be 5,000 characters or fewer.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze-tone", {
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
      trackToneCheckerUsed();
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
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-12 text-center">
        <h1 className="font-[family-name:var(--font-literata)] text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
          Email{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
            Tone Checker
          </span>
        </h1>
        <p className="text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed">
          Paste your email and see how it really sounds &mdash; before you hit send.
        </p>
      </section>

      {/* Input */}
      <section className="max-w-3xl mx-auto px-6 pb-8">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your email here..."
            className="w-full min-h-[200px] bg-stone-900/50 border border-stone-800/60 rounded-lg p-4 text-[#FAFAF9] placeholder:text-stone-600 resize-y focus:outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30 transition-colors font-[family-name:var(--font-geist-sans)] text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-stone-500">
              {text.length.toLocaleString()} / 5,000 characters
              {text.length > 0 && text.length < 10 && (
                <span className="text-amber-500 ml-2">
                  {10 - text.length} more needed
                </span>
              )}
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || text.length < 10}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 rounded-lg font-medium transition-colors text-sm"
            >
              {loading ? "Analyzing..." : "Analyze Tone"}
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
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="space-y-4">
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-stone-800 rounded w-1/3 mb-4" />
              <div className="h-4 bg-stone-800/60 rounded w-1/4" />
            </div>
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-stone-800 rounded w-1/4 mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-3 bg-stone-800/60 rounded w-full" />
                ))}
              </div>
            </div>
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-stone-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-stone-800/60 rounded w-full mb-2" />
              <div className="h-3 bg-stone-800/60 rounded w-4/5 mb-2" />
              <div className="h-3 bg-stone-800/60 rounded w-3/4" />
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {analysis && !loading && (
        <section className="max-w-4xl mx-auto px-6 pb-16 space-y-6">
          {/* Overall Tone */}
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 text-center">
            <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
              Overall Tone
            </h2>
            <p
              className={`font-[family-name:var(--font-literata)] text-3xl sm:text-4xl font-bold ${overallToneColor(
                analysis.overall
              )}`}
            >
              {analysis.overall}
            </p>
          </div>

          {/* Score Bars */}
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6">
            <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-5">
              Tone Scores
            </h2>
            <div className="space-y-4">
              {SCORE_LABELS.map(({ key, label, lowLabel, highLabel }) => {
                const score = analysis.scores[key];
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-stone-300">{label}</span>
                      <span className="text-sm font-bold text-[#FAFAF9]">{score}/10</span>
                    </div>
                    <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${scoreColor(score)} rounded-full transition-all duration-500`}
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-stone-600">{lowLabel}</span>
                      <span className="text-[10px] text-stone-600">{highLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observations */}
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6">
            <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-4">
              Observations
            </h2>
            <ul className="space-y-3">
              {analysis.observations.map((obs, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-stone-300 leading-relaxed">
                  <span className="text-amber-500 mt-0.5 shrink-0 font-bold">{i + 1}.</span>
                  {obs}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestion */}
          <div className="bg-amber-600/5 border border-amber-600/20 rounded-lg p-6">
            <h2 className="text-xs font-medium text-amber-500/80 uppercase tracking-wider mb-3">
              Suggestion
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              {analysis.suggestion}
            </p>
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-600/20 rounded-lg p-8 text-center">
            <h3 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-2">
              Sound more like yourself?
            </h3>
            <p className="text-stone-400 mb-5 max-w-lg mx-auto">
              DoppelWriter learns your writing voice and helps you write emails, docs, and content that sound authentically you.
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
