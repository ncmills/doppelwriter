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

interface Profile {
  id: number;
  name: string;
  is_curated: boolean;
  writer_name: string | null;
}

export default function DashboardPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/drafts").then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/usage").then((r) => r.json()),
    ]).then(([d, p, u]) => {
      setDrafts(d);
      setProfiles(p);
      setUsage(u);
    });
  }, []);

  const personalProfiles = profiles.filter((p) => !p.is_curated);
  const recentCurated = profiles.filter((p) => p.is_curated).slice(0, 4);

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-literata)] text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <p className="text-stone-400 text-sm">Projects</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{drafts.length}</p>
          </div>
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <p className="text-stone-400 text-sm">My DoppelWriters</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{personalProfiles.length}</p>
          </div>
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <p className="text-stone-400 text-sm">Drafts</p>
            <p className="text-2xl font-bold mt-1 text-green-400">{drafts.length}</p>
          </div>
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5">
            <p className="text-stone-400 text-sm">Usage</p>
            <p className="text-2xl font-bold mt-1 text-stone-300">
              {usage ? (usage.limit === -1 ? `${usage.used}` : `${usage.used}/${usage.limit}`) : "..."}
            </p>
          </div>
        </div>

        {/* DoppelWriters section */}
        {(personalProfiles.length > 0 || recentCurated.length > 0) && (
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-4">Your DoppelWriters</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {personalProfiles.map((p) => (
                <div key={p.id} className="bg-stone-900/50 border border-amber-500/30 rounded-lg p-4 hover:border-amber-500/60 transition-colors">
                  <Link href={`/doppelwrite/personal?id=${p.id}`}>
                    <p className="font-medium text-sm">{p.name}</p>
                  </Link>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-stone-500">Personal voice</p>
                    <Link href={`/profile/${p.id}`} className="text-[10px] text-amber-400 hover:text-amber-300">View profile</Link>
                  </div>
                </div>
              ))}
              {recentCurated.map((p) => (
                <Link key={p.id} href={`/doppelwrite/curated?id=${p.id}`}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors">
                  <p className="font-medium text-sm">{p.writer_name || p.name}</p>
                  <p className="text-xs text-stone-500 mt-1">Curated</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects / Drafts */}
        {drafts.length > 0 && (
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-4">Recent Projects</h2>
            <div className="space-y-2">
              {drafts.slice(0, 8).map((draft) => (
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

        {/* Quick action cards */}
        <div className="grid grid-cols-3 gap-4">
          <Link href="/doppelwrite" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group">
            <h3 className="text-lg font-semibold group-hover:text-amber-400 transition-colors">DoppelWrite</h3>
            <p className="text-stone-400 text-sm mt-1">Edit or generate in any voice</p>
          </Link>
          <Link href="/create" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group">
            <h3 className="text-lg font-semibold group-hover:text-amber-400 transition-colors">Create DoppelWriter</h3>
            <p className="text-stone-400 text-sm mt-1">Build a new voice profile</p>
          </Link>
          <Link href="/create/personal" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group">
            <h3 className="text-lg font-semibold group-hover:text-amber-400 transition-colors">Clone Your Voice</h3>
            <p className="text-stone-400 text-sm mt-1">Upload your writing and build your profile</p>
          </Link>
        </div>
      </main>
    </>
  );
}
