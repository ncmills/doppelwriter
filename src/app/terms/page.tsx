import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for DoppelWriter. Plain English, no legalese.",
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-3 font-[family-name:var(--font-display)]">Terms of Service</h1>
        <p className="text-[var(--color-ink-mute)] text-sm mb-12">Last updated: March 2026</p>

        <div className="space-y-10 text-[var(--color-ink-soft)] leading-relaxed">
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">What DoppelWriter is</h2>
            <p>
              DoppelWriter is an AI-powered writing tool that analyzes voice patterns and helps you write in any style. You can clone your own voice, use pre-built profiles of famous writers, or request custom profiles. We offer a free tier and a paid Pro plan.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Your account</h2>
            <p>
              You&apos;re responsible for keeping your login credentials secure. If you suspect unauthorized access, let us know immediately. One account per person — don&apos;t share accounts or create multiple free accounts to circumvent limits.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Acceptable use</h2>
            <p>
              Use DoppelWriter to write better. Don&apos;t use it to generate illegal content, impersonate someone for fraud, produce spam, or create content that violates someone else&apos;s rights. We reserve the right to suspend accounts that abuse the platform.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Your content</h2>
            <p>
              Everything you write using DoppelWriter belongs to you. We don&apos;t claim any intellectual property rights over your input or output. You grant us a limited license to process your content solely for the purpose of providing the service — building voice profiles, transforming text, etc. That&apos;s it.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Payment terms</h2>
            <p>
              Pro costs $19/month, billed monthly through Stripe. You can cancel anytime — your Pro access continues through the end of the billing period. No refunds for partial months, but we don&apos;t lock you into annual contracts or make cancellation difficult. If pricing changes, existing subscribers get 30 days notice before any increase takes effect.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Service changes</h2>
            <p>
              We&apos;re actively building DoppelWriter and the product will evolve. We may add, modify, or remove features. If we make changes that materially reduce the value of your paid plan, we&apos;ll give you reasonable notice and the option to cancel.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Limitation of liability</h2>
            <p>
              DoppelWriter is provided as-is. We work hard to keep it running and useful, but we can&apos;t guarantee uninterrupted service or that AI output will be perfect. We&apos;re not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you&apos;ve paid us in the prior 12 months.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Termination</h2>
            <p>
              You can delete your account at any time by emailing <a href="mailto:enterprise@doppelwriter.com" className="text-[var(--color-accent)] hover:underline">enterprise@doppelwriter.com</a>. We may terminate or suspend your account if you violate these terms. On termination, we&apos;ll delete your data per our <Link href="/privacy" className="text-[var(--color-accent)] hover:underline">privacy policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] mb-3">Changes to these terms</h2>
            <p>
              We may update these terms as the product evolves. Material changes will be communicated by email. Continued use after changes take effect constitutes acceptance.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
