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
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center px-4">
      <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2 text-center font-[family-name:var(--font-literata)]">
          Reset Password
        </h1>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-stone-300 mb-4">
              If an account exists with that email, we sent a reset link. Check your inbox.
            </p>
            <Link href="/login" className="text-amber-400 hover:text-amber-300 text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-stone-500 text-sm text-center mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-stone-500">
              <Link href="/login" className="text-amber-400 hover:text-amber-300">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
