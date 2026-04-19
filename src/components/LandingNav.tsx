"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo from "./Logo";

export default function LandingNav() {
  const { data: session } = useSession();

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-[var(--color-rule)] sticky top-0 bg-[var(--color-paper)]/95 backdrop-blur-sm z-50"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center h-16 justify-between">
        <Link
          href="/"
          aria-label="DoppelWriter — home"
          className="flex items-center gap-3 text-[var(--color-ink)]"
        >
          <Logo className="h-6 w-6 text-[var(--color-ink)]" />
          <span className="font-[family-name:var(--font-display)] font-bold text-xl tracking-[-0.02em]">
            DoppelWriter
          </span>
        </Link>
        <div className="flex gap-5 sm:gap-8 items-center">
          <Link
            href="/analyze"
            className="hidden sm:inline ed-link text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
          >
            Analyzer
          </Link>
          <Link
            href="/blog"
            className="hidden sm:inline ed-link text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
          >
            Journal
          </Link>
          {session?.user ? (
            <Link
              href="/write"
              className="text-sm px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] transition-colors uppercase tracking-wide font-medium"
              style={{ borderRadius: "2px" }}
            >
              Open editor
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="ed-link text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] transition-colors uppercase tracking-wide font-medium"
                style={{ borderRadius: "2px" }}
              >
                Start writing
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
