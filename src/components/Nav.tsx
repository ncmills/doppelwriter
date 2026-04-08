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
  const plan = (session?.user as Record<string, unknown>)?.plan;
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

  return (
    <nav aria-label="App navigation" className="border-b border-stone-800/40 bg-[#0C0A09]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-3 sm:gap-6">
        <Link href="/home" className="font-[family-name:var(--font-literata)] text-white font-bold text-lg shrink-0 flex items-center gap-0">
          <Logo className="h-[0.86em] w-auto mr-0.5 text-amber-600" />
          <span className="hidden sm:inline">DoppelWriter</span>
          <span className="sm:hidden">DW</span>
        </Link>
        <div className="flex gap-1">
          <Link
            href="/write"
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith("/write") && !pathname.startsWith("/write-like")
                ? "bg-amber-600/20 text-amber-400"
                : "text-stone-400 hover:text-white hover:bg-stone-800/40"
            }`}
          >
            Write
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block"><UsageBar /></div>
          {session?.user && (
            <>
              {/* Desktop nav links */}
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/home" className={`text-xs py-2 transition-colors ${pathname === "/home" ? "text-amber-400" : "text-stone-500 hover:text-stone-300"}`}>
                  Home
                </Link>
                <Link href="/settings" className={`text-xs py-2 transition-colors ${pathname === "/settings" ? "text-amber-400" : "text-stone-500 hover:text-stone-300"}`}>
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs py-2 text-stone-600 hover:text-stone-400"
                >
                  Sign out
                </button>
              </div>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-2 text-stone-400 hover:text-white transition-colors"
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
        <div className="sm:hidden border-t border-stone-800/40 bg-[#0C0A09] px-4 py-3 space-y-1">
          <UsageBar />
          <Link href="/home" onClick={() => setMenuOpen(false)} className={`block py-2.5 text-sm ${pathname === "/home" ? "text-amber-400" : "text-stone-400"}`}>
            Home
          </Link>
          <Link href="/settings" onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-stone-400">
            Settings
          </Link>
          <button
            onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
            className="block py-2.5 text-sm text-stone-600"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
