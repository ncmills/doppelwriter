import Link from "next/link";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/lib/use-cases";
import LandingDemo from "@/components/LandingDemo";
import LandingNav from "@/components/LandingNav";
import WriterCarousel from "@/components/WriterCarousel";

const CATEGORY_SUBHEADS: Record<string, string> = {
  personal: "The ones that matter most.",
  professional: "Letters that get opened, read, answered.",
  business: "Proposals, updates, pages that don't sound like a template.",
  content: "Essays, posts, scripts — written the way you'd say it.",
  formal: "Official correspondence, said clearly.",
};

const features = [
  {
    eyebrow: "01 — Clone a voice",
    title: "Any voice you can point to",
    body: "Upload emails, essays, posts — your own, a friend's, a founder's. DoppelWriter reads the voice the way a musician reads sheet music: rhythm, dynamics, the spaces between notes.",
  },
  {
    eyebrow: "02 — Hire the greats",
    title: "Or borrow from the canon",
    body: "Pick from 140+ prebuilt voice profiles: Hemingway, Didion, Graham, Morrison, Buffett. Or name anyone — we build a forensic style profile from their published work.",
  },
  {
    eyebrow: "03 — Draft & revise",
    title: "Edit in place, stream in voice",
    body: "Paste a rough draft and get it refined. Start from a brief and watch it stream. Word-level tracked changes. Iterate until it sounds like you actually wrote it.",
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
    a: "DoppelWriter is free to use — no credit card required. You get monthly uses to edit and generate drafts. If you need more, there's an option to upgrade for additional capacity.",
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
  description:
    "AI-powered writing tool that clones your voice or lets you write like any famous author.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      name: "Free",
      description: "AI-powered writing tool that clones any voice",
    },
  ],
};

const crossSites = [
  { label: "Tour de Fore", href: "https://tourdefore.com", note: "Golf trip planner" },
  { label: "Peptide Stack", href: "https://whatpeptidesdo.com", note: "Research journal" },
  { label: "I Don't Have a Will", href: "https://idonthaveawill.com", note: "Estate tool" },
  { label: "Imfrustrated", href: "https://imfrustrated.org", note: "Venting, done well" },
];

const footerCols: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Voice Analyzer", href: "/analyze" },
      { label: "The Editor", href: "/write" },
      { label: "For Writers", href: "/for" },
      { label: "Pricing", href: "/pricing" },
      { label: "Journal", href: "/blog" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Wedding speech", href: "/write/wedding-speech" },
      { label: "Cover letter", href: "/write/cover-letter" },
      { label: "Newsletter", href: "/write/newsletter" },
      { label: "Blog post", href: "/write/blog-post" },
      { label: "LinkedIn post", href: "/write/linkedin-post" },
      { label: "All templates", href: "/write" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs. ChatGPT", href: "/vs/chatgpt" },
      { label: "vs. Jasper", href: "/vs/jasper" },
      { label: "vs. Grammarly", href: "/vs/grammarly" },
      { label: "vs. Copy.ai", href: "/vs/copyai" },
      { label: "vs. Writesonic", href: "/vs/writesonic" },
      { label: "All alternatives", href: "/alternatives" },
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LandingNav />

      <main id="main-content">
        {/* ━━━━━━━━━━ HERO ━━━━━━━━━━ */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 sm:pt-24 pb-10 sm:pb-16">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-ink-mute)] mb-6">
              <span className="text-[var(--color-accent)]">●</span>{" "}
              Vol. I — AI Writing, Voice-Matched
            </p>
            <h1 className="font-[family-name:var(--font-display)] font-bold text-[44px] sm:text-[64px] md:text-[72px] leading-[1.02] tracking-[-0.02em] mb-6 sm:mb-8">
              Write in anyone&apos;s voice.
              <br />
              <em className="font-normal text-[var(--color-ink-soft)]">
                Starting with yours.
              </em>
            </h1>
            <p className="font-[family-name:var(--font-display)] text-lg sm:text-2xl text-[var(--color-ink-soft)] max-w-2xl mx-auto leading-snug italic">
              The AI that sounds like you. Or Hemingway. Or your mom.
            </p>
          </div>

          {/* The demo IS the hero */}
          <LandingDemo />
        </section>

        <hr className="rule max-w-6xl mx-auto" />

        {/* ━━━━━━━━━━ THREE-UP FEATURES — newspaper columns ━━━━━━━━━━ */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="grid md:grid-cols-3 gap-10 md:gap-14">
            {features.map((f) => (
              <div key={f.title}>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-4">
                  {f.eyebrow}
                </p>
                <h3 className="font-[family-name:var(--font-display)] text-[28px] leading-[1.1] mb-4">
                  {f.title}
                </h3>
                <div className="w-8 h-[1px] bg-[var(--color-rule)] mb-4" />
                <p className="text-[15px] leading-[1.7] text-[var(--color-ink-soft)]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <hr className="rule max-w-6xl mx-auto" />

        {/* ━━━━━━━━━━ WRITER GALLERY — literary trading cards ━━━━━━━━━━ */}
        <section id="writers" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="flex items-baseline justify-between mb-4 gap-6 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-ink-mute)] mb-3">
                The Writers
              </p>
              <h2 className="font-[family-name:var(--font-display)] font-bold text-[40px] sm:text-[56px] leading-[1.03] tracking-[-0.02em]">
                Or borrow <em className="font-normal">someone else&apos;s.</em>
              </h2>
            </div>
            <Link
              href="/write-like/authors"
              className="ed-link text-sm text-[var(--color-ink)]"
            >
              Browse all 140+ →
            </Link>
          </div>
          <p className="max-w-xl text-[var(--color-ink-soft)] mb-10 italic font-[family-name:var(--font-display)] text-lg">
            Prebuilt profiles for 140 iconic voices. Name anyone else — we&apos;ll
            build a forensic style profile from their published work.
          </p>
          <WriterCarousel />
        </section>

        <hr className="rule max-w-6xl mx-auto" />

        {/* ━━━━━━━━━━ USE CASES — newspaper columns ━━━━━━━━━━ */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="mb-12 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-ink-mute)] mb-3">
              The Assignments
            </p>
            <h2 className="font-[family-name:var(--font-display)] font-bold text-[40px] sm:text-[56px] leading-[1.03] tracking-[-0.02em] mb-4">
              What will you write?
            </h2>
            <p className="font-[family-name:var(--font-display)] italic text-lg text-[var(--color-ink-soft)]">
              Any writing task — in any voice.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">
            {USE_CASE_CATEGORIES.map((cat) => {
              const cases = USE_CASES.filter((u) => u.category === cat.id).slice(0, 5);
              return (
                <div key={cat.id} className="border-t border-[var(--color-ink)] pt-4">
                  <h3 className="font-[family-name:var(--font-display)] text-[22px] leading-tight mb-2">
                    {cat.label}
                  </h3>
                  <p className="text-[13px] italic text-[var(--color-ink-soft)] mb-5 font-[family-name:var(--font-display)]">
                    — {CATEGORY_SUBHEADS[cat.id]}
                  </p>
                  <ul className="space-y-2.5">
                    {cases.map((uc) => (
                      <li key={uc.slug}>
                        <Link
                          href={`/write/${uc.slug}`}
                          className="ed-link text-[14px] text-[var(--color-ink)] leading-snug"
                        >
                          {uc.title}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-1">
                      <Link
                        href={`/write/${cat.id}`}
                        className="ed-link ed-link-accent text-[13px] uppercase tracking-[0.15em]"
                      >
                        See all →
                      </Link>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="rule max-w-6xl mx-auto" />

        {/* ━━━━━━━━━━ FIELD NOTES — testimonials as marginalia ━━━━━━━━━━ */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-ink-mute)] mb-10 text-center">
            Field Notes — From 50+ Writers In Practice
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                quote:
                  "I used DoppelWriter for my wedding speech. People thought I hired a professional. It nailed my voice.",
                attribution: "Sarah K. — marketing director",
              },
              {
                quote:
                  "I write a weekly newsletter. DoppelWriter cut my drafting time in half. The Hemingway voice is scary good.",
                attribution: "James M. — founder",
              },
              {
                quote:
                  "Finally an AI tool that doesn't sound like an AI. I cloned my own voice. I use it for every client email now.",
                attribution: "Priya R. — consultant",
              },
            ].map((t, i) => (
              <figure key={i} className="border-l-2 border-[var(--color-accent)] pl-5">
                <blockquote className="font-[family-name:var(--font-display)] italic text-[19px] leading-[1.5] text-[var(--color-ink)] mb-4">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                  {t.attribution}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <hr className="rule max-w-6xl mx-auto" />

        {/* ━━━━━━━━━━ FAQ — editorial accordion ━━━━━━━━━━ */}
        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-ink-mute)] mb-3">
              Frequently Asked
            </p>
            <h2 className="font-[family-name:var(--font-display)] font-bold text-[40px] sm:text-[56px] leading-[1.03] tracking-[-0.02em]">
              Questions.
            </h2>
          </div>
          <div className="border-t border-[var(--color-ink)]">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="border-b border-[var(--color-rule)] group"
              >
                <summary className="py-5 cursor-pointer list-none flex items-baseline justify-between gap-6">
                  <span className="font-[family-name:var(--font-display)] text-[20px] sm:text-[22px] leading-snug text-[var(--color-ink)]">
                    {faq.q}
                  </span>
                  <span className="text-[var(--color-ink-mute)] group-open:rotate-45 transition-transform text-xl font-light shrink-0">
                    +
                  </span>
                </summary>
                <div className="pb-6 pr-8 text-[15px] leading-[1.7] text-[var(--color-ink-soft)]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <hr className="rule max-w-6xl mx-auto" />

        {/* ━━━━━━━━━━ CTA — ink stamp close ━━━━━━━━━━ */}
        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-32 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-ink-mute)] mb-6">
            Fin.
          </p>
          <h2 className="font-[family-name:var(--font-display)] font-bold text-[40px] sm:text-[64px] leading-[1.03] tracking-[-0.02em] mb-6">
            Now — <em className="font-normal">your turn.</em>
          </h2>
          <p className="font-[family-name:var(--font-display)] italic text-lg sm:text-xl text-[var(--color-ink-soft)] max-w-md mx-auto mb-10">
            Free to use. No credit card. Voice cloned in under a minute.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-[var(--color-ink)] text-[var(--color-paper)] text-sm font-medium tracking-[0.15em] uppercase hover:bg-[var(--color-accent)] transition-colors"
            style={{ borderRadius: "2px" }}
          >
            Start Writing →
          </Link>
        </section>
      </main>

      {/* ━━━━━━━━━━ FOOTER — 3 columns + cross-site list ━━━━━━━━━━ */}
      <footer className="border-t border-[var(--color-ink)] bg-[var(--color-paper-deep)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* Masthead */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4 text-[var(--color-ink)]">
                <svg
                  viewBox="0 0 64 64"
                  className="h-7 w-7"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M 4 12 L 18 12 C 28 12 30 20 30 32 C 30 44 28 52 18 52 L 4 52 Z M 10 16 L 17 16 C 22 16 24 22 24 32 C 24 42 22 48 17 48 L 10 48 Z" />
                  <rect x="30" y="12" width="2" height="40" />
                  <path d="M 32 12 L 36 12 L 42 52 L 38 52 Z" />
                  <path d="M 39 52 L 41 52 L 48 12 L 46 12 Z" />
                  <path d="M 45 12 L 49 12 L 55 52 L 51 52 Z" />
                  <path d="M 52 52 L 54 52 L 61 12 L 59 12 Z" />
                </svg>
                <span className="font-[family-name:var(--font-display)] font-bold text-xl tracking-[-0.02em]">
                  DoppelWriter
                </span>
              </Link>
              <p className="text-[13px] leading-relaxed text-[var(--color-ink-soft)] italic font-[family-name:var(--font-display)]">
                Voice-matched writing for people who still read.
              </p>
            </div>

            {/* 3 columns */}
            {footerCols.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-ink-mute)] mb-5">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="ed-link text-[14px] text-[var(--color-ink)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Cross-site reading list */}
          <div className="border-t border-[var(--color-rule)] pt-8 mb-8">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-ink-mute)] mb-5">
              Also from the same desk
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
              {crossSites.map((s) => (
                <li key={s.href} className="flex items-baseline gap-2">
                  <a
                    href={s.href}
                    rel="nofollow"
                    className="ed-link text-[13px] text-[var(--color-ink)]"
                  >
                    {s.label}
                  </a>
                  <span className="text-[11px] text-[var(--color-ink-mute)] italic font-[family-name:var(--font-display)]">
                    {s.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[var(--color-rule)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-mute)]">
            <span>© {new Date().getFullYear()} DoppelWriter · All rights reserved</span>
            <div className="flex gap-5">
              <Link href="/privacy" className="ed-link">Privacy</Link>
              <Link href="/terms" className="ed-link">Terms</Link>
              <a href="mailto:info@doppelwriter.com" className="ed-link">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Referral param handler — unchanged */}
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
