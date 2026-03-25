"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import WriterAvatar from "./WriterAvatar";
import { CURATED_WRITERS, CATEGORIES } from "@/lib/writer-data";
import { trackWriterSelected } from "@/lib/analytics";

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

const POPULAR = ["Ernest Hemingway", "Paul Graham", "Barack Obama", "Joan Didion", "Tina Fey", "Kurt Vonnegut"];

export default function VoiceSelector({ selectedId, selectedName, onSelect, open, onClose }: Props) {
  const [personal, setPersonal] = useState<Profile[]>([]);
  const [curated, setCurated] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [building, setBuilding] = useState<string | null>(null);
  const [buildError, setBuildError] = useState<{ name: string; reason: string } | null>(null);

  const load = useCallback(async () => {
    const [profilesRes, writersRes] = await Promise.all([
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/writers").then((r) => r.json()),
    ]);
    setPersonal(profilesRes.filter((p: Profile) => !p.is_curated));
    setCurated(writersRes.writers || []);
  }, []);

  useEffect(() => {
    if (open) { load(); setSearch(""); setCategoryFilter(null); setBuildError(null); }
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

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

  const handleSelect = (p: { id: number | null; name: string; writer_name?: string | null; writer_category?: string | null; has_profile?: boolean }) => {
    if (p.id && p.has_profile !== false) {
      trackWriterSelected(p.writer_name || p.name, p.writer_category || "custom");
      onSelect(p.id, p.writer_name || p.name);
      onClose();
    } else {
      handleBuild(p.writer_name || p.name);
    }
  };

  const handleAddWriter = async (name: string) => {
    setBuilding(name);
    setBuildError(null);
    try {
      const res = await fetch("/api/writers/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerName: name, isCurated: false }),
      });
      if (res.ok) {
        const { profileId } = await res.json();
        onSelect(profileId, name);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error?.includes("Pro")) {
          setBuildError({ name, reason: data.error });
        } else {
          setBuildError({ name, reason: `We couldn\u2019t find enough published writing for \u201c${name}\u201d to build an accurate voice. You can build it yourself by uploading their writing.` });
        }
      }
    } catch {
      setBuildError({ name, reason: "Connection error. Please try again." });
    }
    setBuilding(null);
  };

  // Fuzzy match for misspellings
  const fuzzyMatch = (name: string, query: string): boolean => {
    const n = name.toLowerCase();
    const q = query.toLowerCase().trim();
    if (n.includes(q) || q.includes(n)) return true;
    const queryWords = q.split(/\s+/).filter(Boolean);
    if (queryWords.length > 1 && queryWords.every((w) => n.includes(w))) return true;
    const nameWords = n.split(/\s+/);
    const closeMatch = (a: string, b: string): boolean => {
      if (a === b || a.startsWith(b) || b.startsWith(a)) return true;
      if (Math.abs(a.length - b.length) > 1) return false;
      let diffs = 0;
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) diffs++;
        if (diffs > 1) return false;
      }
      return true;
    };
    const matchCount = queryWords.filter((qw) => nameWords.some((nw) => closeMatch(qw, nw))).length;
    return matchCount === queryWords.length;
  };

  const searchResults = search.trim().length >= 2
    ? [
        ...personal.filter((p) => fuzzyMatch(p.name, search)),
        ...curated.filter((w) =>
          fuzzyMatch(w.writer_name || w.name, search) ||
          (w.writer_bio || "").toLowerCase().includes(search.toLowerCase())
        ),
      ]
    : null;

  // Writers filtered by category
  const categoryWriters = categoryFilter
    ? CURATED_WRITERS.filter((w) => w.category === categoryFilter)
    : null;

  if (!open) return null;

  const isSearching = searchResults !== null;

  // Reusable writer card
  const writerCard = (w: { name: string; bio?: string }, size: "sm" | "md" = "sm") => {
    const built = curated.find((c) => c.writer_name === w.name);
    const isReady = built?.has_profile;
    return (
      <button
        key={w.name}
        onClick={() => built?.id ? handleSelect({ ...built, has_profile: true }) : handleBuild(w.name)}
        disabled={building !== null}
        className={`bg-stone-900/50 border ${isReady ? "border-stone-700/60" : "border-stone-800/40"} rounded-lg ${size === "md" ? "p-3.5" : "p-2.5"} text-left hover:border-amber-600/40 transition-all disabled:opacity-50 flex items-center gap-3 group`}
      >
        <WriterAvatar name={w.name} size={size === "md" ? 36 : 28} />
        <div className="min-w-0 flex-1">
          <p className={`font-medium ${size === "md" ? "text-sm" : "text-xs"} truncate group-hover:text-amber-400 transition-colors`}>{w.name}</p>
          {w.bio && size === "md" && (
            <p className="text-xs text-stone-500 truncate">{w.bio}</p>
          )}
        </div>
        {isReady && <span className="text-xs text-green-500/70 shrink-0">Ready</span>}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-16" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-[#0C0A09] border border-stone-800 rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[85vh] sm:max-h-[75vh] mx-0 sm:mx-4 overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Building overlay */}
        {building && (
          <div className="absolute inset-0 z-10 bg-[#0C0A09]/90 flex flex-col items-center justify-center gap-4">
            <svg className="animate-spin h-10 w-10 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="text-center">
              <p className="text-amber-400 font-medium text-lg">Building {building}&apos;s voice...</p>
              <p className="text-stone-500 text-sm mt-1">Analyzing their writing patterns. This takes 30-60 seconds.</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-4 pb-3 border-b border-stone-800/60 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCategoryFilter(null); }}
              placeholder="Search by name, style, or category..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-4">

          {/* ═══ SEARCH MODE ═══ */}
          {isSearching && (
            <div>
              {searchResults.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {searchResults.slice(0, 20).map((p) => (
                    <button
                      key={p.writer_name || p.name}
                      onClick={() => handleSelect(p)}
                      disabled={building !== null}
                      className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-3 text-left hover:border-amber-600/40 transition-colors disabled:opacity-50 flex items-center gap-3 group"
                    >
                      <WriterAvatar name={p.writer_name || p.name} size={32} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-amber-400 transition-colors">{p.writer_name || p.name}</p>
                        <p className="text-xs text-stone-500">{p.is_curated ? (p.writer_bio || "Curated").toString().slice(0, 50) : "Personal voice"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Add writer prompt */}
              {!building && (
                <div className={`text-center ${searchResults.length > 0 ? "pt-3 border-t border-stone-800/40" : ""} py-4`}>
                  {searchResults.length === 0 && (
                    <p className="text-stone-400 text-sm mb-3">No voice found for &quot;{search}&quot;</p>
                  )}
                  {buildError?.name === search ? (
                    <div className="space-y-3">
                      <p className="text-stone-500 text-sm">{buildError.reason}</p>
                      <a href={`/create/personal?name=${encodeURIComponent(search)}`}
                        className="inline-block px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
                        Upload {search}&apos;s writing to build their voice
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-stone-500 text-xs mb-2">
                        {searchResults.length > 0 ? "Don\u2019t see who you\u2019re looking for?" : `Want to write like ${search}?`}
                      </p>
                      <button onClick={() => handleAddWriter(search)}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
                        Add &quot;{search}&quot; as a voice
                      </button>
                      <p className="text-stone-600 text-xs mt-1.5">We&apos;ll scan for their published writing and build a voice profile</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ BROWSE MODE (no search) ═══ */}
          {!isSearching && (
            <div className="space-y-6">

              {/* Your Voices — always at top if they have any */}
              {personal.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider">Your Voices</h3>
                    <Link href="/create/personal" onClick={onClose}
                      className="text-xs text-amber-400 hover:text-amber-300">+ New</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {personal.map((p) => (
                      <button key={p.id} onClick={() => handleSelect(p)}
                        className="bg-stone-900/50 border border-amber-500/20 rounded-lg p-2.5 text-left hover:border-amber-500/50 transition-colors flex items-center gap-3 group">
                        <div className="w-7 h-7 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                          {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <p className="font-medium text-xs truncate group-hover:text-amber-400 transition-colors">{p.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category filter pills */}
              <div>
                <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Famous Voices</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    onClick={() => setCategoryFilter(null)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      !categoryFilter ? "bg-amber-600/20 text-amber-400 border border-amber-500/30" : "bg-stone-900 text-stone-500 border border-stone-800 hover:text-white hover:border-stone-600"
                    }`}
                  >
                    Popular
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        categoryFilter === cat.id ? "bg-amber-600/20 text-amber-400 border border-amber-500/30" : "bg-stone-900 text-stone-500 border border-stone-800 hover:text-white hover:border-stone-600"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Popular (default) or filtered category */}
                <div className="grid grid-cols-2 gap-2">
                  {categoryFilter ? (
                    // Filtered by category
                    categoryWriters!.map((w) => writerCard(w, "md"))
                  ) : (
                    // Popular picks
                    POPULAR.map((name) => {
                      const w = CURATED_WRITERS.find((c) => c.name === name);
                      if (!w) return null;
                      return writerCard(w, "md");
                    })
                  )}
                </div>

                {/* Show count when browsing popular */}
                {!categoryFilter && (
                  <p className="text-center text-stone-600 text-xs mt-3">
                    Showing 6 popular voices. Use the filters above to browse all {CURATED_WRITERS.length}.
                  </p>
                )}
              </div>

              {/* Clone your own voice CTA — at the bottom if they don't have personal voices */}
              {personal.length === 0 && (
                <Link href="/create/personal" onClick={onClose}
                  className="block text-center py-4 border border-dashed border-stone-800 rounded-lg hover:border-amber-600/40 transition-colors group">
                  <p className="text-stone-400 text-sm group-hover:text-amber-400 transition-colors">Clone your own voice</p>
                  <p className="text-stone-600 text-xs mt-0.5">Upload your writing and we&apos;ll build a voice that sounds like you</p>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
