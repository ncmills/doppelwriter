"use client";

import { useEffect, useState, useCallback } from "react";
import Nav from "@/components/Nav";

interface Sample {
  id: number;
  title: string;
  source_type: string;
  word_count: number;
  categories: string | null;
  created_at: string;
}

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const loadSamples = useCallback(async () => {
    const res = await fetch("/api/samples");
    setSamples(await res.json());
  }, []);

  useEffect(() => { loadSamples(); }, [loadSamples]);

  const handlePaste = async () => {
    if (!pasteContent) return;
    setUploading(true);
    await fetch("/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: pasteTitle || "Pasted text", content: pasteContent, sourceType: "paste" }),
    });
    setPasteTitle("");
    setPasteContent("");
    setUploading(false);
    loadSamples();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/samples", { method: "POST", body: formData });
    }
    setUploading(false);
    loadSamples();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/samples", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadSamples();
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analyze" }),
    });
    setAnalyzing(false);
    loadSamples();
  };

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-literata)]">Writing Samples</h1>
            <p className="text-stone-400 text-sm mt-1">Upload your writing to build personal voice profiles.</p>
          </div>
          <button onClick={handleAnalyze} disabled={analyzing || samples.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {analyzing ? "Analyzing..." : "Analyze & Build Profiles"}
          </button>
        </div>

        {/* Upload Area */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <h3 className="font-medium mb-3">Upload Files</h3>
            <label className="block w-full py-8 border-2 border-dashed border-stone-800 rounded-lg text-center cursor-pointer hover:border-amber-600/40 transition-colors">
              <p className="text-stone-400 text-sm">{uploading ? "Uploading..." : "Drop .docx, .txt, or .md files here"}</p>
              <input type="file" accept=".docx,.txt,.md" multiple onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <h3 className="font-medium mb-3">Paste Text</h3>
            <input type="text" value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)} placeholder="Title"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <textarea value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} placeholder="Paste your writing here..."
              className="w-full h-20 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-600 text-sm resize-none mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <button onClick={handlePaste} disabled={!pasteContent || uploading}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded text-sm transition-colors disabled:opacity-40">
              Add Sample
            </button>
          </div>
        </div>

        {/* Samples List */}
        <h2 className="text-lg font-semibold mb-3 font-[family-name:var(--font-literata)]">Your Samples ({samples.length})</h2>
        {samples.length === 0 ? (
          <p className="text-stone-500">No samples yet. Upload files or paste text to get started.</p>
        ) : (
          <div className="space-y-2">
            {samples.map((s) => (
              <div key={s.id} className="bg-stone-900/50 border border-stone-800/40 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-stone-500">
                    <span className="text-amber-400">{s.source_type}</span>
                    {s.categories && <> · <span className="text-green-400">{s.categories}</span></>}
                    {" · "}{s.word_count} words
                  </p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-stone-600 hover:text-red-400 transition-colors">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
