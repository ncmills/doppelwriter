"use client";

export default function StreamingOutput({
  text,
  loading,
}: {
  text: string;
  loading: boolean;
}) {
  return (
    <div className="relative">
      <div className="whitespace-pre-wrap leading-relaxed text-[var(--color-ink)] min-h-[200px]">
        {text}
        {loading && (
          <span className="inline-block w-2 h-5 bg-[var(--color-ink)] animate-pulse ml-0.5" />
        )}
      </div>
      {!text && !loading && (
        <p className="text-[var(--color-ink-mute)] italic font-[family-name:var(--font-display)]">Output will appear here...</p>
      )}
    </div>
  );
}
