"use client";

import { useState } from "react";

export default function EmbedToneChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    overall: string;
    scores: { warmth: number; formality: number; confidence: number; clarity: number };
    observations: string[];
    suggestion: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (text.length < 10) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/analyze-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }
      setResult(await res.json());
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-fg)] p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold font-[family-name:var(--font-display)]">Email Tone Checker</h2>
          <a href="https://doppelwriter.com/tools/email-tone-checker" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-brand)] hover:text-[var(--color-fg)]">
            Powered by DoppelWriter &rarr;
          </a>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your email here..."
          className="w-full h-32 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] p-3 text-sm resize-none focus:outline-none focus:border-[var(--color-fg)] mb-3 placeholder:text-[var(--color-fg-muted)]"
          maxLength={5000}
        />
        <button
          onClick={analyze}
          disabled={text.length < 10 || loading}
          className="w-full py-2 bg-[var(--color-fg)] text-[var(--color-surface)] hover:bg-[var(--color-brand)] disabled:bg-[var(--color-surface-raised)] disabled:text-[var(--color-fg-muted)] rounded-[2px] text-sm font-medium transition-colors mb-4"
        >
          {loading ? "Analyzing..." : "Check Tone"}
        </button>
        {error && <p className="text-red-700 text-sm mb-3">{error}</p>}
        {result && (
          <div className="space-y-3">
            <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] p-3">
              <p className="text-xs text-[var(--color-fg-muted)] mb-1">Overall Tone</p>
              <p className="text-lg font-semibold text-[var(--color-brand)]">{result.overall}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.scores).map(([key, val]) => (
                <div key={key} className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] p-2">
                  <p className="text-xs text-[var(--color-fg-muted)] capitalize">{key}</p>
                  <div className="w-full h-1.5 bg-[var(--color-border)] rounded-[2px] mt-1">
                    <div className="h-full bg-[var(--color-fg)] rounded-[2px]" style={{ width: `${val * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {result.observations.length > 0 && (
              <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] p-3">
                <p className="text-xs text-[var(--color-fg-muted)] mb-2">Observations</p>
                <ul className="space-y-1">
                  {result.observations.map((obs, i) => (
                    <li key={i} className="text-xs text-[var(--color-fg)]">{obs}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-[var(--color-fg-muted)]">{result.suggestion}</p>
          </div>
        )}
        <footer className="mt-6 pt-3 border-t border-[var(--color-border)] text-center">
          <a
            href="https://doppelwriter.com/?utm_source=embed&utm_medium=widget"
            target="_blank"
            rel="noopener"
            className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-brand)] transition-colors"
          >
            Powered by DoppelWriter &rarr;
          </a>
        </footer>
      </div>
    </div>
  );
}
