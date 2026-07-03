// Renders an engine-generated MDX post (content/blog/*.mdx). Used as a fallback
// from the [slug] page when a slug is not one of the hand-authored BLOG_POSTS.
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { getPost, getRelatedPosts } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/mdxComponents";
import { JsonLd } from "@/components/JsonLd";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function MdxPost({ slug }: { slug: string }) {
  const post = getPost(slug);
  if (!post) return null;
  const { content } = await compileMDX({ source: post.content, components: mdxComponents });
  const related = getRelatedPosts(post, 3);
  const url = `https://doppelwriter.com/blog/${slug}`;

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.datePublished,
          dateModified: post.dateModified ?? post.datePublished,
          author: { "@type": "Organization", name: "DoppelWriter", url: "https://doppelwriter.com" },
          publisher: { "@type": "Organization", name: "DoppelWriter", url: "https://doppelwriter.com" },
          mainEntityOfPage: url,
        }}
      />
      {post.faqs && post.faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: post.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}
      <article className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/blog" className="text-sm text-[var(--color-fg-muted)] no-underline hover:text-[var(--color-fg)]">
          ← All posts
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-fg-strong)] sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-lg text-[var(--color-fg-muted)]">{post.description}</p>
        <div className="mt-2 text-sm text-[var(--color-fg-muted)]">
          {formatDate(post.datePublished)} · {post.readingMinutes} min read
        </div>
        <div className="mt-8">{content}</div>

        {post.citations?.length > 0 && (
          <section className="mt-12 border-t border-[var(--color-border)] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Sources</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {post.citations.map((c) => (
                <li key={c.url}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-fg)] underline">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12 border-t border-[var(--color-border)] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Related</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} className="font-medium text-[var(--color-brand)] underline">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
