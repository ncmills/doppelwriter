"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0C0A09] text-[#FAFAF9] antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-5xl font-bold text-amber-600 mb-4">Oops</h1>
            <h2 className="text-xl font-semibold mb-3">Something went wrong</h2>
            <p className="text-stone-400 mb-8">
              An unexpected error occurred. Try again or head back to the homepage.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-5 py-2.5 border border-stone-600 hover:border-stone-400 rounded-lg transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
