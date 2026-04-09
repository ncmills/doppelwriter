import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

const BLOG_RELATED_RESOURCES: Record<string, { useCases: { slug: string; label: string }[]; writers: { slug: string; label: string }[] }> = {
  "ai-cover-letter-generator": {
    useCases: [
      { slug: "cover-letter", label: "Write My Cover Letter" },
      { slug: "resume", label: "Write My Resume" },
      { slug: "linkedin-summary", label: "Write My LinkedIn Summary" },
    ],
    writers: [
      { slug: "james-clear", label: "Write Like James Clear" },
      { slug: "paul-graham", label: "Write Like Paul Graham" },
    ],
  },
  "how-to-write-eulogy-for-mom": {
    useCases: [
      { slug: "eulogy", label: "Write My Eulogy" },
      { slug: "condolence-message", label: "Write My Condolence Message" },
      { slug: "sympathy-card", label: "Write My Sympathy Card" },
    ],
    writers: [
      { slug: "mary-oliver", label: "Write Like Mary Oliver" },
      { slug: "joan-didion", label: "Write Like Joan Didion" },
    ],
  },
  "best-ai-writing-tools-2026": {
    useCases: [
      { slug: "blog-post", label: "Write My Blog Post" },
      { slug: "newsletter", label: "Write My Newsletter" },
      { slug: "essay", label: "Write My Essay" },
    ],
    writers: [
      { slug: "paul-graham", label: "Write Like Paul Graham" },
      { slug: "seth-godin", label: "Write Like Seth Godin" },
    ],
  },
  "why-ai-writing-sounds-robotic": {
    useCases: [
      { slug: "blog-post", label: "Write My Blog Post" },
      { slug: "essay", label: "Write My Essay" },
    ],
    writers: [
      { slug: "ernest-hemingway", label: "Write Like Ernest Hemingway" },
      { slug: "kurt-vonnegut", label: "Write Like Kurt Vonnegut" },
    ],
  },
  "how-to-write-a-wedding-speech": {
    useCases: [
      { slug: "wedding-speech", label: "Write My Wedding Speech" },
      { slug: "best-man-speech", label: "Write My Best Man Speech" },
      { slug: "maid-of-honor-speech", label: "Write My Maid of Honor Speech" },
    ],
    writers: [
      { slug: "david-sedaris", label: "Write Like David Sedaris" },
      { slug: "nora-ephron", label: "Write Like Nora Ephron" },
    ],
  },
  "chatgpt-vs-doppelwriter": {
    useCases: [
      { slug: "blog-post", label: "Write My Blog Post" },
      { slug: "cover-letter", label: "Write My Cover Letter" },
      { slug: "linkedin-post", label: "Write My LinkedIn Post" },
    ],
    writers: [
      { slug: "james-clear", label: "Write Like James Clear" },
      { slug: "joan-didion", label: "Write Like Joan Didion" },
    ],
  },
  "famous-writers-style-analysis": {
    useCases: [
      { slug: "essay", label: "Write My Essay" },
      { slug: "blog-post", label: "Write My Blog Post" },
    ],
    writers: [
      { slug: "ernest-hemingway", label: "Write Like Ernest Hemingway" },
      { slug: "toni-morrison", label: "Write Like Toni Morrison" },
    ],
  },
  "personal-statement-ai-writer": {
    useCases: [
      { slug: "personal-statement", label: "Write My Personal Statement" },
      { slug: "college-application-essay", label: "Write My College Application Essay" },
      { slug: "scholarship-essay", label: "Write My Scholarship Essay" },
    ],
    writers: [
      { slug: "james-baldwin", label: "Write Like James Baldwin" },
      { slug: "joan-didion", label: "Write Like Joan Didion" },
    ],
  },
  "best-man-speech-guide": {
    useCases: [
      { slug: "best-man-speech", label: "Write My Best Man Speech" },
      { slug: "wedding-speech", label: "Write My Wedding Speech" },
      { slug: "wedding-toast", label: "Write My Wedding Toast" },
    ],
    writers: [
      { slug: "david-sedaris", label: "Write Like David Sedaris" },
      { slug: "jerry-seinfeld", label: "Write Like Jerry Seinfeld" },
    ],
  },
  "linkedin-post-tips": {
    useCases: [
      { slug: "linkedin-post", label: "Write My LinkedIn Post" },
      { slug: "linkedin-summary", label: "Write My LinkedIn Summary" },
      { slug: "professional-bio", label: "Write My Professional Bio" },
    ],
    writers: [
      { slug: "seth-godin", label: "Write Like Seth Godin" },
      { slug: "james-clear", label: "Write Like James Clear" },
    ],
  },
  "how-to-make-ai-write-like-you": {
    useCases: [
      { slug: "blog-post", label: "Write My Blog Post" },
      { slug: "newsletter", label: "Write My Newsletter" },
    ],
    writers: [
      { slug: "paul-graham", label: "Write Like Paul Graham" },
      { slug: "maria-popova", label: "Write Like Maria Popova" },
    ],
  },
  "can-ai-write-for-me": {
    useCases: [
      { slug: "cover-letter", label: "Write My Cover Letter" },
      { slug: "blog-post", label: "Write My Blog Post" },
      { slug: "essay", label: "Write My Essay" },
    ],
    writers: [
      { slug: "ernest-hemingway", label: "Write Like Ernest Hemingway" },
      { slug: "james-clear", label: "Write Like James Clear" },
    ],
  },
  "ai-writing-tools-for-beginners": {
    useCases: [
      { slug: "blog-post", label: "Write My Blog Post" },
      { slug: "cover-letter", label: "Write My Cover Letter" },
      { slug: "wedding-speech", label: "Write My Wedding Speech" },
    ],
    writers: [
      { slug: "paul-graham", label: "Write Like Paul Graham" },
      { slug: "seth-godin", label: "Write Like Seth Godin" },
    ],
  },
  "how-to-write-wedding-speech-not-a-writer": {
    useCases: [
      { slug: "wedding-speech", label: "Write My Wedding Speech" },
      { slug: "best-man-speech", label: "Write My Best Man Speech" },
      { slug: "wedding-vows", label: "Write My Wedding Vows" },
    ],
    writers: [
      { slug: "nora-ephron", label: "Write Like Nora Ephron" },
      { slug: "david-sedaris", label: "Write Like David Sedaris" },
    ],
  },
};

function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://doppelwriter.com/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.updatedAt && { modifiedTime: post.updatedAt }),
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: `https://doppelwriter.com/blog/${slug}` },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug);

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          author: {
            "@type": "Organization",
            name: "DoppelWriter",
            url: "https://doppelwriter.com",
          },
          publisher: {
            "@type": "Organization",
            name: "DoppelWriter",
            url: "https://doppelwriter.com",
          },
          mainEntityOfPage: `https://doppelwriter.com/blog/${slug}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://doppelwriter.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: "https://doppelwriter.com/blog",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: `https://doppelwriter.com/blog/${slug}`,
            },
          ],
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

      <main className="max-w-3xl mx-auto px-6 py-16">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-stone-500 mb-6 flex items-center gap-1.5 flex-wrap"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-stone-300 line-clamp-1">{post.title}</span>
        </nav>

        <article>
          <header className="mb-10">
            <h1 className="font-[family-name:var(--font-literata)] text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
              <span>{post.author}</span>
              <span>&middot;</span>
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
              <span>&middot;</span>
              <span>{post.readingTime}</span>
            </div>
          </header>

          <div
            className="prose prose-invert prose-stone max-w-none prose-headings:font-[family-name:var(--font-literata)] prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-[#FAFAF9] prose-th:text-left prose-table:text-sm prose-blockquote:border-amber-600/40 prose-blockquote:text-stone-400"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* CTA Banner */}
        <section className="mt-16 mb-12 text-center py-10 bg-stone-900/50 border border-stone-800/40 rounded-lg">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-3">
            Ready to write in your own voice?
          </h2>
          <p className="text-stone-400 mb-6 max-w-md mx-auto">
            DoppelWriter learns how you write, then helps you write more — in
            your voice, not the AI default.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium text-lg transition-colors"
          >
            Try DoppelWriter Free
          </Link>
        </section>

        {/* Related Resources — cross-links to use cases, writers, and tools */}
        {BLOG_RELATED_RESOURCES[slug] && (
          <section className="mb-12">
            <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-6">
              Related Resources
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BLOG_RELATED_RESOURCES[slug].useCases.map((uc) => (
                <Link
                  key={uc.slug}
                  href={`/write/${uc.slug}`}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group"
                >
                  <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">{uc.label}</p>
                  <p className="text-xs text-stone-500 mt-1">AI writing tool</p>
                </Link>
              ))}
              {BLOG_RELATED_RESOURCES[slug].writers.map((w) => (
                <Link
                  key={w.slug}
                  href={`/write-like/${w.slug}`}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group"
                >
                  <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">{w.label}</p>
                  <p className="text-xs text-stone-500 mt-1">Famous voice</p>
                </Link>
              ))}
              <Link
                href="/analyze"
                className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-4 hover:border-amber-600/40 transition-colors group"
              >
                <p className="font-medium text-sm group-hover:text-amber-400 transition-colors">Voice Analyzer</p>
                <p className="text-xs text-stone-500 mt-1">Analyze your writing style</p>
              </Link>
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-6">
              More from the blog
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="bg-stone-900/50 border border-stone-800/40 rounded-lg p-5 hover:border-amber-600/40 transition-colors group"
                >
                  <p className="font-[family-name:var(--font-literata)] font-semibold mb-1 group-hover:text-amber-400 transition-colors">
                    {p.title}
                  </p>
                  <p className="text-sm text-stone-500 line-clamp-2">
                    {p.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-stone-800/40 py-8 text-center text-xs text-stone-600">
        DoppelWriter
      </footer>
    </div>
  );
}
