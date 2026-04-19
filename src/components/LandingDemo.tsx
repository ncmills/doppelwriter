"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const DEFAULT_BRIEF =
  "Write a paragraph about why the best ideas come when you're not trying.";
const MAX_BRIEF_CHARS = 500;

export default function LandingDemo() {
  const [brief, setBrief] = useState(DEFAULT_BRIEF);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    if (loading) return;
    const trimmed = brief.trim();
    if (!trimmed) {
      setError("Type a brief first.");
      return;
    }
    setLoading(true);
    setOutput("");
    setDone(false);
    setError("");

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmed }),
      });
      if (res.status === 429) {
        setError("Demo limit reached — create an account to keep writing.");
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;
          full += decoder.decode(value, { stream: true });
          setOutput(full);
        }
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }, [loading, brief]);

  const reset = useCallback(() => {
    setOutput("");
    setDone(false);
    setError("");
  }, []);

  const showingResult = output || loading;
  const charsLeft = MAX_BRIEF_CHARS - brief.length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="bg-[var(--color-paper)] border border-[var(--color-rule)]">
        {/* Slug line — the editorial masthead */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-rule)]">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
            <span>The Demo</span>
            <span className="h-[1px] w-6 bg-[var(--color-rule)]" />
            <span>Live</span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
            <span className="text-[var(--color-accent)]">●</span>{" "}
            Voice: Hemingway
          </div>
        </div>

        {/* Brief — editable typewriter prompt */}
        <div className="px-5 sm:px-8 pt-6 pb-2">
          <div className="flex items-baseline gap-3 mb-3">
            <label
              htmlFor="demo-brief"
              className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-ink-mute)]"
            >
              Brief
            </label>
            <span className="h-[1px] flex-1 bg-[var(--color-rule)]" />
            <span
              className={`text-[10px] uppercase tracking-[0.25em] ${
                charsLeft < 50 ? "text-[var(--color-accent)]" : "text-[var(--color-ink-mute)]"
              }`}
            >
              {charsLeft}
            </span>
          </div>
          <div className="flex gap-2 items-start">
            <span
              className="text-[var(--color-ink-mute)] select-none font-mono text-[15px] leading-[1.6] pt-[2px]"
              aria-hidden="true"
            >
              ›
            </span>
            <textarea
              id="demo-brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value.slice(0, MAX_BRIEF_CHARS))}
              disabled={loading}
              rows={2}
              maxLength={MAX_BRIEF_CHARS}
              placeholder="Write a paragraph about…"
              className="flex-1 bg-transparent font-mono text-[15px] leading-[1.6] text-[var(--color-ink)] resize-none border-none outline-none placeholder:text-[var(--color-ink-mute)]"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Action */}
        {!showingResult && !error && (
          <div className="px-5 sm:px-8 pb-6 pt-4">
            <button
              onClick={handleGenerate}
              disabled={loading || !brief.trim()}
              className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium tracking-wide uppercase hover:bg-[var(--color-accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderRadius: "2px" }}
            >
              Compose — Watch Hemingway Write
            </button>
          </div>
        )}

        {error && !showingResult && (
          <div className="px-5 sm:px-8 pb-8 text-center">
            <p className="text-[var(--color-accent)] text-sm mb-4 font-[family-name:var(--font-display)] italic">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-block px-5 py-2.5 border border-[var(--color-ink)] text-[var(--color-ink)] text-sm font-medium tracking-wide uppercase hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] transition-colors"
                style={{ borderRadius: "2px" }}
              >
                Try again
              </button>
              <Link
                href="/signup"
                className="inline-block px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium tracking-wide uppercase hover:bg-[var(--color-accent)] transition-colors"
                style={{ borderRadius: "2px" }}
              >
                Create an account
              </Link>
            </div>
          </div>
        )}

        {showingResult && (
          <div className="px-5 sm:px-8 pb-8">
            <div className="flex items-baseline gap-3 mb-4 mt-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-ink-mute)]">
                In Hemingway&apos;s voice
              </span>
              <span className="h-[1px] flex-1 bg-[var(--color-rule)]" />
            </div>
            <p className="font-[family-name:var(--font-display)] text-lg sm:text-xl leading-[1.55] text-[var(--color-ink)]">
              {output}
              {loading && <span className="type-cursor" aria-hidden="true" />}
            </p>

            {done && (
              <div className="mt-8 pt-6 border-t border-[var(--color-rule)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-baseline gap-4">
                  <button
                    onClick={reset}
                    className="ed-link text-sm text-[var(--color-ink-soft)]"
                  >
                    ← Try a different brief
                  </button>
                </div>
                <Link
                  href="/signup"
                  className="inline-block px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium tracking-wide uppercase hover:bg-[var(--color-accent)] transition-colors whitespace-nowrap"
                  style={{ borderRadius: "2px" }}
                >
                  Create your voice →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Colophon line */}
      <p className="mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-mute)]">
        No account required · No credit card · 3 demos / hour
      </p>
    </div>
  );
}
