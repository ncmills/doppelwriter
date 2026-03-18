"use client";

interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function DiffView({ chunks }: { chunks: DiffChunk[] }) {
  if (chunks.length === 0) return null;

  return (
    <div className="whitespace-pre-wrap leading-relaxed text-gray-200">
      {chunks.map((chunk, i) => {
        if (chunk.added) {
          return (
            <span key={i} className="bg-green-900/40 text-green-300">
              {chunk.value}
            </span>
          );
        }
        if (chunk.removed) {
          return (
            <span key={i} className="bg-red-900/40 text-red-400 line-through">
              {chunk.value}
            </span>
          );
        }
        return <span key={i}>{chunk.value}</span>;
      })}
    </div>
  );
}
