import type { Metadata } from "next";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";

export const metadata: Metadata = {
  title: "DoppelWriter vs Grammarly — Voice Matching vs Grammar Checking",
  description:
    "An honest comparison of DoppelWriter and Grammarly. Grammarly fixes your grammar and makes you sound 'professional.' DoppelWriter makes AI writing sound like you — not like everyone else.",
  keywords: [
    "doppelwriter vs grammarly",
    "grammarly alternative for voice",
    "AI writing tool vs grammar checker",
    "grammarly voice matching",
    "writing tool that preserves your voice",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com/vs/grammarly",
    siteName: "DoppelWriter",
    title: "DoppelWriter vs Grammarly — Voice Matching vs Grammar Checking",
    description:
      "An honest comparison of DoppelWriter and Grammarly. One fixes your grammar. The other makes AI sound like you.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DoppelWriter vs Grammarly" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoppelWriter vs Grammarly — Voice Matching vs Grammar Checking",
    description:
      "An honest comparison. Grammarly is a proofreader. DoppelWriter is a voice-matching ghostwriter.",
  },
  alternates: { canonical: "https://doppelwriter.com/vs/grammarly" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "DoppelWriter vs Grammarly",
  description:
    "An honest comparison of DoppelWriter and Grammarly for writing tasks, voice matching, and grammar checking.",
  url: "https://doppelwriter.com/vs/grammarly",
  publisher: {
    "@type": "Organization",
    name: "DoppelWriter",
    url: "https://doppelwriter.com",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://doppelwriter.com" },
    { "@type": "ListItem", position: 2, name: "Comparisons", item: "https://doppelwriter.com/vs" },
    { "@type": "ListItem", position: 3, name: "DoppelWriter vs Grammarly", item: "https://doppelwriter.com/vs/grammarly" },
  ],
};

export default function VsGrammarlyPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <LandingNav />

      <main className="max-w-4xl mx-auto px-6">
        {/* Hero */}
        <section className="py-16 md:py-24 text-center">
          <h1 className="font-[family-name:var(--font-literata)] text-4xl md:text-5xl font-bold mb-4">
            DoppelWriter vs Grammarly
          </h1>
          <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto">
            Grammarly fixes your grammar. DoppelWriter makes AI writing sound like{" "}
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
                  <th className="text-left px-5 py-4 font-medium text-stone-400 w-1/3">Grammarly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/30">
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Core function</td>
                  <td className="px-5 py-4 text-stone-300">
                    AI writing that matches your personal voice
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Grammar, spelling, and tone correction
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Voice matching</td>
                  <td className="px-5 py-4 text-stone-300">
                    Deep style analysis — sentence rhythm, word choice, pacing, punctuation habits
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Tone detection (formal, friendly, etc.) but no personal voice matching
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Content generation</td>
                  <td className="px-5 py-4 text-stone-300">
                    Full-length drafts in your voice or any famous writer&apos;s voice
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Limited generation — mainly rewrites and suggestions
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Editing approach</td>
                  <td className="px-5 py-4 text-stone-300">
                    Rewrites text to match a specific person&apos;s voice with tracked changes
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Corrects grammar, clarity, and tone — standardizes toward &ldquo;correct&rdquo; writing
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Famous writer voices</td>
                  <td className="px-5 py-4 text-stone-300">
                    100+ curated profiles (Hemingway, Paul Graham, Obama, and more)
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    None — focused on correctness, not style
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Price</td>
                  <td className="px-5 py-4 text-stone-300">
                    Free (5/mo) or <span className="text-amber-400 font-medium">$19/mo</span> Pro
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Free basic, $12/mo Premium, $15/mo Business
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Best for</td>
                  <td className="px-5 py-4 text-stone-300">
                    Writers who want AI that sounds like them
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Anyone who wants fewer typos and clearer sentences
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* When to use Grammarly */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-4">
            When to use Grammarly
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            Grammarly is the best grammar checker on the market. If clean, error-free writing is
            what you need, it&apos;s the right tool. Here&apos;s where it shines:
          </p>
          <ul className="space-y-3 text-stone-300">
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Catching typos and grammar mistakes</strong> — Grammarly is the best at this. Period.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Professional email polish</strong> — Quick grammar and tone checks before sending important emails.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Non-native English speakers</strong> — Grammarly helps with fluency and natural phrasing.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Academic writing</strong> — Citation checks, plagiarism detection, and formal tone guidance.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Browser-wide correction</strong> — Grammarly works everywhere: Gmail, Docs, Slack, anywhere you type.</span>
            </li>
          </ul>
          <p className="text-stone-500 text-sm mt-6">
            We use Grammarly too. It&apos;s a genuinely great tool. DoppelWriter isn&apos;t trying to replace it — they solve different problems.
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
              <span><strong>Writing that needs to sound like you</strong> — Not &ldquo;correct&rdquo; writing, but YOUR writing. Your quirks, your rhythm, your voice.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Generating content in your voice</strong> — Need a blog post, newsletter, or speech that sounds like you wrote it? DoppelWriter generates from scratch.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Preserving style that Grammarly would &ldquo;fix&rdquo;</strong> — Sentence fragments? Comma splices on purpose? Starting sentences with &ldquo;And&rdquo;? Grammarly flags these. DoppelWriter preserves them if they&apos;re part of your voice.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Writing in famous authors&apos; styles</strong> — Study and write in the voice of Hemingway, Morrison, Paul Graham, and 100+ more.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Ghostwriting for clients</strong> — Maintain each client&apos;s distinct voice, not just &ldquo;grammatically correct&rdquo; writing.</span>
            </li>
          </ul>
        </section>

        {/* FAQ: Can I use both? */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-6">
            &ldquo;Can I use both DoppelWriter and Grammarly?&rdquo;
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            Yes, absolutely — and many writers should. They solve different problems. Use Grammarly
            to catch typos and grammar errors in everything you write. Use DoppelWriter when you
            need AI-generated content that actually sounds like you, or when you want to edit a
            draft to match a specific voice.
          </p>
          <p className="text-stone-400 leading-relaxed mb-4">
            Grammarly makes your writing correct. DoppelWriter makes your writing sound like a
            specific person. One is a proofreader. The other is a voice-matching ghostwriter. They
            complement each other perfectly.
          </p>
        </section>

        {/* FAQ: Doesn't Grammarly have a tone feature? */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-6">
            &ldquo;Doesn&apos;t Grammarly have a &lsquo;tone&rsquo; feature?&rdquo;
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            Grammarly can detect tone (confident, friendly, formal, etc.) and suggest adjustments.
            But tone is just one dimension of voice. Your writing voice includes sentence length
            patterns, vocabulary preferences, punctuation habits, paragraph rhythm, pronoun usage,
            and dozens of other measurable patterns.
          </p>
          <p className="text-stone-400 leading-relaxed mb-4">
            Telling an AI to &ldquo;write in a friendly tone&rdquo; is like telling a musician to
            &ldquo;play something upbeat&rdquo; — it&apos;s directional, not specific. DoppelWriter
            doesn&apos;t guess at your tone. It analyzes your actual writing and reproduces the full
            pattern.
          </p>
        </section>

        {/* Compare & Explore */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-6">
            Compare & Explore
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <Link href="/vs/chatgpt" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">DoppelWriter vs ChatGPT</p>
            </Link>
            <Link href="/vs/jasper" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">DoppelWriter vs Jasper</p>
            </Link>
            <Link href="/vs/copyai" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">DoppelWriter vs Copy.ai</p>
            </Link>
            <Link href="/vs/writesonic" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">DoppelWriter vs Writesonic</p>
            </Link>
          </div>
          <h3 className="font-medium text-stone-300 mb-4">Popular use cases</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/write/essay" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Essay</p>
            </Link>
            <Link href="/write/cover-letter" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Cover Letter</p>
            </Link>
            <Link href="/write/linkedin-post" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My LinkedIn Post</p>
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
