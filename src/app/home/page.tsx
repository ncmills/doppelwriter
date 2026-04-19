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
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold">Home</h1>
          <Link href="/write" className="px-4 sm:px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium transition-colors text-sm sm:text-base">
            Start Writing
          </Link>
        </div>

        {/* Loading state */}
        {!loaded && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 animate-pulse">
                <div className="h-4 bg-[var(--color-paper-deep)] rounded-[2px] w-1/3 mb-3" />
                <div className="h-3 bg-[var(--color-paper-deep)] rounded-[2px] w-2/3" />
              </div>
            ))}
          </div>
        )}

        {loaded && <>
        {/* Stats — only show if user has activity */}
        {(drafts.length > 0 || personalProfiles.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4">
              <p className="text-[var(--color-ink-mute)] text-xs">Projects</p>
              <p className="text-xl font-bold mt-1 text-[var(--color-accent)]">{drafts.length}</p>
            </div>
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4">
              <p className="text-[var(--color-ink-mute)] text-xs">My Voices</p>
              <p className="text-xl font-bold mt-1 text-[var(--color-accent)]">{personalProfiles.length}</p>
            </div>
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4">
              <p className="text-[var(--color-ink-mute)] text-xs">Words Written</p>
              <p className="text-xl font-bold mt-1 text-green-700">
                {drafts.reduce((sum, d) => sum + (d.content?.split(/\s+/).length || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4">
              <p className="text-[var(--color-ink-mute)] text-xs">Usage</p>
              <p className="text-xl font-bold mt-1 text-[var(--color-ink-soft)]">
                {usage ? (usage.limit === -1 ? `${usage.used}` : `${usage.used}/${usage.limit}`) : "..."}
              </p>
            </div>
          </div>
        )}

        {/* Empty state for new users — action-oriented, not stat-oriented */}
        {drafts.length === 0 && personalProfiles.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Link href="/write"
              className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 transition-colors hover:border-[var(--color-ink)] group">
              <div className="flex gap-3 mb-3">
                {["Ernest Hemingway", "Paul Graham"].map((n) => (
                  <WriterAvatar key={n} name={n} size={32} />
                ))}
              </div>
              <h3 className="font-semibold group-hover:text-[var(--color-accent)] transition-colors">Try a Famous Voice</h3>
              <p className="text-[var(--color-ink-mute)] text-xs mt-1">Pick any writer and see AI write in their style. One click.</p>
            </Link>
            <Link href="/create/personal"
              className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 transition-colors hover:border-[var(--color-ink)] group">
              <div className="text-2xl mb-2">You</div>
              <h3 className="font-semibold group-hover:text-[var(--color-accent)] transition-colors">Clone Your Voice</h3>
              <p className="text-[var(--color-ink-mute)] text-xs mt-1">Upload your writing and build a voice that sounds like you.</p>
            </Link>
            <Link href="/write"
              className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-6 transition-colors hover:border-[var(--color-ink)] group">
              <div className="text-2xl mb-2">100+</div>
              <h3 className="font-semibold group-hover:text-[var(--color-accent)] transition-colors">Browse All Voices</h3>
              <p className="text-[var(--color-ink-mute)] text-xs mt-1">Authors, politicians, scientists, comedians, and more.</p>
            </Link>
          </div>
        )}

        {/* Your Voices */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Your Voices</h2>
            <Link href="/create/personal" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-ink)]">+ Create new</Link>
          </div>
          {personalProfiles.length === 0 ? (
            <Link href="/create/personal"
              className="block bg-[var(--color-paper-deep)] border border-dashed border-[var(--color-rule)] rounded-[2px] p-6 text-center transition-colors hover:border-[var(--color-ink)]">
              <p className="text-[var(--color-ink-mute)] text-sm">Clone your voice, your mom&apos;s, anyone&apos;s</p>
              <p className="text-[var(--color-accent)] text-xs mt-1">Create your first voice &rarr;</p>
            </Link>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personalProfiles.map((p) => (
                <div key={p.id}
                  className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4">
                  <p className="font-medium text-sm mb-3">{p.name}</p>
                  <div className="flex gap-2">
                    <Link href={`/write?voice=${p.id}&mode=generate`}
                      className="flex-1 text-center py-2 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-xs font-medium transition-colors">
                      Generate
                    </Link>
                    <Link href={`/write?voice=${p.id}&mode=edit`}
                      className="flex-1 text-center py-2 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-xs font-medium transition-colors">
                      Edit
                    </Link>
                    <Link href={`/profile/${p.id}`}
                      className="flex-1 text-center py-2 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] rounded-[2px] text-xs font-medium text-[var(--color-ink-soft)] transition-colors">
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
              className="block bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5 transition-colors hover:border-[var(--color-ink)] group">
              <div className="flex items-center gap-4">
                {/* Overlapping avatars preview */}
                <div className="flex -space-x-3 shrink-0">
                  {allBuiltProfiles.slice(0, 3).map((p) => (
                    <div key={p.id} className="border-2 border-[var(--color-paper)] rounded-[2px]">
                      <WriterAvatar name={p.writer_name || p.name} size={36} />
                    </div>
                  ))}
                  {allBuiltProfiles.length > 3 && (
                    <div className="w-9 h-9 rounded-[2px] bg-[var(--color-paper-deep)] border-2 border-[var(--color-paper)] flex items-center justify-center text-xs text-[var(--color-ink-soft)]">
                      +{allBuiltProfiles.length - 3}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors">
                    Merge Voices
                  </h3>
                  <p className="text-xs text-[var(--color-ink-mute)]">
                    Blend {allBuiltProfiles.length} voices into a hybrid — your voice + Hemingway, Obama + Paul Graham, anything.
                  </p>
                </div>
                <span className="ml-auto text-[var(--color-ink-mute)] group-hover:text-[var(--color-accent)] transition-colors">&rarr;</span>
              </div>
            </Link>
          </div>
        )}

        {/* Famous Voices */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Famous Voices</h2>
            <Link href="/write" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-ink)]">Browse all &rarr;</Link>
          </div>

          {curatedProfiles.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-[var(--color-ink-mute)] uppercase tracking-wider mb-2">Recently used</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {curatedProfiles.slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/write?voice=${p.id}`}
                    className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-3 transition-colors hover:border-[var(--color-ink)] flex items-center gap-3">
                    <WriterAvatar name={p.writer_name || p.name} size={32} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.writer_name || p.name}</p>
                      <p className="text-xs text-[var(--color-ink-mute)]">{p.writer_category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-[var(--color-ink-mute)] uppercase tracking-wider mb-2">Suggested</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {suggestedWriters.map((w) => (
              <Link key={w.name} href="/write"
                className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-3 transition-colors hover:border-[var(--color-ink)] text-center">
                <div className="flex justify-center"><WriterAvatar name={w.name} size={40} /></div>
                <p className="font-medium text-xs mt-2">{w.name}</p>
                <p className="text-xs text-[var(--color-ink-mute)] mt-0.5">{w.category}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Referral Card */}
        {referral && (
          <div className="mb-8 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
              <h2 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-semibold">Invite Friends, Get Free Uses</h2>
              <span className="text-xs text-[var(--color-ink-mute)]">{referral.count} invited &middot; +{referral.bonus} bonus uses</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={`doppelwriter.com/?ref=${referral.code}`}
                className="flex-1 px-3 py-2.5 bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-[2px] text-sm text-[var(--color-ink-soft)] focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://doppelwriter.com/?ref=${referral.code}`);
                  setRefCopied(true);
                  setTimeout(() => setRefCopied(false), 2000);
                }}
                className="px-4 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] text-sm font-medium transition-colors shrink-0"
              >
                {refCopied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <p className="text-xs text-[var(--color-ink-mute)] mt-2">You and your friend both get +5 free uses when they sign up.</p>
          </div>
        )}

        {/* Recent Projects */}
        {drafts.length > 0 && (
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-3">Recent Projects</h2>
            <div className="space-y-2">
              {drafts.slice(0, 6).map((draft) => (
                <div key={draft.id} className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{draft.title}</p>
                    <p className="text-xs text-[var(--color-ink-soft)]">
                      {draft.profile_name && <span className="text-[var(--color-accent)]">{draft.profile_name}</span>}
                      {draft.profile_name && " · "}
                      {draft.mode} · {new Date(draft.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-[var(--color-ink-mute)] text-xs">{draft.content?.split(/\s+/).length || 0} words</p>
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
