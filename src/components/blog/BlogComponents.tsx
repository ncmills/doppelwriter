// Custom MDX components available to engine-generated blog posts on doppelwriter.
// Styled with the site's semantic design tokens (per CLAUDE.md — never raw palette).
// Keep this list in sync with .blog-agent/brief.md.
import Link from "next/link";
import type { ReactNode } from "react";

/** Primary conversion CTA into the DoppelWriter tool. */
export function WriteCTA({ label = "Try DoppelWriter — write in your own voice" }: { label?: string }) {
  return (
    <div className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 text-center">
      <Link
        href="/create"
        className="inline-block rounded-lg bg-[var(--color-brand)] px-5 py-3 font-medium text-white no-underline hover:opacity-90"
      >
        {label}
      </Link>
    </div>
  );
}

/** A highlighted callout / aside. */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-[var(--color-brand)] bg-[var(--color-surface-raised)] px-5 py-4 text-[var(--color-fg)]">
      {children}
    </div>
  );
}

/** An extractable data/insight box (AI-citation friendly). */
export function DataHook({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 text-[var(--color-fg)] shadow-sm">
      {children}
    </div>
  );
}

/** A single key statistic. */
export function KeyStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="my-6 rounded-lg bg-[var(--color-brand)] px-6 py-5 text-center text-white">
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm opacity-80">{label}</div>
    </div>
  );
}
