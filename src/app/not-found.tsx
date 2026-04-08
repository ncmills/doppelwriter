import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-amber-600 mb-4 font-[family-name:var(--font-literata)]">404</h1>
        <h2 className="text-xl font-semibold mb-3">Page not found</h2>
        <p className="text-stone-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/write"
            className="px-5 py-2.5 border border-stone-600 hover:border-stone-400 rounded-lg transition-colors"
          >
            Start Writing
          </Link>
        </div>
      </div>
    </div>
  );
}
