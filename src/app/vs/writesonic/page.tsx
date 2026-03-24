import type { Metadata } from "next";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";

export const metadata: Metadata = {
  title: "DoppelWriter vs Writesonic — Voice Cloning vs Content Generation",
  description:
    "An honest comparison of DoppelWriter and Writesonic. Writesonic generates SEO content at scale from templates. DoppelWriter clones your personal writing voice — making everything sound like you, not a content mill.",
  keywords: [
    "doppelwriter vs writesonic",
    "writesonic alternative",
    "writesonic vs",
    "AI writing that sounds like me",
    "writesonic alternative personal voice",
    "AI voice cloning writing tool",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com/vs/writesonic",
    siteName: "DoppelWriter",
    title: "DoppelWriter vs Writesonic — Voice Cloning vs Content Generation",
    description:
      "An honest comparison of DoppelWriter and Writesonic. One generates SEO content at scale. The other writes like you.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DoppelWriter vs Writesonic" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoppelWriter vs Writesonic — Voice Cloning vs Content Generation",
    description:
      "An honest comparison. Writesonic is an SEO content generator. DoppelWriter is a personal voice-matching writing tool.",
  },
  alternates: { canonical: "https://doppelwriter.com/vs/writesonic" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "DoppelWriter vs Writesonic",
  description:
    "An honest comparison of DoppelWriter and Writesonic for writing tasks, voice matching, and SEO content generation.",
  url: "https://doppelwriter.com/vs/writesonic",
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
    { "@type": "ListItem", position: 3, name: "DoppelWriter vs Writesonic", item: "https://doppelwriter.com/vs/writesonic" },
  ],
};

export default function VsWritesonicPage() {
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
            DoppelWriter vs Writesonic
          </h1>
          <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto">
            Both use AI to write. One optimizes for search engines. The other writes like{" "}
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
                  <th className="text-left px-5 py-4 font-medium text-stone-400 w-1/3">Writesonic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/30">
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Core focus</td>
                  <td className="px-5 py-4 text-stone-300">
                    Voice authenticity — makes everything sound like a specific person
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Content volume — generates SEO articles and marketing copy at scale
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Voice approach</td>
                  <td className="px-5 py-4 text-stone-300">
                    Forensic voice analysis from your writing samples — automatic, deep
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Tone selector dropdowns (professional, casual, witty, etc.)
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Content generation</td>
                  <td className="px-5 py-4 text-stone-300">
                    Generates or rewrites text in your unique voice with tracked changes
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Generates SEO-optimized articles, landing pages, and ads from templates
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Learns from feedback</td>
                  <td className="px-5 py-4 text-stone-300">
                    Yes — tracks your edits and corrections to improve over time
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    No — regenerate or manually adjust output
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Famous writer voices</td>
                  <td className="px-5 py-4 text-stone-300">
                    100+ curated profiles (Hemingway, Paul Graham, Obama, and more)
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    No — generic tone options only
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Personal voice clone</td>
                  <td className="px-5 py-4 text-stone-300">
                    Upload samples &rarr; permanent voice profile you can reuse
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    No persistent voice profiles — pick a tone each time
                  </td>
                </tr>
                <tr className="bg-stone-900/20">
                  <td className="px-5 py-4 font-medium">Price</td>
                  <td className="px-5 py-4 text-stone-300">
                    Free (5/mo) or <span className="text-amber-400 font-medium">$19/mo</span> Pro
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    $16/mo Individual
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Best for</td>
                  <td className="px-5 py-4 text-stone-300">
                    Anyone who writes and wants consistent personal voice
                  </td>
                  <td className="px-5 py-4 text-stone-500">
                    Content marketers generating SEO articles at volume
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* When to use Writesonic */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-4">
            When to use Writesonic
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            Writesonic is built for content marketers who need volume. Here&apos;s where it does well:
          </p>
          <ul className="space-y-3 text-stone-300">
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>SEO blog posts</strong> — Generate keyword-optimized articles quickly. If you need 20 blog posts this month for organic traffic, Writesonic can help.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Landing page copy</strong> — Create headlines, feature descriptions, and CTAs from templates designed to convert.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Ad copy variations</strong> — Generate multiple versions of Google or Facebook ads to A/B test.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Content at scale</strong> — When volume matters more than voice and you need content produced fast.</span>
            </li>
          </ul>
          <p className="text-stone-500 text-sm mt-6">
            Writesonic is a capable content generation tool. If SEO volume is your primary goal, it&apos;s worth considering. DoppelWriter solves a different problem.
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
              <span><strong>Writing that needs to sound like you</strong> — Blog posts, newsletters, social content that should read like your voice, not generic SEO filler.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 shrink-0">&#10003;</span>
              <span><strong>Voice consistency across content</strong> — Everything you publish sounds like the same person wrote it, because it was trained on how you actually write.</span>
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
              <span><strong>Ghostwriting for multiple clients</strong> — Maintain distinct personal voices per client without writing tone guidelines for each one.</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl md:text-3xl font-bold mb-6">
            &ldquo;Don&apos;t Writesonic&apos;s tone options cover voice matching?&rdquo;
          </h2>
          <p className="text-stone-400 leading-relaxed mb-4">
            Not really. They&apos;re solving different problems.
          </p>
          <p className="text-stone-400 leading-relaxed mb-4">
            Writesonic&apos;s tone selector lets you pick from generic options like &ldquo;professional,&rdquo;
            &ldquo;casual,&rdquo; &ldquo;witty,&rdquo; or &ldquo;enthusiastic.&rdquo; That affects surface-level
            feel, but every user who picks &ldquo;casual&rdquo; gets the same kind of casual. There&apos;s nothing
            unique about it.
          </p>
          <p className="text-stone-400 leading-relaxed mb-4">
            DoppelWriter doesn&apos;t ask you to pick a tone from a dropdown. It reads your actual writing
            and extracts the patterns that make it yours — sentence rhythm, vocabulary choices, punctuation
            habits, paragraph cadence. The stuff a human editor would notice after reading 50 of your posts.
          </p>
          <p className="text-stone-400 leading-relaxed mb-6">
            It&apos;s the difference between selecting &ldquo;casual&rdquo; from a menu and teaching AI
            exactly how <em>you</em> write casually. Ten different writers all have different versions of
            casual. DoppelWriter captures yours.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed">
            If you need high-volume SEO content and voice doesn&apos;t matter much, Writesonic does
            that well. If you care about sounding like yourself in everything you publish,
            DoppelWriter is the right tool.
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
              <Link href="/vs/copyai" className="text-amber-400 hover:text-amber-300 transition-colors">DoppelWriter vs Copy.ai</Link>
              <span className="text-stone-500"> — brand voice playbooks vs personal voice cloning</span>
            </li>
          </ul>
          <h3 className="font-medium text-stone-300 mb-4 mt-8">Popular use cases</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/write/blog-post" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Blog Post</p>
            </Link>
            <Link href="/write/about-page" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My About Page</p>
            </Link>
            <Link href="/write/newsletter" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group">
              <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Write My Newsletter</p>
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
