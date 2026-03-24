import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed DoppelWriter's Free Writing Tools on Your Site",
  description: "Add DoppelWriter's free AI voice analyzer or email tone checker to your website. One line of code, free forever.",
  alternates: { canonical: "https://doppelwriter.com/embed" },
};

export default function EmbedPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-stone-800/40 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-literata)] font-bold text-lg">DoppelWriter</Link>
          <Link href="/signup" className="text-sm px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors">
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-literata)] text-4xl sm:text-5xl font-bold mb-4">
          Embed Free Writing Tools
        </h1>
        <p className="text-xl text-stone-400 mb-12 leading-relaxed">
          Add DoppelWriter&apos;s writing tools to your blog, course, or website. Free forever, one line of code.
        </p>

        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-4">Email Tone Checker</h2>
          <p className="text-stone-400 mb-4">Let your visitors check the tone of their emails before sending. Perfect for career blogs, communication courses, and HR sites.</p>
          <div className="bg-stone-900 border border-stone-800/40 rounded-lg p-4 mb-4">
            <code className="text-sm text-amber-400 break-all">
              &lt;iframe src=&quot;https://doppelwriter.com/embed/tone-checker&quot; width=&quot;100%&quot; height=&quot;500&quot; frameborder=&quot;0&quot; style=&quot;border-radius:12px&quot;&gt;&lt;/iframe&gt;
            </code>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-literata)] text-2xl font-semibold mb-4">Voice Analyzer</h2>
          <p className="text-stone-400 mb-4">Let visitors analyze their writing voice — sentence patterns, vocabulary, tone. Great for writing courses and author websites.</p>
          <div className="bg-stone-900 border border-stone-800/40 rounded-lg p-4 mb-4">
            <code className="text-sm text-amber-400 break-all">
              &lt;iframe src=&quot;https://doppelwriter.com/embed/voice-analyzer&quot; width=&quot;100%&quot; height=&quot;600&quot; frameborder=&quot;0&quot; style=&quot;border-radius:12px&quot;&gt;&lt;/iframe&gt;
            </code>
          </div>
        </section>

        <section className="mb-12 bg-stone-900/50 border border-stone-800/40 rounded-lg p-6">
          <h2 className="font-[family-name:var(--font-literata)] text-xl font-semibold mb-3">Why embed?</h2>
          <ul className="space-y-2 text-stone-400 text-sm">
            <li>Free forever — no API keys, no limits, no catch</li>
            <li>Responsive — works on mobile and desktop</li>
            <li>Dark and light mode compatible</li>
            <li>Your visitors get a useful tool, you get engagement</li>
          </ul>
        </section>

        <section className="text-center py-8">
          <p className="text-stone-500 text-sm mb-4">Want a custom integration?</p>
          <a href="mailto:enterprise@doppelwriter.com" className="text-amber-400 hover:text-amber-300 transition-colors">
            Contact us &rarr;
          </a>
        </section>
      </main>

      <footer className="border-t border-stone-800/40 py-8 text-center text-xs text-stone-600">
        DoppelWriter
      </footer>
    </div>
  );
}
