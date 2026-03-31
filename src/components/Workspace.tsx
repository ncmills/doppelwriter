"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import DiffView from "./DiffView";
import StreamingOutput from "./StreamingOutput";
import RichEditor from "./RichEditor";
import UpgradeModal from "./UpgradeModal";
import { trackEvent, trackFirstGeneration, trackShare, trackEdit, trackGenerate, trackAcceptEdit, trackRevisionRequested, trackCopyOutput, trackDownloadOutput, trackUpgradeModalShown } from "@/lib/analytics";

interface DiffChunk { value: string; added?: boolean; removed?: boolean; }

export default function Workspace({ profileId, profileName, defaultMode }: { profileId: number; profileName: string; defaultMode?: "edit" | "generate" }) {
  const [mode, setMode] = useState<"edit" | "generate">(defaultMode || "edit");
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
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [doneMode, setDoneMode] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageNudge, setUsageNudge] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  // Track the AI's raw output so we can compare against user edits
  const aiOutputRef = useRef("");

  // Check email verification status
  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then((data) => {
      if (data.emailVerified !== undefined) setEmailVerified(data.emailVerified);
    }).catch(() => {});
  }, []);

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
      setShowUpgradeModal(true);
      trackUpgradeModalShown();
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
    // Notify UsageBar to refresh and check for nudges
    window.dispatchEvent(new Event("dw:usage-changed"));
    fetch("/api/usage").then((r) => r.json()).then((data) => {
      if (data.plan === "free") {
        setUsageCount(data.used);
        const remaining = data.limit - data.used;
        if (remaining <= 0) { setShowUpgradeModal(true); trackUpgradeModalShown(); }
        else setUsageNudge("");
      }
      // Track first generation
      if (data.used === 1) trackFirstGeneration();
    }).catch(() => {});
    return full;
  }, []);

  const handleEdit = useCallback(async () => {
    if (!draft) return;
    trackEdit(profileName);
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
    trackGenerate(profileName);
    await handleStream("/api/generate", {
      brief, profileId,
      wordCount: wordCount ? Number(wordCount) : undefined,
      instructions: instructions || undefined,
    });
  }, [brief, profileId, wordCount, instructions, handleStream]);

  const handleRevise = useCallback(async () => {
    if (!feedback) return;
    trackRevisionRequested();
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
    trackDownloadOutput();
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
    const userFinal = output;

    if (aiRaw && userFinal) {
      const wasEdited = aiRaw !== userFinal;
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

    trackAcceptEdit();
    setDraft(output);
    setOutput("");
    setDiffChunks([]);
    setShowDiff(false);
    aiOutputRef.current = "";
  }, [output, profileId]);

  const handleDone = useCallback(() => {
    const text = output || draft;
    if (!text) return;

    // Record correction if there's an AI output being accepted
    const aiRaw = aiOutputRef.current;
    if (aiRaw && output) {
      const wasEdited = aiRaw !== output;
      fetch("/api/editor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          aiOutput: aiRaw,
          userVersion: output,
          correctionType: wasEdited ? "manual_edit" : "accept",
        }),
      }).then(() => setLearningCount((c) => c + 1));
    }

    // Convert plain text to formatted HTML paragraphs
    const formatted = text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

    setFinalText(formatted);
    setDoneMode(true);
    aiOutputRef.current = "";
  }, [output, draft, profileId]);

  const handleCopy = useCallback(async () => {
    // Create a temp element to get clean text from HTML
    const el = document.createElement("div");
    el.innerHTML = finalText;
    const plainText = el.innerText;
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    trackCopyOutput();
    setTimeout(() => setCopied(false), 2000);
  }, [finalText]);

  const handleCopyFormatted = useCallback(async () => {
    // Copy as rich text (HTML) so it pastes with formatting in Google Docs, Word, etc.
    const blob = new Blob([finalText], { type: "text/html" });
    const plainBlob = new Blob([new DOMParser().parseFromString(finalText, "text/html").body.innerText], { type: "text/plain" });
    await navigator.clipboard.write([
      new ClipboardItem({ "text/html": blob, "text/plain": plainBlob }),
    ]);
    setCopied(true);
    trackCopyOutput();
    setTimeout(() => setCopied(false), 2000);
  }, [finalText]);

  const handleBackToEdit = useCallback(() => {
    setDraft(new DOMParser().parseFromString(finalText, "text/html").body.innerText);
    setOutput("");
    setDiffChunks([]);
    setShowDiff(false);
    setDoneMode(false);
    setFinalText("");
  }, [finalText]);

  const handleShare = useCallback(async () => {
    const content = finalText || output || draft;
    if (!content || sharing) return;
    setSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, voiceName: profileName }),
      });
      const { url } = await res.json();
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      trackShare();
    } catch { /* ignore */ }
    setSharing(false);
  }, [finalText, output, draft, profileName, sharing]);

  const copyReferralLink = useCallback(async () => {
    try {
      const res = await fetch("/api/referral");
      if (res.ok) {
        const data = await res.json();
        await navigator.clipboard.writeText(`https://doppelwriter.com?ref=${data.code}`);
      } else {
        // Fallback if no referral code exists
        await navigator.clipboard.writeText("https://doppelwriter.com");
      }
    } catch {
      // TODO: handle case where referral endpoint is unavailable
      await navigator.clipboard.writeText("https://doppelwriter.com");
    }
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  }, []);

  return (
    <div>
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal used={usageCount || 5} onClose={() => setShowUpgradeModal(false)} />
      )}
      {/* Share URL toast */}
      {shareUrl && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
          Link copied!
          <button onClick={() => setShareUrl("")} className="text-green-200 hover:text-white ml-2">&times;</button>
        </div>
      )}
      {/* Save toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium shadow-lg">
          Saved to drafts
        </div>
      )}
      {/* Email verification banner */}
      {emailVerified === false && (
        <div className="mb-4 px-4 py-2.5 bg-amber-900/30 border border-amber-700/40 rounded-lg flex items-center justify-between">
          <span className="text-amber-300 text-sm">Verify your email to keep using DoppelWriter. Check your inbox for the verification link.</span>
          <button
            onClick={() => fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resendVerification: true }) }).then(() => alert("Verification email sent!"))}
            className="text-xs text-amber-400 hover:text-amber-300 underline shrink-0 ml-4"
          >
            Resend email
          </button>
        </div>
      )}
      {/* Done mode — clean formatted final view */}
      {doneMode ? (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold">Final Draft</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleBackToEdit} className="px-3 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs text-stone-400 hover:text-white transition-colors">
                Back to Edit
              </button>
              <button onClick={handleCopy} className="px-3 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-xs transition-colors">
                {copied ? "Copied!" : "Copy Text"}
              </button>
              <button onClick={handleCopyFormatted} className="hidden sm:inline-block px-3 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-xs transition-colors">
                {copied ? "Copied!" : "Copy Formatted"}
              </button>
              <button onClick={handleDownload} className="hidden sm:inline-block px-3 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-xs transition-colors">
                Download
              </button>
              <button onClick={handleShare} disabled={sharing} className="px-3 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-xs transition-colors disabled:opacity-50">
                {sharing ? "Sharing..." : shareUrl ? "Shared!" : "Share"}
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
                Save
              </button>
            </div>
          </div>
          <div
            className="prose prose-invert prose-stone max-w-none bg-stone-900 border border-stone-800 rounded-lg p-4 sm:p-8 min-h-[300px] sm:min-h-[500px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: finalText }}
          />
          <div className="mt-6 p-4 bg-stone-900/50 border border-stone-800/40 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-300">Know someone who&apos;d love this?</p>
              <p className="text-xs text-stone-500">Share DoppelWriter — they get 5 free uses</p>
            </div>
            <button onClick={copyReferralLink} className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm transition-colors">
              {referralCopied ? "Copied!" : "Copy Invite Link"}
            </button>
          </div>
        </div>
      ) : (
      <>
      {/* Top bar — minimal: mode toggle + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-900 rounded-lg p-0.5">
            <button onClick={() => setMode("edit")}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${mode === "edit" ? "bg-stone-700 text-white" : "text-stone-400"}`}>
              Edit
            </button>
            <button onClick={() => setMode("generate")}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${mode === "generate" ? "bg-stone-700 text-white" : "text-stone-400"}`}>
              Generate
            </button>
          </div>
          <button onClick={() => setShowOptions(!showOptions)}
            className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
            {showOptions ? "Hide options" : "Options"}
          </button>
          {learningCount > 0 && (
            <span className="text-xs text-stone-600 hidden sm:inline">{learningCount} edit{learningCount !== 1 ? "s" : ""} learned</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="hidden sm:block px-3 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs transition-colors text-stone-400 hover:text-white">
            Download
          </button>
          {output && (
            <button onClick={handleShare} disabled={sharing} className="px-3 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs transition-colors text-stone-400 hover:text-white disabled:opacity-50">
              {sharing ? "Sharing..." : shareUrl ? "Shared!" : "Share"}
            </button>
          )}
          <button onClick={handleSave} className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm transition-colors">
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-400 text-sm">
          {error}
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
          {/* Edit action bar — at the top */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
            <button onClick={handleEdit} disabled={!draft || loading}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-40 w-full sm:w-auto">
              {loading ? "Rewriting..." : "Edit in This Voice"}
            </button>
            {output && !loading && (
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <input type="text" value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRevise()} placeholder="Tell it how to revise..."
                  className="flex-1 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <div className="flex gap-2">
                  <button onClick={handleRevise} disabled={!feedback}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors disabled:opacity-40">Revise</button>
                  <button onClick={handleDone}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors">Done</button>
                </div>
              </div>
            )}
          </div>

          {/* Edit mode: two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-stone-400">Your Draft</h2>
                <label className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer">
                  Upload file
                  <input type="file" accept=".docx,.txt,.md" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div className="flex-1 min-h-[250px] sm:min-h-[400px] bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
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
                    <button onClick={handleAccept} className="text-xs text-amber-400 hover:text-amber-300">Accept & Keep Editing</button>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-[250px] sm:min-h-[400px] bg-stone-900 border border-stone-800 rounded-lg overflow-auto">
                {showDiff && diffChunks.length > 0 ? (
                  <div className="p-4"><DiffView chunks={diffChunks} /></div>
                ) : loading ? (
                  <div className="p-4"><StreamingOutput text={output} loading={loading} /></div>
                ) : output ? (
                  <textarea
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    className="w-full h-full min-h-[250px] sm:min-h-[400px] p-4 bg-transparent text-white resize-none focus:outline-none leading-relaxed"
                  />
                ) : (
                  <div className="p-4"><StreamingOutput text="" loading={false} /></div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Generate mode: brief left, output right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
            <div className="space-y-4">
              <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Describe what you want to write..."
                className="w-full min-h-[200px] sm:min-h-[300px] p-4 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed" />
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
                <div className="flex items-center gap-3">
                  {output && <span className="text-xs text-stone-500">{output.split(/\s+/).length} words</span>}
                  {output && !loading && (
                    <button onClick={handleDone}
                      className="px-4 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium transition-colors">Done</button>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-[250px] sm:min-h-[400px] p-4 bg-stone-900 border border-stone-800 rounded-lg overflow-auto">
                <StreamingOutput text={output} loading={loading} />
              </div>
            </div>
          </div>
        </>
      )}
      </>
      )}
    </div>
  );
}
