import type { Metadata } from "next";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import { CATEGORIES } from "@/lib/writer-data";
import { USE_CASE_CATEGORIES } from "@/lib/use-cases";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { ALTERNATIVES } from "@/lib/alternatives";

export const metadata: Metadata = {
  title: "Sitemap — DoppelWriter",
  description:
    "Browse every page on DoppelWriter — writer voices, use cases, blog posts, free tools, competitor comparisons, and more.",
  alternates: { canonical: "https://doppelwriter.com/sitemap-html" },
};

const MAIN_PAGES = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/signup", label: "Sign Up" },
  { href: "/login", label: "Log In" },
  { href: "/blog", label: "Blog" },
  { href: "/for", label: "DoppelWriter For..." },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const VS_PAGES = [
  { href: "/vs/chatgpt", label: "DoppelWriter vs ChatGPT" },
  { href: "/vs/jasper", label: "DoppelWriter vs Jasper" },
  { href: "/vs/grammarly", label: "DoppelWriter vs Grammarly" },
  { href: "/vs/copyai", label: "DoppelWriter vs Copy.ai" },
  { href: "/vs/writesonic", label: "DoppelWriter vs Writesonic" },
];

const FREE_TOOLS = [
  { href: "/tools/email-tone-checker", label: "Email Tone Checker" },
  { href: "/analyze", label: "Voice Analyzer" },
];

export default function SitemapHtmlPage() {
  const blogPosts = BLOG_POSTS.slice(0, 10);
  const hasMoreBlogPosts = BLOG_POSTS.length > 10;

  return (
    <div className="min-h-screen">
      <LandingNav />

      <main className="max-w-4xl mx-auto px-6">
        <section className="py-16 md:py-20">
          <h1 className="font-[family-name:var(--font-literata)] text-4xl md:text-5xl font-bold mb-4">
            Sitemap
          </h1>
          <p className="text-stone-400 text-lg">
            Every page on DoppelWriter, organized for easy browsing.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-12 pb-16">
          {/* Main Pages */}
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-bold mb-4 text-amber-400">
              Main Pages
            </h2>
            <ul className="space-y-2">
              {MAIN_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-stone-300 hover:text-white transition-colors text-sm"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Writer Categories */}
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-bold mb-4 text-amber-400">
              Writer Categories
            </h2>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/write-like/${cat.id}`}
                    className="text-stone-300 hover:text-white transition-colors text-sm"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Use Case Categories */}
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-bold mb-4 text-amber-400">
              Use Case Categories
            </h2>
            <ul className="space-y-2">
              {USE_CASE_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/write/${cat.id}`}
                    className="text-stone-300 hover:text-white transition-colors text-sm"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/for"
                  className="text-stone-500 hover:text-amber-400 transition-colors text-xs"
                >
                  See all niches &rarr;
                </Link>
              </li>
            </ul>
          </section>

          {/* Blog */}
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-bold mb-4 text-amber-400">
              Blog
            </h2>
            <ul className="space-y-2">
              {blogPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-stone-300 hover:text-white transition-colors text-sm"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
              {hasMoreBlogPosts && (
                <li>
                  <Link
                    href="/blog"
                    className="text-stone-500 hover:text-amber-400 transition-colors text-xs"
                  >
                    See all {BLOG_POSTS.length} posts &rarr;
                  </Link>
                </li>
              )}
            </ul>
          </section>

          {/* VS Pages */}
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-bold mb-4 text-amber-400">
              Comparisons
            </h2>
            <ul className="space-y-2">
              {VS_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-stone-300 hover:text-white transition-colors text-sm"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Alternatives Pages */}
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-bold mb-4 text-amber-400">
              Alternatives
            </h2>
            <ul className="space-y-2">
              {ALTERNATIVES.map((alt) => (
                <li key={alt.slug}>
                  <Link
                    href={`/alternatives/${alt.slug}`}
                    className="text-stone-300 hover:text-white transition-colors text-sm"
                  >
                    Best {alt.competitor} Alternative
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Free Tools */}
          <section>
            <h2 className="font-[family-name:var(--font-literata)] text-xl font-bold mb-4 text-amber-400">
              Free Tools
            </h2>
            <ul className="space-y-2">
              {FREE_TOOLS.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-stone-300 hover:text-white transition-colors text-sm"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/40 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-stone-600">&copy; {new Date().getFullYear()} DoppelWriter</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-stone-500 hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-stone-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-stone-500 hover:text-white transition-colors">Terms</Link>
          </div>
          <a
            href="mailto:enterprise@doppelwriter.com?subject=Enterprise%20Inquiry"
            className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
          >
            Enterprise &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
