"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import UsageBar from "./UsageBar";
import Logo from "./Logo";

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const plan = (session?.user as Record<string, unknown>)?.plan;

  return (
    <nav className="border-b border-stone-800/40 bg-[#0C0A09]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center h-14 gap-4 sm:gap-6">
        <Link href="/home" className="font-[family-name:var(--font-literata)] text-white font-bold text-lg shrink-0 flex items-center gap-2">
          <Logo className="w-5 h-5 text-amber-600" />
          DoppelWriter
        </Link>
        <div className="flex gap-1">
          <Link
            href="/write"
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith("/write") && !pathname.startsWith("/write-like")
                ? "bg-amber-600/20 text-amber-400"
                : "text-stone-400 hover:text-white hover:bg-stone-800/40"
            }`}
          >
            Write
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <UsageBar />
          {session?.user && (
            <div className="flex items-center gap-3">
              <Link href="/home" className={`text-xs transition-colors ${pathname === "/home" ? "text-amber-400" : "text-stone-500 hover:text-stone-300"}`}>
                Home
              </Link>
              <Link href="/settings" className="text-xs text-stone-500 hover:text-stone-300">
                Settings
              </Link>
              {plan === "pro" ? (
                <span className="text-xs text-amber-400">Pro</span>
              ) : (
                <Link href="/pricing" className="text-xs text-amber-400 hover:text-amber-300">Upgrade</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-stone-600 hover:text-stone-400"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
