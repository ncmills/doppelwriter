"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { trackSignup } from "@/lib/analytics";

export default function SignupPage() {
  useEffect(() => { document.title = "Sign Up | DoppelWriter"; }, []);

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

    const ref = localStorage.getItem("dw_ref") || undefined;
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, ref }),
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
    trackSignup("email");

    // Auto-login after 2 seconds (they can verify later)
    setTimeout(async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result?.error) window.location.href = "/write";
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center px-4">
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
        ) : (
          <>
            <button
              onClick={() => { trackSignup("google"); signIn("google", { callbackUrl: "/write" }); }}
              className="w-full py-3 border border-stone-700 hover:border-stone-500 rounded-lg text-sm text-stone-300 hover:text-white transition-colors flex items-center justify-center gap-3 mb-5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-stone-800" />
              <span className="text-xs text-stone-600">or sign up with email</span>
              <div className="flex-1 h-px bg-stone-800" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
          </>
        )}
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
