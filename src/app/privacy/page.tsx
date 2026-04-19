import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DoppelWriter handles your data. Plain English, no legalese.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-[var(--color-rule)] sticky top-0 bg-[var(--color-paper)]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-display)] font-bold text-lg">DoppelWriter</Link>
          <div className="flex gap-4 items-center">
            <Link href="/pricing" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors">Log in</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-3 font-[family-name:var(--font-display)]">Privacy Policy</h1>
        <p className="text-[var(--color-ink-mute)] text-sm mb-12">Last updated: March 2026</p>

        <div className="space-y-10 text-[var(--color-ink-soft)] leading-relaxed">
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">What we collect</h2>
            <p>
              When you create an account, we store your name and email address. If you upload writing samples or paste text into the editor, we process that content to build your voice profile. We also collect basic usage data — things like which features you use and how often — to improve the product.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">How we handle your writing</h2>
            <p>
              This is the part that matters most. When you submit writing samples, we analyze them to extract voice patterns — sentence structure, word choice tendencies, rhythm, tone. Once we&apos;ve built your voice profile, the raw text is deleted. We do not retain your original writing samples. The profile itself is an abstract statistical model, not a copy of your words.
            </p>
            <p className="mt-3">
              This is a deliberate design choice. Your writing is personal. We take what we need to serve you, then we let go of the rest.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Gmail integration</h2>
            <p>
              If you connect your Gmail account, we request read-only access to your sent emails. We use these to build a voice profile from how you actually write day to day. Emails are processed in real time and then deleted — we never store the raw content of your messages.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Payments</h2>
            <p>
              We use <a href="https://stripe.com/privacy" className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener noreferrer">Stripe</a> to process payments. Your credit card number never touches our servers. Stripe handles all payment data under their own PCI-compliant infrastructure.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Email communications</h2>
            <p>
              We send transactional emails (account verification, password resets, receipts) through <a href="https://resend.com/legal/privacy-policy" className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener noreferrer">Resend</a>. We don&apos;t send marketing emails unless you opt in, and you can unsubscribe from anything at any time.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Analytics</h2>
            <p>
              We use Vercel Analytics to understand how people use the site. This collects anonymous, aggregated data — no personal identifiers, no tracking across other websites.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Third parties</h2>
            <p>
              We do not sell, rent, or share your personal data with third parties. Period. Your data exists to make DoppelWriter work for you, and that&apos;s the only thing it&apos;s used for.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Deleting your data</h2>
            <p>
              Want everything gone? Email <a href="mailto:enterprise@doppelwriter.com" className="text-[var(--color-accent)] hover:underline">enterprise@doppelwriter.com</a> and we&apos;ll wipe your account, voice profiles, and any associated data. No hoops, no retention period.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Changes to this policy</h2>
            <p>
              If we make meaningful changes to how we handle your data, we&apos;ll update this page and notify you by email. We won&apos;t quietly change the rules.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
