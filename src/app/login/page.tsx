"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center">
      <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center font-[family-name:var(--font-literata)]">Log In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Log In"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300">
            Sign up
          </Link>
        </p>
        <div className="mt-6 pt-6 border-t border-stone-800/40">
          <a
            href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry%20-%20DoppelWriter%20for%20Business&body=Hi%20DoppelWriter%20team%2C%0A%0AI%27m%20interested%20in%20building%20DoppelWriter%20for%20our%20organization%27s%20internal%20use.%0A%0ACompany%3A%20%0ATeam%20size%3A%20%0AUse%20case%3A%20%0A%0AThanks!"
            className="block w-full py-2.5 border border-stone-700 hover:border-stone-500 rounded-lg text-center text-sm text-stone-400 hover:text-white transition-colors"
          >
            Business? Build DoppelWriter for your team &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
