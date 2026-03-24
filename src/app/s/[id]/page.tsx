import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

async function getSharedDraft(slug: string) {
  try {
    const db = sql();
    const [draft] = await db`
      SELECT content, voice_name, created_at FROM shared_drafts WHERE slug = ${slug}
    `;
    return draft || null;
  } catch {
    // Table may not exist yet
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const draft = await getSharedDraft(id);
  if (!draft) return { title: "Not Found — DoppelWriter" };

  const plainText = draft.content.replace(/<[^>]+>/g, "").slice(0, 160);
  const title = draft.voice_name
    ? `${draft.voice_name}'s voice — Written with DoppelWriter`
    : "Written with DoppelWriter";

  return {
    title,
    description: plainText,
    openGraph: {
      title,
      description: plainText,
      type: "article",
      siteName: "DoppelWriter",
      url: `https://doppelwriter.com/s/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: plainText,
    },
  };
}

export default async function SharedDraftPage({ params }: Props) {
  const { id } = await params;
  const draft = await getSharedDraft(id);
  if (!draft) notFound();

  const voiceSignupUrl = draft.voice_name
    ? `/signup?voice=${encodeURIComponent(draft.voice_name)}`
    : "/signup";

  return (
    <div className="min-h-screen">
      {/* Minimal nav */}
      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-3xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-literata)] font-bold text-lg">
            DoppelWriter
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            Try It Free
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {draft.voice_name && (
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/10 border border-amber-600/20 rounded-full mb-3">
              <span className="text-amber-400 text-sm">Written in the voice of</span>
              <span className="font-[family-name:var(--font-literata)] font-bold text-amber-300 text-lg">{draft.voice_name}</span>
            </div>
            <p className="text-stone-500 text-sm max-w-lg">
              DoppelWriter uses AI to capture any writer&apos;s voice — sentence rhythm, word choice, and personality.
            </p>
          </div>
        )}

        {draft.voice_name && (
          <div className="mb-8">
            <Link
              href={voiceSignupUrl}
              className="inline-block px-6 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors text-sm"
            >
              Write your own version in {draft.voice_name}&apos;s voice
            </Link>
          </div>
        )}

        <div
          className="prose prose-invert prose-stone max-w-none leading-relaxed text-lg"
          dangerouslySetInnerHTML={{ __html: draft.content }}
        />

        {/* Watermark + CTAs */}
        <div className="mt-16 pt-8 border-t border-stone-800/40 text-center">
          <a
            href="https://doppelwriter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-stone-500 hover:text-amber-400 text-xs tracking-wide uppercase mb-6 transition-colors"
          >
            Written with DoppelWriter — Try it free
          </a>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {draft.voice_name && (
              <Link
                href={voiceSignupUrl}
                className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
              >
                Write in {draft.voice_name}&apos;s Voice
              </Link>
            )}
            <Link
              href="/signup"
              className={draft.voice_name
                ? "inline-block px-8 py-3 border border-stone-700 hover:border-stone-500 rounded-lg font-medium transition-colors text-stone-300 hover:text-white"
                : "inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
              }
            >
              {draft.voice_name ? "Try Your Own Voice" : "Write like this — try DoppelWriter free"}
            </Link>
          </div>
          <p className="text-stone-600 text-xs mt-3">No credit card required</p>
        </div>
      </main>
    </div>
  );
}
