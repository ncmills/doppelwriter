"use client";

import { useState } from "react";

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
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 text-center">
        <p className="text-amber-400 font-medium">You&apos;re on the list!</p>
        <p className="text-stone-400 text-sm mt-1">We&apos;ll let you know when new voices drop.</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6">
      <p className="font-[family-name:var(--font-literata)] font-medium mb-3">{headline}</p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-4 py-2 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Notify Me"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-400 text-sm mt-2">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
