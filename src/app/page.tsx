import Link from "next/link";
import { CURATED_WRITERS } from "@/lib/writer-builder";

const features = [
  {
    title: "Upload Your Words",
    desc: "Paste emails, essays, memos — anything you've written. DoppelWriter reads your voice the way a musician reads sheet music: rhythm, dynamics, the spaces between notes.",
  },
  {
    title: "Write Like Anyone",
    desc: "Pick from our library of iconic writers, or name anyone. We build a forensic style profile from their published work so you can draft in their voice.",
  },
  {
    title: "Edit & Generate",
    desc: "Paste a rough draft and get it refined in your chosen voice. Or start from a brief. Streaming output, word-level tracked changes, iterative revision.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <span className="font-[family-name:var(--font-literata)] font-bold text-lg">DoppelWriter</span>
          <div className="flex gap-4 items-center">
            <Link href="/pricing" className="text-sm text-stone-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-stone-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="font-[family-name:var(--font-literata)] text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Your writing has a{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
            fingerprint.
          </span>
        </h1>
        <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI that writes like you. Upload your words. Get back your voice.
          Or write like Hemingway, Paul Graham, or anyone else.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
          >
            Start Writing Free
          </Link>
          <Link
            href="#writers"
            className="px-8 py-3 border border-stone-700 hover:border-stone-500 rounded-lg text-lg transition-colors text-stone-300"
          >
            Browse Writers
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6"
            >
              <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center text-sm font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-[family-name:var(--font-literata)] text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Writer Showcase */}
      <section id="writers" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">Write Like the Greats</h2>
        <p className="text-stone-400 text-center mb-10 max-w-xl mx-auto">
          Pre-built voice profiles for iconic writers. Or name anyone — we&apos;ll build a custom
          profile from their published work.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CURATED_WRITERS.map((w) => (
            <div
              key={w.name}
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors"
            >
              <p className="font-medium text-sm">{w.name}</p>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{w.bio}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-stone-600 text-sm mt-4">
          + request any writer you want
        </p>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6">
            <h3 className="font-[family-name:var(--font-literata)] font-semibold text-lg mb-1">Free</h3>
            <p className="text-3xl font-bold mb-4">
              $0<span className="text-sm font-normal text-stone-500">/mo</span>
            </p>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>5 edits & generations per month</li>
              <li>1 personal voice profile</li>
              <li>3 curated writer profiles</li>
              <li>Upload docs, paste text</li>
            </ul>
          </div>
          <div className="bg-amber-600/10 border border-amber-500/40 rounded-lg p-6">
            <h3 className="font-[family-name:var(--font-literata)] font-semibold text-lg text-amber-400 mb-1">Pro</h3>
            <p className="text-3xl font-bold mb-4">
              $19<span className="text-sm font-normal text-stone-500">/mo</span>
            </p>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>200 edits & generations per month</li>
              <li>Unlimited personal profiles</li>
              <li>All curated writers + custom builds</li>
              <li>Never blocked — heavy use just slows down</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold mb-4">Ready to find your voice?</h2>
        <p className="text-stone-400 mb-8">Free plan. No credit card. No guilt.</p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
        >
          Start Writing
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800/40 py-8 text-center text-xs text-stone-600">
        DoppelWriter
      </footer>
    </div>
  );
}
