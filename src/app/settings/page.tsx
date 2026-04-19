"use client";

import { useSession } from "next-auth/react";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    plan: string;
    throttled: boolean;
  } | null>(null);
  const [stripeError, setStripeError] = useState("");
  const [referral, setReferral] = useState<{ code: string; count: number; bonus: number } | null>(null);
  const [refCopied, setRefCopied] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then(setUsage);
    fetch("/api/referral").then((r) => r.json()).then((r) => {
      if (r && !r.error) setReferral(r);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      setUpgraded(true);
      updateSession();
      window.history.replaceState({}, "", "/settings");
    }
  }, [updateSession]);

  const plan = (session?.user as Record<string, unknown>)?.plan as string;

  const handleUpgrade = async () => {
    setStripeError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        setStripeError("Something went wrong. Please try again.");
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setStripeError("Connection error. Please try again.");
    }
  };

  const handleManage = async () => {
    setStripeError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) {
        setStripeError("Something went wrong. Please try again.");
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setStripeError("Connection error. Please try again.");
    }
  };

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8 font-[family-name:var(--font-display)]">Settings</h1>

        {upgraded && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700/40 rounded-[2px] flex items-center justify-between">
            <span className="text-green-700 text-sm font-medium">You&apos;re on Pro! Your account has been upgraded.</span>
            <button onClick={() => setUpgraded(false)} className="text-green-700 hover:text-green-900 text-xs ml-4">Dismiss</button>
          </div>
        )}

        <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-display)]">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-soft)]">Email</span>
              <span>{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-soft)]">Name</span>
              <span>{session?.user?.name || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-display)]">Usage</h2>
          <div className="space-y-3 text-sm">
            {usage && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-ink-soft)]">Used this month</span>
                  <span>{usage.used} / {usage.limit}</span>
                </div>
                {usage.throttled && (
                  <p className="text-[var(--color-accent)] text-xs">
                    You&apos;ve passed your monthly soft cap. Requests are slowed but never blocked.
                  </p>
                )}
                <div className="w-full h-2 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] overflow-hidden">
                  <div
                    className={`h-full rounded-[2px] transition-all ${
                      usage.throttled ? "bg-[var(--color-accent)]" : usage.used / usage.limit > 0.8 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
          {plan === "pro" && (
            <div className="mt-5">
              <button onClick={handleManage} className="px-4 py-2 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] rounded-[2px] text-sm transition-colors">
                Manage Subscription
              </button>
              {stripeError && (
                <p className="text-red-700 text-xs mt-2">{stripeError}</p>
              )}
            </div>
          )}
        </div>
        {/* Referral */}
        {referral && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-display)]">Referrals</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-soft)]">Friends invited</span>
                <span>{referral.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-soft)]">Bonus uses earned</span>
                <span className="text-green-700">+{referral.bonus}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  readOnly
                  value={`https://doppelwriter.com/?ref=${referral.code}`}
                  className="flex-1 px-3 py-2 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-sm text-[var(--color-ink-soft)] focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://doppelwriter.com/?ref=${referral.code}`);
                    setRefCopied(true);
                    setTimeout(() => setRefCopied(false), 2000);
                  }}
                  className="px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-sm font-medium transition-colors shrink-0"
                >
                  {refCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-[var(--color-ink-mute)]">You and your friend both get +5 free uses.</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
