"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Workspace from "@/components/Workspace";

interface Profile {
  id: number;
  name: string;
  is_curated: boolean;
  updated_at: string;
}

export default function PersonalDoppelWritePage() {
  return (
    <Suspense>
      <PersonalDoppelWriteInner />
    </Suspense>
  );
}

function PersonalDoppelWriteInner() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [search, setSearch] = useState("");
  const [editingName, setEditingName] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/profiles").then((r) => r.json()).then((all: Profile[]) => {
      const personal = all.filter((p) => !p.is_curated);
      setProfiles(personal);

      const urlId = searchParams.get("id");
      if (urlId) {
        const match = personal.find((p) => p.id === Number(urlId));
        if (match) {
          setSelectedId(match.id);
          setSelectedName(match.name);
        }
      }
    });
  }, [searchParams]);

  const handleRename = async (id: number) => {
    if (!newName.trim()) return;
    await fetch(`/api/profiles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, name: newName.trim() } : p));
    setEditingName(null);
    setNewName("");
  };

  const filtered = search
    ? profiles.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : profiles;

  if (selectedId) {
    return (
      <>
        <Nav />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <button
            onClick={() => { setSelectedId(null); setSelectedName(""); }}
            className="text-sm text-stone-400 hover:text-white mb-4 inline-block"
          >
            &larr; Back to profiles
          </button>
          <Workspace profileId={selectedId} profileName={selectedName} />
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">Personal DoppelWriters</h1>
        <p className="text-stone-400 text-sm mb-6">Your voice, your mom&apos;s, your boss&apos;s — anyone you&apos;ve built a profile for.</p>

        {/* Search */}
        {profiles.length > 3 && (
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your DoppelWriters..."
              className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {filtered.length === 0 && !search ? (
          <div className="text-center py-16">
            <p className="text-stone-500 mb-4">You haven&apos;t created any personal DoppelWriters yet.</p>
            <Link href="/create/personal" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors">
              Create Your First DoppelWriter
            </Link>
          </div>
        ) : filtered.length === 0 && search ? (
          <p className="text-stone-500 text-center py-8">No profiles matching &quot;{search}&quot;</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-stone-900/50 border border-amber-500/30 rounded-lg p-5 hover:border-amber-500/60 transition-colors">
                {editingName === p.id ? (
                  <div className="mb-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRename(p.id)}
                      autoFocus
                      className="w-full px-2 py-1 bg-stone-900 border border-amber-500 rounded text-sm text-white focus:outline-none"
                    />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleRename(p.id)} className="text-[10px] text-amber-400">Save</button>
                      <button onClick={() => setEditingName(null)} className="text-[10px] text-stone-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between mb-2">
                    <button onClick={() => { setSelectedId(p.id); setSelectedName(p.name); }}>
                      <h3 className="font-semibold text-left">{p.name}</h3>
                    </button>
                    <button
                      onClick={() => { setEditingName(p.id); setNewName(p.name); }}
                      className="text-[10px] text-stone-600 hover:text-stone-400 shrink-0 ml-2"
                    >
                      rename
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-500">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
                  <Link href={`/profile/${p.id}`} className="text-[10px] text-amber-400 hover:text-amber-300">
                    view profile
                  </Link>
                </div>
              </div>
            ))}

            {/* Create new */}
            <Link
              href="/create/personal"
              className="border-2 border-dashed border-stone-800 rounded-lg p-5 flex items-center justify-center hover:border-amber-600/40 transition-colors"
            >
              <div className="text-center">
                <span className="text-2xl text-stone-600">+</span>
                <p className="text-xs text-stone-600 mt-1">New DoppelWriter</p>
              </div>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
