"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-[var(--color-accent)] mb-4 font-[family-name:var(--font-display)]">Oops</h1>
        <h2 className="text-xl font-semibold mb-3">Something went wrong</h2>
        <p className="text-[var(--color-ink-soft)] mb-8">
          An unexpected error occurred. Try again or head back to the homepage.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-[var(--color-rule)] hover:border-[var(--color-ink)] rounded-[2px] transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
