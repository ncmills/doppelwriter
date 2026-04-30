import type { Metadata } from "next";
import HomepageCinematic from "@/components/HomepageCinematic";

// Internal preview — noindex applied by /preview/layout.tsx.
export const metadata: Metadata = {
  title: "Preview · Homepage Cinematic",
};

export default function CinematicPreviewPage() {
  return (
    <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-ink-mute)] mb-3">
          Internal preview · item #1
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl tracking-[-0.02em] mb-2">
          Homepage scrubbed cinematic
        </h1>
        <p className="text-[var(--color-ink-soft)] italic font-[family-name:var(--font-display)]">
          3-portrait reveal sequence — Didion / Hemingway / Paul Graham, real
          /api/demo captures, auto-play loop.
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <HomepageCinematic mode="auto" />
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-[var(--color-rule)] text-sm text-[var(--color-ink-soft)] leading-relaxed">
        <p className="mb-3 font-medium text-[var(--color-ink)]">Notes for review</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Auto-play loop · ~16.5 s total · resets after a 1.5 s hold.</li>
          <li>
            Each card: portrait fades 800 ms; name fades 320 ms (overlapping
            tail of portrait); prose wipes left-to-right via clip-path over
            12 s. Stagger between cards = 1.5 s.
          </li>
          <li>
            Real Claude outputs captured 2026-04-30 using the same brief and
            model as <code>/api/demo</code>. Source samples in{" "}
            <code>src/lib/voice-samples.ts</code>.
          </li>
          <li>
            Prefers-reduced-motion: jumps to fully-revealed state (no animation).
          </li>
          <li>
            Next step (after your OK): swap <code>mode=&quot;auto&quot;</code>{" "}
            for <code>mode=&quot;scrub&quot;</code> and integrate into the
            homepage hero (<code>src/app/page.tsx</code>) so scroll progress
            drives the timeline.
          </li>
        </ul>
      </section>
    </main>
  );
}
