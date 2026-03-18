import Link from "next/link";
import { CURATED_WRITERS } from "@/lib/writer-builder";

const features = [
  {
    title: "Write Like You",
    desc: "Upload your writing — emails, essays, memos. We analyze your voice and build a personal style profile so the AI writes exactly like you do.",
    icon: "1",
  },
  {
    title: "Write Like Anyone",
    desc: "Choose from our curated library of famous writers, or request any author. Draft emails like Paul Graham, marketing copy like Ogilvy, or essays like Orwell.",
    icon: "2",
  },
  {
    title: "Edit & Generate",
    desc: "Paste a rough draft and get it refined in your chosen voice. Or start from a brief and generate a complete first draft with streaming output and tracked changes.",
    icon: "3",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-800/40 sticky top-0 bg-slate-950/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <span className="font-bold text-lg">DoppelWriter</span>
          <div className="flex gap-4 items-center">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Your Voice.{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Amplified.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered writing that sounds like you — or your favorite authors. Build a personal style
          engine, draft in any voice, and edit with precision.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-lg transition-colors"
          >
            Start Writing Free
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-3 border border-gray-700 hover:border-gray-500 rounded-lg text-lg transition-colors text-gray-300"
          >
            See Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-6"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-sm font-bold mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Writer Showcase */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Write Like the Greats</h2>
        <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
          Pre-built style profiles for iconic writers. Or request anyone — we&apos;ll build a custom
          profile from their published work.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CURATED_WRITERS.map((w) => (
            <div
              key={w.name}
              className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-4 hover:border-indigo-500/40 transition-colors"
            >
              <p className="font-medium text-sm">{w.name}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{w.bio}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">
          + request any writer you want
        </p>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-1">Free</h3>
            <p className="text-3xl font-bold mb-4">
              $0<span className="text-sm font-normal text-gray-500">/mo</span>
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>5 edits/generations per month</li>
              <li>1 personal voice profile</li>
              <li>3 curated writer profiles</li>
              <li>Upload docs, paste text, connect email</li>
            </ul>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-500/40 rounded-lg p-6">
            <h3 className="font-semibold text-lg text-indigo-400 mb-1">Pro</h3>
            <p className="text-3xl font-bold mb-4">
              $19<span className="text-sm font-normal text-gray-500">/mo</span>
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
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
        <h2 className="text-3xl font-bold mb-4">Ready to find your voice?</h2>
        <p className="text-gray-400 mb-8">Start free. No credit card required.</p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-lg transition-colors"
        >
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/40 py-8 text-center text-xs text-gray-600">
        DoppelWriter
      </footer>
    </div>
  );
}
