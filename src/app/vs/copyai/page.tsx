import type { Metadata } from "next";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";

export const metadata: Metadata = {
  title: "DoppelWriter vs Copy.ai — Personal Voice vs Brand Templates",
  description:
    "An honest comparison of DoppelWriter and Copy.ai. Copy.ai generates marketing copy from templates and brand playbooks. DoppelWriter clones your personal writing voice from samples — forensically, automatically.",
  keywords: [
    "doppelwriter vs copy.ai",
    "copy.ai alternative",
    "copy.ai vs",
    "AI writing tool personal voice",
    "copy.ai alternative for personal voice",
    "AI voice cloning writing",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com/vs/copyai",
    siteName: "DoppelWriter",
    title: "DoppelWriter vs Copy.ai — Personal Voice vs Brand Templates",
    description:
      "An honest comparison of DoppelWriter and Copy.ai. One follows a brand playbook. The other writes like you.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DoppelWriter vs Copy.ai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoppelWriter vs Copy.ai — Personal Voice vs Brand Templates",
    description:
      "An honest comparison. Copy.ai is a brand template engine. DoppelWriter is a personal voice-matching writing tool.",
  },
  alternates: { canonical: "https://doppelwriter.com/vs/copyai" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "DoppelWriter vs Copy.ai",
  description:
    "An honest comparison of DoppelWriter and Copy.ai for writing tasks, voice matching, and content generation.",
  url: "https://doppelwriter.com/vs/copyai",
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
    { "@type": "ListItem", position: 3, name: "DoppelWriter vs Copy.ai", item: "https://doppelwriter.com/vs/copyai" },
  ],
};

export default function VsCopyAIPage() {
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
            DoppelWriter vs Copy.ai
          </h1>
          <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto">
            Both use AI to write. One follows a brand playbook. The other writes like{" "}
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
                  <th className="text-left px-5 py-4 font-medium text-stone-400 w-1/3">Copy.ai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/30">
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Voice approach</td>
                  <td className="px-5 py-4 text-stone-300">
                    Forensic voice analysis — extracts your style automatically from writing samples
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Brand Voice rules you define manually (tone, dos &amp; don&apos;ts)
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Who it&apos;s for</td>
                  <td className="px-5 py-4 text-stone-300">
                    Individual writers who want AI that sounds like them
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Marketing teams managing brand consistency
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Content generation</td>
                  <td className="px-5 py-4 text-stone-300">
                    Generates or rewrites text in your unique voice
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Generates marketing copy from pre-built templates
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Learns from feedback</td>
                  <td className="px-5 py-4 text-stone-300">
                    Yes — tracks your edits and corrections to improve over time
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    No — you update brand rules manually
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Famous writer voices</td>
                  <td className="px-5 py-4 text-stone-300">
                    100+ curated profiles (Hemingway, Paul Graham, Obama, and more)
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    No — brand voice only
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Personal voice clone</td>
                  <td className="px-5 py-4 text-stone-300">
                    Upload samples &rarr; permanent voice profile you can reuse
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Define tone guidelines and brand rules manually
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Price</td>
                  <td className="px-5 py-4 text-stone-300">
                    Free (5/mo) or <span className="text-amber-400 font-medium">$19/mo</span> Pro
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    $49/mo Starter
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Best for</td>
                  <td className="px-5 py-4 text-stone-300">
                    Writers who want their personal voice preserved in every piece
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Marketing teams generating brand-consistent copy at scale
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* When to use Copy.ai */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-4">
            When to use Copy.ai
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            Copy.ai is a solid tool for marketing teams that need brand-consistent copy at scale.
            Here&apos;s where it shines:
          </p>
          <ul className="space-y-3 text-stone-300">
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Team brand consistency</strong> — Keep a 10-person marketing team writing in the same brand voice with shared rules and guidelines.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Marketing copy templates</strong> — Generate ad copy, product descriptions, email campaigns, and social posts from proven templates.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Workflow automation</strong> — Integrate AI copy generation into your marketing workflow with team collaboration tools.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>High-volume content</strong> — Need 50 product descriptions or 20 ad variations? Copy.ai&apos;s template approach handles bulk generation well.</span>
            </li>
          </ul>
          <p className="text-stone-500 text-sm mt-6">
            Copy.ai is a good product for what it does. If you need a team marketing tool, it&apos;s worth looking at. DoppelWriter solves a different problem.
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
              <span><strong>Writing that needs to sound like you</strong> — Blog posts, newsletters, social content that should read like your voice, not a template&apos;s output.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Automatic voice extraction</strong> — You don&apos;t write tone rules. You upload samples and DoppelWriter figures out your voice forensically.</span>
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
              <span><strong>Ghostwriting for multiple clients</strong> — Maintain distinct personal voices per client without writing brand guidelines for each one.</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-6">
            &ldquo;Isn&apos;t Copy.ai&apos;s Brand Voice the same as voice cloning?&rdquo;
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            They sound similar but work in fundamentally different ways.
          </p>
          <p className="text-stone-400 leading-relaxed mb-4">
            Copy.ai&apos;s Brand Voice is a set of rules <em>you</em> define — tone guidelines, approved
            terminology, dos and don&apos;ts. You tell it how to sound. It&apos;s designed to keep a marketing
            team on-brand, not to capture how a specific individual actually writes.
          </p>
          <p className="text-stone-400 leading-relaxed mb-4">
            DoppelWriter&apos;s voice cloning works the other way around. You upload writing samples
            and the system analyzes your sentence rhythm, word choice patterns, punctuation habits,
            paragraph cadence — the subtle stuff that makes writing <em>feel</em> like a specific person.
            You don&apos;t define rules. DoppelWriter discovers them.
          </p>
          <p className="text-stone-400 leading-relaxed mb-6">
            It&apos;s the difference between handing someone a brand style guide and having them
            actually spend a year reading everything you&apos;ve ever written. Copy.ai follows the
            guide. DoppelWriter reads the writing.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed">
            If you need brand-level tone consistency for a marketing team, Copy.ai works well for
            that. If you need AI that writes like a specific individual — you, your CEO, your
            client — DoppelWriter is built for that.
          </p>
        </section>

        {/* Other Comparisons */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-4">
            Other comparisons
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            See how DoppelWriter compares to other AI writing tools:
          </p>
          <ul className="space-y-2 text-stone-300">
            <li>
              <Link href="/vs/chatgpt" className="text-amber-400 hover:text-amber-300 transition-colors">DoppelWriter vs ChatGPT</Link>
              <span className="text-stone-500"> — general-purpose AI vs voice matching</span>
            </li>
            <li>
              <Link href="/vs/jasper" className="text-amber-400 hover:text-amber-300 transition-colors">DoppelWriter vs Jasper</Link>
              <span className="text-stone-500"> — marketing templates vs personal voice</span>
            </li>
            <li>
              <Link href="/vs/grammarly" className="text-amber-400 hover:text-amber-300 transition-colors">DoppelWriter vs Grammarly</Link>
              <span className="text-stone-500"> — grammar correction vs voice cloning</span>
            </li>
            <li>
              <Link href="/vs/writesonic" className="text-amber-400 hover:text-amber-300 transition-colors">DoppelWriter vs Writesonic</Link>
              <span className="text-stone-500"> — SEO content generation vs voice authenticity</span>
            </li>
          </ul>
          <h3 className="font-medium text-stone-300 mb-4 mt-8">Popular use cases</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/write/cold-email" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Cold Email</p>
            </Link>
            <Link href="/write/product-description" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Product Description</p>
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
