"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { WRITER_PHOTOS } from "@/lib/writer-photos";

type FeaturedWriter = {
  name: string;
  category: string;
  pullQuote: string;
};

// Invented pull-quotes in each writer's apparent voice. All fictional.
const FEATURED_WRITERS: FeaturedWriter[] = [
  {
    name: "Ernest Hemingway",
    category: "Authors",
    pullQuote:
      "A paragraph should hit like a good cocktail — three ingredients, no umbrella.",
  },
  {
    name: "Paul Graham",
    category: "Business",
    pullQuote:
      "If you have to explain the metaphor, pick a worse metaphor.",
  },
  {
    name: "Tina Fey",
    category: "Comedy",
    pullQuote:
      "Write the joke you'd laugh at alone in the car. The rest is marketing.",
  },
  {
    name: "Barack Obama",
    category: "Leaders",
    pullQuote:
      "Say what's true. Then say why it matters. Then stop.",
  },
  {
    name: "Joan Didion",
    category: "Authors",
    pullQuote:
      "A good sentence is a small weather system — it knows exactly what it's doing.",
  },
  {
    name: "Carl Sagan",
    category: "Science",
    pullQuote:
      "Write so the kid in the back row can't help looking up.",
  },
  {
    name: "Toni Morrison",
    category: "Authors",
    pullQuote:
      "If a sentence doesn't haunt you, it won't haunt anyone else.",
  },
  {
    name: "Seth Godin",
    category: "Business",
    pullQuote:
      "If you can say it in a tweet, don't write the essay.",
  },
  {
    name: "Hunter S. Thompson",
    category: "Authors",
    pullQuote:
      "Polite prose is how bad centuries survive themselves.",
  },
  {
    name: "Joe Rogan",
    category: "Podcasters",
    pullQuote:
      "Just say what you mean. Adjectives are for people who don't mean it yet.",
  },
  {
    name: "Dr. Seuss",
    category: "Children's",
    pullQuote:
      "A good word is a small bright thing — bring two, just in case.",
  },
  {
    name: "Warren Buffett",
    category: "Business",
    pullQuote:
      "If a sentence needs a footnote, it needs a rewrite.",
  },
];

const PAGE_SIZE = 4;
const ROTATE_INTERVAL = 6000;

export default function WriterCarousel() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(FEATURED_WRITERS.length / PAGE_SIZE);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [totalPages]);

  const visible = FEATURED_WRITERS.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 min-h-[360px]">
        {visible.map((w) => {
          const slug = w.name.toLowerCase().replace(/['']/g, "").replace(/\s+/g, "-");
          const photo = WRITER_PHOTOS[w.name];
          return (
            <Link
              key={w.name}
              href={`/write-like/${slug}`}
              className="group flex flex-col bg-[var(--color-paper)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] transition-colors"
            >
              {/* Portrait — duotone ink wash */}
              <div className="relative bg-[var(--color-paper-deep)] aspect-[4/5] overflow-hidden border-b border-[var(--color-rule)]">
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
                  <div className="w-full h-full flex items-center justify-center font-[family-name:var(--font-display)] text-5xl text-[var(--color-ink-mute)]">
                    {w.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
                {/* Category stamp — top-left corner */}
                <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.25em] text-[var(--color-paper)] bg-[var(--color-ink)]/80 px-2 py-1">
                  {w.category}
                </span>
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight mb-1 text-[var(--color-ink)]">
                  {w.name}
                </h3>
                <div className="w-10 h-[1px] bg-[var(--color-accent)] mb-4" />
                <p className="font-[family-name:var(--font-display)] italic text-[15px] leading-snug text-[var(--color-ink-soft)] mb-6 flex-1">
                  &ldquo;{w.pullQuote}&rdquo;
                </p>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink)] border border-[var(--color-rule)] group-hover:border-[var(--color-ink)] group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-paper)] px-3 py-2 text-center transition-colors">
                  Write like {w.name.split(" ").slice(-1)[0]}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-center gap-2 mt-8" role="tablist">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            aria-label={`Show writers ${i * PAGE_SIZE + 1}–${Math.min((i + 1) * PAGE_SIZE, FEATURED_WRITERS.length)}`}
            aria-selected={i === page}
            role="tab"
            className={`h-[2px] transition-all ${
              i === page ? "w-10 bg-[var(--color-ink)]" : "w-6 bg-[var(--color-rule)] hover:bg-[var(--color-ink-mute)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
