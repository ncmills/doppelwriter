"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const DEMO_BRIEF =
  "Write a paragraph about why the best ideas come when you're not trying.";

export default function LandingDemo() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setOutput("");
    setDone(false);
    setError("");

    try {
      const res = await fetch("/api/demo", { method: "POST" });
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
  }, [loading]);

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

        {/* Brief — typewriter prompt */}
        <div className="px-5 sm:px-8 pt-6 pb-4">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-ink-mute)]">
              Brief
            </span>
            <span className="h-[1px] flex-1 bg-[var(--color-rule)]" />
          </div>
          <p className="font-mono text-[15px] leading-relaxed text-[var(--color-ink)]">
            <span className="text-[var(--color-ink-mute)] select-none mr-2">
              ›
            </span>
            {DEMO_BRIEF}
            {!loading && !output && !error && (
              <span className="type-cursor" aria-hidden="true" />
            )}
          </p>
        </div>

        {/* Action */}
        {!output && !loading && !error && (
          <div className="px-5 sm:px-8 pb-6">
            <button
              onClick={handleGenerate}
              className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium tracking-wide uppercase hover:bg-[var(--color-accent)] transition-colors"
              style={{ borderRadius: "2px" }}
            >
              Compose — Watch Hemingway Write
            </button>
          </div>
        )}

        {error && (
          <div className="px-5 sm:px-8 pb-8 text-center">
            <p className="text-[var(--color-accent)] text-sm mb-4 font-[family-name:var(--font-display)] italic">
              {error}
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium tracking-wide uppercase hover:bg-[var(--color-accent)] transition-colors"
              style={{ borderRadius: "2px" }}
            >
              Create an account
            </Link>
          </div>
        )}

        {(output || loading) && (
          <div className="px-5 sm:px-8 pb-8">
            <div className="flex items-baseline gap-3 mb-4">
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
                <p className="text-sm text-[var(--color-ink-soft)] italic">
                  That was Hemingway. What would yours sound like?
                </p>
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
        No account required · No credit card
      </p>
    </div>
  );
}
