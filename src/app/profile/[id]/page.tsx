"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

interface Profile {
  id: number;
  name: string;
  is_curated: boolean;
  writer_name: string | null;
  profile_json: string | null;
  system_prompt: string | null;
  voice_overrides: Record<string, number> | null;
  updated_at: string;
}

interface QualityDimension {
  name: string;
  score: number;
  status: string;
  description: string;
  improvement: string;
}

interface Quality {
  overall: number;
  dimensions: QualityDimension[];
  topRecommendation: string;
}

const SLIDERS = [
  { key: "formality", label: "Formality", low: "Casual", high: "Formal", desc: "How formal or conversational the voice sounds" },
  { key: "sentence_length", label: "Sentence Length", low: "Short & punchy", high: "Long & flowing", desc: "Average sentence complexity and length" },
  { key: "creativity", label: "Creativity", low: "Literal & direct", high: "Metaphorical & vivid", desc: "How much imagery and creative language to use" },
  { key: "humor", label: "Humor", low: "Serious", high: "Witty & playful", desc: "Amount of humor, irony, and levity" },
  { key: "emotion", label: "Emotion", low: "Detached & analytical", high: "Personal & expressive", desc: "Emotional expressiveness in the writing" },
];

function ProfileDetail() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [loadingQuality, setLoadingQuality] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [sliders, setSliders] = useState<Record<string, number>>({});
  const [slidersChanged, setSlidersChanged] = useState(false);

  useEffect(() => {
    fetch(`/api/profiles/${profileId}`).then((r) => r.json()).then((p) => {
      setProfile(p);
      setNameValue(p.writer_name || p.name);
      const overrides = p.voice_overrides || {};
      setSliders({
        formality: overrides.formality ?? 5,
        sentence_length: overrides.sentence_length ?? 5,
        creativity: overrides.creativity ?? 5,
        humor: overrides.humor ?? 5,
        emotion: overrides.emotion ?? 5,
      });
    });
  }, [profileId]);

  useEffect(() => {
    setLoadingQuality(true);
    fetch(`/api/profiles/${profileId}/quality`)
      .then((r) => r.ok ? r.json() : null)
      .then((q) => { if (q) setQuality(q); })
      .finally(() => setLoadingQuality(false));
  }, [profileId]);

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue === (profile?.writer_name || profile?.name)) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    await fetch(`/api/profiles/${profileId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameValue.trim() }),
    });
    setProfile((p) => p ? { ...p, name: nameValue.trim() } : p);
    setEditingName(false);
    setSaving(false);
  };

  const handleSaveSliders = async () => {
    setSaving(true);
    await fetch(`/api/profiles/${profileId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voice_overrides: sliders }),
    });
    setSlidersChanged(false);
    setSaving(false);
  };

  const handleSliderChange = (key: string, value: number) => {
    setSliders((s) => ({ ...s, [key]: value }));
    setSlidersChanged(true);
  };

  const handleResetSliders = () => {
    setSliders({ formality: 5, sentence_length: 5, creativity: 5, humor: 5, emotion: 5 });
    setSlidersChanged(true);
  };

  if (!profile) return <div className="min-h-screen bg-[var(--color-paper)]"><Nav /><div className="p-8 text-[var(--color-ink-mute)]">Loading...</div></div>;

  const statusColor = (status: string) => {
    switch (status) {
      case "strong": return "bg-green-500";
      case "moderate": return "bg-[var(--color-accent)]";
      case "weak": return "bg-red-500";
      default: return "bg-[var(--color-ink-mute)]";
    }
  };

  const statusBorder = (status: string) => {
    switch (status) {
      case "strong": return "border-green-500/30";
      case "moderate": return "border-[var(--color-accent)]";
      case "weak": return "border-red-500/30";
      default: return "border-[var(--color-rule)]";
    }
  };

  const isPersonal = !profile.is_curated;

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => router.back()} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] mb-4 inline-block">
          &larr; Back
        </button>

        {/* Header with editable name */}
        <div className="flex items-start justify-between mb-8">
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                  className="font-[family-name:var(--font-display)] text-2xl font-bold bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] px-3 py-1 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <button onClick={handleSaveName} disabled={saving}
                  className="px-3 py-1 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-sm transition-colors disabled:opacity-50">
                  {saving ? "..." : "Save"}
                </button>
                <button onClick={() => { setEditingName(false); setNameValue(profile.writer_name || profile.name); }}
                  className="px-3 py-1 text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] text-sm">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                  {profile.writer_name || profile.name}
                </h1>
                {isPersonal && (
                  <button onClick={() => setEditingName(true)}
                    className="text-[var(--color-ink-mute)] hover:text-[var(--color-ink-soft)] transition-colors" title="Rename">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <p className="text-[var(--color-ink-mute)] text-sm mt-1">
              {profile.is_curated ? "Curated profile" : "Personal voice profile"} · Updated {new Date(profile.updated_at).toLocaleDateString()}
            </p>
          </div>
          <Link href={`/write?voice=${profile.id}`}
            className="px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-sm font-medium transition-colors shrink-0">
            Use This Voice
          </Link>
        </div>

        {/* Overall Score */}
        {quality && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#E8E4DA" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={quality.overall >= 80 ? "#22c55e" : quality.overall >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${quality.overall * 2.64} 264`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{quality.overall}</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-1">Voice Quality Score</h2>
                <p className="text-[var(--color-ink-soft)] text-sm">{quality.topRecommendation}</p>
              </div>
            </div>
          </div>
        )}

        {loadingQuality && !quality && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-8 mb-6 text-center">
            <p className="text-[var(--color-ink-soft)] animate-pulse">Analyzing profile quality...</p>
          </div>
        )}

        {/* Voice Dimensions */}
        {quality && (
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-4">Voice Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quality.dimensions.map((d) => (
                <div key={d.name} className={`bg-[var(--color-paper-deep)] border ${statusBorder(d.status)} rounded-[2px] p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{d.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--color-ink-soft)]">{d.score}/100</span>
                      <div className={`w-2 h-2 rounded-[2px] ${statusColor(d.status)}`} />
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] mb-2">
                    <div className={`h-full rounded-[2px] transition-all ${statusColor(d.status)}`} style={{ width: `${d.score}%` }} />
                  </div>
                  <p className="text-xs text-[var(--color-ink-mute)] mb-1">{d.description}</p>
                  {d.status !== "strong" && (
                    <p className="text-xs text-[var(--color-accent)] mt-1">To improve: {d.improvement}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Tuning Sliders */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Voice Tuning</h2>
              <p className="text-[var(--color-ink-mute)] text-xs mt-0.5">Adjust these sliders to fine-tune how this voice writes. Changes apply to all future edits and generations.</p>
            </div>
            <div className="flex gap-2">
              {slidersChanged && (
                <>
                  <button onClick={handleResetSliders}
                    className="px-3 py-1.5 text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors">
                    Reset
                  </button>
                  <button onClick={handleSaveSliders} disabled={saving}
                    className="px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-xs font-medium transition-colors disabled:opacity-50">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5 space-y-5">
            {SLIDERS.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[var(--color-ink-soft)]">{s.label}</label>
                  <span className="text-xs text-[var(--color-ink-mute)]">{sliders[s.key] ?? 5}/10</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[var(--color-ink-mute)] w-24 text-right shrink-0">{s.low}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={sliders[s.key] ?? 5}
                    onChange={(e) => handleSliderChange(s.key, Number(e.target.value))}
                    className="flex-1 h-1.5 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] appearance-none cursor-pointer accent-[var(--color-accent)]
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-[2px] [&::-webkit-slider-thumb]:bg-[var(--color-accent)] [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-[2px] [&::-moz-range-thumb]:bg-[var(--color-accent)] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <span className="text-[10px] text-[var(--color-ink-mute)] w-24 shrink-0">{s.high}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload More Samples */}
        {isPersonal && quality && quality.overall < 90 && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-accent)] rounded-[2px] p-6 mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3 text-[var(--color-accent)]">
              Improve This Voice
            </h2>
            <ul className="space-y-3 mb-4">
              {quality.dimensions
                .filter((d) => d.status !== "strong")
                .sort((a, b) => a.score - b.score)
                .slice(0, 3)
                .map((d) => (
                  <li key={d.name} className="flex gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-[2px] mt-1.5 shrink-0 ${statusColor(d.status)}`} />
                    <div>
                      <span className="text-[var(--color-ink-soft)] font-medium">{d.name}</span>
                      <span className="text-[var(--color-ink-mute)]"> — {d.improvement}</span>
                    </div>
                  </li>
                ))}
            </ul>
            <Link href={`/create/personal?improve=${profile.id}`}
              className="inline-block px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-sm font-medium transition-colors">
              Upload More Samples
            </Link>
          </div>
        )}

        {/* Merge / Blend CTA */}
        {isPersonal && (
          <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2">Blend With a Famous Voice</h2>
            <p className="text-[var(--color-ink-soft)] text-sm mb-4">
              Want your voice to sound like you but with Hemingway&apos;s precision? Obama&apos;s cadence? Paul Graham&apos;s clarity? Merge your personal voice with any curated writer to create a hybrid.
            </p>
            <Link href="/merge"
              className="inline-block px-5 py-2.5 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] rounded-[2px] text-sm font-medium transition-colors">
              Merge Voices
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileDetail />
    </Suspense>
  );
}
