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

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {!selectedId ? (
          <>
            <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-2">Your Personal DoppelWriters</h1>
            <p className="text-stone-400 text-sm mb-8">Select a voice profile to start writing.</p>

            {profiles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-500 mb-4">You haven&apos;t created any personal DoppelWriters yet.</p>
                <Link href="/create/personal" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors">
                  Create Your First DoppelWriter
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedId(p.id); setSelectedName(p.name); }}
                    className="bg-stone-900/50 border border-amber-500/30 rounded-lg p-5 text-left hover:border-amber-500/60 transition-colors"
                  >
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-xs text-stone-500 mt-1">Personal voice</p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => { setSelectedId(null); setSelectedName(""); }}
              className="text-sm text-stone-400 hover:text-white mb-4 inline-block"
            >
              &larr; Back to profiles
            </button>
            <Workspace profileId={selectedId} profileName={selectedName} />
          </>
        )}
      </main>
    </>
  );
}
