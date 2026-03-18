"use client";

import { useState, useCallback } from "react";
import Nav from "@/components/Nav";
import ProfileSelector from "@/components/ProfileSelector";
import StreamingOutput from "@/components/StreamingOutput";

export default function GeneratePage() {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [brief, setBrief] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [instructions, setInstructions] = useState("");
  const [doResearch, setDoResearch] = useState(false);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    if (!brief || !profileId) return;
    setLoading(true);
    setOutput("");
    setError("");

    let researchContext: string | undefined;
    if (doResearch) {
      const res = await fetch("/api/generate/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: brief }),
      });
      const data = await res.json();
      researchContext = data.research;
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief, profileId, wordCount: wordCount ? Number(wordCount) : undefined, instructions: instructions || undefined, researchContext }),
    });

    if (res.status === 429) {
      setError("Usage limit reached. Upgrade to Pro for unlimited access.");
      setLoading(false);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let full = "";
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setOutput(full);
      }
    }
    setLoading(false);
  }, [brief, profileId, wordCount, instructions, doResearch]);

  const handleSave = useCallback(async () => {
    if (!output) return;
    await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: brief.slice(0, 60) || "Generated Draft", profileId, mode: "generate", brief, content: output }),
    });
    alert("Draft saved!");
  }, [output, brief, profileId]);

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-literata)]">Generate</h1>
          <ProfileSelector value={profileId} onChange={setProfileId} />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-400 text-sm">
            {error} <a href="/pricing" className="underline">See pricing</a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-stone-400 mb-2">Brief / Topic</label>
              <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Describe what you want to write..."
                className="w-full min-h-[200px] p-4 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-stone-400 mb-2">Target Word Count</label>
                <input type="number" value={wordCount} onChange={(e) => setWordCount(e.target.value)} placeholder="e.g., 500"
                  className="w-full px-4 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={doResearch} onChange={(e) => setDoResearch(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-600 bg-stone-900 text-amber-500 focus:ring-amber-500" />
                  <span className="text-sm text-stone-400">Research first</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-2">Special Instructions</label>
              <input type="text" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Any additional guidance..."
                className="w-full px-4 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
            </div>
            <button onClick={handleGenerate} disabled={!brief || !profileId || loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? "Generating..." : "Generate First Draft"}
            </button>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-stone-400">Output</h2>
              {output && (
                <div className="flex gap-3">
                  <span className="text-xs text-stone-500">{output.split(/\s+/).length} words</span>
                  <button onClick={handleSave} className="text-xs text-amber-400 hover:text-amber-300">Save Draft</button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-[400px] p-4 bg-stone-900 border border-stone-800 rounded-lg overflow-auto">
              <StreamingOutput text={output} loading={loading} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
