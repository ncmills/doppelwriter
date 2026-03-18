"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // Show verification prompt, then auto-login
    setShowVerify(true);
    setLoading(false);

    // Auto-login after 2 seconds (they can verify later)
    setTimeout(async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result?.error) window.location.href = "/write";
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center">
      <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center font-[family-name:var(--font-literata)]">
          {showVerify ? "Check Your Email" : "Create Account"}
        </h1>

        {showVerify ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">&#9993;</div>
            <p className="text-stone-300 mb-2">We sent a verification link to</p>
            <p className="text-amber-400 font-medium mb-4">{email}</p>
            <p className="text-stone-500 text-sm">Click the link to verify your account. Redirecting you now...</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className={`space-y-4 ${showVerify ? "hidden" : ""}`}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
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
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 hover:text-amber-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
