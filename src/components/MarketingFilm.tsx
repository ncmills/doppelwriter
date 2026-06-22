"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { VOICE_SAMPLES } from "@/lib/voice-samples";

// 30-second 5-segment marketing film.
// Segments (ms):
//   0-4000   · cold open — ditto-mark stamps onto blank paper
//   4000-10000 · setup — "Write in anyone's voice." mono types in,
//               then italic "Starting with yours."
//   10000-18000 · reveal — 5 writer portraits drift in, snippet under each
//   18000-25000 · anchor — portraits collapse, a stitched paragraph types in
//   25000-30000 · close — ditto-mark + doppelwriter.com + huashu watermark

const SEG = {
  cold: { start: 0, end: 4000 },
  setup: { start: 4000, end: 10000 },
  reveal: { start: 10000, end: 18000 },
  anchor: { start: 18000, end: 25000 },
  close: { start: 25000, end: 30000 },
};
const TOTAL = 30000;

// Composite of phrases drawn from the 5 voices — visual stand-in for the
// product's voice-merge feature.
const STITCHED =
  "The best ideas come when you walk by the river — when you've stopped performing the act of thinking — and you allow the mind to anneal at random, until the answer reveals itself, patient as roots, needing only the cease of effort to surface.";

const DRIFT_POSITIONS: { x: string; y: string; from: string }[] = [
  { x: "8%", y: "22%", from: "translate(-60%, -10%)" }, // Didion — top-left
  { x: "72%", y: "18%", from: "translate(60%, -10%)" }, // Hemingway — top-right
  { x: "18%", y: "58%", from: "translate(-60%, 10%)" }, // PG — bottom-left
  { x: "62%", y: "60%", from: "translate(60%, 10%)" }, // Obama — bottom-right
  { x: "42%", y: "8%", from: "translate(0, -60%)" }, // Morrison — top-center
];

type Props = {
  mode?: "auto" | "loop";
};

export default function MarketingFilm({ mode = "auto" }: Props) {
  const [ms, setMs] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setMs(TOTAL);
      return;
    }
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      if (elapsed >= TOTAL) {
        if (mode === "loop" && elapsed > TOTAL + 1000) {
          startRef.current = now;
          setMs(0);
        } else {
          setMs(TOTAL);
          if (mode === "auto") return; // stop
        }
      } else {
        setMs(elapsed);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode]);

  return (
    <div
      className="film-stage relative w-full bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden"
      style={{ aspectRatio: "16/9" }}
      aria-label="DoppelWriter — voice in motion (30 second marketing film)"
    >
      <ColdOpenSegment ms={ms} />
      <SetupSegment ms={ms} />
      <RevealSegment ms={ms} />
      <AnchorSegment ms={ms} />
      <CloseSegment ms={ms} />

      {/* Persistent watermark per huashu-design skill rules */}
      <div className="film-watermark absolute bottom-3 right-4 text-[10px] tracking-[0.2em] uppercase text-[var(--color-fg-muted)] font-mono pointer-events-none z-[100]">
        Created by Huashu-Design
      </div>

      {/* Time scrubber for review */}
      <div className="film-scrubber absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-border)]/30 pointer-events-none">
        <div
          className="h-full bg-[var(--color-brand)]"
          style={{ width: `${(ms / TOTAL) * 100}%` }}
        />
      </div>
    </div>
  );
}

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Segment helpers ---------------------------------------------------

function DittoMark({
  scale = 1,
  opacity = 1,
  size = 96,
}: {
  scale?: number;
  opacity?: number;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `scale(${scale})`, opacity, transition: "none" }}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Paired ditto-mark — two slanted hairline tick pairs */}
      <path d="M6 7 L8 5 M8 5 L7 9 M7 9 L9 7" stroke="currentColor" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M14 7 L16 5 M16 5 L15 9 M15 9 L17 7" stroke="currentColor" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ColdOpenSegment({ ms }: { ms: number }) {
  const active = ms >= SEG.cold.start && ms < SEG.cold.end + 200;
  if (!active) return null;
  const t = clamp01((ms - SEG.cold.start) / (SEG.cold.end - SEG.cold.start));
  // Dot grows to ~0.5 at t=0.4, ditto stamps in at t=0.55–0.7
  const dotOpacity = clamp01((t - 0.1) / 0.3);
  const stampStart = 0.55;
  const stampScale = t < stampStart ? 0.5 : 0.5 + easeOut((t - stampStart) / 0.15) * 0.55;
  const stampOpacity = t < stampStart ? 0 : clamp01((t - stampStart) / 0.1);
  const fadeOut = clamp01(1 - (t - 0.85) / 0.15);

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: fadeOut, color: "var(--color-fg)" }}>
      <div className="relative">
        {/* Single ink dot */}
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-brand)]"
          style={{ opacity: dotOpacity }}
        />
        <DittoMark scale={stampScale} opacity={stampOpacity} size={120} />
      </div>
    </div>
  );
}

function SetupSegment({ ms }: { ms: number }) {
  const active = ms >= SEG.setup.start && ms < SEG.setup.end + 200;
  if (!active) return null;
  const t = clamp01((ms - SEG.setup.start) / (SEG.setup.end - SEG.setup.start));

  // Mono headline types over t=0..0.18 (about 1.1s)
  const mono = "Write in anyone's voice.";
  const monoCharsT = clamp01(t / 0.18);
  const monoChars = Math.floor(monoCharsT * mono.length);
  const monoTyped = mono.slice(0, monoChars);
  const monoCursor = monoCharsT < 1;

  // Pause from t=0.18..0.40
  // Italic completion fades in from t=0.40..0.55
  const italicOpacity = clamp01((t - 0.4) / 0.15);
  const italicY = (1 - italicOpacity) * 8;

  // Hold both from t=0.55..0.9, then fade out 0.9..1
  const fadeOut = clamp01(1 - (t - 0.9) / 0.1);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-12"
      style={{ opacity: fadeOut }}
    >
      <p className="font-mono text-[var(--color-fg)] text-2xl sm:text-3xl tracking-tight mb-6">
        {monoTyped}
        {monoCursor && <span className="type-cursor" />}
      </p>
      <p
        className="font-[family-name:var(--font-display)] text-[var(--color-fg-muted)] text-3xl sm:text-4xl"
        style={{ opacity: italicOpacity, transform: `translateY(${italicY}px)` }}
      >
        Starting with yours.
      </p>
    </div>
  );
}

function RevealSegment({ ms }: { ms: number }) {
  const active = ms >= SEG.reveal.start - 200 && ms < SEG.reveal.end + 200;
  if (!active) return null;
  const t = clamp01((ms - SEG.reveal.start) / (SEG.reveal.end - SEG.reveal.start));

  return (
    <div className="absolute inset-0">
      {VOICE_SAMPLES.map((s, i) => {
        // Each portrait drifts in over a 1.2s window with 1.0s stagger
        const startT = i * 0.12;
        const localT = clamp01((t - startT) / 0.18);
        const settled = easeOut(localT);
        const opacity = clamp01(localT * 1.5);
        const pos = DRIFT_POSITIONS[i];
        const fadeOut = clamp01(1 - (t - 0.85) / 0.15);
        return (
          <div
            key={s.slug}
            className="film-portrait absolute"
            style={{
              left: pos.x,
              top: pos.y,
              transform: `translate(0,0) ${pos.from.replace("translate(", "translate(").replace(/-?\d+%/g, (m) => {
                const v = parseFloat(m);
                return `${v * (1 - settled)}%`;
              })}`,
              opacity: opacity * fadeOut,
              width: "20%",
            }}
          >
            <div className="relative aspect-[4/5] bg-[var(--color-surface-raised)] border border-[var(--color-border)] overflow-hidden">
              <Image
                src={`/writers/${s.photoSlug}.jpg`}
                alt={s.writer}
                fill
                sizes="20vw"
                className="object-cover duotone"
              />
            </div>
            <p className="font-[family-name:var(--font-display)] text-[10px] mt-1 text-[var(--color-fg)] truncate">
              {s.writer}
            </p>
            <p className="text-[9px] text-[var(--color-fg-muted)] line-clamp-2 leading-snug">
              {s.sample.slice(0, 60)}…
            </p>
          </div>
        );
      })}
    </div>
  );
}

function AnchorSegment({ ms }: { ms: number }) {
  const active = ms >= SEG.anchor.start - 200 && ms < SEG.anchor.end + 200;
  if (!active) return null;
  const t = clamp01((ms - SEG.anchor.start) / (SEG.anchor.end - SEG.anchor.start));

  // Portraits collapse over t=0..0.25 (drift toward center, fade out)
  const collapseT = clamp01(t / 0.25);

  // Stitched paragraph types in over t=0.25..0.85 via clip-path wipe
  const proseT = clamp01((t - 0.25) / 0.6);
  const clipRight = (1 - proseT) * 100;

  // Hold and fade 0.85..1
  const fadeOut = clamp01(1 - (t - 0.92) / 0.08);

  return (
    <div className="absolute inset-0" style={{ opacity: fadeOut }}>
      {/* Collapsing portraits — shrink toward center */}
      {collapseT < 1 &&
        VOICE_SAMPLES.map((s, i) => {
          const pos = DRIFT_POSITIONS[i];
          const portraitOpacity = clamp01(1 - collapseT);
          const portraitScale = 1 - 0.7 * collapseT;
          return (
            <div
              key={s.slug}
              className="absolute"
              style={{
                left: `calc(${pos.x} + ${collapseT * 8}%)`,
                top: `calc(${pos.y} + ${collapseT * 12}%)`,
                width: `calc(20% * ${portraitScale})`,
                opacity: portraitOpacity,
              }}
            >
              <div className="relative aspect-[4/5] bg-[var(--color-surface-raised)] border border-[var(--color-border)] overflow-hidden">
                <Image
                  src={`/writers/${s.photoSlug}.jpg`}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover duotone"
                />
              </div>
            </div>
          );
        })}

      {/* Stitched paragraph */}
      <div
        className="absolute inset-x-12 top-1/2 -translate-y-1/2 text-center"
        style={{ opacity: collapseT }}
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-brand)] mb-3">
          Voice merge
        </p>
        <p
          className="font-[family-name:var(--font-display)] text-xl sm:text-2xl text-[var(--color-fg)] leading-snug max-w-3xl mx-auto"
          style={{ clipPath: `inset(0 ${clipRight}% 0 0)` }}
        >
          {STITCHED}
        </p>
      </div>
    </div>
  );
}

function CloseSegment({ ms }: { ms: number }) {
  const active = ms >= SEG.close.start - 200 && ms <= TOTAL;
  if (!active) return null;
  const t = clamp01((ms - SEG.close.start) / (SEG.close.end - SEG.close.start));

  // Ditto stamps in 0..0.3
  const stampT = clamp01(t / 0.3);
  const stampScale = 0.5 + easeOut(stampT) * 0.55;

  // URL types in 0.3..0.7
  const url = "doppelwriter.com";
  const urlT = clamp01((t - 0.3) / 0.4);
  const urlChars = Math.floor(urlT * url.length);
  const urlTyped = url.slice(0, urlChars);

  // Tagline fades in 0.6..0.85
  const taglineOpacity = clamp01((t - 0.6) / 0.25);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ color: "var(--color-fg)" }}>
      <DittoMark scale={stampScale} opacity={clamp01(stampT * 1.5)} size={88} />
      <p className="font-[family-name:var(--font-display)] text-2xl mt-4 tracking-[-0.01em]">
        DoppelWriter
      </p>
      <p className="font-mono text-[var(--color-brand)] text-base mt-2 tracking-wide">
        {urlTyped}
        {urlT < 1 && <span className="type-cursor" />}
      </p>
      <p
        className="font-[family-name:var(--font-display)] text-[var(--color-fg-muted)] text-base mt-3"
        style={{ opacity: taglineOpacity }}
      >
        Voice-matched writing for people who still read.
      </p>
    </div>
  );
}
