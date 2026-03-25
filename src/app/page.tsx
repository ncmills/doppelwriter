import Link from "next/link";
import { CURATED_WRITERS, CATEGORIES } from "@/lib/writer-data";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/lib/use-cases";
import { WRITER_PHOTOS } from "@/lib/writer-photos";
import LandingDemo from "@/components/LandingDemo";
import LandingNav from "@/components/LandingNav";

const features = [
  {
    title: "Clone Any Voice",
    desc: "Upload writing from anyone — yourself, your mom, your boss, a friend. DoppelWriter reads their voice the way a musician reads sheet music: rhythm, dynamics, the spaces between notes.",
  },
  {
    title: "Write Like the Greats",
    desc: "Pick from our library of iconic writers, or name anyone. We build a forensic style profile from their published work so you can draft in their voice.",
  },
  {
    title: "Edit & Generate",
    desc: "Paste a rough draft and get it refined in your chosen voice. Or start from a brief. Streaming output, word-level tracked changes, iterative revision.",
  },
];

const faqs = [
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT writes in one voice — its own. DoppelWriter writes in YOUR voice, or anyone else's. We build forensic style profiles that match sentence rhythm, word choices, tone, and personality. The result reads like a human wrote it, not an AI.",
  },
  {
    q: "How does voice cloning work?",
    a: "Upload 3-5 samples of someone's writing (emails, essays, social posts). DoppelWriter analyzes their style across 30+ dimensions — sentence length, vocabulary, punctuation habits, tone, rhythm — and builds a voice profile that captures what makes their writing theirs.",
  },
  {
    q: "Is my writing data safe?",
    a: "Your writing samples and generated content are stored securely and never shared with other users. We don't use your content to train models. You can delete your data at any time from your settings.",
  },
  {
    q: "What happens after the free trial?",
    a: "The free plan gives you 5 uses per month, forever. No credit card required. If you want more, Pro is $19/month for 200 uses, unlimited voices, and custom writer builds.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DoppelWriter",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://doppelwriter.com",
  description: "AI-powered writing tool that clones your voice or lets you write like any famous author.",
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free", description: "5 edits & generations per month" },
    { "@type": "Offer", price: "19", priceCurrency: "USD", name: "Pro", description: "200 edits & generations per month" },
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LandingNav />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
        <h1 className="font-[family-name:var(--font-literata)] text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Your writing has a{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
            fingerprint.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          AI that writes like anyone. Clone your voice, your mom&apos;s, your boss&apos;s —
          or write like Hemingway, Paul Graham, and the greats.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 sm:px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-base sm:text-lg transition-colors"
          >
            <span className="sm:hidden">Start Writing Free</span>
            <span className="hidden sm:inline">Start Writing Free — 5 uses, no credit card</span>
          </Link>
          <Link
            href="#writers"
            className="px-6 sm:px-8 py-3 border border-stone-700 hover:border-stone-500 rounded-lg text-base sm:text-lg transition-colors text-stone-300"
          >
            Browse Writers
          </Link>
        </div>
        <p className="mt-4 text-stone-500 text-sm">
          New to AI writing? <Link href="/how-it-works" className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2">See how it works</Link>
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
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

      {/* Live Demo */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">See it in action</h2>
        <p className="text-stone-400 text-center mb-8 max-w-xl mx-auto">
          Watch Hemingway write about ideas — live, right here. No signup needed.
        </p>
        <LandingDemo />
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-center text-stone-500 text-sm mb-8 uppercase tracking-wider">Trusted by 50+ writers</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <p className="text-stone-300 text-sm leading-relaxed mb-3">
              &ldquo;I used DoppelWriter for my wedding speech and people thought I hired a professional writer. It nailed my voice perfectly.&rdquo;
            </p>
            <p className="text-stone-500 text-xs">— Sarah K., marketing director</p>
          </div>
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <p className="text-stone-300 text-sm leading-relaxed mb-3">
              &ldquo;I write a weekly newsletter and DoppelWriter cut my drafting time in half. The Hemingway voice is scary good.&rdquo;
            </p>
            <p className="text-stone-500 text-xs">— James M., founder</p>
          </div>
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <p className="text-stone-300 text-sm leading-relaxed mb-3">
              &ldquo;Finally an AI tool that doesn&apos;t sound like an AI. I cloned my own voice and now I use it for every client email.&rdquo;
            </p>
            <p className="text-stone-500 text-xs">— Priya R., consultant</p>
          </div>
        </div>
      </section>

      {/* Writer Showcase — By Category */}
      <section id="writers" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">Write Like the Greats</h2>
        <p className="text-stone-400 text-center mb-12 max-w-xl mx-auto">
          Pre-built voice profiles for 140+ iconic writers. Or name anyone — we&apos;ll build a custom
          profile from their published work.
        </p>
        {CATEGORIES.map((cat) => {
          const writers = CURATED_WRITERS.filter((w) => w.category === cat.id).slice(0, 5);
          return (
            <div key={cat.id} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[family-name:var(--font-literata)] text-xl font-semibold">{cat.label}</h3>
                <Link href={`/write-like/${cat.id}`} className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                  See all &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {writers.map((w) => (
                  <Link
                    key={w.name}
                    href={`/write-like/${w.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors block"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {WRITER_PHOTOS[w.name] ? (
                        <img src={WRITER_PHOTOS[w.name]} alt={w.name} className="w-7 h-7 rounded-full object-cover bg-stone-800" loading="lazy" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 text-xs font-medium">
                          {w.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      <p className="font-medium text-sm truncate">{w.name}</p>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2">{w.bio}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Use Cases — By Category */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">What will you write?</h2>
        <p className="text-stone-400 text-center mb-12 max-w-xl mx-auto">
          DoppelWriter handles any writing task — in any voice.
        </p>
        {USE_CASE_CATEGORIES.map((cat) => {
          const cases = USE_CASES.filter((u) => u.category === cat.id).slice(0, 4);
          return (
            <div key={cat.id} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[family-name:var(--font-literata)] text-xl font-semibold">{cat.label}</h3>
                <Link href={`/write/${cat.id}`} className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                  See all &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {cases.map((uc) => (
                  <Link
                    key={uc.slug}
                    href={`/write/${uc.slug}`}
                    className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors"
                  >
                    <p className="font-medium text-sm mb-1">Write My {uc.title}</p>
                    <p className="text-xs text-stone-500 line-clamp-2">{uc.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Pricing Preview */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
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
            <Link href="/signup" className="block mt-5 text-center py-2 border border-stone-700 hover:border-stone-500 rounded-lg text-sm transition-colors">
              Start Free
            </Link>
            <p className="text-center text-stone-600 text-xs mt-2">No credit card required</p>
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
            <Link href="/signup" className="block mt-5 text-center py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
              Start Free, Upgrade Later
            </Link>
            <p className="text-center text-stone-600 text-xs mt-2">No credit card required</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-8">Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="bg-stone-900/50 border border-stone-800/40 rounded-lg group">
              <summary className="px-6 py-4 cursor-pointer text-sm font-medium list-none flex items-center justify-between">
                {faq.q}
                <span className="text-stone-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-6 pb-4 text-sm text-stone-400 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Free Tools & Resources */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">Free Tools & Resources</h2>
        <p className="text-stone-400 text-center mb-8 max-w-xl mx-auto">
          Explore DoppelWriter beyond the editor — free tools, guides, and niche solutions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/analyze"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors block"
          >
            <h3 className="font-[family-name:var(--font-literata)] font-semibold mb-1">Free Writing Voice Analyzer</h3>
            <p className="text-sm text-stone-400">Paste any text and get a detailed breakdown of its writing style — sentence rhythm, vocabulary, tone, and personality.</p>
          </Link>
          <Link
            href="/for"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors block"
          >
            <h3 className="font-[family-name:var(--font-literata)] font-semibold mb-1">DoppelWriter For...</h3>
            <p className="text-sm text-stone-400">Newsletter writers, ghostwriters, fiction authors, content marketers, students — see how DoppelWriter fits your niche.</p>
          </Link>
          <Link
            href="/blog"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors block"
          >
            <h3 className="font-[family-name:var(--font-literata)] font-semibold mb-1">Blog</h3>
            <p className="text-sm text-stone-400">Writing tips, AI insights, and the craft of sounding like yourself. Learn how to get the most out of voice-matched AI.</p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold mb-4">Ready to find your voice?</h2>
        <p className="text-stone-400 mb-8">Free plan. No credit card. No guilt.</p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
        >
          Start Writing Free
        </Link>
        <p className="text-stone-600 text-xs mt-3">No credit card required</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800/40 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-600">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/analyze" className="text-xs text-stone-500 hover:text-white transition-colors">Voice Analyzer</Link>
            <Link href="/blog" className="text-xs text-stone-500 hover:text-white transition-colors">Blog</Link>
            <Link href="/for" className="text-xs text-stone-500 hover:text-white transition-colors">Use Cases</Link>
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

      {/* Referral param handler */}
      <ReferralHandler />
    </div>
  );
}

function ReferralHandler() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var ref = new URLSearchParams(window.location.search).get('ref');
            if (ref) {
              localStorage.setItem('dw_ref', ref);
              document.cookie = 'dw_ref=' + ref + ';path=/;max-age=2592000';
            }
          })();
        `,
      }}
    />
  );
}
