"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import UsageBar from "./UsageBar";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/editor", label: "Editor" },
  { href: "/generate", label: "Generate" },
  { href: "/writers", label: "Writers" },
  { href: "/samples", label: "Samples" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-700/40 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center h-14 gap-6">
        <Link href="/dashboard" className="text-white font-bold text-lg shrink-0">
          DoppelWriter
        </Link>
        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === link.href
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/40"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <UsageBar />
          {session?.user && (
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {(session.user as Record<string, unknown>).plan === "pro" ? (
                  <span className="text-indigo-400">Pro</span>
                ) : (
                  <Link href="/pricing" className="text-amber-400 hover:text-amber-300">
                    Upgrade
                  </Link>
                )}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-gray-500 hover:text-gray-300"
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
