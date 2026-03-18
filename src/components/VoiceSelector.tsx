"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import WriterAvatar from "./WriterAvatar";
import { CURATED_WRITERS, CATEGORIES } from "@/lib/writer-data";

interface Profile {
  id: number;
  name: string;
  writer_name: string | null;
  writer_bio: string | null;
  writer_category: string | null;
  is_curated: boolean;
  has_profile: boolean;
}

interface Props {
  selectedId: number | null;
  selectedName: string;
  onSelect: (id: number, name: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function VoiceSelector({ selectedId, selectedName, onSelect, open, onClose }: Props) {
  const [personal, setPersonal] = useState<Profile[]>([]);
  const [curated, setCurated] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"recent" | "personal" | "curated">("recent");
  const [building, setBuilding] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [profilesRes, writersRes] = await Promise.all([
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/writers").then((r) => r.json()),
    ]);
    setPersonal(profilesRes.filter((p: Profile) => !p.is_curated));

    const writers = writersRes.writers || [];
    setCurated(writers);
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleBuild = async (name: string) => {
    setBuilding(name);
    const res = await fetch("/api/writers/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerName: name, isCurated: true }),
    });
    if (res.ok) {
      const { profileId } = await res.json();
      onSelect(profileId, name);
      onClose();
    }
    setBuilding(null);
  };

  const handleSelect = (p: { id: number | null; name: string; writer_name?: string | null; has_profile?: boolean }) => {
    if (p.id && p.has_profile !== false) {
      onSelect(p.id, p.writer_name || p.name);
      onClose();
    } else {
      handleBuild(p.writer_name || p.name);
    }
  };

  const filtered = search
    ? [
        ...personal.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
        ...curated.filter((w) =>
          (w.writer_name || w.name).toLowerCase().includes(search.toLowerCase()) ||
          (w.writer_bio || "").toLowerCase().includes(search.toLowerCase())
        ),
      ]
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-[#0C0A09] border border-stone-800 rounded-xl w-full max-w-2xl max-h-[70vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div className="p-4 border-b border-stone-800">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search voices..."
            autoFocus
            className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Tabs (when not searching) */}
        {!search && (
          <div className="flex gap-1 px-4 pt-3">
            {(["recent", "personal", "curated"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === tab ? "bg-amber-600/20 text-amber-400" : "text-stone-500 hover:text-white"
                }`}
              >
                {tab === "recent" ? "Suggested" : tab === "personal" ? "Your Voices" : "Famous Writers"}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(70vh - 120px)" }}>
          {/* Search results */}
          {search && (
            <div className="grid grid-cols-2 gap-2">
              {filtered.length === 0 && (
                <p className="text-stone-500 text-sm col-span-2 text-center py-8">No voices matching &quot;{search}&quot;</p>
              )}
              {filtered.slice(0, 20).map((p) => (
                <button
                  key={p.writer_name || p.name}
                  onClick={() => handleSelect(p)}
                  disabled={building !== null}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-3 text-left hover:border-amber-600/40 transition-colors disabled:opacity-50 flex items-center gap-3"
                >
                  <WriterAvatar name={p.writer_name || p.name} size={32} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.writer_name || p.name}</p>
                    <p className="text-[11px] text-stone-500">{p.is_curated ? "Curated" : "Personal"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Suggested tab */}
          {!search && activeTab === "recent" && (
            <div className="grid grid-cols-2 gap-2">
              {CURATED_WRITERS.slice(0, 8).map((w) => {
                const built = curated.find((c) => c.writer_name === w.name);
                return (
                  <button
                    key={w.name}
                    onClick={() => built?.id ? handleSelect({ ...built, has_profile: true }) : handleBuild(w.name)}
                    disabled={building !== null}
                    className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-3 text-left hover:border-amber-600/40 transition-colors disabled:opacity-50 flex items-center gap-3"
                  >
                    <WriterAvatar name={w.name} size={32} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{w.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{w.bio.slice(0, 50)}</p>
                    </div>
                    {building === w.name && <span className="text-[10px] text-amber-400 animate-pulse ml-auto">Building...</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Personal tab */}
          {!search && activeTab === "personal" && (
            <div>
              {personal.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-stone-500 text-sm mb-3">No personal voices yet.</p>
                  <Link href="/create/personal" onClick={onClose}
                    className="text-sm text-amber-400 hover:text-amber-300">
                    Clone your first voice &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {personal.map((p) => (
                    <button key={p.id} onClick={() => handleSelect(p)}
                      className="bg-stone-900/50 border border-amber-500/30 rounded-lg p-3 text-left hover:border-amber-500/60 transition-colors">
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-[11px] text-stone-500">Personal voice</p>
                    </button>
                  ))}
                  <Link href="/create/personal" onClick={onClose}
                    className="border-2 border-dashed border-stone-800 rounded-lg p-3 flex items-center justify-center hover:border-amber-600/40 transition-colors">
                    <span className="text-stone-600 text-sm">+ New voice</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Curated tab — show by category */}
          {!search && activeTab === "curated" && (
            <div className="space-y-6">
              {CATEGORIES.map((cat) => {
                const writers = CURATED_WRITERS.filter((w) => w.category === cat.id);
                if (writers.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <p className="text-[10px] text-stone-600 uppercase tracking-wider mb-2">{cat.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {writers.map((w) => {
                        const built = curated.find((c) => c.writer_name === w.name);
                        return (
                          <button
                            key={w.name}
                            onClick={() => built?.id ? handleSelect({ ...built, has_profile: true }) : handleBuild(w.name)}
                            disabled={building !== null}
                            className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-2.5 text-left hover:border-amber-600/40 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            <WriterAvatar name={w.name} size={28} />
                            <div className="min-w-0">
                              <p className="font-medium text-xs truncate">{w.name}</p>
                            </div>
                            {built?.has_profile && <span className="text-[9px] text-amber-400 ml-auto">Ready</span>}
                            {building === w.name && <span className="text-[9px] text-amber-400 animate-pulse ml-auto">...</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
