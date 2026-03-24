"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { document.title = "Set New Password | DoppelWriter"; }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must be 8+ characters with uppercase, lowercase, and a number");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Reset failed. The link may have expired.");
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center px-4">
        <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-8 w-full max-w-sm text-center">
          <p className="text-stone-400 mb-4">Invalid or missing reset token.</p>
          <Link href="/forgot-password" className="text-amber-400 hover:text-amber-300 text-sm">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center px-4">
      <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center font-[family-name:var(--font-literata)]">
          Set New Password
        </h1>

        {success ? (
          <div className="text-center py-4">
            <p className="text-green-400 mb-2">Password reset successfully!</p>
            <p className="text-stone-500 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              minLength={8}
              className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              minLength={8}
              className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-stone-600 -mt-2">Min 8 characters, with uppercase, lowercase, and a number</p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
