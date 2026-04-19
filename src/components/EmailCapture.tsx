"use client";

import { useState } from "react";
import posthog from "posthog-js";

interface EmailCaptureProps {
  source: string;
  sourceSlug: string;
  headline?: string;
}

export default function EmailCapture({
  source,
  sourceSlug,
  headline = "Get notified when we add new voices",
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, sourceSlug }),
      });
      if (!res.ok) throw new Error("Subscribe failed");
      try {
        posthog.capture("email_captured", { source, sourceSlug });
      } catch {}
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] p-6 text-center">
        <p className="text-[var(--color-accent)] font-[family-name:var(--font-display)] italic">You&apos;re on the list!</p>
        <p className="text-[var(--color-ink-soft)] text-sm mt-1">We&apos;ll let you know when new voices drop.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] p-6">
      <p className="font-[family-name:var(--font-display)] font-medium mb-3 text-[var(--color-ink)]">{headline}</p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-[var(--color-paper)] border border-[var(--color-rule)] px-4 py-2 text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:outline-none text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] uppercase tracking-[0.15em] text-xs font-medium transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Notify Me"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-[var(--color-accent)] text-sm mt-2">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
