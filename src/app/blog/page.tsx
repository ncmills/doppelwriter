import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | DoppelWriter",
  description:
    "Tips, guides, and insights on AI writing, voice matching, and making AI-generated text sound like you.",
  openGraph: {
    title: "Blog | DoppelWriter",
    description:
      "Tips, guides, and insights on AI writing, voice matching, and making AI-generated text sound like you.",
    url: "https://doppelwriter.com/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | DoppelWriter",
    description:
      "Tips, guides, and insights on AI writing, voice matching, and making AI-generated text sound like you.",
  },
  alternates: { canonical: "https://doppelwriter.com/blog" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "DoppelWriter Blog",
          description:
            "Tips, guides, and insights on AI writing, voice matching, and making AI-generated text sound like you.",
          url: "https://doppelwriter.com/blog",
          publisher: {
            "@type": "Organization",
            name: "DoppelWriter",
            url: "https://doppelwriter.com",
          },
          blogPost: posts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            ...(post.updatedAt && { dateModified: post.updatedAt }),
            author: {
              "@type": "Organization",
              name: post.author,
            },
            url: `https://doppelwriter.com/blog/${post.slug}`,
          })),
        }}
      />

      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-literata)] font-bold text-lg"
          >
            DoppelWriter
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="font-[family-name:var(--font-literata)] text-4xl sm:text-5xl font-bold mb-4">
            Blog
          </h1>
          <p className="text-xl text-stone-400 leading-relaxed">
            Writing tips, AI insights, and the craft of sounding like yourself.
          </p>
        </div>

        <div className="grid gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-stone-900/50 border border-stone-800/40 rounded-lg p-6 hover:border-amber-600/40 transition-colors group"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-3">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                <span>&middot;</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="font-[family-name:var(--font-literata)] text-xl sm:text-2xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-stone-400 leading-relaxed mb-4">
                {post.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-stone-800/60 text-stone-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Internal Links — Tools & Resources */}
        <div className="mt-16 pt-12 border-t border-stone-800/40">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-bold mb-6">
            Explore DoppelWriter
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/analyze"
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors block"
            >
              <h3 className="font-semibold text-sm mb-1">Free Writing Voice Analyzer</h3>
              <p className="text-xs text-stone-400">Paste any text and instantly see its writing style broken down — sentence rhythm, vocabulary, tone, and personality.</p>
            </Link>
            <Link
              href="/for"
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors block"
            >
              <h3 className="font-semibold text-sm mb-1">DoppelWriter For Your Niche</h3>
              <p className="text-xs text-stone-400">Newsletter writers, ghostwriters, fiction authors, marketers, students — see how DoppelWriter fits what you do.</p>
            </Link>
            <Link
              href="/vs/chatgpt"
              className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors block"
            >
              <h3 className="font-semibold text-sm mb-1">DoppelWriter vs ChatGPT</h3>
              <p className="text-xs text-stone-400">See why voice-matched writing beats generic AI output for anything that needs to sound like you.</p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-800/40 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-600">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className="text-xs text-stone-500 hover:text-white transition-colors">Home</Link>
            <Link href="/analyze" className="text-xs text-stone-500 hover:text-white transition-colors">Voice Analyzer</Link>
            <Link href="/for" className="text-xs text-stone-500 hover:text-white transition-colors">Use Cases</Link>
            <Link href="/pricing" className="text-xs text-stone-500 hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
