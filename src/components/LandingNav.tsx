"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo from "./Logo";
import { Button } from "./ui/Button";

export default function LandingNav() {
  const { data: session } = useSession();

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)]/95 backdrop-blur-sm z-50"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center h-16 justify-between">
        <Link
          href="/"
          aria-label="DoppelWriter — home"
          className="flex items-center gap-3 text-[var(--color-fg)]"
        >
          <Logo className="h-6 w-6 text-[var(--color-fg)]" />
          <span className="font-[family-name:var(--font-display)] font-bold text-xl tracking-[-0.02em]">
            DoppelWriter
          </span>
        </Link>
        <div className="flex gap-5 sm:gap-8 items-center">
          <Link
            href="/analyze"
            className="hidden sm:inline ed-link text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            Analyzer
          </Link>
          <Link
            href="/write-like/authors"
            className="hidden md:inline ed-link text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            Writers
          </Link>
          <Link
            href="/pricing"
            className="hidden sm:inline ed-link text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className="hidden md:inline ed-link text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            Guides
          </Link>
          {session?.user ? (
            <Button href="/write" size="sm" className="uppercase tracking-wide">
              Open editor
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className="ed-link text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                Log in
              </Link>
              <Button href="/signup" size="sm" className="uppercase tracking-wide">
                Start writing
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
