"use client";

import Link from "next/link";
import Nav from "@/components/Nav";

export default function DoppelWritePage() {
  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">DoppelWrite</h1>
        <p className="text-stone-400 text-center mb-12">Choose a voice, then edit or generate.</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/doppelwrite/personal"
            className="bg-stone-900/50 border border-amber-500/30 rounded-xl p-8 hover:border-amber-500/60 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center text-xl font-bold mb-4">
              You
            </div>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
              Personal DoppelWriter
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Write using your own voice profile. Sounds like you wrote it yourself.
            </p>
          </Link>

          <Link
            href="/doppelwrite/curated"
            className="bg-stone-900/50 border border-stone-800/40 rounded-xl p-8 hover:border-amber-600/40 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center text-xl mb-4">
              &ldquo;&rdquo;
            </div>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
              Curated DoppelWriter
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Write like Hemingway, Paul Graham, Ogilvy, or any of our curated voices.
            </p>
          </Link>
        </div>
      </main>
    </>
  );
}
