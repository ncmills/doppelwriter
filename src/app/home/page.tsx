"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Nav from "@/components/Nav";
import WriterAvatar from "@/components/WriterAvatar";
import { CURATED_WRITERS } from "@/lib/writer-data";
import { identifyUser } from "@/lib/analytics";

interface Draft {
  id: number;
  title: string;
  mode: string;
  profile_name: string | null;
  updated_at: string;
  content: string;
}

interface Profile {
  id: number;
  name: string;
  is_curated: boolean;
  writer_name: string | null;
  writer_category: string | null;
  updated_at: string;
}

const SUGGESTED = ["Ernest Hemingway", "Paul Graham", "Barack Obama", "Tina Fey", "Carl Sagan", "Seth Godin"];

export default function HomePage() {
  const { data: session } = useSession();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string } | null>(null);
  const [referral, setReferral] = useState<{ code: string; count: number; bonus: number } | null>(null);
  const [refCopied, setRefCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      identifyUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
        plan: (session.user as Record<string, unknown>).plan,
      });
    }
  }, [session]);

  useEffect(() => {
    Promise.all([
      fetch("/api/drafts").then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/usage").then((r) => r.json()),
      fetch("/api/referral").then((r) => r.json()).catch(() => null),
    ]).then(([d, p, u, r]) => {
      setDrafts(d);
      setProfiles(p);
      setUsage(u);
      if (r && !r.error) setReferral(r);
      setLoaded(true);
    });
  }, []);

  const personalProfiles = profiles.filter((p) => !p.is_curated);
  const curatedProfiles = profiles.filter((p) => p.is_curated);
  const allBuiltProfiles = profiles.filter((p) => p.id);
  const suggestedWriters = CURATED_WRITERS.filter(
    (w) => SUGGESTED.includes(w.name) && !curatedProfiles.some((p) => p.writer_name === w.name)
  );
  const hasEnoughToMerge = allBuiltProfiles.length >= 2;

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="font-[family-name:var(--font-literata)] text-2xl sm:text-3xl font-bold">Home</h1>
          <Link href="/write" className="px-4 sm:px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors text-sm sm:text-base">
            Start Writing
          </Link>
        </div>

        {/* Loading state */}
        {!loaded && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-stone-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-stone-800/60 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {loaded && <>
        {/* Stats — only show if user has activity */}
        {(drafts.length > 0 || personalProfiles.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4">
              <p className="text-stone-500 text-xs">Projects</p>
              <p className="text-xl font-bold mt-1 text-amber-400">{drafts.length}</p>
            </div>
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4">
              <p className="text-stone-500 text-xs">My Voices</p>
              <p className="text-xl font-bold mt-1 text-amber-400">{personalProfiles.length}</p>
            </div>
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4">
              <p className="text-stone-500 text-xs">Words Written</p>
              <p className="text-xl font-bold mt-1 text-green-400">
                {drafts.reduce((sum, d) => sum + (d.content?.split(/\s+/).length || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4">
              <p className="text-stone-500 text-xs">Usage</p>
              <p className="text-xl font-bold mt-1 text-stone-300">
                {usage ? (usage.limit === -1 ? `${usage.used}` : `${usage.used}/${usage.limit}`) : "..."}
              </p>
            </div>
          </div>
        )}

        {/* Empty state for new users — action-oriented, not stat-oriented */}
        {drafts.length === 0 && personalProfiles.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Link href="/write"
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group">
              <div className="flex gap-3 mb-3">
                {["Ernest Hemingway", "Paul Graham"].map((n) => (
                  <WriterAvatar key={n} name={n} size={32} />
                ))}
              </div>
              <h3 className="font-semibold group-hover:text-amber-400 transition-colors">Try a Famous Voice</h3>
              <p className="text-stone-500 text-xs mt-1">Pick any writer and see AI write in their style. One click.</p>
            </Link>
            <Link href="/create/personal"
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group">
              <div className="text-2xl mb-2">You</div>
              <h3 className="font-semibold group-hover:text-amber-400 transition-colors">Clone Your Voice</h3>
              <p className="text-stone-500 text-xs mt-1">Upload your writing and build a voice that sounds like you.</p>
            </Link>
            <Link href="/write"
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group">
              <div className="text-2xl mb-2">100+</div>
              <h3 className="font-semibold group-hover:text-amber-400 transition-colors">Browse All Voices</h3>
              <p className="text-stone-500 text-xs mt-1">Authors, politicians, scientists, comedians, and more.</p>
            </Link>
          </div>
        )}

        {/* Your Voices */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold">Your Voices</h2>
            <Link href="/create/personal" className="text-xs text-amber-400 hover:text-amber-300">+ Create new</Link>
          </div>
          {personalProfiles.length === 0 ? (
            <Link href="/create/personal"
              className="block bg-stone-900/30 border border-dashed border-stone-800 rounded-lg p-6 text-center hover:border-amber-600/40 transition-colors">
              <p className="text-stone-500 text-sm">Clone your voice, your mom&apos;s, anyone&apos;s</p>
              <p className="text-amber-400 text-xs mt-1">Create your first voice &rarr;</p>
            </Link>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personalProfiles.map((p) => (
                <div key={p.id}
                  className="bg-stone-900/50 border border-amber-500/20 rounded-lg p-4">
                  <p className="font-medium text-sm mb-3">{p.name}</p>
                  <div className="flex gap-2">
                    <Link href={`/write?voice=${p.id}&mode=generate`}
                      className="flex-1 text-center py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-medium transition-colors">
                      Generate
                    </Link>
                    <Link href={`/write?voice=${p.id}&mode=edit`}
                      className="flex-1 text-center py-2 bg-amber-600/80 hover:bg-amber-500 rounded-lg text-xs font-medium transition-colors">
                      Edit
                    </Link>
                    <Link href={`/profile/${p.id}`}
                      className="flex-1 text-center py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs font-medium text-stone-300 transition-colors">
                      Customize
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Merge Voices — only shows when user has 2+ built profiles */}
        {hasEnoughToMerge && (
          <div className="mb-8">
            <Link href="/merge"
              className="block bg-stone-900/30 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors group">
              <div className="flex items-center gap-4">
                {/* Overlapping avatars preview */}
                <div className="flex -space-x-3 shrink-0">
                  {allBuiltProfiles.slice(0, 3).map((p) => (
                    <div key={p.id} className="border-2 border-[#0C0A09] rounded-full">
                      <WriterAvatar name={p.writer_name || p.name} size={36} />
                    </div>
                  ))}
                  {allBuiltProfiles.length > 3 && (
                    <div className="w-9 h-9 rounded-full bg-stone-800 border-2 border-[#0C0A09] flex items-center justify-center text-xs text-stone-400">
                      +{allBuiltProfiles.length - 3}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-amber-400 transition-colors">
                    Merge Voices
                  </h3>
                  <p className="text-xs text-stone-500">
                    Blend {allBuiltProfiles.length} voices into a hybrid — your voice + Hemingway, Obama + Paul Graham, anything.
                  </p>
                </div>
                <span className="ml-auto text-stone-600 group-hover:text-amber-400 transition-colors">&rarr;</span>
              </div>
            </Link>
          </div>
        )}

        {/* Famous Voices */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold">Famous Voices</h2>
            <Link href="/write" className="text-xs text-amber-400 hover:text-amber-300">Browse all &rarr;</Link>
          </div>

          {curatedProfiles.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-stone-600 uppercase tracking-wider mb-2">Recently used</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {curatedProfiles.slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/write?voice=${p.id}`}
                    className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-3 hover:border-amber-600/40 transition-colors flex items-center gap-3">
                    <WriterAvatar name={p.writer_name || p.name} size={32} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.writer_name || p.name}</p>
                      <p className="text-xs text-stone-600">{p.writer_category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-stone-600 uppercase tracking-wider mb-2">Suggested</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {suggestedWriters.map((w) => (
              <Link key={w.name} href="/write"
                className="bg-stone-900/30 border border-stone-800/30 rounded-lg p-3 hover:border-amber-600/40 transition-colors text-center">
                <div className="flex justify-center"><WriterAvatar name={w.name} size={40} /></div>
                <p className="font-medium text-xs mt-2">{w.name}</p>
                <p className="text-xs text-stone-600 mt-0.5">{w.category}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Referral Card */}
        {referral && (
          <div className="mb-8 bg-stone-900/50 border border-amber-500/20 rounded-lg p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
              <h2 className="font-[family-name:var(--font-literata)] text-base sm:text-lg font-semibold">Invite Friends, Get Free Uses</h2>
              <span className="text-xs text-stone-500">{referral.count} invited &middot; +{referral.bonus} bonus uses</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={`doppelwriter.com/?ref=${referral.code}`}
                className="flex-1 px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-300 focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://doppelwriter.com/?ref=${referral.code}`);
                  setRefCopied(true);
                  setTimeout(() => setRefCopied(false), 2000);
                }}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors shrink-0"
              >
                {refCopied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-2">You and your friend both get +5 free uses when they sign up.</p>
          </div>
        )}

        {/* Recent Projects */}
        {drafts.length > 0 && (
          <div>
            <h2 className="font-[family-name:var(--font-literata)] text-lg font-semibold mb-3">Recent Projects</h2>
            <div className="space-y-2">
              {drafts.slice(0, 6).map((draft) => (
                <div key={draft.id} className="bg-stone-900/50 border border-stone-800/40 rounded-lg px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{draft.title}</p>
                    <p className="text-xs text-stone-400">
                      {draft.profile_name && <span className="text-amber-400">{draft.profile_name}</span>}
                      {draft.profile_name && " · "}
                      {draft.mode} · {new Date(draft.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-stone-500 text-xs">{draft.content?.split(/\s+/).length || 0} words</p>
                </div>
              ))}
            </div>
          </div>
        )}
        </>}
      </main>
    </>
  );
}
