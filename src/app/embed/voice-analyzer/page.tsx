import Link from "next/link";

export default function EmbedVoiceAnalyzer() {
  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAFAF9] p-6 font-sans flex flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold mb-3">Free Voice Analyzer</h2>
      <p className="text-sm text-stone-400 mb-6 max-w-md">
        Paste your writing and discover your unique voice fingerprint — sentence rhythm, vocabulary, tone, and more.
      </p>
      <a
        href="https://doppelwriter.com/analyze"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors"
      >
        Analyze Your Voice Free &rarr;
      </a>
      <p className="text-xs text-stone-600 mt-4">
        Powered by <a href="https://doppelwriter.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">DoppelWriter</a>
      </p>
    </div>
  );
}
