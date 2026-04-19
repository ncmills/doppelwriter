"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { trackLogin } from "@/lib/analytics";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => { document.title = "Log In | DoppelWriter"; }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") setVerified(true);
    if (params.get("error") === "invalid_token") setTokenError(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      trackLogin("email");
      window.location.href = "/write";
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center px-4">
      <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-6 text-center font-[family-name:var(--font-display)]">Log In</h1>
        {verified && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700/40 rounded-[2px] text-green-700 text-sm text-center">
            Email verified! You can now log in.
          </div>
        )}
        {tokenError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/40 rounded-[2px] text-red-700 text-sm text-center">
            Verification link is invalid or expired.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="sr-only">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              inputMode="email"
              className="w-full px-4 py-3 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink)] placeholder-[var(--color-ink-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="login-password" className="sr-only">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink)] placeholder-[var(--color-ink-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <div className="mt-1.5 text-right">
              <Link href="/forgot-password" className="text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-accent)] transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Log In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--color-rule)]" />
          <span className="text-xs text-[var(--color-ink-mute)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-rule)]" />
        </div>

        <button
          onClick={() => { trackLogin("google"); signIn("google", { callbackUrl: "/write" }); }}
          className="w-full py-3 border border-[var(--color-rule)] hover:border-[var(--color-ink)] rounded-[2px] text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-5 text-center text-sm text-[var(--color-ink-mute)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--color-accent)] hover:text-[var(--color-ink)]">
            Sign up
          </Link>
        </p>
        <div className="mt-6 pt-6 border-t border-[var(--color-rule)]">
          <a
            href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry%20-%20DoppelWriter%20for%20Business&body=Hi%20DoppelWriter%20team%2C%0A%0AI%27m%20interested%20in%20building%20DoppelWriter%20for%20our%20organization%27s%20internal%20use.%0A%0ACompany%3A%20%0ATeam%20size%3A%20%0AUse%20case%3A%20%0A%0AThanks!"
            className="block w-full py-2.5 border border-[var(--color-rule)] hover:border-[var(--color-ink)] rounded-[2px] text-center text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
          >
            Business? Build DoppelWriter for your team &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
