"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

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
        setError("Demo limit reached — sign up to keep writing!");
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
    <div className="bg-stone-900/80 border border-stone-800/60 rounded-xl overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-800/40">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-stone-700" />
            <div className="w-3 h-3 rounded-full bg-stone-700" />
            <div className="w-3 h-3 rounded-full bg-stone-700" />
          </div>
          <span className="text-xs text-stone-500">Live Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-stone-700" />
          <span className="text-xs text-amber-400">Hemingway</span>
        </div>
      </div>

      {/* Content area */}
      <div className="p-6">
        <p className="text-xs text-stone-500 mb-2">Brief</p>
        <p className="text-sm text-stone-400 mb-4">
          &ldquo;Write a paragraph about why the best ideas come when you&apos;re not trying&rdquo;
        </p>

        {!output && !loading && !error && (
          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
          >
            Generate — Watch Hemingway Write
          </button>
        )}

        {error && (
          <div className="text-center">
            <p className="text-amber-400 text-sm mb-4">{error}</p>
            <Link href="/signup" className="inline-block px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
              Sign Up Free
            </Link>
          </div>
        )}

        {(output || loading) && (
          <div className="mt-2">
            <p className="text-xs text-stone-500 mb-2">Hemingway&apos;s Voice</p>
            <p className="text-sm text-white leading-relaxed">
              {output}
              {loading && <span className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 animate-pulse" />}
            </p>
          </div>
        )}

        {done && (
          <div className="mt-6 pt-4 border-t border-stone-800/40 text-center">
            <p className="text-stone-400 text-sm mb-3">That was Hemingway. Want to try your own voice?</p>
            <Link
              href="/signup"
              className="inline-block px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
            >
              Create Your Voice — Free
            </Link>
            <p className="text-stone-600 text-xs mt-2">No credit card required</p>
          </div>
        )}
      </div>
    </div>
  );
}
