"use client";

import { useEffect, useState, useCallback } from "react";
import UpgradeModal from "./UpgradeModal";

export default function UsageBar() {
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string; throttled: boolean } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const refreshUsage = useCallback(() => {
    fetch("/api/usage").then((r) => r.json()).then(setUsage).catch(() => {});
  }, []);

  useEffect(() => {
    refreshUsage();
    window.addEventListener("dw:usage-changed", refreshUsage);
    return () => window.removeEventListener("dw:usage-changed", refreshUsage);
  }, [refreshUsage]);

  if (!usage) return null;

  const pct = Math.min((usage.used / usage.limit) * 100, 100);
  const atLimit = usage.plan === "free" && usage.used >= usage.limit;

  return (
    <>
      {showModal && <UpgradeModal used={usage.used} onClose={() => setShowModal(false)} />}
      <div
        className={`flex items-center gap-3 text-xs ${atLimit ? "cursor-pointer" : ""}`}
        onClick={atLimit ? () => setShowModal(true) : undefined}
      >
        <div className="w-24 h-1 bg-[var(--color-rule)] overflow-hidden">
          <div
            className={`h-full transition-all ${usage.throttled ? "bg-orange-600" : pct > 80 ? "bg-[var(--color-accent)]" : "bg-[var(--color-ink)]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[var(--color-ink-mute)] font-mono">{usage.used}/{usage.limit}</span>
        {atLimit && (
          <span className="text-[var(--color-accent)] uppercase tracking-[0.15em] hover:text-[var(--color-ink)]">Upgrade</span>
        )}
      </div>
    </>
  );
}
