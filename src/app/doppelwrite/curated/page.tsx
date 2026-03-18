"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Workspace from "@/components/Workspace";

interface Writer {
  id: number | null;
  name: string;
  writer_name: string;
  writer_bio: string;
  built: boolean;
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [building, setBuilding] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/writers").then((r) => r.json()).then((all: Writer[]) => {
      setWriters(all);
      const urlId = searchParams.get("id");
      if (urlId) {
        const match = all.find((w) => w.id === Number(urlId));
        if (match) {
          setSelectedId(match.id);
          setSelectedName(match.writer_name);
        }
      }
    });
  }, [searchParams]);

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
      // Refresh list
      const updated = await fetch("/api/writers").then((r) => r.json());
      setWriters(updated);
    } else {
      const { error } = await res.json();
      alert(error || "Failed to build");
    }
    setBuilding(null);
  };

  const handleSelect = (w: Writer) => {
    if (w.built && w.id) {
      setSelectedId(w.id);
      setSelectedName(w.writer_name);
    } else {
      handleBuild(w.writer_name);
    }
  };

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {!selectedId ? (
          <>
            <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">Curated DoppelWriters</h1>
            <p className="text-stone-400 text-sm mb-8">Select a writer to use their voice. Profiles not yet built will be created on first use.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {writers.map((w) => (
                <button
                  key={w.writer_name}
                  onClick={() => handleSelect(w)}
                  disabled={building !== null}
                  className={`bg-stone-900/50 border rounded-lg p-5 text-left transition-colors disabled:opacity-50 ${
                    w.built ? "border-amber-500/30 hover:border-amber-500/60" : "border-stone-800/40 hover:border-amber-600/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold">{w.writer_name}</h3>
                    {w.built && <span className="text-[10px] bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded shrink-0">Ready</span>}
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2">{w.writer_bio}</p>
                  {building === w.writer_name && (
                    <p className="text-xs text-amber-400 mt-2 animate-pulse">Building profile...</p>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => { setSelectedId(null); setSelectedName(""); }}
              className="text-sm text-stone-400 hover:text-white mb-4 inline-block"
            >
              &larr; Back to writers
            </button>
            <Workspace profileId={selectedId} profileName={selectedName} />
          </>
        )}
      </main>
    </>
  );
}
