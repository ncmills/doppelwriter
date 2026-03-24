"use client";

import { useSession } from "next-auth/react";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    plan: string;
    throttled: boolean;
  } | null>(null);
  const [stripeError, setStripeError] = useState("");
  const [referral, setReferral] = useState<{ code: string; count: number; bonus: number } | null>(null);
  const [refCopied, setRefCopied] = useState(false);

  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then(setUsage);
    fetch("/api/referral").then((r) => r.json()).then((r) => {
      if (r && !r.error) setReferral(r);
    }).catch(() => {});
  }, []);

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
        <h1 className="text-2xl font-bold mb-8 font-[family-name:var(--font-literata)]">Settings</h1>

        <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-literata)]">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-400">Email</span>
              <span>{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Name</span>
              <span>{session?.user?.name || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-literata)]">Plan & Usage</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Plan</span>
              <span className={plan === "pro" ? "text-amber-400 font-medium" : ""}>
                {plan === "pro" ? "Pro — $19/mo" : "Free"}
              </span>
            </div>
            {usage && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Used this month</span>
                  <span>{usage.used} / {usage.limit}</span>
                </div>
                {usage.throttled && (
                  <p className="text-amber-400 text-xs">
                    You&apos;ve passed your monthly soft cap. Requests are slowed but never blocked.
                  </p>
                )}
                <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usage.throttled ? "bg-amber-500" : usage.used / usage.limit > 0.8 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-5">
            {plan === "pro" ? (
              <button onClick={handleManage} className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm transition-colors">
                Manage Subscription
              </button>
            ) : (
              <button onClick={handleUpgrade} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
                Upgrade to Pro — $19/mo
              </button>
            )}
            {stripeError && (
              <p className="text-red-400 text-xs mt-2">{stripeError}</p>
            )}
          </div>
        </div>
        {/* Referral */}
        {referral && (
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-literata)]">Referrals</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-400">Friends invited</span>
                <span>{referral.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Bonus uses earned</span>
                <span className="text-green-400">+{referral.bonus}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  readOnly
                  value={`https://doppelwriter.com/?ref=${referral.code}`}
                  className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://doppelwriter.com/?ref=${referral.code}`);
                    setRefCopied(true);
                    setTimeout(() => setRefCopied(false), 2000);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors shrink-0"
                >
                  {refCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-stone-500">You and your friend both get +5 free uses.</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
