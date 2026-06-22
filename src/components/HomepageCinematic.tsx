"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HERO_VOICE_SAMPLES, VOICE_SAMPLE_BRIEF } from "@/lib/voice-samples";

type Props = {
  // "auto" plays a single 18s loop on mount. "scrub" maps progress to scroll.
  mode?: "auto" | "scrub";
};

const PORTRAIT_FADE_MS = 800;
const PORTRAIT_STAGGER_MS = 1500;
const NAME_DELAY_AFTER_PORTRAIT_MS = 400;
const NAME_FADE_MS = 320;
const PROSE_TYPING_MS = 12000;

function HomepageCinematic({ mode = "auto" }: Props) {
  // progress is 0..1 across the cinematic. In auto mode, ticks via rAF.
  // In scrub mode, set externally via scroll IO.
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total scene duration: last portrait starts at 3000ms, plus prose typing,
  // plus a 1500ms hold tail.
  const totalMs = 3000 + PROSE_TYPING_MS + 1500;

  useEffect(() => {
    if (mode !== "auto") return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setProgress(1);
      return;
    }
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const p = elapsed / totalMs;
      if (p >= 1) {
        // Loop: hold at 1 briefly, then reset.
        if (elapsed > totalMs + 1500) {
          startRef.current = now;
          setProgress(0);
        } else {
          setProgress(1);
        }
      } else {
        setProgress(p);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode, totalMs]);

  // Scrub mode: bind progress to the nearest .cinematic-scroll-track parent.
  // The track is a tall container (≥180vh) wrapping a sticky child where this
  // component renders; scroll progress through the track drives the timeline.
  useEffect(() => {
    if (mode !== "scrub") return;
    const el = containerRef.current;
    if (!el) return;
    const track = el.closest<HTMLElement>(".cinematic-scroll-track");
    if (!track) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setProgress(1);
      return;
    }

    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const range = track.offsetHeight - vh; // distance scrolled while sticky engages
      if (range <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / range));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="cinematic-stage relative w-full"
      aria-label="Three writers responding to the same brief"
    >
      <p className="cinematic-brief text-[11px] uppercase tracking-[0.3em] text-[var(--color-fg-muted)] mb-6 text-center">
        Same brief — three voices.{" "}
        <span className="font-[family-name:var(--font-display)] tracking-normal text-[var(--color-fg-muted)]">
          &ldquo;{VOICE_SAMPLE_BRIEF}&rdquo;
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HERO_VOICE_SAMPLES.map((s, i) => {
          const ms = progress * totalMs;
          const portraitStart = i * PORTRAIT_STAGGER_MS;
          const portraitOpacity = clamp01((ms - portraitStart) / PORTRAIT_FADE_MS);
          const nameStart = portraitStart + PORTRAIT_FADE_MS - NAME_DELAY_AFTER_PORTRAIT_MS;
          const nameOpacity = clamp01((ms - nameStart) / NAME_FADE_MS);
          const proseStart = portraitStart + PORTRAIT_FADE_MS;
          const proseProgress = clamp01((ms - proseStart) / PROSE_TYPING_MS);
          // Reveal text via clip-path (left-to-right wipe) for an aliased "type" feel.
          const clipRight = (1 - proseProgress) * 100;

          const photoUrl = `/writers/${s.photoSlug}.jpg`;

          return (
            <article
              key={s.slug}
              className="cinematic-card relative bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col"
              data-active={portraitOpacity > 0.5 ? "true" : undefined}
            >
              {/* Portrait — fades in from opacity 0 over 800ms */}
              <div
                className="cinematic-portrait relative bg-[var(--color-surface-raised)] aspect-[4/5] overflow-hidden border-b border-[var(--color-border)]"
                style={{ opacity: portraitOpacity }}
              >
                <Image
                  src={photoUrl}
                  alt={`Portrait of ${s.writer}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover duotone"
                  priority={i === 0}
                />
                <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.25em] text-[var(--color-surface)] bg-[var(--color-fg)]/80 px-2 py-1 z-10">
                  {s.cadenceLabel}
                </span>
              </div>

              {/* Name — fades in 400ms before portrait finishes */}
              <div
                className="cinematic-name px-5 pt-5"
                style={{ opacity: nameOpacity }}
              >
                <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight">
                  {s.writer}
                </h3>
                <div className="w-10 h-[1px] bg-[var(--color-brand)] mt-2 mb-4" />
              </div>

              {/* Prose — left-to-right reveal via clip-path */}
              <div
                className="cinematic-prose px-5 pb-5 font-[family-name:var(--font-display)] text-[15px] leading-[1.55] text-[var(--color-fg)] flex-1"
                style={{
                  clipPath: `inset(0 ${clipRight}% 0 0)`,
                }}
              >
                {s.sample}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export default HomepageCinematic;
