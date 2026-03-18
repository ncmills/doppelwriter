"use client";

import { useState, useCallback } from "react";
import Nav from "@/components/Nav";
import ProfileSelector from "@/components/ProfileSelector";
import DiffView from "@/components/DiffView";
import StreamingOutput from "@/components/StreamingOutput";

interface DiffChunk { value: string; added?: boolean; removed?: boolean; }

export default function EditorPage() {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [editedText, setEditedText] = useState("");
  const [diffChunks, setDiffChunks] = useState<DiffChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");

  const handleStream = useCallback(async (url: string, body: Record<string, unknown>) => {
    setLoading(true);
    setEditedText("");
    setDiffChunks([]);
    setShowDiff(false);
    setError("");

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      setError("Usage limit reached. Upgrade to Pro for unlimited access.");
      setLoading(false);
      return "";
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let full = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setEditedText(full);
      }
    }

    // Compute diff
    const diffRes = await fetch("/api/diff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ original: draft, edited: full }),
    });
    const { diff } = await diffRes.json();
    setDiffChunks(diff);
    setShowDiff(true);
    setLoading(false);
    return full;
  }, [draft]);

  const handleEdit = useCallback(() => {
    if (!draft || !profileId) return;
    handleStream("/api/editor", { draft, profileId, instructions: instructions || undefined });
  }, [draft, profileId, instructions, handleStream]);

  const handleRevise = useCallback(async () => {
    if (!feedback || !profileId) return;
    const prevEdit = editedText;
    await handleStream("/api/editor/revise", {
      original: draft, currentEdit: prevEdit, feedback, profileId,
    });
    setFeedback("");
  }, [draft, editedText, feedback, profileId, handleStream]);

  const handleSave = useCallback(async () => {
    const content = editedText || draft;
    await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: content.split("\n")[0]?.slice(0, 60) || "Untitled",
        profileId, mode: "editor", content,
      }),
    });
    alert("Draft saved!");
  }, [draft, editedText, profileId]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith(".docx")) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-docx", { method: "POST", body: formData });
      const { text } = await res.json();
      setDraft(text);
    } else {
      setDraft(await file.text());
    }
  }, []);

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Editor</h1>
          <div className="flex items-center gap-3">
            <ProfileSelector value={profileId} onChange={setProfileId} />
            <button onClick={handleSave} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
              Save Draft
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-400 text-sm">
            {error} <a href="/pricing" className="underline">See pricing</a>
          </div>
        )}

        <div className="mb-4">
          <input type="text" value={instructions} onChange={(e) => setInstructions(e.target.value)}
            placeholder="Optional editing instructions (e.g., 'make it more concise', 'add more energy')"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-400">Your Draft</h2>
              <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                Upload file
                <input type="file" accept=".docx,.txt,.md" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Paste your draft here..."
              className="flex-1 min-h-[400px] p-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-400">{showDiff ? "Changes" : "Edited Output"}</h2>
              {editedText && (
                <div className="flex gap-2">
                  <button onClick={() => setShowDiff(!showDiff)} className="text-xs text-gray-400 hover:text-white">
                    {showDiff ? "Show Clean" : "Show Diff"}
                  </button>
                  <button onClick={() => { setDraft(editedText); setEditedText(""); setDiffChunks([]); setShowDiff(false); }}
                    className="text-xs text-green-400 hover:text-green-300">Accept</button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-[400px] p-4 bg-gray-900 border border-gray-700 rounded-lg overflow-auto">
              {showDiff && diffChunks.length > 0 ? <DiffView chunks={diffChunks} /> : <StreamingOutput text={editedText} loading={loading} />}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEdit} disabled={!draft || !profileId || loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Editing..." : "Edit in This Voice"}
          </button>
          {editedText && !loading && (
            <div className="flex items-center gap-2 flex-1">
              <input type="text" value={feedback} onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRevise()} placeholder="What would you like to change?"
                className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={handleRevise} disabled={!feedback}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-40">Revise</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
