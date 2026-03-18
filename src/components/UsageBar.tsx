"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UsageBar() {
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    plan: string;
    throttled: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  if (!usage) return null;

  const pct = Math.min((usage.used / usage.limit) * 100, 100);

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            usage.throttled ? "bg-amber-500" : pct > 80 ? "bg-red-500" : "bg-indigo-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-500">
        {usage.used}/{usage.limit}
      </span>
      {usage.plan === "free" && usage.used >= usage.limit && (
        <Link href="/pricing" className="text-amber-400 hover:text-amber-300">
          Upgrade
        </Link>
      )}
    </div>
  );
}
