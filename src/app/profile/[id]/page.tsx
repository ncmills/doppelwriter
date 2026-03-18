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

function ProfileDetail() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [loadingQuality, setLoadingQuality] = useState(false);

  useEffect(() => {
    fetch(`/api/profiles/${profileId}`).then((r) => r.json()).then(setProfile);
  }, [profileId]);

  const loadQuality = async () => {
    setLoadingQuality(true);
    const res = await fetch(`/api/profiles/${profileId}/quality`);
    if (res.ok) setQuality(await res.json());
    setLoadingQuality(false);
  };

  useEffect(() => { loadQuality(); }, [profileId]);

  if (!profile) return <div className="p-8 text-stone-500">Loading...</div>;

  const statusColor = (status: string) => {
    switch (status) {
      case "strong": return "bg-green-500";
      case "moderate": return "bg-amber-500";
      case "weak": return "bg-red-500";
      default: return "bg-stone-600";
    }
  };

  const statusBorder = (status: string) => {
    switch (status) {
      case "strong": return "border-green-500/30";
      case "moderate": return "border-amber-500/30";
      case "weak": return "border-red-500/30";
      default: return "border-stone-700/40";
    }
  };

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => router.back()} className="text-sm text-stone-400 hover:text-white mb-4 inline-block">
          &larr; Back
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-literata)] text-2xl font-bold">
              {profile.writer_name || profile.name}
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              {profile.is_curated ? "Curated profile" : "Personal voice profile"} · Updated {new Date(profile.updated_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/doppelwrite/${profile.is_curated ? "curated" : "personal"}?id=${profile.id}`}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
              Use This Voice
            </Link>
            {!profile.is_curated && (
              <Link href="/create/personal"
                className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm transition-colors">
                Add More Samples
              </Link>
            )}
          </div>
        </div>

        {/* Overall Score */}
        {quality && (
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#292524" strokeWidth="8" />
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
                <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold mb-1">
                  Voice Quality Score
                </h2>
                <p className="text-stone-400 text-sm">{quality.topRecommendation}</p>
              </div>
            </div>
          </div>
        )}

        {loadingQuality && !quality && (
          <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-8 mb-6 text-center">
            <p className="text-stone-400 animate-pulse">Analyzing profile quality...</p>
          </div>
        )}

        {/* Dimension Breakdown */}
        {quality && (
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold mb-4">Voice Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quality.dimensions.map((d) => (
                <div key={d.name} className={`bg-stone-900/50 border ${statusBorder(d.status)} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{d.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">{d.score}/100</span>
                      <div className={`w-2 h-2 rounded-full ${statusColor(d.status)}`} />
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${statusColor(d.status)}`}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500 mb-1">{d.description}</p>
                  {d.status !== "strong" && (
                    <p className="text-xs text-amber-400 mt-1">
                      To improve: {d.improvement}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Improvement Tips */}
        {quality && quality.overall < 90 && (
          <div className="bg-amber-600/10 border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold mb-3 text-amber-400">
              Quick Wins to Improve Your Profile
            </h2>
            <ul className="space-y-3">
              {quality.dimensions
                .filter((d) => d.status !== "strong")
                .sort((a, b) => a.score - b.score)
                .slice(0, 3)
                .map((d) => (
                  <li key={d.name} className="flex gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${statusColor(d.status)}`} />
                    <div>
                      <span className="text-stone-300 font-medium">{d.name}</span>
                      <span className="text-stone-500"> — {d.improvement}</span>
                    </div>
                  </li>
                ))}
            </ul>
            <Link href="/create/personal" className="inline-block mt-4 text-sm text-amber-400 hover:text-amber-300">
              Upload more samples &rarr;
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
