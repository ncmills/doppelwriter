"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import WriterAvatar from "@/components/WriterAvatar";
import { CURATED_WRITERS } from "@/lib/writer-builder";

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
  writer_bio: string | null;
  writer_category: string | null;
  updated_at: string;
}

// Suggested curated writers — popular picks for new users
const SUGGESTED = ["Ernest Hemingway", "Paul Graham", "Barack Obama", "Tina Fey", "Carl Sagan", "Seth Godin"];

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
  const recentCurated = profiles.filter((p) => p.is_curated);
  const suggestedWriters = CURATED_WRITERS.filter(
    (w) => SUGGESTED.includes(w.name) && !recentCurated.some((p) => p.writer_name === w.name)
  );

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-literata)] text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-4">
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

        {/* Quick action cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Link href="/doppelwrite" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors group">
            <h3 className="font-semibold group-hover:text-amber-400 transition-colors">DoppelWrite</h3>
            <p className="text-stone-400 text-sm mt-1">Edit or generate in any voice</p>
          </Link>
          <Link href="/create" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors group">
            <h3 className="font-semibold group-hover:text-amber-400 transition-colors">Create DoppelWriter</h3>
            <p className="text-stone-400 text-sm mt-1">Build a new voice profile</p>
          </Link>
          <Link href="/create/personal" className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors group">
            <h3 className="font-semibold group-hover:text-amber-400 transition-colors">Clone a Voice</h3>
            <p className="text-stone-400 text-sm mt-1">Yours, your mom&apos;s, anyone&apos;s</p>
          </Link>
        </div>

        {/* ── Personal DoppelWriters ────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold">Your Personal DoppelWriters</h2>
            <Link href="/create/personal" className="text-xs text-amber-400 hover:text-amber-300">+ Create new</Link>
          </div>

          {personalProfiles.length === 0 ? (
            <div className="bg-stone-900/30 border border-dashed border-stone-800 rounded-lg p-8 text-center">
              <p className="text-stone-500 mb-3">You haven&apos;t created any personal DoppelWriters yet.</p>
              <Link href="/create/personal" className="text-sm text-amber-400 hover:text-amber-300">
                Clone your first voice &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {personalProfiles.map((p) => (
                <div key={p.id} className="bg-stone-900/50 border border-amber-500/30 rounded-lg p-4">
                  <Link href={`/doppelwrite/personal?id=${p.id}`}>
                    <h3 className="font-medium text-sm">{p.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-stone-600">Personal voice</p>
                    <Link href={`/profile/${p.id}`} className="text-[10px] text-amber-400 hover:text-amber-300">profile</Link>
                  </div>
                </div>
              ))}
              <Link href="/create/personal"
                className="border-2 border-dashed border-stone-800 rounded-lg p-4 flex items-center justify-center hover:border-amber-600/40 transition-colors">
                <div className="text-center">
                  <span className="text-xl text-stone-600">+</span>
                  <p className="text-[10px] text-stone-600 mt-1">New</p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* ── Curated DoppelWriters ─────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold">Curated DoppelWriters</h2>
            <Link href="/doppelwrite/curated" className="text-xs text-amber-400 hover:text-amber-300">Browse all &rarr;</Link>
          </div>

          {/* Recently used */}
          {recentCurated.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-stone-600 uppercase tracking-wider mb-2">Recently used</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recentCurated.slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/doppelwrite/curated?id=${p.id}`}
                    className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <WriterAvatar name={p.writer_name || p.name} size={32} />
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">{p.writer_name || p.name}</h3>
                        <p className="text-[10px] text-stone-600">{p.writer_category}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Suggested */}
          {suggestedWriters.length > 0 && (
            <div>
              <p className="text-[10px] text-stone-600 uppercase tracking-wider mb-2">Suggested for you</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {suggestedWriters.map((w) => (
                  <Link key={w.name} href="/doppelwrite/curated"
                    className="bg-stone-900/30 border border-stone-800/30 rounded-lg p-3 hover:border-amber-600/40 transition-colors text-center">
                    <WriterAvatar name={w.name} size={40} />
                    <p className="font-medium text-xs mt-2">{w.name}</p>
                    <p className="text-[10px] text-stone-600 mt-0.5">{w.category}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Recent Projects ──────────────────────────────────────── */}
        {drafts.length > 0 && (
          <div>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-4">Recent Projects</h2>
            <div className="space-y-2">
              {drafts.slice(0, 6).map((draft) => (
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
