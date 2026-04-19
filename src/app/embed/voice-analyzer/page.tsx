export default function EmbedVoiceAnalyzer() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] p-6 flex flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold mb-3 font-[family-name:var(--font-display)]">Free Voice Analyzer</h2>
      <p className="text-sm text-[var(--color-ink-soft)] mb-6 max-w-md">
        Paste your writing and discover your unique voice fingerprint — sentence rhythm, vocabulary, tone, and more.
      </p>
      <a
        href="https://doppelwriter.com/analyze"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-sm font-medium transition-colors"
      >
        Analyze Your Voice Free &rarr;
      </a>
      <p className="text-xs text-[var(--color-ink-mute)] mt-4">
        Powered by <a href="https://doppelwriter.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:text-[var(--color-ink)]">DoppelWriter</a>
      </p>
    </div>
  );
}
