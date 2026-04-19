"use client";

interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function DiffView({ chunks }: { chunks: DiffChunk[] }) {
  if (chunks.length === 0) return null;

  return (
    <div className="whitespace-pre-wrap leading-relaxed text-[var(--color-ink)]">
      {chunks.map((chunk, i) => {
        if (chunk.added) {
          return (
            <span key={i} className="bg-[var(--color-paper-deep)] text-[var(--color-ink)] underline decoration-[var(--color-accent)]">
              {chunk.value}
            </span>
          );
        }
        if (chunk.removed) {
          return (
            <span key={i} className="text-[var(--color-ink-mute)] line-through">
              {chunk.value}
            </span>
          );
        }
        return <span key={i}>{chunk.value}</span>;
      })}
    </div>
  );
}
