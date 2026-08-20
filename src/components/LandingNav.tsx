"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo from "./Logo";
import { Button } from "./ui/Button";

const NAV_LINKS = [
  { href: "/analyze", label: "Analyzer", desktop: "hidden sm:inline" },
  { href: "/write-like/authors", label: "Writers", desktop: "hidden md:inline" },
  { href: "/pricing", label: "Pricing", desktop: "hidden sm:inline" },
  { href: "/blog", label: "Guides", desktop: "hidden md:inline" },
];

export default function LandingNav() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)]/95 backdrop-blur-sm z-50"
    >
      <div className="px-5 sm:px-8 lg:px-20 flex items-center h-16 justify-between">
        <Link
          href="/"
          aria-label="DoppelWriter — home"
          className="flex items-center gap-3 text-[var(--color-fg)]"
        >
          <Logo className="h-6 w-6 text-[var(--color-fg)]" />
          <span className="font-[family-name:var(--font-display)] font-bold text-lg sm:text-xl tracking-[-0.02em]">
            DoppelWriter
          </span>
        </Link>
        <div className="flex gap-2 sm:gap-8 items-center">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${l.desktop} ed-link text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]`}
            >
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <Button
              href="/write"
              size="sm"
              className="uppercase tracking-wide whitespace-nowrap max-sm:min-h-11"
            >
              Open editor
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline ed-link text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                Log in
              </Link>
              <Button
                href="/signup"
                size="sm"
                className="uppercase tracking-wide whitespace-nowrap max-sm:min-h-11"
              >
                Start writing
              </Button>
            </>
          )}
          {/* Mobile menu affordance — holds the nav links + Log in that the
              narrow header can't fit. 44px tap target; icon inked to the
              right gutter via the negative margin. */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-nav-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden inline-flex h-11 w-11 -mr-3 items-center justify-center text-[var(--color-fg)]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              {menuOpen ? (
                <>
                  <line x1="3" y1="3" x2="15" y2="15" />
                  <line x1="15" y1="3" x2="3" y2="15" />
                </>
              ) : (
                <>
                  <line x1="2" y1="5.5" x2="16" y2="5.5" />
                  <line x1="2" y1="12.5" x2="16" y2="12.5" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div
          id="landing-nav-menu"
          className="sm:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center min-h-11 px-5 text-sm text-[var(--color-fg)] border-b border-[var(--color-border)] last:border-b-0"
            >
              {l.label}
            </Link>
          ))}
          {!session?.user && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center min-h-11 px-5 text-sm text-[var(--color-fg)]"
            >
              Log in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
