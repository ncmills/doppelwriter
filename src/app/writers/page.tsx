"use client";

import { useEffect, useState, useCallback } from "react";
import Nav from "@/components/Nav";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Writer {
  id: number | null;
  name: string;
  writer_name: string;
  writer_bio: string;
  built: boolean;
  has_profile: boolean;
}

export default function WritersPage() {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [building, setBuilding] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customBio, setCustomBio] = useState("");
  const { data: session } = useSession();

  const loadWriters = useCallback(async () => {
    const res = await fetch("/api/writers");
    setWriters(await res.json());
  }, []);

  useEffect(() => { loadWriters(); }, [loadWriters]);

  const handleBuild = async (writerName: string, isCurated: boolean) => {
    setBuilding(writerName);
    const res = await fetch("/api/writers/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writerName, isCurated }),
    });
    if (res.ok) {
      await loadWriters();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to build profile");
    }
    setBuilding(null);
  };

  const handleCustomBuild = async () => {
    if (!customName) return;
    await handleBuild(customName, false);
    setCustomName("");
    setCustomBio("");
  };

  const plan = (session?.user as Record<string, unknown>)?.plan;

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Writer Profiles</h1>
        <p className="text-gray-400 text-sm mb-8">
          Pre-built voice profiles for iconic writers. Select one to use in the Editor or Generator.
        </p>

        {/* Curated Writers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {writers.map((w) => (
            <div key={w.writer_name} className={`bg-gray-800/40 border rounded-lg p-5 ${w.built ? "border-indigo-500/40" : "border-gray-700/40"}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{w.writer_name}</h3>
                {w.built && <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded">Ready</span>}
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{w.writer_bio}</p>
              {w.built ? (
                <div className="flex gap-2">
                  <Link href={`/editor?profile=${w.id}`} className="text-xs text-indigo-400 hover:text-indigo-300">Use in Editor</Link>
                  <Link href={`/generate?profile=${w.id}`} className="text-xs text-indigo-400 hover:text-indigo-300">Use in Generator</Link>
                </div>
              ) : (
                <button
                  onClick={() => handleBuild(w.writer_name, true)}
                  disabled={building !== null}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
                >
                  {building === w.writer_name ? "Building..." : "Build Profile"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Custom Writer Build */}
        <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-1">Request a Custom Writer</h2>
          <p className="text-sm text-gray-400 mb-4">
            Name any writer and we&apos;ll build a voice profile from their published work.
            {plan !== "pro" && (
              <span className="text-amber-400"> Pro plan required. <Link href="/pricing" className="underline">Upgrade</Link></span>
            )}
          </p>
          <div className="flex gap-3">
            <input
              type="text" value={customName} onChange={(e) => setCustomName(e.target.value)}
              placeholder="Writer name (e.g., Ta-Nehisi Coates)"
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleCustomBuild}
              disabled={!customName || building !== null || plan !== "pro"}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {building ? "Building..." : "Build"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
