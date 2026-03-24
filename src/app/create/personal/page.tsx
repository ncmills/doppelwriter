"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { trackProfileBuildStarted, trackSampleUploaded } from "@/lib/analytics";

interface Sample {
  title: string;
  wordCount: number;
  sourceType: string;
}

const WORD_PERFECT = 5000; // Green zone — enough for a great profile
const WORD_MINIMUM = 1500; // Yellow zone — can build but quality won't be great
const WORD_PLENTY = 15000; // Past this, more content won't improve the profile much
// Below WORD_MINIMUM = Red zone — not enough to build

const TIPS = [
  "The speech feature is the easiest way to generate a lot of content fast — just talk for a few minutes.",
  "Did you upload your sent emails? They're one of the best sources of your natural voice.",
  "What about that college writing assignment you were proud of?",
  "LinkedIn posts, Slack messages, text conversations — anything you wrote counts.",
  "Try uploading a few different types: a casual email, a professional memo, something personal.",
  "Old cover letters and job applications are surprisingly rich writing samples.",
  "Newsletter drafts, blog posts, even long social media captions work great.",
  "The more variety you give it, the better it captures the full range of your voice.",
  "Got any old essays or school papers saved on your laptop?",
  "Even voice memos work — hit record and explain an idea like you're talking to a friend.",
  "Recommendation letters you've written for other people? Those are gold.",
  "Check your Notes app — you probably have drafts and thoughts saved there.",
  "Wedding speeches, toasts, eulogies — emotional writing reveals your voice at its most authentic.",
  "Work presentations with speaker notes are a great source of your explanatory voice.",
];

export default function CreatePersonalPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<unknown>(null);
  const [currentTip, setCurrentTip] = useState(0);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailSyncing, setGmailSyncing] = useState(false);
  const [gmailResult, setGmailResult] = useState("");
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [improveProfileId, setImproveProfileId] = useState<string | null>(null);
  const [weakDimensions, setWeakDimensions] = useState<{ name: string; improvement: string }[]>([]);
  const [targetName, setTargetName] = useState<string | null>(null);

  // Load existing samples, check for existing profile, and load quality tips if improving
  useEffect(() => {
    fetch("/api/samples").then((r) => r.json()).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setSamples(data.map((s: { title: string; word_count: number; source_type: string }) => ({
          title: s.title,
          wordCount: s.word_count,
          sourceType: s.source_type,
        })));
      }
    }).catch(() => {});

    const params = new URLSearchParams(window.location.search);

    // Check for ?name= param (coming from voice selector fallback)
    const nameParam = params.get("name");
    if (nameParam) setTargetName(nameParam);

    // Check for ?improve=ID param
    const improveId = params.get("improve");
    if (improveId) {
      setImproveProfileId(improveId);
      setHasExistingProfile(true);
      // Load quality dimensions to show what needs improvement
      fetch(`/api/profiles/${improveId}/quality`).then((r) => r.ok ? r.json() : null).then((quality) => {
        if (quality?.dimensions) {
          const weak = quality.dimensions
            .filter((d: { status: string }) => d.status !== "strong")
            .sort((a: { score: number }, b: { score: number }) => a.score - b.score)
            .slice(0, 3)
            .map((d: { name: string; improvement: string }) => ({ name: d.name, improvement: d.improvement }));
          setWeakDimensions(weak);
        }
      }).catch(() => {});
    } else {
      // Check if user already has a personal profile
      fetch("/api/profiles").then((r) => r.json()).then((profiles) => {
        if (Array.isArray(profiles) && profiles.some((p: { is_curated: boolean }) => !p.is_curated)) {
          setHasExistingProfile(true);
        }
      }).catch(() => {});
    }
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const totalWords = samples.reduce((sum, s) => sum + s.wordCount, 0);
  const progressPct = Math.min((totalWords / WORD_PERFECT) * 100, 100);
  const hasEnough = totalWords >= WORD_MINIMUM;
  const isStrong = totalWords >= WORD_PERFECT;
  const hasPlenty = totalWords >= WORD_PLENTY;

  const addSample = async (title: string, content: string, sourceType: string) => {
    const res = await fetch("/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, sourceType }),
    });
    if (res.ok) {
      const wc = content.split(/\s+/).filter(Boolean).length;
      setSamples((prev) => [...prev, { title, wordCount: wc, sourceType }]);
      trackSampleUploaded(sourceType, wc);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/samples", { method: "POST", body: formData });
      if (res.ok) {
        // Estimate word count from file size (~5 chars per word)
        const estimatedWords = Math.round(file.size / 5);
        setSamples((prev) => [...prev, { title: file.name, wordCount: estimatedWords, sourceType: "upload" }]);
        trackSampleUploaded("upload", estimatedWords);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const handlePaste = async () => {
    if (!pasteContent) return;
    await addSample(pasteTitle || "Pasted text", pasteContent, "paste");
    setPasteTitle("");
    setPasteContent("");
  };

  const handleGmailConnect = async () => {
    const res = await fetch("/api/gmail/connect");
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const handleGmailSync = async () => {
    setGmailSyncing(true);
    setGmailResult("");
    const res = await fetch("/api/gmail/sync", { method: "POST" });
    if (res.ok) {
      const { synced } = await res.json();
      setGmailResult(`Synced ${synced} emails`);
      // Refresh word count (emails are temporarily stored then will be purged after profile build)
      const samplesRes = await fetch("/api/samples");
      const allSamples = await samplesRes.json();
      const emailSamples = allSamples.filter((s: { source_type: string; word_count: number; title: string }) => s.source_type === "email");
      for (const s of emailSamples) {
        setSamples((prev) => {
          if (prev.some((p) => p.title === s.title)) return prev;
          return [...prev, { title: s.title, wordCount: s.word_count, sourceType: "email" }];
        });
      }
    } else {
      setGmailResult("Sync failed — try reconnecting Gmail");
    }
    setGmailSyncing(false);
  };

  // Check Gmail connection on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail") === "connected") setGmailConnected(true);
  }, []);

  const startRecording = useCallback(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }, []);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
    }
    setRecording(false);
    if (transcript.trim().length > 50) {
      await addSample("Voice recording", transcript.trim(), "speech");
      setTranscript("");
    }
  }, [transcript]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeError("");
    trackProfileBuildStarted();
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", improveProfileId: improveProfileId || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        const profileId = improveProfileId || data.profileIds?.[0];
        // Send to profile page so they see quality scores + improvement tips
        router.push(profileId ? `/profile/${profileId}` : "/write");
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error === "insufficient_content") {
          setAnalyzeError(`Not enough content to build a voice profile. You have ${totalWords.toLocaleString()} words — add more samples to reach at least ${WORD_MINIMUM.toLocaleString()}.`);
        } else {
          setAnalyzeError(data.error || "Something went wrong building your profile. Please try again.");
        }
        setAnalyzing(false);
      }
    } catch {
      setAnalyzeError("Connection error — please try again.");
      setAnalyzing(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">
          {hasExistingProfile
            ? "Improve Your DoppelWriter"
            : targetName
              ? `Build ${targetName}\u2019s Voice`
              : "Create Personal DoppelWriter"}
        </h1>
        <p className="text-stone-400 text-sm mb-6">
          {hasExistingProfile
            ? "Add more writing samples to make your voice profile more accurate. New samples will be analyzed and merged with your existing profile."
            : targetName
              ? `We couldn\u2019t find enough published writing online for ${targetName}. Upload their writing \u2014 emails, essays, blog posts, anything they\u2019ve written \u2014 and we\u2019ll build a voice profile from it.`
              : "Clone anyone\u2019s voice \u2014 yours, your mom\u2019s, your boss\u2019s, a friend\u2019s. Upload their writing and we\u2019ll build a profile that sounds exactly like them."}
        </p>

        {/* Improvement tips from quality analysis */}
        {weakDimensions.length > 0 && (
          <div className="mb-6 bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
            <h3 className="text-amber-400 text-sm font-medium mb-2">What your profile needs most:</h3>
            <ul className="space-y-1.5">
              {weakDimensions.map((d) => (
                <li key={d.name} className="text-sm text-stone-400">
                  <span className="text-stone-300 font-medium">{d.name}</span> — {d.improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-400">
              {totalWords.toLocaleString()} words uploaded
            </span>
            <span className={`text-xs font-medium ${isStrong ? "text-green-400" : hasEnough ? "text-amber-400" : "text-red-400"}`}>
              {hasPlenty
                ? "More than enough — ready to build a great profile"
                : isStrong
                  ? "Perfect — ready for a great profile"
                  : hasEnough
                    ? "Good enough to build — more samples will improve quality"
                    : `Need ${Math.max(0, WORD_MINIMUM - totalWords).toLocaleString()} more words to build`}
            </span>
          </div>
          <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden relative">
            {/* Threshold markers */}
            <div className="absolute h-full w-px bg-stone-600/50 z-10" style={{ left: `${(WORD_MINIMUM / WORD_PERFECT) * 100}%` }} />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isStrong ? "bg-green-500" : hasEnough ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.max(progressPct, 2)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-stone-600">0</span>
            <span className="text-[10px] text-stone-600" style={{ position: "relative", left: `${(WORD_MINIMUM / WORD_PERFECT) * 100 - 50}%` }}>
              {WORD_MINIMUM.toLocaleString()} min
            </span>
            <span className="text-[10px] text-stone-600">{WORD_PERFECT.toLocaleString()}</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s ? "bg-amber-600 text-white" : "bg-stone-800 text-stone-500"
                }`}
              >{s}</button>
              <span className={`text-sm ${step >= s ? "text-white" : "text-stone-500"}`}>
                {s === 1 ? "Add samples" : "Build profile"}
              </span>
              {s < 2 && <div className="w-12 h-px bg-stone-700" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Upload files */}
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="font-medium mb-3">Upload Files</h3>
              <label className="block w-full py-8 border-2 border-dashed border-stone-800 rounded-lg text-center cursor-pointer hover:border-amber-600/40 transition-colors">
                <p className="text-stone-400 text-sm">{uploading ? "Uploading..." : "Drop .docx, .txt, or .md files"}</p>
                <p className="text-stone-600 text-xs mt-1">Select multiple files at once</p>
                <input type="file" accept=".docx,.txt,.md" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Paste text */}
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="font-medium mb-3">Paste Text</h3>
              <input type="text" value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)} placeholder="Title (optional)"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <textarea value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} placeholder="Paste an email, essay, memo, or any writing sample..."
                className="w-full h-32 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-600 text-sm resize-none mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <button onClick={handlePaste} disabled={!pasteContent}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded text-sm transition-colors disabled:opacity-40">
                Add Sample
              </button>
            </div>

            {/* Speech to text */}
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="font-medium mb-3">Record Your Voice</h3>
              <p className="text-stone-500 text-xs mb-3">Speak naturally — talk about your day, explain an idea, tell a story. We&apos;ll transcribe it and use it as a writing sample.</p>
              {!recording ? (
                <button onClick={startRecording} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-colors">
                  Start Recording
                </button>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-400">Recording...</span>
                    <button onClick={stopRecording} className="px-3 py-1 bg-stone-700 hover:bg-stone-600 rounded text-sm">
                      Stop & Save
                    </button>
                  </div>
                  {transcript && (
                    <div className="p-3 bg-stone-900 rounded-lg text-sm text-stone-300 max-h-32 overflow-auto">
                      {transcript}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Gmail sync */}
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <h3 className="font-medium mb-3">Connect Gmail</h3>
              <p className="text-stone-500 text-xs mb-3">
                Pull your sent emails automatically. We read them, extract your voice patterns, then delete the raw text. Your emails are never stored.
              </p>
              {gmailConnected ? (
                <div>
                  <button onClick={handleGmailSync} disabled={gmailSyncing}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm transition-colors disabled:opacity-50">
                    {gmailSyncing ? "Syncing..." : "Sync Sent Emails"}
                  </button>
                  {gmailResult && <p className="text-xs text-stone-400 mt-2">{gmailResult}</p>}
                </div>
              ) : (
                <button onClick={handleGmailConnect}
                  className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm transition-colors">
                  Connect Google Account
                </button>
              )}
            </div>

            {/* Samples added */}
            {samples.length > 0 && (
              <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
                <h3 className="font-medium mb-3">Samples Added ({samples.length})</h3>
                <div className="space-y-2">
                  {samples.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="truncate mr-4">{s.title}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-stone-500">{s.wordCount.toLocaleString()} words</span>
                        <span className="text-xs text-stone-600">{s.sourceType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!hasEnough}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-40"
            >
              {hasEnough
                ? `Continue — Build Profile (${totalWords.toLocaleString()} words)`
                : `Add more writing (${Math.max(0, WORD_MINIMUM - totalWords).toLocaleString()} words to go)`}
            </button>

            {/* Scrolling tips */}
            <div className="bg-stone-900/30 border border-stone-800/30 rounded-lg px-5 py-3 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-xs shrink-0">TIP</span>
                <p className="text-stone-500 text-xs transition-opacity duration-500" key={currentTip}>
                  {TIPS[currentTip]}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-12">
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-3">
              {improveProfileId
                ? "Ready to improve your voice profile"
                : isStrong ? "Ready to build your DoppelWriter" : "You can build now, but more samples = better results"}
            </h2>
            <p className="text-stone-400 mb-4 max-w-md mx-auto">
              {improveProfileId
                ? `We'll analyze your ${samples.length} new sample${samples.length !== 1 ? "s" : ""} and merge them with your existing profile to improve accuracy.`
                : `We'll analyze your ${samples.length} writing sample${samples.length !== 1 ? "s" : ""} (${totalWords.toLocaleString()} words) at the sentence and paragraph level, identify your distinctive patterns, and build a voice profile.`}
            </p>

            {!isStrong && (
              <button
                onClick={() => setStep(1)}
                className="text-sm text-amber-400 hover:text-amber-300 mb-6 inline-block"
              >
                &larr; Go back and add more samples for better results
              </button>
            )}

            {analyzeError && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700/40 rounded-lg text-red-400 text-sm max-w-md mx-auto">
                {analyzeError}
                <button onClick={() => { setStep(1); setAnalyzeError(""); }}
                  className="block mt-2 text-amber-400 hover:text-amber-300 underline">
                  &larr; Add more samples
                </button>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-stone-700 hover:border-stone-500 rounded-lg text-stone-300 transition-colors"
              >
                Add More Samples
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
              >
                {analyzing ? "Analyzing your voice..." : improveProfileId ? "Improve My DoppelWriter" : "Build My DoppelWriter"}
              </button>
            </div>

            {analyzing && (
              <p className="text-stone-500 text-sm mt-4 animate-pulse">
                This takes 30-60 seconds. We&apos;re reading your writing at a forensic level.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
