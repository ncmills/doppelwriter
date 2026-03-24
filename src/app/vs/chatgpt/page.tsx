import type { Metadata } from "next";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";

export const metadata: Metadata = {
  title: "DoppelWriter vs ChatGPT — Which AI Writing Tool Sounds Like You?",
  description:
    "An honest comparison of DoppelWriter and ChatGPT for writing. ChatGPT is a great general-purpose AI, but DoppelWriter is built specifically for voice matching, style cloning, and writing that sounds like a real person — not a robot.",
  keywords: [
    "doppelwriter vs chatgpt",
    "chatgpt alternative for writing",
    "AI writing tool that sounds like me",
    "chatgpt voice matching",
    "AI voice cloning writing",
    "write in my style AI",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com/vs/chatgpt",
    siteName: "DoppelWriter",
    title: "DoppelWriter vs ChatGPT — Which AI Writing Tool Sounds Like You?",
    description:
      "An honest comparison of DoppelWriter and ChatGPT for writing. One writes generically. The other writes like you.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DoppelWriter vs ChatGPT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoppelWriter vs ChatGPT — Which AI Writing Tool Sounds Like You?",
    description:
      "An honest comparison. ChatGPT is a Swiss Army knife. DoppelWriter is a voice-matching writing tool.",
  },
  alternates: { canonical: "https://doppelwriter.com/vs/chatgpt" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "DoppelWriter vs ChatGPT",
  description:
    "An honest comparison of DoppelWriter and ChatGPT for writing tasks, voice matching, and style cloning.",
  url: "https://doppelwriter.com/vs/chatgpt",
  publisher: {
    "@type": "Organization",
    name: "DoppelWriter",
    url: "https://doppelwriter.com",
  },
};

export default function VsChatGPTPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LandingNav />

      <main className="max-w-4xl mx-auto px-6">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center">
          <h1 className="font-[family-name:var(--font-literata)] text-4xl md:text-5xl font-bold mb-4">
            DoppelWriter vs ChatGPT
          </h1>
          <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto">
            Both are AI writing tools. One writes generically. The other writes like{" "}
            <span className="text-[#FAFAF9]">you</span>.
          </p>
        </section>

        {/* Comparison Table */}
        <section className="pb-16">
          <div className="overflow-x-auto rounded-xl border border-stone-800/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800/40 bg-stone-900/60">
                  <th className="text-left px-5 py-4 font-medium text-stone-400 w-1/3">Feature</th>
                  <th className="text-left px-5 py-4 font-medium text-amber-400 w-1/3">DoppelWriter</th>
                  <th className="text-left px-5 py-4 font-medium text-stone-400 w-1/3">ChatGPT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/30">
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Voice matching</td>
                  <td className="px-5 py-4 text-stone-300">
                    Deep style analysis — sentence rhythm, word choice, pacing, punctuation habits
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Basic &ldquo;write in this tone&rdquo; prompting
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Learns from feedback</td>
                  <td className="px-5 py-4 text-stone-300">
                    Yes — tracks your edits and corrections to improve over time
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    No — starts fresh each conversation
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Edit existing text</td>
                  <td className="px-5 py-4 text-stone-300">
                    Paste a draft, get it rewritten in any voice with tracked changes
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Copy-paste into chat, re-prompt manually
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Famous writer voices</td>
                  <td className="px-5 py-4 text-stone-300">
                    100+ curated profiles (Hemingway, Paul Graham, Obama, and more)
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    You write the prompt yourself
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Personal voice clone</td>
                  <td className="px-5 py-4 text-stone-300">
                    Upload samples &rarr; permanent voice profile you can reuse
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Paste samples each time you start a conversation
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Price</td>
                  <td className="px-5 py-4 text-stone-300">
                    Free (5/mo) or <span className="text-amber-400 font-medium">$19/mo</span> Pro
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    $20/mo Plus
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Best for</td>
                  <td className="px-5 py-4 text-stone-300">
                    Writers who want consistent voice across content
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    General-purpose AI assistant
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* When to use ChatGPT */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-4">
            When to use ChatGPT
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            ChatGPT is excellent at a lot of things. If you need a general-purpose AI assistant,
            it&apos;s hard to beat. Here&apos;s where it shines:
          </p>
          <ul className="space-y-3 text-stone-300">
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>General Q&amp;A</strong> — Ask it anything. Get a solid answer fast.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Coding help</strong> — Debug code, write scripts, explain APIs. This is one of its best use cases.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Brainstorming</strong> — Need 20 headline ideas in 10 seconds? ChatGPT is great for ideation.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Research and summarization</strong> — Condense long articles, explain complex topics, compare options.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>One-off tasks</strong> — Write a quick email, translate a paragraph, reformat some data. The Swiss Army knife of AI.</span>
            </li>
          </ul>
          <p className="text-stone-500 text-sm mt-6">
            We use ChatGPT too. It&apos;s a genuinely great tool. DoppelWriter isn&apos;t trying to replace it — they solve different problems.
          </p>
        </section>

        {/* When to use DoppelWriter */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-4">
            When to use DoppelWriter
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            DoppelWriter is purpose-built for one thing: making AI-generated writing sound like it
            was written by a real, specific person. Here&apos;s where it&apos;s the better tool:
          </p>
          <ul className="space-y-3 text-stone-300">
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Writing that needs to sound like you</strong> — Blog posts, newsletters, social content that should read like your voice, not AI slop.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Maintaining voice consistency</strong> — If you write for a brand, a publication, or just yourself, every piece should sound the same.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Editing drafts in someone&apos;s style</strong> — Paste a rough draft and get it back rewritten in your voice (or Hemingway&apos;s, or Paul Graham&apos;s).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Learning from great writers</strong> — See how famous writers would approach your topic. Study their sentence structure, rhythm, and choices.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Ghostwriting at scale</strong> — Agencies and teams that write for multiple clients can maintain distinct voices without prompt gymnastics.</span>
            </li>
          </ul>
        </section>

        {/* Can't I just prompt ChatGPT? */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-6">
            &ldquo;Can&apos;t I just prompt ChatGPT to match my voice?&rdquo;
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            Yes, you can — and it works okay for casual use. Here&apos;s a prompt template that
            does a decent job:
          </p>
          <div className="bg-stone-900/60 border border-stone-800/40 rounded-xl p-5 mb-6 text-sm text-stone-300 font-[family-name:var(--font-geist-sans)] leading-relaxed">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-3">Prompt template</p>
            <p>
              &ldquo;I&apos;m going to paste 3 samples of my writing. Analyze my style — sentence
              length, vocabulary level, tone, punctuation habits, paragraph structure, and any
              recurring patterns. Then write [YOUR TASK] matching my voice exactly.&rdquo;
            </p>
          </div>
          <p className="text-stone-400 leading-relaxed mb-4">
            That will get you 70% of the way there. But here&apos;s what it won&apos;t do:
          </p>
          <ul className="space-y-3 text-stone-300 mb-6">
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0">&times;</span>
              <span><strong>Remember across conversations.</strong> You have to re-paste your samples every single time. DoppelWriter saves your voice profile permanently.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0">&times;</span>
              <span><strong>Learn from corrections.</strong> When you edit ChatGPT&apos;s output, it doesn&apos;t remember that for next time. DoppelWriter tracks your edits and gets better.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0">&times;</span>
              <span><strong>Match deep style patterns.</strong> ChatGPT matches surface-level things like vocabulary and tone. DoppelWriter analyzes rhythm, sentence structure, pacing, paragraph cadence — the stuff that makes writing actually <em>feel</em> like a specific person.</span>
            </li>
          </ul>
          <p className="text-stone-500 text-sm leading-relaxed">
            If you write one blog post a month and don&apos;t mind re-prompting, ChatGPT works fine.
            If you write regularly and care about voice consistency, DoppelWriter saves you
            real time and produces better results.
          </p>
        </section>

        {/* Compare & Explore */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-6">
            Compare & Explore
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <Link href="/vs/jasper" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">DoppelWriter vs Jasper</p>
            </Link>
            <Link href="/vs/copyai" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">DoppelWriter vs Copy.ai</p>
            </Link>
            <Link href="/vs/grammarly" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">DoppelWriter vs Grammarly</p>
            </Link>
            <Link href="/vs/writesonic" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">DoppelWriter vs Writesonic</p>
            </Link>
          </div>
          <h3 className="font-medium text-stone-300 mb-4">Popular use cases</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/write/cover-letter" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Cover Letter</p>
            </Link>
            <Link href="/write/blog-post" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Blog Post</p>
            </Link>
            <Link href="/write/wedding-speech" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Wedding Speech</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center border-t border-stone-800/40">
          <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold mb-4">
            Try DoppelWriter free
          </h2>
          <p className="text-stone-400 mb-8">
            5 uses per month. No credit card. See how your writing sounds when AI actually
            matches your voice.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
          >
            Start Writing Free
          </Link>
          <p className="text-stone-600 text-xs mt-3">No credit card required</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/40 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-600">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-stone-500 hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-stone-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-stone-500 hover:text-white transition-colors">Terms</Link>
          </div>
          <a
            href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry"
            className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
          >
            Enterprise &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
