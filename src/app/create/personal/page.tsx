"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

interface Sample {
  title: string;
  wordCount: number;
  sourceType: string;
}

const WORD_TARGET = 5000; // Target word count for a strong profile
const WORD_MINIMUM = 500; // Absolute minimum to attempt building

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

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const totalWords = samples.reduce((sum, s) => sum + s.wordCount, 0);
  const progressPct = Math.min((totalWords / WORD_TARGET) * 100, 100);
  const hasEnough = totalWords >= WORD_MINIMUM;
  const isStrong = totalWords >= WORD_TARGET;

  const addSample = async (title: string, content: string, sourceType: string) => {
    const res = await fetch("/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, sourceType }),
    });
    if (res.ok) {
      const wc = content.split(/\s+/).filter(Boolean).length;
      setSamples((prev) => [...prev, { title, wordCount: wc, sourceType }]);
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
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analyze" }),
    });
    if (res.ok) {
      router.push("/doppelwrite/personal");
    } else {
      setAnalyzeError("Not enough content to build a reliable voice profile. Go back and add more samples — aim for the green zone.");
      setAnalyzing(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">Create Personal DoppelWriter</h1>
        <p className="text-stone-400 text-sm mb-6">Feed it your writing. The more you give it, the better it sounds.</p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-400">
              {totalWords.toLocaleString()} words uploaded
            </span>
            <span className={`text-xs font-medium ${isStrong ? "text-green-400" : hasEnough ? "text-amber-400" : "text-stone-500"}`}>
              {isStrong ? "Strong profile" : hasEnough ? "Minimum met — add more for better results" : `Need ${(WORD_MINIMUM - totalWords).toLocaleString()} more words`}
            </span>
          </div>
          <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isStrong ? "bg-green-500" : hasEnough ? "bg-amber-500" : "bg-stone-600"
              }`}
              style={{ width: `${Math.max(progressPct, 2)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-stone-600">0</span>
            <span className="text-[10px] text-stone-600">|</span>
            <span className="text-[10px] text-stone-600">{WORD_TARGET.toLocaleString()} words</span>
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
                ? `Continue — Build Profile (${samples.length} sample${samples.length !== 1 ? "s" : ""})`
                : `Add more writing (${(WORD_MINIMUM - totalWords).toLocaleString()} words to go)`}
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
              {isStrong ? "Ready to build your DoppelWriter" : "You can build now, but more samples = better results"}
            </h2>
            <p className="text-stone-400 mb-4 max-w-md mx-auto">
              We&apos;ll analyze your {samples.length} writing sample{samples.length !== 1 ? "s" : ""} ({totalWords.toLocaleString()} words)
              at the sentence and paragraph level, identify your distinctive patterns, and build a voice profile.
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
                {analyzing ? "Analyzing your voice..." : "Build My DoppelWriter"}
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
