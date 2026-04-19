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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/40 backdrop-blur-sm">
      <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] max-w-md w-full mx-4 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 border border-[var(--color-rule)] bg-[var(--color-paper-deep)] text-[var(--color-accent)] flex items-center justify-center text-xl font-[family-name:var(--font-display)] font-bold mx-auto mb-4">
            {used}
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-2 text-[var(--color-ink)]">
            You&apos;ve written {used} pieces this month
          </h2>
          <p className="text-[var(--color-ink-soft)] text-sm">
            You&apos;ve hit your free limit. Upgrade to keep writing.
          </p>
        </div>

        <hr className="rule mb-6" />

        {/* What Pro unlocks */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
            <span className="text-[var(--color-accent)]">&#10003;</span>
            <span>200 edits & generations per month</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
            <span className="text-[var(--color-accent)]">&#10003;</span>
            <span>Unlimited voice profiles</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
            <span className="text-[var(--color-accent)]">&#10003;</span>
            <span>Custom writer builds from any name</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
            <span className="text-[var(--color-accent)]">&#10003;</span>
            <span>Never blocked &mdash; heavy use just slows down</span>
          </div>
        </div>

        {/* Social proof */}
        <p className="text-center text-[var(--color-ink-mute)] text-xs mb-5 italic font-[family-name:var(--font-display)]">
          Join writers who create 10x more with Pro
        </p>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] uppercase tracking-[0.15em] text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Upgrade to Pro \u2014 $19/month"}
        </button>

        {error && <p className="text-[var(--color-accent)] text-xs text-center mt-2">{error}</p>}

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] text-sm transition-colors uppercase tracking-[0.15em]"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
