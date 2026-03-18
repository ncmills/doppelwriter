"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

interface Draft {
  id: number;
  title: string;
  mode: string;
  profile_name: string | null;
  updated_at: string;
  content: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ profiles: 0, samples: 0, drafts: 0 });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/samples").then((r) => r.json()),
      fetch("/api/drafts").then((r) => r.json()),
      fetch("/api/usage").then((r) => r.json()),
    ]).then(([profiles, samples, draftsData, usageData]) => {
      setStats({ profiles: profiles.length, samples: samples.length, drafts: draftsData.length });
      setDrafts(draftsData.slice(0, 5));
      setUsage(usageData);
    });
  }, []);

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8 font-[family-name:var(--font-literata)]">Dashboard</h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Style Profiles", value: stats.profiles, color: "text-amber-400" },
            { label: "Writing Samples", value: stats.samples, color: "text-green-400" },
            { label: "Drafts", value: stats.drafts, color: "text-amber-400" },
            {
              label: "Usage",
              value: usage ? (usage.limit === -1 ? "Unlimited" : `${usage.used}/${usage.limit}`) : "...",
              color: usage?.plan === "pro" ? "text-amber-400" : "text-stone-400",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
              <p className="text-stone-400 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link
            href="/editor"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group"
          >
            <h3 className="text-lg font-semibold group-hover:text-amber-400 transition-colors">Edit a Draft</h3>
            <p className="text-stone-400 text-sm mt-1">Refine your writing in any voice</p>
          </Link>
          <Link
            href="/generate"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group"
          >
            <h3 className="text-lg font-semibold group-hover:text-amber-400 transition-colors">Write Something New</h3>
            <p className="text-stone-400 text-sm mt-1">Generate a first draft from a brief</p>
          </Link>
          <Link
            href="/writers"
            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group"
          >
            <h3 className="text-lg font-semibold group-hover:text-amber-400 transition-colors">Browse Writers</h3>
            <p className="text-stone-400 text-sm mt-1">Explore curated voice profiles</p>
          </Link>
        </div>

        {drafts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 font-[family-name:var(--font-literata)]">Recent Drafts</h2>
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div key={draft.id} className="bg-stone-900/50 border border-stone-800/40 rounded-lg px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{draft.title}</p>
                    <p className="text-sm text-stone-400">
                      {draft.profile_name && <span className="text-amber-400">{draft.profile_name}</span>}
                      {draft.profile_name && " · "}
                      {draft.mode} · {new Date(draft.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-stone-500 text-sm">{draft.content?.split(/\s+/).length || 0} words</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
