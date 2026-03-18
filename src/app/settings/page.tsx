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

  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then(setUsage);
  }, []);

  const plan = (session?.user as Record<string, unknown>)?.plan as string;

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const handleManage = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span>{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span>{session?.user?.name || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Plan & Usage</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Plan</span>
              <span className={plan === "pro" ? "text-indigo-400 font-medium" : ""}>
                {plan === "pro" ? "Pro — $19/mo" : "Free"}
              </span>
            </div>
            {usage && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Used this month</span>
                  <span>{usage.used} / {usage.limit}</span>
                </div>
                {usage.throttled && (
                  <p className="text-amber-400 text-xs">
                    You&apos;ve passed your monthly soft cap. Requests are slowed but never blocked.
                  </p>
                )}
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usage.throttled ? "bg-amber-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-5">
            {plan === "pro" ? (
              <button onClick={handleManage} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                Manage Subscription
              </button>
            ) : (
              <button onClick={handleUpgrade} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">
                Upgrade to Pro — $19/mo
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
