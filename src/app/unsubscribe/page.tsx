import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { applyUnsubscribe, verifyUnsubscribeToken } from "@/lib/unsubscribe";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

type Props = { searchParams: Promise<{ email?: string; token?: string; done?: string }> };

export default async function UnsubscribePage({ searchParams }: Props) {
  const { email = "", token = "", done } = await searchParams;
  const valid = verifyUnsubscribeToken(email, token);

  // Confirmation step: mail scanners that prefetch the link must not unsubscribe anyone.
  async function confirm(formData: FormData) {
    "use server";
    const ok = await applyUnsubscribe(String(formData.get("email") ?? ""), String(formData.get("token") ?? ""));
    redirect(ok ? "/unsubscribe?done=1" : "/unsubscribe");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24 text-[var(--color-fg)]">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-4">Unsubscribe</h1>
      {done ? (
        <p className="text-[var(--color-fg-muted)]">You&apos;re unsubscribed. No more onboarding emails.</p>
      ) : valid ? (
        <form action={confirm}>
          <p className="mb-6 text-[var(--color-fg-muted)]">
            Stop DoppelWriter onboarding emails to <strong>{email}</strong>?
          </p>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="token" value={token} />
          <button type="submit" className="rounded-lg bg-[var(--color-brand)] px-6 py-3 font-semibold text-white">
            Unsubscribe
          </button>
        </form>
      ) : (
        <p className="text-[var(--color-fg-muted)]">
          This unsubscribe link is invalid or incomplete. Email enterprise@doppelwriter.com and we&apos;ll remove you.
        </p>
      )}
    </main>
  );
}
