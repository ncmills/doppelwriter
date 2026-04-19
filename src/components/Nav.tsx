"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import UsageBar from "./UsageBar";
import Logo from "./Logo";

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, closeMenu]);

  const isActive = (href: string) =>
    pathname.startsWith(href) && !pathname.startsWith("/write-like");

  return (
    <nav
      aria-label="App navigation"
      className="border-b border-[var(--color-rule)] bg-[var(--color-paper)]/95 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center h-16 gap-4 sm:gap-8">
        <Link
          href="/home"
          aria-label="DoppelWriter — home"
          className="flex items-center gap-3 shrink-0 text-[var(--color-ink)]"
        >
          <Logo className="h-6 w-6 text-[var(--color-ink)]" />
          <span className="hidden sm:inline font-[family-name:var(--font-display)] font-bold text-xl tracking-[-0.02em]">
            DoppelWriter
          </span>
          <span className="sm:hidden font-[family-name:var(--font-display)] font-bold text-xl tracking-[-0.02em]">
            DW
          </span>
        </Link>
        <div className="flex items-baseline">
          <Link
            href="/write"
            className={`text-sm tracking-wide uppercase font-medium px-1 py-2 transition-colors ${
              isActive("/write")
                ? "text-[var(--color-ink)] border-b-2 border-[var(--color-accent)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            Write
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:block"><UsageBar /></div>
          {session?.user && (
            <>
              {/* Desktop nav links */}
              <div className="hidden sm:flex items-center gap-5">
                <Link
                  href="/home"
                  className={`ed-link text-xs uppercase tracking-[0.15em] py-2 ${
                    pathname === "/home"
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/settings"
                  className={`ed-link text-xs uppercase tracking-[0.15em] py-2 ${
                    pathname === "/settings"
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ed-link text-xs uppercase tracking-[0.15em] py-2 text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]"
                >
                  Sign out
                </button>
              </div>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-2 text-[var(--color-ink)] transition-colors"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      {/* Mobile dropdown menu */}
      {menuOpen && session?.user && (
        <div className="sm:hidden border-t border-[var(--color-rule)] bg-[var(--color-paper)] px-5 py-4 space-y-1">
          <UsageBar />
          <Link
            href="/home"
            onClick={() => setMenuOpen(false)}
            className={`block py-2.5 text-sm uppercase tracking-wide ${
              pathname === "/home" ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/settings"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-sm uppercase tracking-wide text-[var(--color-ink-soft)]"
          >
            Settings
          </Link>
          <button
            onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
            className="block py-2.5 text-sm uppercase tracking-wide text-[var(--color-ink-mute)]"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
