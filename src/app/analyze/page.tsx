"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LandingNav from "@/components/LandingNav";
import { trackCtaClicked, trackVoiceAnalyzerUsed } from "@/lib/analytics";

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
  const { data: session } = useSession();
  const router = useRouter();
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  function handleSaveVoice() {
    if (!analysis || !text) return;
    trackCtaClicked("save_voice_from_analyzer", "/analyze");
    try {
      sessionStorage.setItem(
        "dw_pending_sample",
        JSON.stringify({
          text,
          tone: analysis.tone?.primary || "",
          shareUrl,
          savedAt: Date.now(),
        }),
      );
    } catch {
      // sessionStorage quota or SSR — ignore, signup will still work
    }
    if (session?.user) {
      router.push("/create/personal?fromAnalyzer=1");
    } else {
      router.push("/signup?fromAnalyzer=1");
    }
  }

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
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          Analyze Your{" "}
          <span className="italic text-[var(--color-accent)]">
            Writing Voice
          </span>
        </h1>
        <p className="text-lg text-[var(--color-ink-soft)] max-w-2xl mx-auto leading-relaxed">
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
            className="w-full min-h-[250px] bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] resize-y focus:outline-none focus:border-[var(--color-ink)] transition-colors text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[var(--color-ink-soft)]">
              {text.length.toLocaleString()} / 10,000 characters
              {text.length > 0 && text.length < 100 && (
                <span className="text-[var(--color-accent)] ml-2">
                  {100 - text.length} more needed
                </span>
              )}
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || text.length < 100}
              className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] disabled:bg-[var(--color-paper-deep)] disabled:text-[var(--color-ink-mute)] rounded-[2px] font-medium transition-colors text-sm"
            >
              {loading ? "Analyzing..." : "Analyze My Writing"}
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
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="space-y-4">
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 animate-pulse">
              <div className="h-4 bg-[var(--color-rule)] rounded w-1/3 mb-3" />
              <div className="h-3 bg-[var(--color-rule)]/60 rounded w-full mb-2" />
              <div className="h-3 bg-[var(--color-rule)]/60 rounded w-4/5" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5 animate-pulse"
                >
                  <div className="h-3 bg-[var(--color-rule)] rounded w-1/2 mb-3" />
                  <div className="h-6 bg-[var(--color-rule)]/60 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-[var(--color-rule)]/60 rounded w-3/4" />
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
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-3 text-[var(--color-accent)]">
              Voice Summary
            </h2>
            <p className="text-[var(--color-ink)] leading-relaxed">
              {analysis.personality.description}
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
                {analysis.sentenceLength.average}{" "}
                <span className="text-sm font-normal text-[var(--color-ink-mute)]">avg words</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
                <span>Variation:</span>
                <span
                  className={
                    analysis.sentenceLength.variation === "high"
                      ? "text-[var(--color-accent)]"
                      : analysis.sentenceLength.variation === "medium"
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-ink-mute)]"
                  }
                >
                  {analysis.sentenceLength.variation}
                </span>
              </div>
              <p className="text-xs text-[var(--color-ink-mute)] mt-1">
                Range: {analysis.sentenceLength.shortest}–{analysis.sentenceLength.longest} words
              </p>
            </div>

            {/* Vocabulary */}
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
              <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">
                Vocabulary Level
              </h3>
              <p className="text-2xl font-bold text-[var(--color-ink)] capitalize mb-1">
                {analysis.vocabulary.level}
              </p>
              <p className="text-sm text-[var(--color-ink-soft)]">
                {Math.round(analysis.vocabulary.uniqueWordRatio * 100)}% unique words
              </p>
            </div>

            {/* Tone */}
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
              <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">
                Tone
              </h3>
              <p className="text-lg font-bold text-[var(--color-ink)] capitalize mb-1">
                {analysis.tone.primary}
                <span className="text-sm font-normal text-[var(--color-ink-mute)]">
                  {" "}/ {analysis.tone.secondary}
                </span>
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-[var(--color-ink-mute)] mb-1">
                  <span>Casual</span>
                  <span>Formal</span>
                </div>
                <div className="h-2 bg-[var(--color-rule)] rounded-[2px] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-ink)] rounded-[2px] transition-all"
                    style={{ width: `${(analysis.tone.formality / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--color-ink-mute)] mt-1 text-center">
                  {analysis.tone.formality}/10
                </p>
              </div>
            </div>

            {/* Structure */}
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
              <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">
                Structure
              </h3>
              <p className="text-sm text-[var(--color-ink)] mb-1">
                Paragraphs: <span className="text-[var(--color-ink)] font-medium">{analysis.structure.avgParagraphLength}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.structure.usesFragments && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink-soft)]">
                    Uses fragments
                  </span>
                )}
                {analysis.structure.listHeavy && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink-soft)]">
                    List-heavy
                  </span>
                )}
              </div>
              {analysis.structure.preferredTransitions.length > 0 && (
                <p className="text-xs text-[var(--color-ink-mute)] mt-2">
                  Transitions: {analysis.structure.preferredTransitions.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Signature Words */}
          {analysis.vocabulary.signatureWords.length > 0 && (
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
              <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
                Signature Words
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.vocabulary.signatureWords.map((word) => (
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
          {analysis.similarTo.length > 0 && (
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
              <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
                Your Writing Resembles
              </h3>
              <ul className="space-y-2">
                {analysis.similarTo.map((writer) => (
                  <li key={writer} className="text-[var(--color-ink)] text-sm leading-relaxed">
                    <span className="text-[var(--color-ink)] font-medium">{writer}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths & Quirks */}
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.personality.strengths.length > 0 && (
              <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
                <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
                  Strengths
                </h3>
                <ul className="space-y-1.5">
                  {analysis.personality.strengths.map((s) => (
                    <li key={s} className="text-sm text-[var(--color-ink)] flex items-start gap-2">
                      <span className="text-[var(--color-accent)] mt-0.5 shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.personality.quirks.length > 0 && (
              <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5">
                <h3 className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
                  Quirks
                </h3>
                <ul className="space-y-1.5">
                  {analysis.personality.quirks.map((q) => (
                    <li key={q} className="text-sm text-[var(--color-ink)] flex items-start gap-2">
                      <span className="text-[var(--color-ink-mute)] mt-0.5 shrink-0">~</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Share Your Voice Card */}
          {shareUrl && (
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 sm:p-8">
              <div className="text-center mb-6">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-2">
                  Share Your{" "}
                  <span className="italic text-[var(--color-accent)]">
                    Voice Card
                  </span>
                </h3>
                <p className="text-[var(--color-ink-soft)] text-sm">
                  Your link generates a visual card when shared on social media
                </p>
              </div>

              {/* Card Preview */}
              <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] p-5 mb-6 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[var(--color-accent)]">DoppelWriter</span>
                  <span className="text-xs text-[var(--color-ink-mute)] uppercase tracking-widest">Voice Analysis</span>
                </div>
                <div className="mb-3">
                  <p className="text-2xl font-extrabold capitalize tracking-tight">{analysis.tone.primary}</p>
                  <p className="text-sm text-[var(--color-ink-mute)] capitalize">with a {analysis.tone.secondary} edge</p>
                </div>
                {analysis.similarTo[0] && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-[var(--color-ink-mute)] uppercase tracking-wider">Writes like</span>
                    <span className="text-sm font-bold text-[var(--color-accent)]">
                      {analysis.similarTo[0].split(" — ")[0]?.split(" – ")[0]?.trim()}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink-soft)] capitalize">{analysis.vocabulary.level} vocabulary</span>
                  <span className="text-xs px-2 py-0.5 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink-soft)]">{analysis.tone.formality}/10 formality</span>
                  <span className="text-xs px-2 py-0.5 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink-soft)]">{analysis.sentenceLength.average} avg words/sentence</span>
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
                  className={`px-5 py-2.5 rounded-[2px] text-sm font-medium transition-all flex items-center gap-2 ${
                    copied
                      ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                      : "bg-[var(--color-paper)] hover:bg-[var(--color-paper-deep)] border border-[var(--color-rule)]"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Just analyzed my writing voice — apparently I write like ${analysis.similarTo[0]?.split(" — ")[0]?.split(" – ")[0]?.trim() || "a unique original"}!\n\nAnalyze yours free:\nhttps://doppelwriter.com${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[var(--color-paper)] hover:bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] text-sm font-medium transition-colors flex items-center gap-2"
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
                  className="px-5 py-2.5 bg-[var(--color-paper)] hover:bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Share on LinkedIn
                </a>
              </div>
            </div>
          )}

          {/* CTA Banner — graduation to full voice profile */}
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5 sm:p-8 text-center">
            <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-semibold mb-2">
              Keep this voice — build your full profile
            </h3>
            <p className="text-[var(--color-ink)] mb-5 max-w-lg mx-auto">
              We&apos;ll use this sample as your starting point. Add a few more and DoppelWriter writes new content in your voice.
            </p>
            <button
              onClick={handleSaveVoice}
              className="inline-block px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-semibold transition-colors"
            >
              {session?.user ? "Save This Voice →" : "Save This Voice — Sign Up Free"}
            </button>
          </div>
        </section>
      )}

      {/* Footer spacer when no results */}
      {!analysis && !loading && <div className="pb-24" />}
    </div>
  );
}
