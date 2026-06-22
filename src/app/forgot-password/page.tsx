"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  useEffect(() => { document.title = "Reset Password | DoppelWriter"; }, []);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
      <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2 text-center font-[family-name:var(--font-display)]">
          Reset Password
        </h1>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-[var(--color-fg-muted)] mb-4">
              If an account exists with that email, we sent a reset link. Check your inbox.
            </p>
            <Link href="/login" className="text-[var(--color-brand)] hover:text-[var(--color-fg)] text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[var(--color-fg-muted)] text-sm text-center mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2px] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-[var(--color-fg)] text-[var(--color-surface)] hover:bg-[var(--color-brand)] rounded-[2px] font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-[var(--color-fg-muted)]">
              <Link href="/login" className="text-[var(--color-brand)] hover:text-[var(--color-fg)]">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
