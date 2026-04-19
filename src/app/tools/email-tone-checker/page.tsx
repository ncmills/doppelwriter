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
  if (score <= 3) return "from-red-700 to-red-500";
  if (score <= 5) return "from-[var(--color-ink-mute)] to-[var(--color-ink-soft)]";
  if (score <= 7) return "from-[var(--color-ink-soft)] to-[var(--color-ink)]";
  return "from-[var(--color-accent)] to-[var(--color-ink)]";
}

function overallToneColor(overall: string): string {
  const lower = overall.toLowerCase();
  if (lower.includes("passive-aggressive") || lower.includes("hostile") || lower.includes("cold"))
    return "text-red-700";
  if (lower.includes("warm") || lower.includes("friendly") || lower.includes("enthusiastic"))
    return "text-[var(--color-accent)]";
  if (lower.includes("professional") || lower.includes("confident") || lower.includes("direct"))
    return "text-[var(--color-ink)]";
  if (lower.includes("apologetic") || lower.includes("hesitant") || lower.includes("uncertain"))
    return "text-[var(--color-ink-soft)]";
  return "text-[var(--color-accent)]";
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
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
          Email{" "}
          <span className="italic text-[var(--color-accent)]">
            Tone Checker
          </span>
        </h1>
        <p className="text-lg text-[var(--color-ink-soft)] max-w-2xl mx-auto leading-relaxed">
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
            className="w-full min-h-[200px] bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] resize-y focus:outline-none focus:border-[var(--color-ink)] transition-colors text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[var(--color-ink-soft)]">
              {text.length.toLocaleString()} / 5,000 characters
              {text.length > 0 && text.length < 10 && (
                <span className="text-[var(--color-accent)] ml-2">
                  {10 - text.length} more needed
                </span>
              )}
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || text.length < 10}
              className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] disabled:bg-[var(--color-paper-deep)] disabled:text-[var(--color-ink-mute)] rounded-[2px] font-medium transition-colors text-sm"
            >
              {loading ? "Analyzing..." : "Analyze Tone"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[var(--color-paper-deep)] border border-red-700/40 rounded-[2px] text-red-700 text-sm">
            {error}
          </div>
        )}
      </section>

      {/* Loading skeleton */}
      {loading && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="space-y-4">
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 animate-pulse">
              <div className="h-6 bg-[var(--color-rule)] rounded w-1/3 mb-4" />
              <div className="h-4 bg-[var(--color-rule)]/60 rounded w-1/4" />
            </div>
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 animate-pulse">
              <div className="h-4 bg-[var(--color-rule)] rounded w-1/4 mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-3 bg-[var(--color-rule)]/60 rounded w-full" />
                ))}
              </div>
            </div>
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 animate-pulse">
              <div className="h-4 bg-[var(--color-rule)] rounded w-1/3 mb-3" />
              <div className="h-3 bg-[var(--color-rule)]/60 rounded w-full mb-2" />
              <div className="h-3 bg-[var(--color-rule)]/60 rounded w-4/5 mb-2" />
              <div className="h-3 bg-[var(--color-rule)]/60 rounded w-3/4" />
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {analysis && !loading && (
        <section className="max-w-4xl mx-auto px-6 pb-16 space-y-6">
          {/* Overall Tone */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 text-center">
            <h2 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
              Overall Tone
            </h2>
            <p
              className={`font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold ${overallToneColor(
                analysis.overall
              )}`}
            >
              {analysis.overall}
            </p>
          </div>

          {/* Score Bars */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6">
            <h2 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-5">
              Tone Scores
            </h2>
            <div className="space-y-4">
              {SCORE_LABELS.map(({ key, label, lowLabel, highLabel }) => {
                const score = analysis.scores[key];
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
                      <span className="text-sm font-bold text-[var(--color-ink)]">{score}/10</span>
                    </div>
                    <div className="h-2.5 bg-[var(--color-rule)] rounded-[2px] overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${scoreColor(score)} rounded-[2px] transition-all duration-500`}
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-[var(--color-ink-mute)]">{lowLabel}</span>
                      <span className="text-[10px] text-[var(--color-ink-mute)]">{highLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observations */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6">
            <h2 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-4">
              Observations
            </h2>
            <ul className="space-y-3">
              {analysis.observations.map((obs, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-ink)] leading-relaxed">
                  <span className="text-[var(--color-accent)] mt-0.5 shrink-0 font-bold">{i + 1}.</span>
                  {obs}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestion */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6">
            <h2 className="text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider mb-3">
              Suggestion
            </h2>
            <p className="text-[var(--color-ink)] text-sm leading-relaxed">
              {analysis.suggestion}
            </p>
          </div>

          {/* CTA Banner */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-8 text-center">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">
              Sound more like yourself?
            </h3>
            <p className="text-[var(--color-ink-soft)] mb-5 max-w-lg mx-auto">
              DoppelWriter learns your writing voice and helps you write emails, docs, and content that sound authentically you.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium transition-colors"
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
