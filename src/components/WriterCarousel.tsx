"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WRITER_PHOTOS } from "@/lib/writer-photos";

const FEATURED_WRITERS = [
  { name: "Ernest Hemingway", bio: "Sparse, powerful prose. The iceberg theory — say less, mean more.", category: "Authors" },
  { name: "Paul Graham", bio: "Clear, direct essays on startups and thinking.", category: "Business" },
  { name: "Tina Fey", bio: "Sharp, self-aware comedy writing. Bossypants voice.", category: "Comedy" },
  { name: "Barack Obama", bio: "Soaring oratory, measured cadence, bridge-building rhetoric.", category: "Leaders" },
  { name: "Joan Didion", bio: "Precise, atmospheric observation of American life. Sentences that cut.", category: "Authors" },
  { name: "Carl Sagan", bio: "Cosmic wonder in accessible prose. Billions and billions.", category: "Science" },
  { name: "Toni Morrison", bio: "Lyrical, mythic prose that excavates the American experience.", category: "Authors" },
  { name: "Seth Godin", bio: "Punchy daily blog posts on marketing, leadership, and change.", category: "Business" },
  { name: "Hunter S. Thompson", bio: "Gonzo journalism. Visceral, unhinged, brilliantly chaotic.", category: "Authors" },
  { name: "Joe Rogan", bio: "Casual, curious, long-form conversational style.", category: "Podcasters" },
  { name: "Dr. Seuss", bio: "Rhyming, whimsical, nonsense words that make perfect sense.", category: "Children's" },
  { name: "Warren Buffett", bio: "Folksy, clear shareholder letters. Complex ideas in simple language.", category: "Business" },
];

const PAGE_SIZE = 4;
const ROTATE_INTERVAL = 4000;

export default function WriterCarousel() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(FEATURED_WRITERS.length / PAGE_SIZE);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [totalPages]);

  const visible = FEATURED_WRITERS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-h-[140px]">
        {visible.map((w) => (
          <Link
            key={w.name}
            href={`/write-like/${w.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-all block"
          >
            <div className="flex items-center gap-2.5 mb-2">
              {WRITER_PHOTOS[w.name] ? (
                <img src={WRITER_PHOTOS[w.name]} alt={`Portrait of ${w.name}`} className="w-11 h-11 rounded-full object-cover bg-stone-800" loading="lazy" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 text-sm font-medium">
                  {w.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{w.name}</p>
                <p className="text-[10px] text-amber-500/70">{w.category}</p>
              </div>
            </div>
            <p className="text-xs text-stone-500 line-clamp-2">{w.bio}</p>
          </Link>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-5">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === page ? "bg-amber-500" : "bg-stone-700 hover:bg-stone-600"}`}
          />
        ))}
      </div>
    </div>
  );
}
