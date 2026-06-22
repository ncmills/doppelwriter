export default function EmbedVoiceAnalyzer() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-fg)] p-6 flex flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold mb-3 font-[family-name:var(--font-display)]">Free Voice Analyzer</h2>
      <p className="text-sm text-[var(--color-fg-muted)] mb-6 max-w-md">
        Paste your writing and discover your unique voice fingerprint — sentence rhythm, vocabulary, tone, and more.
      </p>
      <a
        href="https://doppelwriter.com/analyze"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-2.5 bg-[var(--color-fg)] text-[var(--color-surface)] hover:bg-[var(--color-brand)] rounded-[2px] text-sm font-medium transition-colors"
      >
        Analyze Your Voice Free &rarr;
      </a>
      <p className="text-xs text-[var(--color-fg-muted)] mt-6">
        <a
          href="https://doppelwriter.com/?utm_source=embed&utm_medium=widget"
          target="_blank"
          rel="noopener"
          className="text-[var(--color-fg-muted)] hover:text-[var(--color-brand)] transition-colors"
        >
          Powered by DoppelWriter &rarr;
        </a>
      </p>
    </div>
  );
}
