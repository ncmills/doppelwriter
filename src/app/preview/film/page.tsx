"use client";

import { useState } from "react";
import MarketingFilm from "@/components/MarketingFilm";

// Internal preview — noindex applied by /preview/layout.tsx.

export default function FilmPreviewPage() {
  const [key, setKey] = useState(0);

  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-fg)]">
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-fg-muted)] mb-3">
          Internal preview · item #10
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl tracking-[-0.02em] mb-2">
          Voice in motion — 30s film
        </h1>
        <p className="text-[var(--color-fg-muted)] italic font-[family-name:var(--font-display)]">
          5-segment Junior pass · real Claude captures · no audio yet
        </p>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="mt-4 text-xs uppercase tracking-[0.18em] px-4 py-2 border border-[var(--color-border)] hover:border-[var(--color-fg)] transition-colors"
        >
          Replay
        </button>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-6">
        <MarketingFilm key={key} mode="auto" />
      </section>

      <section className="max-w-6xl mx-auto px-6 py-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-fg-muted)] mb-3">
          Exported MP4 — with BGM + SFX
        </p>
        <video
          src="/film/voice-in-motion.mp4"
          poster="/film/voice-in-motion.gif"
          controls
          preload="metadata"
          className="w-full border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
        />
        <p className="text-[12px] text-[var(--color-fg-muted)] mt-2">
          Deliverables in <code>/public/film/</code>: <a href="/film/voice-in-motion.mp4" className="ed-link" download>1080p MP4 (2.9 MB)</a> · <a href="/film/voice-in-motion-720.mp4" className="ed-link" download>720p Twitter MP4 (1.2 MB)</a> · <a href="/film/voice-in-motion.gif" className="ed-link" download>GIF (6.8 MB)</a>.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-[var(--color-border)] text-sm text-[var(--color-fg-muted)] leading-relaxed">
        <p className="mb-3 font-medium text-[var(--color-fg)]">Segments</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>0–4s · Cold open.</strong> Blank paper. Ink dot appears, then the ditto-mark logo stamps over it.</li>
          <li><strong>4–10s · Setup.</strong> Mono types &ldquo;Write in anyone&apos;s voice.&rdquo; Pause. Italic display below: &ldquo;Starting with yours.&rdquo;</li>
          <li><strong>10–18s · Reveal.</strong> 5 portraits drift in (Didion, Hemingway, PG, Obama, Morrison) with snippets of their captured voice.</li>
          <li><strong>18–25s · Anchor.</strong> Portraits collapse toward center. A stitched composite paragraph types in (visual stand-in for the voice-merge feature).</li>
          <li><strong>25–30s · Close.</strong> Ditto-mark stamps. <code>doppelwriter.com</code> types in. Brand tagline fades in. Huashu-Design watermark persists.</li>
        </ol>

        <p className="mt-6 mb-3 font-medium text-[var(--color-fg)]">Open questions for review</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Pacing — does any segment feel too long / too short?</li>
          <li>Stitched paragraph in segment 4 is hand-composed (not from the merge API). OK as a visual stand-in?</li>
          <li>Brief said 6 voices including &ldquo;You&rdquo; (your photo). Currently 5 — want me to add a silhouette + question-glyph for the 6th?</li>
          <li>No audio yet (BGM + ink-thud + typewriter ticks per the brief). Add after you OK the visual?</li>
          <li>Export targets per brief: 60fps MP4 + GIF + 1200×675 Twitter MP4 with H.265. Defer to next session?</li>
        </ul>
      </section>
    </main>
  );
}
