"use client";

import { useState } from "react";

interface UpgradeModalProps {
  used: number;
  onClose: () => void;
}

export default function UpgradeModal({ used, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-700 rounded-xl max-w-md w-full mx-4 p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center text-xl font-bold mx-auto mb-4">
            {used}
          </div>
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">
            You&apos;ve written {used} pieces this month
          </h2>
          <p className="text-stone-400 text-sm">
            You&apos;ve hit your free limit. Upgrade to keep writing.
          </p>
        </div>

        {/* What Pro unlocks */}
        <div className="bg-stone-800/50 rounded-lg p-4 mb-6 space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">&#10003;</span>
            <span>200 edits & generations per month</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">&#10003;</span>
            <span>Unlimited voice profiles</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">&#10003;</span>
            <span>Custom writer builds from any name</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">&#10003;</span>
            <span>Never blocked — heavy use just slows down</span>
          </div>
        </div>

        {/* Social proof */}
        <p className="text-center text-stone-500 text-xs mb-5">
          Join writers who create 10x more with Pro
        </p>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Upgrade to Pro — $19/month"}
        </button>

        {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-stone-500 hover:text-stone-300 text-sm transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
