"use client";

interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function DiffView({ chunks }: { chunks: DiffChunk[] }) {
  if (chunks.length === 0) return null;

  return (
    <div className="whitespace-pre-wrap leading-relaxed text-[var(--color-fg)]">
      {chunks.map((chunk, i) => {
        if (chunk.added) {
          return (
            <span key={i} className="bg-[var(--color-surface-raised)] text-[var(--color-fg)] underline decoration-[var(--color-brand)]">
              {chunk.value}
            </span>
          );
        }
        if (chunk.removed) {
          return (
            <span key={i} className="text-[var(--color-fg-muted)] line-through">
              {chunk.value}
            </span>
          );
        }
        return <span key={i}>{chunk.value}</span>;
      })}
    </div>
  );
}
