import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How AI Voice Cloning Writing Works",
  description: "Learn how DoppelWriter's AI analyzes your writing style and creates content that sounds like you. No templates, no generic AI voice — just your words, your way.",
  openGraph: {
    title: "How AI Voice Cloning Writing Works",
    description: "AI that writes like you, not like a robot. Here's how it works.",
    url: "https://doppelwriter.com/how-it-works",
  },
  alternates: { canonical: "https://doppelwriter.com/how-it-works" },
};

const faqs = [
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT writes in one voice — its own. It's great for brainstorming and answering questions, but everything it writes sounds like ChatGPT. DoppelWriter analyzes YOUR writing to build a voice profile, then generates content that matches your sentence rhythm, word choices, tone, and personality. The result reads like you wrote it on a good day — not like AI wrote it on any day.",
  },
  {
    q: "Can people tell AI wrote it?",
    a: "With generic AI tools, yes — most people can tell immediately. The vocabulary, rhythm, and structure all scream \"AI.\" With voice-matched writing, it's significantly harder to detect because the output mirrors your actual writing patterns. AI detection tools look for statistical signatures of generic AI. When the output is styled to match a specific human voice, those signatures largely disappear.",
  },
  {
    q: "What do I need to upload?",
    a: "Any writing that sounds like you. Emails are ideal because they're natural and unselfconscious. Slack messages, social media posts, essays, blog posts — anything works. You need at least 3 samples, and more is better. The key is authenticity: upload things you wrote as yourself, not formal writing you did for a client or school assignment where you were performing a different voice.",
  },
  {
    q: "Is it cheating to use AI for writing?",
    a: "That depends entirely on context. Using AI on a school exam is cheating. Using AI to draft a work email faster is no different from using spell-check. Using AI to help write a wedding speech when you're not a natural writer? That's a tool helping you express something you genuinely feel. Your thoughts, your stories, your feelings — just organized and polished by AI in your voice. Humans have always used tools to write better. This is the next one.",
  },
  {
    q: "How much does it cost?",
    a: "The free plan gives you 5 uses per month, forever. No credit card required, no trial period, no bait-and-switch. If you need more, Pro is $19/month for 200 uses, unlimited voice profiles, and custom writer builds. Most people start free and upgrade when they realize how much time it saves.",
  },
  {
    q: "Is my writing data safe?",
    a: "Yes. Your writing samples and generated content are stored securely and never shared with other users. We don't use your content to train our models — your voice profile is yours alone. You can delete all your data at any time from your account settings. We don't sell data, we don't share data, and we don't mine your writing for anything other than building your personal voice profile.",
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

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://doppelwriter.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "How It Works",
      item: "https://doppelwriter.com/how-it-works",
    },
  ],
};

const steps = [
  {
    num: 1,
    title: "Share your writing",
    desc: "Upload emails, essays, anything you've written. Even voice memos. The more natural the writing, the better — we want the real you, not the performing-for-an-audience you.",
  },
  {
    num: 2,
    title: "We analyze your voice",
    desc: "Sentence rhythm, word choice, punctuation, tone, what you never say. 30+ dimensions of your writing style, mapped in about 30 seconds. Most people have never seen their own voice broken down like this.",
  },
  {
    num: 3,
    title: "Write anything in your style",
    desc: "Essays, speeches, emails, blog posts, cover letters. Give us the brief and we'll draft it in your voice. Sounds like you wrote it on your best writing day.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Nav */}
      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-literata)] font-bold text-lg">
            DoppelWriter
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            Try Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="font-[family-name:var(--font-literata)] text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          How Does AI Write in{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
            Your Voice?
          </span>
        </h1>
        <p className="text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed">
          Most AI writes like AI. DoppelWriter writes like you. Here&apos;s how.
        </p>
      </section>

      {/* 3-Step Process */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6"
            >
              <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center text-sm font-bold mb-4">
                {step.num}
              </div>
              <h3 className="font-[family-name:var(--font-literata)] text-lg font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What Makes It Different */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">
          Why Voice Cloning Beats Prompt Engineering
        </h2>
        <p className="text-stone-400 text-center mb-10 max-w-xl mx-auto">
          Telling ChatGPT to &ldquo;write in a casual tone&rdquo; is like telling an impersonator &ldquo;he talks fast.&rdquo;
          It&apos;s not enough. Here&apos;s what we actually analyze.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Sentence rhythm", detail: "Your pattern of long and short sentences — as personal as a heartbeat" },
            { label: "Word choice", detail: "The words you reach for vs. the words you know but never use" },
            { label: "Punctuation habits", detail: "Em dashes, ellipses, semicolons — or the total absence of them" },
            { label: "Tone and register", detail: "How formal or informal, and how that shifts by context" },
            { label: "Argument structure", detail: "Do you lead with the point or build to it? Examples or abstractions?" },
            { label: "What you never say", detail: "The words, phrases, and patterns you consistently avoid" },
          ].map((dim) => (
            <div key={dim.label} className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4">
              <p className="font-medium text-sm text-amber-400 mb-1">{dim.label}</p>
              <p className="text-stone-400 text-sm leading-relaxed">{dim.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-8">
          Common Questions
        </h2>
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

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="font-[family-name:var(--font-literata)] text-3xl font-bold mb-4">
          Ready to hear your own voice?
        </h2>
        <p className="text-stone-400 mb-8">Try it free — 5 uses, no credit card.</p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
        >
          Start Writing Free
        </Link>
        <p className="text-stone-600 text-xs mt-3">No credit card required</p>
      </section>

      {/* Explore Links */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-4 gap-4">
          <Link
            href="/write"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors block text-center"
          >
            <p className="font-medium text-sm mb-1">Use Cases</p>
            <p className="text-xs text-stone-500">Speeches, emails, essays & more</p>
          </Link>
          <Link
            href="/analyze"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors block text-center"
          >
            <p className="font-medium text-sm mb-1">Free Voice Analyzer</p>
            <p className="text-xs text-stone-500">See your writing style mapped out</p>
          </Link>
          <Link
            href="/write-like"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors block text-center"
          >
            <p className="font-medium text-sm mb-1">Famous Writers</p>
            <p className="text-xs text-stone-500">Write like Hemingway, Didion & more</p>
          </Link>
          <Link
            href="/pricing"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors block text-center"
          >
            <p className="font-medium text-sm mb-1">Pricing</p>
            <p className="text-xs text-stone-500">Free forever, Pro for $19/mo</p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800/40 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-600">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/analyze" className="text-xs text-stone-500 hover:text-white transition-colors">Voice Analyzer</Link>
            <Link href="/blog" className="text-xs text-stone-500 hover:text-white transition-colors">Blog</Link>
            <Link href="/for" className="text-xs text-stone-500 hover:text-white transition-colors">Use Cases</Link>
            <Link href="/pricing" className="text-xs text-stone-500 hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-stone-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-stone-500 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
