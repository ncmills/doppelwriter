"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Cycle = "monthly" | "annual";

const MONTHLY = 19;
const ANNUAL = 15;

// Expo-out interpolation toward the cycle's target price.
function usePriceCount(cycle: Cycle): number {
  const target = cycle === "annual" ? ANNUAL : MONTHLY;
  const [value, setValue] = useState(target);
  const startRef = useRef(target);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      startRef.current = target;
      setValue(target);
      return;
    }
    const start = value;
    startRef.current = start;
    if (start === target) return;
    const t0 = performance.now();
    const duration = 280;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(2, -10 * t); // Expo-out
      setValue(start + (target - start) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const [cycle, setCycle] = useState<Cycle>("annual");
  const [upgradeError, setUpgradeError] = useState("");

  // Sliding indicator on the toggle pill — measured from the active button.
  const monthlyRef = useRef<HTMLButtonElement>(null);
  const annualRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const target = cycle === "monthly" ? monthlyRef.current : annualRef.current;
    if (target) {
      setIndicator({ left: target.offsetLeft, width: target.offsetWidth });
    }
  }, [cycle]);

  // Re-measure on resize so the indicator stays glued to the active button.
  useEffect(() => {
    const measure = () => {
      const target = cycle === "monthly" ? monthlyRef.current : annualRef.current;
      if (target) setIndicator({ left: target.offsetLeft, width: target.offsetWidth });
    };
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cycle]);

  const handleUpgrade = async () => {
    setUpgradeError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle }),
      });
      if (!res.ok) {
        setUpgradeError("Something went wrong. Please try again or contact support.");
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setUpgradeError("Connection error. Please try again.");
    }
  };

  const animatedPrice = usePriceCount(cycle);
  const proPriceDisplay = `$${Math.round(animatedPrice)}`;
  const proPriceSuffix = cycle === "annual" ? "/mo, billed annually" : "/mo";

  return (
    <div className="min-h-screen">
      <nav className="border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-bold text-lg">DoppelWriter</Link>
          <div className="flex gap-4 items-center">
            {session ? (
              <Link href="/home" className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">Home</Link>
            ) : (
              <Link href="/login" className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">Log in</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3 font-[family-name:var(--font-display)]">Simple Pricing</h1>
        <p className="text-[var(--color-fg-muted)] text-center mb-8">Try it free. Upgrade when you&apos;re hooked.</p>

        <div className="flex justify-center mb-10">
          <div className="relative inline-flex items-center bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] p-1 text-sm">
            {/* Sliding ink indicator — measured from the active button */}
            <span
              aria-hidden
              className="cycle-indicator absolute top-1 bottom-1 bg-[var(--color-fg)] rounded-[2px]"
              style={{
                left: indicator.left,
                width: indicator.width || 0,
                opacity: indicator.width ? 1 : 0,
              }}
            />
            <button
              ref={monthlyRef}
              onClick={() => setCycle("monthly")}
              className={`relative z-10 px-4 py-1.5 rounded-[2px] transition-colors ${cycle === "monthly" ? "text-[var(--color-surface)]" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"}`}
            >
              Monthly
            </button>
            <button
              ref={annualRef}
              onClick={() => setCycle("annual")}
              className={`relative z-10 px-4 py-1.5 rounded-[2px] transition-colors ${cycle === "annual" ? "text-[var(--color-surface)]" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"}`}
            >
              Annual <span className="text-xs opacity-80">— save $48</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[2px] p-5 sm:p-8">
            <h2 className="text-xl font-semibold mb-2 font-[family-name:var(--font-display)]">Free</h2>
            <p className="text-4xl font-bold mb-6">$0<span className="text-base font-normal text-[var(--color-fg-muted)]">/mo</span></p>
            <ul className="space-y-3 text-sm text-[var(--color-fg-muted)] mb-8">
              <li className="flex gap-2"><span className="text-[var(--color-fg)]">&#10003;</span> 20 edits or generations per month</li>
              <li className="flex gap-2"><span className="text-[var(--color-fg)]">&#10003;</span> 1 personal voice profile</li>
              <li className="flex gap-2"><span className="text-[var(--color-fg)]">&#10003;</span> 3 curated writer profiles</li>
              <li className="flex gap-2"><span className="text-[var(--color-fg)]">&#10003;</span> Upload docs, paste text</li>
              <li className="flex gap-2"><span className="text-[var(--color-fg)]">&#10003;</span> Streaming editor & generator</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center py-2.5 border border-[var(--color-border)] hover:border-[var(--color-fg)] rounded-[2px] transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-fg)] rounded-[2px] p-5 sm:p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[var(--color-fg)] text-[var(--color-surface)] rounded-[2px] text-xs font-medium">
              Most Popular
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-brand)] mb-2 font-[family-name:var(--font-display)]">Pro</h2>
            <p className="text-4xl font-bold mb-1 tabular-nums">
              {proPriceDisplay}
              <span className="text-base font-normal text-[var(--color-fg-muted)]">{proPriceSuffix}</span>
            </p>
            <div className="mb-6 h-5 relative">
              {cycle === "annual" ? (
                <span
                  key="annual-savings"
                  className="savings-badge inline-block text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand)] border border-[var(--color-brand)] px-2 py-[2px]"
                >
                  Save $48 / year
                </span>
              ) : (
                <span className="text-xs text-[var(--color-fg-muted)]">$19/mo</span>
              )}
            </div>
            <ul className="space-y-3 text-sm text-[var(--color-fg-muted)] mb-8">
              <li className="flex gap-2"><span className="text-[var(--color-brand)]">&#10003;</span> 200 edits & generations per month</li>
              <li className="flex gap-2"><span className="text-[var(--color-brand)]">&#10003;</span> Unlimited personal profiles</li>
              <li className="flex gap-2"><span className="text-[var(--color-brand)]">&#10003;</span> All 100+ curated writers</li>
              <li className="flex gap-2"><span className="text-[var(--color-brand)]">&#10003;</span> Request any custom writer</li>
              <li className="flex gap-2"><span className="text-[var(--color-brand)]">&#10003;</span> Email ingestion</li>
              <li className="flex gap-2"><span className="text-[var(--color-brand)]">&#10003;</span> Never blocked — just slows past 200</li>
            </ul>
            {session ? (
              <>
                <button
                  onClick={handleUpgrade}
                  className="w-full py-2.5 bg-[var(--color-fg)] text-[var(--color-surface)] hover:bg-[var(--color-brand)] rounded-[2px] font-medium transition-colors"
                >
                  {cycle === "annual" ? "Upgrade — $180/yr" : "Upgrade — $19/mo"}
                </button>
                {upgradeError && (
                  <p className="text-[var(--color-brand)] text-xs mt-2 text-center">{upgradeError}</p>
                )}
              </>
            ) : (
              <Link
                href={`/signup?cycle=${cycle}`}
                className="block text-center py-2.5 bg-[var(--color-fg)] text-[var(--color-surface)] hover:bg-[var(--color-brand)] rounded-[2px] font-medium transition-colors"
              >
                Start Free, Upgrade Later
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-[var(--color-fg-muted)] text-sm mt-8 max-w-[60ch] mx-auto">
          Pro users are never cut off — heavy usage past 200/month is gently throttled, never blocked.
        </p>
      </main>

      <footer className="border-t border-[var(--color-border)] py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[var(--color-fg-muted)]">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors">Terms</Link>
          </div>
          <a href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry" className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-brand)] transition-colors">
            Enterprise &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
