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
    <div className="min-h-screen bg-[#0C0A09] text-[#FAFAF9] p-4 font-sans">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Email Tone Checker</h2>
          <a href="https://doppelwriter.com/tools/email-tone-checker" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300">
            Powered by DoppelWriter &rarr;
          </a>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your email here..."
          className="w-full h-32 bg-stone-900 border border-stone-800 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-amber-600/50 mb-3"
          maxLength={5000}
        />
        <button
          onClick={analyze}
          disabled={text.length < 10 || loading}
          className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 rounded-lg text-sm font-medium transition-colors mb-4"
        >
          {loading ? "Analyzing..." : "Check Tone"}
        </button>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {result && (
          <div className="space-y-3">
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-3">
              <p className="text-xs text-stone-500 mb-1">Overall Tone</p>
              <p className="text-lg font-semibold text-amber-400">{result.overall}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.scores).map(([key, val]) => (
                <div key={key} className="bg-stone-900 border border-stone-800 rounded-lg p-2">
                  <p className="text-xs text-stone-500 capitalize">{key}</p>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full mt-1">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${val * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {result.observations.length > 0 && (
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-3">
                <p className="text-xs text-stone-500 mb-2">Observations</p>
                <ul className="space-y-1">
                  {result.observations.map((obs, i) => (
                    <li key={i} className="text-xs text-stone-300">{obs}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-stone-500">{result.suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
