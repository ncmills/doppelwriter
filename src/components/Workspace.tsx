"use client";

import { useState, useCallback, useRef } from "react";
import DiffView from "./DiffView";
import StreamingOutput from "./StreamingOutput";
import RichEditor from "./RichEditor";

interface DiffChunk { value: string; added?: boolean; removed?: boolean; }

export default function Workspace({ profileId, profileName }: { profileId: number; profileName: string }) {
  const [mode, setMode] = useState<"edit" | "generate">("edit");
  const [draft, setDraft] = useState("");
  const [brief, setBrief] = useState("");
  const [output, setOutput] = useState("");
  const [diffChunks, setDiffChunks] = useState<DiffChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [instructions, setInstructions] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [error, setError] = useState("");
  const [learningCount, setLearningCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  // Track the AI's raw output so we can compare against user edits
  const aiOutputRef = useRef("");

  const handleStream = useCallback(async (url: string, body: Record<string, unknown>): Promise<string> => {
    setLoading(true);
    setOutput("");
    setDiffChunks([]);
    setShowDiff(false);
    setError("");

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      setError("Usage limit reached. Upgrade to Pro for more.");
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
        setOutput(full);
      }
    }
    setLoading(false);
    return full;
  }, []);

  const handleEdit = useCallback(async () => {
    if (!draft) return;
    const result = await handleStream("/api/editor", { draft, profileId, instructions: instructions || undefined });
    if (result) {
      aiOutputRef.current = result; // Store AI's raw output for comparison
      const diffRes = await fetch("/api/diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original: draft, edited: result }),
      });
      const { diff } = await diffRes.json();
      setDiffChunks(diff);
      setShowDiff(true);
    }
  }, [draft, profileId, instructions, handleStream]);

  const handleGenerate = useCallback(async () => {
    if (!brief) return;
    await handleStream("/api/generate", {
      brief, profileId,
      wordCount: wordCount ? Number(wordCount) : undefined,
      instructions: instructions || undefined,
    });
  }, [brief, profileId, wordCount, instructions, handleStream]);

  const handleRevise = useCallback(async () => {
    if (!feedback) return;
    const prevOutput = output;

    // Record the revision feedback as a learning signal
    fetch("/api/editor/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        aiOutput: prevOutput,
        userVersion: prevOutput, // Will be replaced by new output
        correctionType: "revision_feedback",
        revisionFeedback: feedback,
      }),
    }).then(() => setLearningCount((c) => c + 1));

    const result = await handleStream("/api/editor/revise", {
      original: draft, currentEdit: prevOutput, feedback, profileId,
    });
    if (result) {
      aiOutputRef.current = result;
      const diffRes = await fetch("/api/diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original: draft, edited: result }),
      });
      const { diff } = await diffRes.json();
      setDiffChunks(diff);
      setShowDiff(true);
    }
    setFeedback("");
  }, [draft, output, feedback, profileId, handleStream]);

  const handleSave = useCallback(async () => {
    const content = output || draft;
    if (!content) return;
    await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: (mode === "generate" ? brief : content).split("\n")[0]?.slice(0, 60) || "Untitled",
        profileId, mode, brief: mode === "generate" ? brief : undefined, content,
      }),
    });
    alert("Saved to drafts!");
  }, [draft, output, brief, profileId, mode]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith(".docx")) {
      const formData = new FormData();
      formData.append("file", file);
      // Get HTML version for rich editing
      const res = await fetch("/api/parse-docx", { method: "POST", body: formData });
      const data = await res.json();
      setDraft(data.html || data.text);
    } else {
      setDraft(await file.text());
    }
    e.target.value = "";
  }, []);

  const handleDownload = useCallback(() => {
    const content = output || draft;
    if (!content) return;
    // Export as HTML file with basic styling
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Georgia, serif; max-width: 700px; margin: 2em auto; line-height: 1.6; color: #1a1a1a; padding: 0 1em; }
h1 { font-size: 1.5em; } h2 { font-size: 1.3em; } h3 { font-size: 1.1em; }
</style></head><body>${content}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doppelwriter-draft.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [draft, output]);

  // Smart correction tracking — detects if user edited the AI output before accepting
  const handleAccept = useCallback(async () => {
    const aiRaw = aiOutputRef.current;
    const userFinal = output; // May have been manually edited by user in the output area

    if (aiRaw && userFinal) {
      const wasEdited = aiRaw !== userFinal;
      // Fire and forget — don't block the UI
      fetch("/api/editor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          aiOutput: aiRaw,
          userVersion: userFinal,
          correctionType: wasEdited ? "manual_edit" : "accept",
        }),
      }).then(() => setLearningCount((c) => c + 1));
    }

    setDraft(output);
    setOutput("");
    setDiffChunks([]);
    setShowDiff(false);
    aiOutputRef.current = "";
  }, [output, profileId]);

  return (
    <div>
      {/* Top bar — minimal: mode toggle + actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-900 rounded-lg p-0.5">
            <button onClick={() => setMode("edit")}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${mode === "edit" ? "bg-stone-700 text-white" : "text-stone-400"}`}>
              Edit
            </button>
            <button onClick={() => setMode("generate")}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors ${mode === "generate" ? "bg-stone-700 text-white" : "text-stone-400"}`}>
              Generate
            </button>
          </div>
          <button onClick={() => setShowOptions(!showOptions)}
            className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
            {showOptions ? "Hide options" : "Options"}
          </button>
          {learningCount > 0 && (
            <span className="text-xs text-stone-600">{learningCount} edit{learningCount !== 1 ? "s" : ""} learned</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs transition-colors text-stone-400 hover:text-white">
            Download
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm transition-colors">
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-400 text-sm">
          {error} <a href="/pricing" className="underline">Upgrade</a>
        </div>
      )}

      {/* Collapsible options — progressive disclosure */}
      {showOptions && (
        <div className="mb-4 p-3 bg-stone-900/50 border border-stone-800/40 rounded-lg space-y-3">
          <input type="text" value={instructions} onChange={(e) => setInstructions(e.target.value)}
            placeholder={mode === "edit" ? "Instructions (e.g., 'tighten it up', 'more confident')" : "Special instructions for the draft"}
            className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
          {mode === "generate" && (
            <input type="number" value={wordCount} onChange={(e) => setWordCount(e.target.value)}
              placeholder="Target word count (e.g., 500)"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
          )}
        </div>
      )}

      {mode === "edit" ? (
        <>
          {/* Edit mode: two columns */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-stone-400">Your Draft</h2>
                <label className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer">
                  Upload file
                  <input type="file" accept=".docx,.txt,.md" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div className="flex-1 min-h-[400px] bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
              <RichEditor
                value={draft}
                onChange={setDraft}
                placeholder="Paste your draft here..."
              />
            </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-stone-400">{showDiff ? "Changes" : "Output"}</h2>
                {output && (
                  <div className="flex gap-2">
                    <button onClick={() => setShowDiff(!showDiff)} className="text-xs text-stone-400 hover:text-white">
                      {showDiff ? "Clean" : "Diff"}
                    </button>
                    <button onClick={handleAccept} className="text-xs text-green-400 hover:text-green-300">Accept</button>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-[400px] bg-stone-900 border border-stone-800 rounded-lg overflow-auto">
                {showDiff && diffChunks.length > 0 ? (
                  <div className="p-4"><DiffView chunks={diffChunks} /></div>
                ) : loading ? (
                  <div className="p-4"><StreamingOutput text={output} loading={loading} /></div>
                ) : output ? (
                  <textarea
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    className="w-full h-full min-h-[400px] p-4 bg-transparent text-white resize-none focus:outline-none leading-relaxed"
                  />
                ) : (
                  <div className="p-4"><StreamingOutput text="" loading={false} /></div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleEdit} disabled={!draft || loading}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-40">
              {loading ? "Writing..." : "Edit in This Voice"}
            </button>
            {output && !loading && (
              <div className="flex items-center gap-2 flex-1">
                <input type="text" value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRevise()} placeholder="What would you like to change?"
                  className="flex-1 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <button onClick={handleRevise} disabled={!feedback}
                  className="px-4 py-2.5 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors disabled:opacity-40">Revise</button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Generate mode: brief left, output right */}
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="space-y-4">
              <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Describe what you want to write..."
                className="w-full min-h-[300px] p-4 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed" />
              <div>
                <label className="block text-sm text-stone-400 mb-2">Target word count</label>
                <input type="number" value={wordCount} onChange={(e) => setWordCount(e.target.value)} placeholder="e.g., 500"
                  className="w-full px-4 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <button onClick={handleGenerate} disabled={!brief || loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-40">
                {loading ? "Writing..." : "Generate Draft"}
              </button>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-stone-400">Output</h2>
                {output && <span className="text-xs text-stone-500">{output.split(/\s+/).length} words</span>}
              </div>
              <div className="flex-1 min-h-[400px] p-4 bg-stone-900 border border-stone-800 rounded-lg overflow-auto">
                <StreamingOutput text={output} loading={loading} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
