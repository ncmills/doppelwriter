"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PricingPage() {
  const { data: session } = useSession();

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-800/40 sticky top-0 bg-slate-950/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-bold text-lg">DoppelWriter</Link>
          <div className="flex gap-4 items-center">
            {session ? (
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">Dashboard</Link>
            ) : (
              <Link href="/login" className="text-sm text-gray-400 hover:text-white">Log in</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-3">Simple Pricing</h1>
        <p className="text-gray-400 text-center mb-12">Try it free. Upgrade when you&apos;re hooked.</p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-2">Free</h2>
            <p className="text-4xl font-bold mb-6">$0<span className="text-base font-normal text-gray-500">/mo</span></p>
            <ul className="space-y-3 text-sm text-gray-400 mb-8">
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> 5 edits or generations per month</li>
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> 1 personal voice profile</li>
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> 3 curated writer profiles</li>
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> Upload docs, paste text</li>
              <li className="flex gap-2"><span className="text-green-400">&#10003;</span> Streaming editor & generator</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center py-2.5 border border-gray-600 hover:border-gray-400 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-indigo-600/10 border border-indigo-500/40 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 rounded-full text-xs font-medium">
              Most Popular
            </div>
            <h2 className="text-xl font-semibold text-indigo-400 mb-2">Pro</h2>
            <p className="text-4xl font-bold mb-6">$19<span className="text-base font-normal text-gray-500">/mo</span></p>
            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              <li className="flex gap-2"><span className="text-indigo-400">&#10003;</span> 200 edits & generations per month</li>
              <li className="flex gap-2"><span className="text-indigo-400">&#10003;</span> Unlimited personal profiles</li>
              <li className="flex gap-2"><span className="text-indigo-400">&#10003;</span> All 12+ curated writers</li>
              <li className="flex gap-2"><span className="text-indigo-400">&#10003;</span> Request any custom writer</li>
              <li className="flex gap-2"><span className="text-indigo-400">&#10003;</span> Email ingestion</li>
              <li className="flex gap-2"><span className="text-indigo-400">&#10003;</span> Never blocked — just slows past 200</li>
            </ul>
            {session ? (
              <button
                onClick={handleUpgrade}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors"
              >
                Upgrade to Pro
              </button>
            ) : (
              <Link
                href="/signup"
                className="block text-center py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors"
              >
                Start Free, Upgrade Later
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          Pro users are never cut off — heavy usage past 200/month is gently throttled, never blocked.
        </p>
      </main>
    </div>
  );
}
