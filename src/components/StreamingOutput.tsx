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
      <div className="whitespace-pre-wrap leading-relaxed text-[var(--color-fg)] min-h-[200px]">
        {text}
        {loading && (
          <span className="inline-block w-2 h-5 bg-[var(--color-fg)] animate-pulse ml-0.5" />
        )}
      </div>
      {!text && !loading && (
        <p className="text-[var(--color-fg-muted)]">Output will appear here...</p>
      )}
    </div>
  );
}
