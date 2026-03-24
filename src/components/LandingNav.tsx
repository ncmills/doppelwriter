"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo from "./Logo";

export default function LandingNav() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
        <span className="font-[family-name:var(--font-literata)] font-bold text-lg flex items-center gap-2">
            <Logo className="w-5 h-5 text-amber-600" />
            DoppelWriter
          </span>
        <div className="flex gap-4 items-center">
          <Link href="/pricing" className="text-sm text-stone-400 hover:text-white transition-colors">
            Pricing
          </Link>
          {session?.user ? (
            <Link
              href="/write"
              className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
            >
              Go to App
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-stone-400 hover:text-white transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
              >
                Start Writing
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
