"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Workspace from "@/components/Workspace";
import VoiceSelector from "@/components/VoiceSelector";
import WriterAvatar from "@/components/WriterAvatar";

export default function WritePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileId, setProfileId] = useState<number | null>(null);
  const [profileName, setProfileName] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [buildingVoice, setBuildingVoice] = useState<string | null>(null);
  const [initialMode, setInitialMode] = useState<"edit" | "generate" | undefined>(undefined);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Auto-select voice from ?voice= query param
  useEffect(() => {
    if (!session || profileId) return;
    const params = new URLSearchParams(window.location.search);
    const voiceParam = params.get("voice");
    const modeParam = params.get("mode");
    if (modeParam === "generate" || modeParam === "edit") setInitialMode(modeParam);
    if (voiceParam) {
      const voiceId = Number(voiceParam);
      if (Number.isFinite(voiceId)) {
        fetch(`/api/profiles/${voiceId}`)
          .then((r) => r.ok ? r.json() : null)
          .then((profile) => {
            if (profile) {
              setProfileId(profile.id);
              setProfileName(profile.name);
              setIsNewUser(false);
            }
          });
      }
    }
  }, [session, profileId]);

  useEffect(() => {
    if (session) {
      fetch("/api/drafts").then((r) => r.json()).then((drafts) => {
        if (drafts.length > 0) setIsNewUser(false);
      });
    }
  }, [session]);

  // Don't conditionally return null — causes React hooks mismatch during hydration.
  // Instead, render the same tree but hide it while loading.
  const isReady = status !== "loading" && !!session;

  const handleSelectVoice = (id: number, name: string) => {
    setProfileId(id);
    setProfileName(name);
    setIsNewUser(false);
    setBuildingVoice(null);
  };

  const handleQuickStart = async (name: string) => {
    setBuildingVoice(name);
    try {
      const res = await fetch("/api/writers/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerName: name, isCurated: true }),
      });
      if (res.ok) {
        const { profileId: id } = await res.json();
        handleSelectVoice(id, name);
      }
    } catch {
      setBuildingVoice(null);
    }
  };

  if (!isReady) {
    return <div className="min-h-screen bg-[#0C0A09]" />;
  }

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Voice selector modal */}
        <VoiceSelector
          selectedId={profileId}
          selectedName={profileName}
          onSelect={handleSelectVoice}
          open={selectorOpen}
          onClose={() => setSelectorOpen(false)}
        />

        {profileId ? (
          <>
            {/* Voice badge — click to change */}
            <div className="mb-6">
              <button
                onClick={() => setSelectorOpen(true)}
                className="flex items-center gap-3 px-4 py-2 bg-stone-900/50 border border-stone-800/40 rounded-lg hover:border-amber-600/40 transition-colors"
              >
                <WriterAvatar name={profileName} size={28} />
                <span className="text-sm font-medium">{profileName}</span>
                <span className="text-xs text-stone-500 ml-1">Change voice</span>
              </button>
            </div>
            <Workspace profileId={profileId} profileName={profileName} defaultMode={initialMode} />
          </>
        ) : (
          /* First-time / no voice selected — the "magic first minute" */
          <div className="max-w-2xl mx-auto py-8">
            <h1 className="font-[family-name:var(--font-literata)] text-3xl font-bold text-center mb-3">
              {isNewUser ? "See DoppelWriter in action" : "Pick a voice to start writing"}
            </h1>
            <p className="text-stone-400 text-center mb-10">
              {isNewUser
                ? "Choose any voice below and watch the AI write in their style. One click."
                : "Select a voice profile to edit or generate content."}
            </p>

            {/* Quick-start voices */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { name: "Ernest Hemingway", desc: "Sparse, powerful prose" },
                { name: "Paul Graham", desc: "Clear, direct essays" },
                { name: "Tina Fey", desc: "Sharp, funny, self-aware" },
                { name: "Barack Obama", desc: "Soaring, measured oratory" },
              ].map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleQuickStart(w.name)}
                  disabled={buildingVoice !== null}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 text-left hover:border-amber-600/40 transition-colors group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <WriterAvatar name={w.name} size={40} />
                    <div className="flex-1">
                      <p className="font-semibold group-hover:text-amber-400 transition-colors">{w.name}</p>
                      <p className="text-xs text-stone-500">{w.desc}</p>
                    </div>
                    {buildingVoice === w.name ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <svg className="animate-spin h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-xs text-amber-400">Building voice...</span>
                      </div>
                    ) : buildingVoice ? (
                      <span className="text-xs text-stone-600 ml-auto">Waiting...</span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setSelectorOpen(true)}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
              >
                Browse All 100 Voices
              </button>
              <p className="text-stone-600 text-xs mt-3">
                Or <a href="/create/personal" className="text-amber-400 hover:text-amber-300">clone your own voice</a>
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
