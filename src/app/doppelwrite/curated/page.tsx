"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Workspace from "@/components/Workspace";
import WriterAvatar from "@/components/WriterAvatar";

interface Writer {
  id: number | null;
  name: string;
  writer_name: string;
  writer_bio: string;
  writer_category: string;
  built: boolean;
}

interface Category {
  id: string;
  label: string;
}

export default function CuratedDoppelWritePage() {
  return (
    <Suspense>
      <CuratedDoppelWriteInner />
    </Suspense>
  );
}

function CuratedDoppelWriteInner() {
  const router = useRouter();
  const [writers, setWriters] = useState<Writer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Writer[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [building, setBuilding] = useState<string | null>(null);
  // Add writer flow
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [addName, setAddName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<{
    valid: boolean;
    corrected_name: string;
    bio: string;
    content_quality: string;
    content_sources: string;
    reason: string;
    suggestions: string[];
  } | null>(null);
  const searchParams = useSearchParams();

  const loadWriters = useCallback(async (cat?: string | null, q?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    else if (cat) params.set("category", cat);
    const res = await fetch(`/api/writers?${params}`);
    const data = await res.json();
    setWriters(data.writers);
    if (data.categories) setCategories(data.categories);
  }, []);

  const loadFavorites = useCallback(async () => {
    const res = await fetch("/api/favorites");
    if (res.ok) {
      const favs = await res.json();
      setFavorites(favs);
      setFavoriteIds(new Set(favs.map((f: Writer) => f.id)));
    }
  }, []);

  useEffect(() => {
    loadWriters();
    loadFavorites();
    const urlId = searchParams.get("id");
    if (urlId) {
      fetch(`/api/profiles/${urlId}`).then((r) => r.json()).then((p) => {
        if (p?.writer_name) {
          setSelectedId(Number(urlId));
          setSelectedName(p.writer_name);
        }
      });
    }
  }, [searchParams, loadWriters, loadFavorites]);

  useEffect(() => {
    if (search) {
      const timeout = setTimeout(() => loadWriters(null, search), 300);
      return () => clearTimeout(timeout);
    } else if (!showFavorites) {
      loadWriters(activeCategory);
    }
  }, [search, activeCategory, showFavorites, loadWriters]);

  const toggleFavorite = async (profileId: number) => {
    if (favoriteIds.has(profileId)) {
      await fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId }) });
      setFavoriteIds((prev) => { const s = new Set(prev); s.delete(profileId); return s; });
      setFavorites((prev) => prev.filter((f) => f.id !== profileId));
    } else {
      await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId }) });
      setFavoriteIds((prev) => new Set([...prev, profileId]));
      loadFavorites();
    }
  };

  const handleBuild = async (writerName: string) => {
    setBuilding(writerName);
    const res = await fetch("/api/writers/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerName, isCurated: true }),
    });
    if (res.ok) {
      const { profileId } = await res.json();
      setSelectedId(profileId);
      setSelectedName(writerName);
      loadWriters(activeCategory);
    } else {
      alert("Failed to build");
    }
    setBuilding(null);
  };

  const handleVerify = async () => {
    if (!addName) return;
    setVerifying(true);
    setVerification(null);
    const res = await fetch("/api/writers/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerName: addName }),
    });
    const v = await res.json();
    setVerification(v);
    setVerifying(false);
  };

  const handleConfirmBuild = async () => {
    if (!verification?.corrected_name) return;
    setBuilding(verification.corrected_name);
    const res = await fetch("/api/writers/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerName: verification.corrected_name, isCurated: true }),
    });
    if (res.ok) {
      const { profileId } = await res.json();
      setSelectedId(profileId);
      setSelectedName(verification.corrected_name);
      loadWriters(activeCategory);
    }
    setBuilding(null);
    setShowAdd(null);
    setAddName("");
    setVerification(null);
  };

  const handleSelect = (w: Writer) => {
    if (w.built && w.id) {
      setSelectedId(w.id);
      setSelectedName(w.writer_name);
    } else {
      handleBuild(w.writer_name);
    }
  };

  // Group writers by category
  const grouped: Record<string, Writer[]> = {};
  for (const w of writers) {
    const cat = w.writer_category || "custom";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(w);
  }

  if (selectedId) {
    return (
      <>
        <Nav />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <button onClick={() => { setSelectedId(null); setSelectedName(""); }}
            className="text-sm text-stone-400 hover:text-white mb-4 inline-block">&larr; Back to writers</button>
          <Workspace profileId={selectedId} profileName={selectedName} />
        </main>
      </>
    );
  }

  const renderWriterCard = (w: Writer) => (
    <div key={w.writer_name} className={`bg-stone-900/50 border rounded-lg p-4 transition-colors ${
      w.built ? "border-amber-500/30 hover:border-amber-500/60" : "border-stone-800/40 hover:border-amber-600/40"
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => handleSelect(w)} disabled={building !== null} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <WriterAvatar name={w.writer_name} size={36} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-sm truncate">{w.writer_name}</h3>
              {w.built && <span className="text-[10px] bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded shrink-0">Ready</span>}
            </div>
          </div>
        </button>
        {w.id && (
          <button onClick={() => toggleFavorite(w.id!)} className="shrink-0 text-lg">
            {favoriteIds.has(w.id) ? <span className="text-amber-400">&#9733;</span> : <span className="text-stone-600 hover:text-stone-400">&#9734;</span>}
          </button>
        )}
      </div>
      <p className="text-xs text-stone-500 line-clamp-2">{w.writer_bio}</p>
      {building === w.writer_name && <p className="text-xs text-amber-400 mt-2 animate-pulse">Building...</p>}
    </div>
  );

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">Curated DoppelWriters</h1>
        <p className="text-stone-400 text-sm mb-6">100 pre-built voices across 10 categories. Click to use, star to favorite.</p>

        {/* Search */}
        <div className="mb-6">
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); setShowFavorites(false); }}
            placeholder="Search writers, categories, styles..."
            className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        {/* Category tabs + Favorites */}
        {!search && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <button onClick={() => { setShowFavorites(true); setActiveCategory(null); }}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                showFavorites ? "bg-amber-600/20 text-amber-400" : "text-stone-400 hover:text-white bg-stone-900/50"
              }`}>
              &#9733; Favorites
            </button>
            <button onClick={() => { setActiveCategory(null); setShowFavorites(false); }}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                !activeCategory && !showFavorites ? "bg-amber-600/20 text-amber-400" : "text-stone-400 hover:text-white bg-stone-900/50"
              }`}>
              All
            </button>
            {categories.map((cat) => (
              <button key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setShowFavorites(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  activeCategory === cat.id ? "bg-amber-600/20 text-amber-400" : "text-stone-400 hover:text-white bg-stone-900/50"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Favorites tab */}
        {showFavorites && (
          <div className="mb-10">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-500 mb-2">No favorites yet.</p>
                <p className="text-stone-600 text-sm">Star any writer to add them to your favorites.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {favorites.map((w) => renderWriterCard({ ...w, built: true } as Writer))}
              </div>
            )}
          </div>
        )}

        {/* Writers by category */}
        {!showFavorites && (activeCategory ? [activeCategory] : Object.keys(grouped)).map((catId) => {
          const catWriters = grouped[catId] || [];
          if (catWriters.length === 0) return null;
          const catLabel = categories.find((c) => c.id === catId)?.label || catId;

          return (
            <div key={catId} className="mb-10">
              <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold mb-4">{catLabel}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {catWriters.map(renderWriterCard)}

                {/* Add writer button */}
                {showAdd === catId ? (
                  <div className="bg-stone-900/50 border border-amber-500/30 rounded-lg p-4">
                    <input type="text" value={addName}
                      onChange={(e) => { setAddName(e.target.value); setVerification(null); }}
                      placeholder="Who do you want to write like?"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-sm text-white placeholder-stone-500 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />

                    {verifying && <p className="text-xs text-amber-400 animate-pulse mb-2">Verifying...</p>}

                    {verification && verification.valid && (verification.content_quality === "high" || verification.content_quality === "medium") && (
                      <div className="text-xs mb-2 p-2 bg-green-900/20 border border-green-700/30 rounded">
                        <p className="text-green-400 font-medium">{verification.corrected_name}</p>
                        <p className="text-stone-400">{verification.bio}</p>
                        <p className="text-stone-500 mt-1">{verification.content_sources}</p>
                      </div>
                    )}

                    {verification && (!verification.valid || verification.content_quality === "low" || verification.content_quality === "insufficient") && (
                      <div className="text-xs mb-2 p-2 bg-stone-800/50 border border-stone-700/30 rounded">
                        <p className="text-stone-300">{verification.valid ? verification.corrected_name : addName}</p>
                        <p className="text-stone-500 mt-1">
                          {!verification.valid
                            ? verification.reason
                            : "Not enough public content to build a reliable voice profile."}
                        </p>
                        {verification.suggestions?.length > 0 && (
                          <div className="mt-1">
                            <span className="text-stone-500">Did you mean: </span>
                            {verification.suggestions.map((s, i) => (
                              <button key={i} onClick={() => { setAddName(s); setVerification(null); }}
                                className="text-amber-400 hover:text-amber-300 mr-2">{s}</button>
                            ))}
                          </div>
                        )}
                        <Link href="/create/personal" className="text-amber-400 hover:text-amber-300 mt-2 inline-block">
                          Create a Personal DoppelWriter instead &rarr;
                        </Link>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!verification ? (
                        <button onClick={handleVerify} disabled={!addName || verifying}
                          className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-xs transition-colors disabled:opacity-40">
                          {verifying ? "Checking..." : "Verify"}
                        </button>
                      ) : verification.valid && (verification.content_quality === "high" || verification.content_quality === "medium") ? (
                        <button onClick={handleConfirmBuild} disabled={building !== null}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded text-xs transition-colors disabled:opacity-40">
                          {building ? "Building..." : `Build ${verification.corrected_name}`}
                        </button>
                      ) : null}
                      <button onClick={() => { setShowAdd(null); setAddName(""); setVerification(null); }}
                        className="px-3 py-1.5 text-stone-400 hover:text-white text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setShowAdd(catId); setVerification(null); }}
                    className="border-2 border-dashed border-stone-800 rounded-lg p-4 hover:border-amber-600/40 transition-colors flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl text-stone-600">+</span>
                      <p className="text-xs text-stone-600 mt-1">Add writer</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}
