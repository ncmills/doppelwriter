"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

interface Sample {
  title: string;
  wordCount: number;
  sourceType: string;
}

export default function CreatePersonalPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<unknown>(null);

  const addSample = async (title: string, content: string, sourceType: string) => {
    const res = await fetch("/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, sourceType }),
    });
    if (res.ok) {
      setSamples((prev) => [...prev, { title, wordCount: content.split(/\s+/).length, sourceType }]);
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
        setSamples((prev) => [...prev, { title: file.name, wordCount: 0, sourceType: "upload" }]);
      }
    }
    setUploading(false);
  };

  const handlePaste = async () => {
    if (!pasteContent) return;
    await addSample(pasteTitle || "Pasted text", pasteContent, "paste");
    setPasteTitle("");
    setPasteContent("");
  };

  // Speech-to-text using Web Speech API
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
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analyze" }),
    });
    if (res.ok) {
      router.push("/doppelwrite/personal");
    } else {
      alert("Analysis failed. Try adding more samples.");
      setAnalyzing(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">Create Personal DoppelWriter</h1>
        <p className="text-stone-400 text-sm mb-8">Feed it your writing. The more you give it, the better it sounds.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? "bg-amber-600 text-white" : "bg-stone-800 text-stone-500"
              }`}>{s}</div>
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
                      <span>{s.title}</span>
                      <span className="text-xs text-stone-500">{s.sourceType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={samples.length < 1}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-40"
            >
              Continue — Build Profile ({samples.length} sample{samples.length !== 1 ? "s" : ""})
            </button>
            <p className="text-xs text-stone-600 text-center">
              For best results, add at least 3-5 diverse writing samples (emails, essays, memos).
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-12">
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-3">Ready to build your DoppelWriter</h2>
            <p className="text-stone-400 mb-8 max-w-md mx-auto">
              We&apos;ll analyze your {samples.length} writing sample{samples.length !== 1 ? "s" : ""} at the sentence and paragraph level,
              identify your distinctive patterns, and build a voice profile.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
            >
              {analyzing ? "Analyzing your voice..." : "Build My DoppelWriter"}
            </button>
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
