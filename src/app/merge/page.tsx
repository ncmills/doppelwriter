"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import WriterAvatar from "@/components/WriterAvatar";

interface Profile {
  id: number;
  name: string;
  writer_name: string | null;
  is_curated: boolean;
}

export default function MergePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [mergeName, setMergeName] = useState("");
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/profiles").then((r) => r.json()).then(setProfiles);
    }
  }, [session]);

  if (status === "loading" || !session) return null;

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMerge = async () => {
    if (selected.length < 2) return;
    setMerging(true);

    const res = await fetch("/api/profiles/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileIds: selected,
        name: mergeName || undefined,
      }),
    });

    if (res.ok) {
      const { id, name } = await res.json();
      router.push(`/write?voice=${id}`);
    } else {
      const { error } = await res.json();
      alert(error || "Merge failed");
      setMerging(false);
    }
  };

  const selectedProfiles = profiles.filter((p) => selected.includes(p.id));
  const personalProfiles = profiles.filter((p) => !p.is_curated);
  const curatedProfiles = profiles.filter((p) => p.is_curated);

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">Merge Voices</h1>
        <p className="text-[var(--color-ink-soft)] text-sm mb-8">
          Combine multiple DoppelWriters into one hybrid voice. Mix your personal voice with a famous
          writer, blend two authors, or create something entirely new.
        </p>

        {/* Selected voices preview */}
        {selected.length > 0 && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-ink)] rounded-[2px] p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-sm">
                Merging {selected.length} voice{selected.length !== 1 ? "s" : ""}
              </h2>
              <span className="text-xs text-[var(--color-ink-mute)]">
                {selected.length < 2 ? "Select at least 2" : "Ready to merge"}
              </span>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {selectedProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-paper-deep)] text-[var(--color-accent)] rounded-[2px] text-xs"
                >
                  <WriterAvatar name={p.writer_name || p.name} size={20} />
                  {p.writer_name || p.name}
                  <span className="text-[var(--color-ink-mute)] ml-1">&times;</span>
                </button>
              ))}
            </div>

            {selected.length > 1 && (
              <div className="flex items-center gap-3">
                <p className="text-xs text-[var(--color-ink-mute)]">Result:</p>
                <div className="flex -space-x-2">
                  {selectedProfiles.map((p) => (
                    <div key={p.id} className="border-2 border-[var(--color-paper)] rounded-[2px]">
                      <WriterAvatar name={p.writer_name || p.name} size={28} />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-[var(--color-ink-soft)]">
                  {selectedProfiles.map((p) => (p.writer_name || p.name).split(" ")[0]).join(" + ")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Merge button + name */}
        {selected.length >= 2 && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5 mb-8">
            <h3 className="font-medium text-sm mb-3">Name your merged voice</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={mergeName}
                onChange={(e) => setMergeName(e.target.value)}
                placeholder={selectedProfiles.map((p) => (p.writer_name || p.name).split(" ")[0]).join(" + ") + " Blend"}
                className="flex-1 px-4 py-2.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-[var(--color-ink)] placeholder-[var(--color-ink-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <button
                onClick={handleMerge}
                disabled={merging}
                className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium transition-colors disabled:opacity-50"
              >
                {merging ? "Merging..." : "Create Merged Voice"}
              </button>
            </div>
            {merging && (
              <p className="text-xs text-[var(--color-ink-mute)] mt-2 animate-pulse">
                Analyzing both voices and blending their patterns. This takes 15-30 seconds.
              </p>
            )}
          </div>
        )}

        {/* Voice selection */}
        <div className="space-y-8">
          {/* Personal voices */}
          {personalProfiles.length > 0 && (
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Your Voices</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {personalProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`rounded-[2px] p-4 text-left transition-colors border ${
                      selected.includes(p.id)
                        ? "bg-[var(--color-paper-deep)] border-[var(--color-ink)]"
                        : "bg-[var(--color-paper-deep)] border-[var(--color-rule)] hover:border-[var(--color-ink)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{p.name}</p>
                      <div className={`w-5 h-5 rounded-[2px] border-2 flex items-center justify-center ${
                        selected.includes(p.id) ? "border-[var(--color-accent)] bg-[var(--color-accent)]" : "border-[var(--color-rule)]"
                      }`}>
                        {selected.includes(p.id) && <span className="text-[var(--color-paper)] text-xs">&#10003;</span>}
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--color-ink-mute)] mt-1">Personal voice</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Curated voices */}
          {curatedProfiles.length > 0 && (
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Famous Voices</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {curatedProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`rounded-[2px] p-4 text-left transition-colors border ${
                      selected.includes(p.id)
                        ? "bg-[var(--color-paper-deep)] border-[var(--color-ink)]"
                        : "bg-[var(--color-paper-deep)] border-[var(--color-rule)] hover:border-[var(--color-ink)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <WriterAvatar name={p.writer_name || p.name} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.writer_name || p.name}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-[2px] border-2 flex items-center justify-center shrink-0 ${
                        selected.includes(p.id) ? "border-[var(--color-accent)] bg-[var(--color-accent)]" : "border-[var(--color-rule)]"
                      }`}>
                        {selected.includes(p.id) && <span className="text-[var(--color-paper)] text-xs">&#10003;</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {profiles.length < 2 && (
            <div className="text-center py-12">
              <p className="text-[var(--color-ink-mute)] mb-3">You need at least 2 built voice profiles to merge.</p>
              <p className="text-[var(--color-ink-mute)] text-sm">Go to <a href="/write" className="text-[var(--color-accent)] hover:text-[var(--color-ink)]">Write</a> and use a few voices first — they&apos;ll appear here.</p>
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="mt-12 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6">
          <h3 className="font-[family-name:var(--font-display)] font-semibold mb-3">Merge Ideas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[var(--color-ink-soft)]">
            <div className="flex gap-2">
              <span className="text-[var(--color-accent)]">1.</span>
              <span>Your voice + Hemingway = you, but tighter and more powerful</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--color-accent)]">2.</span>
              <span>Paul Graham + Seth Godin = startup wisdom meets marketing punch</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--color-accent)]">3.</span>
              <span>Obama + your voice = your ideas with presidential cadence</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--color-accent)]">4.</span>
              <span>Tina Fey + David Sedaris = peak comedy writing</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
