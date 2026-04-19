import type { Metadata } from "next";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";

export const metadata: Metadata = {
  title: "DoppelWriter vs Jasper — Voice Matching vs Marketing Templates",
  description:
    "An honest comparison of DoppelWriter and Jasper AI. Jasper is built for marketing teams with templates. DoppelWriter is built for writers who want AI that sounds like them — not a template.",
  keywords: [
    "doppelwriter vs jasper",
    "jasper ai alternative",
    "AI writing tool voice matching",
    "jasper alternative for personal voice",
    "AI that writes like me not templates",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com/vs/jasper",
    siteName: "DoppelWriter",
    title: "DoppelWriter vs Jasper — Voice Matching vs Marketing Templates",
    description:
      "An honest comparison of DoppelWriter and Jasper AI. One uses templates. The other writes like you.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DoppelWriter vs Jasper" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoppelWriter vs Jasper — Voice Matching vs Marketing Templates",
    description:
      "An honest comparison. Jasper is a marketing template engine. DoppelWriter is a voice-matching writing tool.",
  },
  alternates: { canonical: "https://doppelwriter.com/vs/jasper" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "DoppelWriter vs Jasper",
  description:
    "An honest comparison of DoppelWriter and Jasper AI for writing tasks, voice matching, and content generation.",
  url: "https://doppelwriter.com/vs/jasper",
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
    { "@type": "ListItem", position: 3, name: "DoppelWriter vs Jasper", item: "https://doppelwriter.com/vs/jasper" },
  ],
};

export default function VsJasperPage() {
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
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold mb-4">
            DoppelWriter vs Jasper
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-ink-soft)] max-w-2xl mx-auto">
            Both are AI writing tools. One runs on templates. The other writes like{" "}
            <span className="text-[var(--color-ink)]">you</span>.
          </p>
        </section>

        {/* Comparison Table */}
        <section className="pb-16">
          <div className="overflow-x-auto rounded-[2px] border border-[var(--color-rule)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-deep)]">
                  <th className="text-left px-5 py-4 font-medium text-[var(--color-ink-soft)] w-1/3">Feature</th>
                  <th className="text-left px-5 py-4 font-medium text-[var(--color-accent)] w-1/3">DoppelWriter</th>
                  <th className="text-left px-5 py-4 font-medium text-[var(--color-ink-soft)] w-1/3">Jasper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-rule)]">
                <tr className="bg-[var(--color-paper-deep)]">
                  <td className="px-5 py-4 font-medium">Voice matching</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                    Deep style analysis — sentence rhythm, word choice, pacing, punctuation habits
                  </td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">
                    Brand voice feature — tone settings and brand guidelines
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Learning from feedback</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                    Yes — tracks your edits and corrections to improve over time
                  </td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">
                    No — tone stays static unless you update brand settings
                  </td>
                </tr>
                <tr className="bg-[var(--color-paper-deep)]">
                  <td className="px-5 py-4 font-medium">Template library</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                    No templates — every generation is voice-first, not format-first
                  </td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">
                    50+ marketing templates (ads, emails, social posts)
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Personal voice clone</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                    Upload samples &rarr; permanent voice profile you can reuse
                  </td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">
                    Brand voice profiles for teams, not personal voice cloning
                  </td>
                </tr>
                <tr className="bg-[var(--color-paper-deep)]">
                  <td className="px-5 py-4 font-medium">Famous writer voices</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                    100+ curated profiles (Hemingway, Paul Graham, Obama, and more)
                  </td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">
                    None — focused on brand/marketing voice
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Price</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                    Free (5/mo) or <span className="text-[var(--color-accent)] font-medium">$19/mo</span> Pro
                  </td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">
                    $49/mo Creator, $69/mo Pro
                  </td>
                </tr>
                <tr className="bg-[var(--color-paper-deep)]">
                  <td className="px-5 py-4 font-medium">Best for</td>
                  <td className="px-5 py-4 text-[var(--color-ink-soft)]">
                    Writers who want consistent personal voice across all content
                  </td>
                  <td className="px-5 py-4 text-[var(--color-ink-mute)]">
                    Marketing teams producing high-volume template-based content
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* When to use Jasper */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-4">
            When to use Jasper
          </h2>
          <p className="text-[var(--color-ink-soft)] leading-relaxed mb-4">
            Jasper is a strong tool for marketing teams that need to produce content at scale.
            If you&apos;re running campaigns and need volume, here&apos;s where it shines:
          </p>
          <ul className="space-y-3 text-[var(--color-ink-soft)]">
            <li className="flex gap-3">
              <span className="text-[var(--color-ink)] shrink-0">&#10003;</span>
              <span><strong>Marketing campaigns</strong> — Need 50 Facebook ad variants fast? Jasper&apos;s templates are built for that.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-ink)] shrink-0">&#10003;</span>
              <span><strong>Team-scale content production</strong> — If you have a 10-person content team that needs to stay on-brand, Jasper&apos;s collaboration features help.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-ink)] shrink-0">&#10003;</span>
              <span><strong>SEO blog posts</strong> — Jasper has built-in SEO tools for keyword targeting and content briefs.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-ink)] shrink-0">&#10003;</span>
              <span><strong>Template-driven content</strong> — Jasper has formats for emails, ad copy, product descriptions, and more.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-ink)] shrink-0">&#10003;</span>
              <span><strong>Brand consistency at enterprise scale</strong> — Large marketing orgs benefit from Jasper&apos;s centralized brand voice.</span>
            </li>
          </ul>
          <p className="text-[var(--color-ink-mute)] text-sm mt-6">
            If you&apos;re a marketing team that needs high-volume, template-based content, Jasper is a solid choice. DoppelWriter solves a different problem.
          </p>
        </section>

        {/* When to use DoppelWriter */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-4">
            When to use DoppelWriter
          </h2>
          <p className="text-[var(--color-ink-soft)] leading-relaxed mb-4">
            DoppelWriter is purpose-built for one thing: making AI-generated writing sound like it
            was written by a real, specific person. Here&apos;s where it&apos;s the better tool:
          </p>
          <ul className="space-y-3 text-[var(--color-ink-soft)]">
            <li className="flex gap-3">
              <span className="text-[var(--color-accent)] shrink-0">&#10003;</span>
              <span><strong>Writing that needs to sound like you</strong> — Blog posts, newsletters, personal essays that should read like your voice, not a marketing template.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-accent)] shrink-0">&#10003;</span>
              <span><strong>Personal voice preservation</strong> — Your writing style is unique. DoppelWriter captures it and reproduces it faithfully.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-accent)] shrink-0">&#10003;</span>
              <span><strong>Editing drafts in someone&apos;s style</strong> — Paste a rough draft and get it back rewritten in any voice, with tracked changes.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-accent)] shrink-0">&#10003;</span>
              <span><strong>Learning from great writers</strong> — Study how Hemingway, Didion, or Paul Graham would approach your topic.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--color-accent)] shrink-0">&#10003;</span>
              <span><strong>Ghostwriting for multiple clients</strong> — Maintain distinct voices per client without prompt gymnastics.</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-6">
            &ldquo;Isn&apos;t Jasper&apos;s Brand Voice the same as voice matching?&rdquo;
          </h2>
          <p className="text-[var(--color-ink-soft)] leading-relaxed mb-4">
            Not really. They sound similar but solve fundamentally different problems.
          </p>
          <p className="text-[var(--color-ink-soft)] leading-relaxed mb-4">
            Jasper&apos;s Brand Voice is about tone guidelines and brand consistency at the organizational
            level. You tell it things like &ldquo;write in a professional, friendly tone&rdquo; and set
            brand do&apos;s and don&apos;ts — formal vs casual, approved terminology, that kind of thing.
            It&apos;s designed to keep a 10-person marketing team sounding consistent.
          </p>
          <p className="text-[var(--color-ink-soft)] leading-relaxed mb-4">
            DoppelWriter&apos;s voice matching is about capturing the actual writing fingerprint of a
            specific person — their sentence rhythm, vocabulary choices, punctuation habits, paragraph
            cadence. It doesn&apos;t just know what tone to use. It knows <em>how a specific human writes</em>.
          </p>
          <p className="text-[var(--color-ink-soft)] leading-relaxed mb-6">
            It&apos;s the difference between saying &ldquo;write in a professional, friendly tone&rdquo;
            and actually writing the way a specific person writes. Jasper tells AI what tone to use.
            DoppelWriter shows AI how a specific human writes.
          </p>
          <p className="text-[var(--color-ink-mute)] text-sm leading-relaxed">
            If you need brand-level tone consistency for a marketing team, Jasper&apos;s Brand Voice
            works well. If you need AI that writes like a specific individual — you, your CEO, your
            client — DoppelWriter is built for that.
          </p>
        </section>

        {/* Compare & Explore */}
        <section className="pb-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-6">
            Compare & Explore
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <Link href="/vs/chatgpt" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs ChatGPT</p>
            </Link>
            <Link href="/vs/copyai" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs Copy.ai</p>
            </Link>
            <Link href="/vs/grammarly" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs Grammarly</p>
            </Link>
            <Link href="/vs/writesonic" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">DoppelWriter vs Writesonic</p>
            </Link>
          </div>
          <h3 className="font-medium text-[var(--color-ink-soft)] mb-4">Popular use cases</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/write/newsletter" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">Write My Newsletter</p>
            </Link>
            <Link href="/write/product-description" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">Write My Product Description</p>
            </Link>
            <Link href="/write/blog-post" className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] group">
              <p className="font-medium text-sm group-hover:text-[var(--color-accent)] transition-colors">Write My Blog Post</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center border-t border-[var(--color-rule)]">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
            Try DoppelWriter free
          </h2>
          <p className="text-[var(--color-ink-soft)] mb-8">
            5 uses per month. No credit card. See how your writing sounds when AI actually
            matches your voice.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium text-lg transition-colors"
          >
            Start Writing Free
          </Link>
          <p className="text-[var(--color-ink-mute)] text-xs mt-3">No credit card required</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-rule)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[var(--color-ink-mute)]">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors">Terms</Link>
          </div>
          <a
            href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry"
            className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-accent)] transition-colors"
          >
            Enterprise &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
