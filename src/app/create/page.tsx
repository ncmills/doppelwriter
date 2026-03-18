"use client";

import Link from "next/link";
import Nav from "@/components/Nav";

export default function CreatePage() {
  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">Create a DoppelWriter</h1>
        <p className="text-stone-400 text-center mb-12">Build a new voice profile from scratch.</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/create/personal"
            className="bg-stone-900/50 border border-amber-500/30 rounded-xl p-8 hover:border-amber-500/60 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center text-xl font-bold mb-4">
              You
            </div>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
              Personal DoppelWriter
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-3">
              Clone anyone&apos;s writing voice — yours, your mom&apos;s, your boss&apos;s. Upload their writing, record them speaking, or connect their email.
            </p>
            <ul className="text-xs text-stone-500 space-y-1">
              <li>Upload .docx, .txt, .md files</li>
              <li>Paste text or record speech</li>
              <li>Sync Gmail sent emails</li>
              <li>Connect Google Drive</li>
            </ul>
          </Link>

          <Link
            href="/create/curated"
            className="bg-stone-900/50 border border-stone-800/40 rounded-xl p-8 hover:border-amber-600/40 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center text-xl mb-4">
              &ldquo;&rdquo;
            </div>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
              Curated DoppelWriter
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-3">
              Build a voice profile for any writer — famous authors, your mom, your boss. We&apos;ll find their writing online or you can upload it.
            </p>
            <ul className="text-xs text-stone-500 space-y-1">
              <li>Auto-scrape published writing</li>
              <li>Upload custom examples</li>
              <li>Works for anyone with written content</li>
            </ul>
          </Link>
        </div>
      </main>
    </>
  );
}
