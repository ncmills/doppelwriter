"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { WRITER_PHOTOS } from "@/lib/writer-photos";
import HairlineFrame from "./HairlineFrame";

type FeaturedWriter = {
  name: string;
  category: string;
  pullQuote: string;
};

// Invented pull-quotes in each writer's apparent voice. All fictional.
const FEATURED_WRITERS: FeaturedWriter[] = [
  { name: "Ernest Hemingway", category: "Authors", pullQuote: "A paragraph should hit like a good cocktail — three ingredients, no umbrella." },
  { name: "Paul Graham", category: "Business", pullQuote: "If you have to explain the metaphor, pick a worse metaphor." },
  { name: "Tina Fey", category: "Comedy", pullQuote: "Write the joke you'd laugh at alone in the car. The rest is marketing." },
  { name: "Barack Obama", category: "Leaders", pullQuote: "Say what's true. Then say why it matters. Then stop." },
  { name: "Joan Didion", category: "Authors", pullQuote: "A good sentence is a small weather system — it knows exactly what it's doing." },
  { name: "Carl Sagan", category: "Science", pullQuote: "Write so the kid in the back row can't help looking up." },
  { name: "Toni Morrison", category: "Authors", pullQuote: "If a sentence doesn't haunt you, it won't haunt anyone else." },
  { name: "Seth Godin", category: "Business", pullQuote: "If you can say it in a tweet, don't write the essay." },
  { name: "Hunter S. Thompson", category: "Authors", pullQuote: "Polite prose is how bad centuries survive themselves." },
  { name: "Joe Rogan", category: "Podcasters", pullQuote: "Just say what you mean. Adjectives are for people who don't mean it yet." },
  { name: "Dr. Seuss", category: "Children's", pullQuote: "A good word is a small bright thing — bring two, just in case." },
  { name: "Warren Buffett", category: "Business", pullQuote: "If a sentence needs a footnote, it needs a rewrite." },
];

const PAGE_SIZE = 4;
const FOCUS_INTERVAL = 6000;

export default function WriterCarouselGallery() {
  // start = leftmost visible writer index in FEATURED_WRITERS (mod len)
  // focusInWindow = which of the 4 visible cards is currently focused (0..3)
  const [start, setStart] = useState(0);
  const [focusInWindow, setFocusInWindow] = useState(0);
  const [hoverFocus, setHoverFocus] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt3D, setTilt3D] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect reduced-motion + load tweak preference from localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const stored = localStorage.getItem("dw_carousel_3d");
      if (stored === "0") setTilt3D(false);
    } catch {
      // ignore
    }
  }, []);

  // Auto-cycle: every 6s advance focus. When focus reaches end of window,
  // roll the window forward by PAGE_SIZE and reset focus to 0.
  useEffect(() => {
    if (reducedMotion) return;
    if (hoverFocus !== null) return;
    const id = setInterval(() => {
      setFocusInWindow((f) => {
        if (f + 1 >= PAGE_SIZE) {
          setStart((s) => (s + PAGE_SIZE) % FEATURED_WRITERS.length);
          return 0;
        }
        return f + 1;
      });
    }, FOCUS_INTERVAL);
    return () => clearInterval(id);
  }, [hoverFocus, reducedMotion]);

  const visible = Array.from({ length: PAGE_SIZE }, (_, i) =>
    FEATURED_WRITERS[(start + i) % FEATURED_WRITERS.length],
  );
  const totalPages = Math.ceil(FEATURED_WRITERS.length / PAGE_SIZE);
  const currentPage = Math.floor(start / PAGE_SIZE);

  const effectiveFocus = hoverFocus ?? focusInWindow;

  // Resting tilt for un-focused cards: angle scales with distance from focus,
  // sign flips so cards on left tilt right (toward focus) and vice versa.
  const tiltFor = useCallback(
    (i: number, focus: number): number => {
      if (!tilt3D || reducedMotion) return 0;
      const delta = i - focus;
      // clamp magnitude
      return Math.max(-9, Math.min(9, delta * 4));
    },
    [tilt3D, reducedMotion],
  );

  return (
    <div>
      <div
        ref={containerRef}
        className="writer-gallery"
        style={{ perspective: tilt3D && !reducedMotion ? "1600px" : "none" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 min-h-[360px]">
          {visible.map((w, i) => {
            const slug = w.name.toLowerCase().replace(/['']/g, "").replace(/\s+/g, "-");
            const photo = WRITER_PHOTOS[w.name];
            const isFocused = effectiveFocus === i;
            const tilt = tiltFor(i, effectiveFocus);
            const scale = isFocused ? 1.04 : 0.96;
            const z = isFocused ? 24 : 0;
            const opacity = isFocused ? 1 : 0.86;
            return (
              <Link
                key={`${start}-${i}-${w.name}`}
                href={`/write-like/${slug}`}
                onMouseEnter={() => setHoverFocus(i)}
                onMouseLeave={() => setHoverFocus(null)}
                onFocus={() => setHoverFocus(i)}
                onBlur={() => setHoverFocus(null)}
                aria-current={isFocused ? "true" : undefined}
                className={`writer-gallery-card group flex flex-col bg-[var(--color-surface)] border ${isFocused ? "border-[var(--color-fg)]" : "border-[var(--color-border)]"}`}
                style={{
                  transform: `rotateY(${tilt}deg) translateZ(${z}px) scale(${scale})`,
                  opacity,
                  transformOrigin: "center center",
                }}
              >
                {/* Portrait */}
                <div className="relative bg-[var(--color-surface-raised)] aspect-[4/5] overflow-hidden border-b border-[var(--color-border)]">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={`Portrait of ${w.name}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover duotone"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-[var(--color-fg-muted)]"
                      aria-label={`No portrait available for ${w.name}`}
                    >
                      <svg viewBox="0 0 32 32" width="80" height="80" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="16" cy="16" r="11" />
                        <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
                        <circle cx="20" cy="17" r="0.9" fill="currentColor" stroke="none" />
                        <path d="M13 21 Q16 23 19 21" />
                        <path d="M14 11 Q14 9 16 9 Q18 9 18 11 Q18 12 16.5 12.5 Q16 13 16 14" />
                        <circle cx="16" cy="15.4" r="0.6" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.25em] text-[var(--color-surface)] bg-[var(--color-fg)]/80 px-2 py-1 z-10">
                    {w.category}
                  </span>
                  <HairlineFrame />
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight mb-1 text-[var(--color-fg)]">
                    <span className="ed-display-link">{w.name}</span>
                  </h3>
                  <div className="w-10 h-[1px] bg-[var(--color-brand)] mb-4" />
                  <p className="font-[family-name:var(--font-display)] text-[15px] leading-snug text-[var(--color-fg-muted)] mb-6 flex-1">
                    &ldquo;{w.pullQuote}&rdquo;
                  </p>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-fg)] border border-[var(--color-border)] group-hover:border-[var(--color-fg)] group-hover:bg-[var(--color-fg)] group-hover:text-[var(--color-surface)] px-3 py-2 text-center transition-colors">
                    Write like {w.name.split(" ").slice(-1)[0]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page indicators — clickable like the original */}
      <div className="flex justify-center gap-2 mt-8" role="tablist">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setStart(i * PAGE_SIZE);
              setFocusInWindow(0);
            }}
            aria-label={`Show writers ${i * PAGE_SIZE + 1}–${Math.min((i + 1) * PAGE_SIZE, FEATURED_WRITERS.length)}`}
            aria-selected={i === currentPage}
            role="tab"
            className={`h-[2px] transition-all ${
              i === currentPage ? "w-10 bg-[var(--color-fg)]" : "w-6 bg-[var(--color-border)] hover:bg-[var(--color-fg-muted)]"
            }`}
          />
        ))}
      </div>

      {/* Dev-only Tweak: ?tweaks=1 toggles the 3D tilt for A/B */}
      <TweakToggle tilt3D={tilt3D} setTilt3D={setTilt3D} />
    </div>
  );
}

function TweakToggle({
  tilt3D,
  setTilt3D,
}: {
  tilt3D: boolean;
  setTilt3D: (v: boolean) => void;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setShow(params.get("tweaks") === "1");
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[var(--color-fg)] text-[var(--color-surface)] text-xs px-3 py-2 flex items-center gap-3 font-mono">
      <span>Tweak · 3D tilt</span>
      <button
        onClick={() => {
          const next = !tilt3D;
          setTilt3D(next);
          try {
            localStorage.setItem("dw_carousel_3d", next ? "1" : "0");
          } catch {
            // ignore
          }
        }}
        className="border border-[var(--color-surface)] px-2 py-0.5"
      >
        {tilt3D ? "ON · click for FLAT" : "OFF · click for 3D"}
      </button>
    </div>
  );
}
