"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PricingPage() {
  const { data: session } = useSession();

  const [upgradeError, setUpgradeError] = useState("");

  const handleUpgrade = async () => {
    setUpgradeError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        setUpgradeError("Something went wrong. Please try again or contact support.");
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setUpgradeError("Connection error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-bold text-lg">DoppelWriter</Link>
          <div className="flex gap-4 items-center">
            {session ? (
              <Link href="/home" className="text-sm text-stone-400 hover:text-white">Home</Link>
            ) : (
              <Link href="/login" className="text-sm text-stone-400 hover:text-white">Log in</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-3 font-[family-name:var(--font-literata)]">Simple Pricing</h1>
        <p className="text-stone-400 text-center mb-12">Try it free. Upgrade when you&apos;re hooked.</p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-stone-900/40 border border-stone-800/40 rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-2 font-[family-name:var(--font-literata)]">Free</h2>
            <p className="text-4xl font-bold mb-6">$0<span className="text-base font-normal text-stone-500">/mo</span></p>
            <ul className="space-y-3 text-sm text-stone-400 mb-8">
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> 5 edits or generations per month</li>
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> 1 personal voice profile</li>
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> 3 curated writer profiles</li>
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> Upload docs, paste text</li>
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> Streaming editor & generator</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center py-2.5 border border-stone-600 hover:border-stone-400 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-amber-600/10 border border-amber-500/40 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-600 rounded-full text-xs font-medium">
              Most Popular
            </div>
            <h2 className="text-xl font-semibold text-amber-400 mb-2 font-[family-name:var(--font-literata)]">Pro</h2>
            <p className="text-4xl font-bold mb-6">$19<span className="text-base font-normal text-stone-500">/mo</span></p>
            <ul className="space-y-3 text-sm text-stone-300 mb-8">
              <li className="flex gap-2"><span className="text-amber-400">&#10003;</span> 200 edits & generations per month</li>
              <li className="flex gap-2"><span className="text-amber-400">&#10003;</span> Unlimited personal profiles</li>
              <li className="flex gap-2"><span className="text-amber-400">&#10003;</span> All 100+ curated writers</li>
              <li className="flex gap-2"><span className="text-amber-400">&#10003;</span> Request any custom writer</li>
              <li className="flex gap-2"><span className="text-amber-400">&#10003;</span> Email ingestion</li>
              <li className="flex gap-2"><span className="text-amber-400">&#10003;</span> Never blocked — just slows past 200</li>
            </ul>
            {session ? (
              <>
                <button
                  onClick={handleUpgrade}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
                >
                  Upgrade to Pro
                </button>
                {upgradeError && (
                  <p className="text-red-400 text-xs mt-2 text-center">{upgradeError}</p>
                )}
              </>
            ) : (
              <Link
                href="/signup"
                className="block text-center py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
              >
                Start Free, Upgrade Later
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-stone-600 text-sm mt-8">
          Pro users are never cut off — heavy usage past 200/month is gently throttled, never blocked.
        </p>
      </main>

      <footer className="border-t border-stone-800/40 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-600">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-stone-500 hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-stone-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-stone-500 hover:text-white transition-colors">Terms</Link>
          </div>
          <a href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry" className="text-xs text-stone-500 hover:text-amber-400 transition-colors">
            Enterprise &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
