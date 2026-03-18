"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import UsageBar from "./UsageBar";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/doppelwrite", label: "DoppelWrite" },
  { href: "/create", label: "Create" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const plan = (session?.user as Record<string, unknown>)?.plan;

  return (
    <nav className="border-b border-stone-800/40 bg-[#0C0A09]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center h-14 gap-6">
        <Link href="/dashboard" className="font-[family-name:var(--font-literata)] text-white font-bold text-lg shrink-0">
          DoppelWriter
        </Link>
        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-amber-600/20 text-amber-400"
                  : "text-stone-400 hover:text-white hover:bg-stone-800/40"
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
              {plan === "pro" ? (
                <Link href="/settings" className="text-xs text-amber-400">Pro</Link>
              ) : (
                <Link href="/pricing" className="text-xs text-amber-400 hover:text-amber-300">Upgrade</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-stone-500 hover:text-stone-300"
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
