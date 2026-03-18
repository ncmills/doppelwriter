"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
  const [writers, setWriters] = useState<Writer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [building, setBuilding] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [showCustom, setShowCustom] = useState<string | null>(null);
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

  useEffect(() => {
    loadWriters();
    const urlId = searchParams.get("id");
    if (urlId) {
      // Try to find name from writers once loaded
      fetch(`/api/profiles/${urlId}`).then((r) => r.json()).then((p) => {
        if (p?.writer_name) {
          setSelectedId(Number(urlId));
          setSelectedName(p.writer_name);
        }
      });
    }
  }, [searchParams, loadWriters]);

  useEffect(() => {
    if (search) {
      const timeout = setTimeout(() => loadWriters(null, search), 300);
      return () => clearTimeout(timeout);
    } else {
      loadWriters(activeCategory);
    }
  }, [search, activeCategory, loadWriters]);

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
      const { error } = await res.json();
      alert(error || "Failed to build");
    }
    setBuilding(null);
  };

  const handleCustomBuild = async (category: string) => {
    if (!customName) return;
    setBuilding(customName);
    const res = await fetch("/api/writers/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerName: customName, isCurated: true }),
    });
    if (res.ok) {
      const { profileId } = await res.json();
      setSelectedId(profileId);
      setSelectedName(customName);
      loadWriters(activeCategory);
    } else {
      const { error } = await res.json();
      alert(error || "Failed to build");
    }
    setBuilding(null);
    setCustomName("");
    setShowCustom(null);
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
          <button
            onClick={() => { setSelectedId(null); setSelectedName(""); }}
            className="text-sm text-stone-400 hover:text-white mb-4 inline-block"
          >
            &larr; Back to writers
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
        <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">Curated DoppelWriters</h1>
        <p className="text-stone-400 text-sm mb-6">100 pre-built voices across 10 categories. Click to use, or add your own.</p>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
            placeholder="Search writers, categories, styles..."
            className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Category tabs */}
        {!search && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                !activeCategory ? "bg-amber-600/20 text-amber-400" : "text-stone-400 hover:text-white bg-stone-900/50"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  activeCategory === cat.id ? "bg-amber-600/20 text-amber-400" : "text-stone-400 hover:text-white bg-stone-900/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Writers by category */}
        {(activeCategory ? [activeCategory] : Object.keys(grouped)).map((catId) => {
          const catWriters = grouped[catId] || [];
          if (catWriters.length === 0) return null;
          const catLabel = categories.find((c) => c.id === catId)?.label || catId;

          return (
            <div key={catId} className="mb-10">
              <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold mb-4">{catLabel}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {catWriters.map((w) => (
                  <button
                    key={w.writer_name}
                    onClick={() => handleSelect(w)}
                    disabled={building !== null}
                    className={`bg-stone-900/50 border rounded-lg p-4 text-left transition-colors disabled:opacity-50 ${
                      w.built ? "border-amber-500/30 hover:border-amber-500/60" : "border-stone-800/40 hover:border-amber-600/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <WriterAvatar name={w.writer_name} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-sm truncate">{w.writer_name}</h3>
                          {w.built && <span className="text-[10px] bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded shrink-0">Ready</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2">{w.writer_bio}</p>
                    {building === w.writer_name && (
                      <p className="text-xs text-amber-400 mt-2 animate-pulse">Building...</p>
                    )}
                  </button>
                ))}

                {/* Add custom writer to this category */}
                {showCustom === catId ? (
                  <div className="bg-stone-900/50 border border-amber-500/30 rounded-lg p-4">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => { setCustomName(e.target.value); setVerification(null); }}
                      placeholder="Writer name..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customName && !verifying) {
                          setVerifying(true);
                          fetch("/api/writers/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ writerName: customName }),
                          })
                            .then((r) => r.json())
                            .then((v) => { setVerification(v); setVerifying(false); });
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-sm text-white placeholder-stone-500 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />

                    {/* Verification result */}
                    {verifying && <p className="text-xs text-amber-400 animate-pulse mb-2">Verifying...</p>}

                    {verification && !verification.valid && (
                      <div className="text-xs mb-2 p-2 bg-red-900/20 border border-red-700/30 rounded">
                        <p className="text-red-400">{verification.reason}</p>
                        {verification.suggestions?.length > 0 && (
                          <div className="mt-1">
                            <span className="text-stone-500">Did you mean: </span>
                            {verification.suggestions.map((s, i) => (
                              <button key={i} onClick={() => { setCustomName(s); setVerification(null); }}
                                className="text-amber-400 hover:text-amber-300 mr-2">{s}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {verification && verification.valid && verification.content_quality === "insufficient" && (
                      <div className="text-xs mb-2 p-2 bg-red-900/20 border border-red-700/30 rounded">
                        <p className="text-red-400">Not enough public writing available for {verification.corrected_name} to build a reliable voice profile.</p>
                        <p className="text-stone-500 mt-1">Try creating a Personal DoppelWriter instead — you can upload their writing directly.</p>
                      </div>
                    )}

                    {verification && verification.valid && verification.content_quality !== "insufficient" && (
                      <div className="text-xs mb-2 p-2 bg-green-900/20 border border-green-700/30 rounded">
                        <p className="text-green-400 font-medium">{verification.corrected_name}</p>
                        <p className="text-stone-400">{verification.bio}</p>
                        <p className="text-stone-500 mt-1">Content: {verification.content_sources}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-stone-500">Quality:</span>
                          <span className={verification.content_quality === "high" ? "text-green-400" : "text-amber-400"}>
                            {verification.content_quality}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!verification ? (
                        <button
                          onClick={() => {
                            if (!customName) return;
                            setVerifying(true);
                            fetch("/api/writers/verify", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ writerName: customName }),
                            })
                              .then((r) => r.json())
                              .then((v) => { setVerification(v); setVerifying(false); });
                          }}
                          disabled={!customName || verifying}
                          className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-xs transition-colors disabled:opacity-40"
                        >
                          {verifying ? "Checking..." : "Verify"}
                        </button>
                      ) : verification.valid && verification.content_quality !== "insufficient" ? (
                        <button
                          onClick={() => {
                            setCustomName(verification.corrected_name);
                            handleCustomBuild(catId);
                          }}
                          disabled={building !== null}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded text-xs transition-colors disabled:opacity-40"
                        >
                          {building ? "Building..." : `Build ${verification.corrected_name}`}
                        </button>
                      ) : null}
                      <button
                        onClick={() => { setShowCustom(null); setCustomName(""); setVerification(null); }}
                        className="px-3 py-1.5 text-stone-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowCustom(catId); setVerification(null); }}
                    className="border-2 border-dashed border-stone-800 rounded-lg p-4 text-left hover:border-amber-600/40 transition-colors flex items-center justify-center"
                  >
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
