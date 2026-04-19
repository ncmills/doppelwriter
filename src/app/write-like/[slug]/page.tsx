import { notFound } from "next/navigation";
import Link from "next/link";
import { CURATED_WRITERS, CATEGORIES } from "@/lib/writer-builder";
import { USE_CASES } from "@/lib/use-cases";
import { JsonLd } from "@/components/JsonLd";
import EmailCapture from "@/components/EmailCapture";
import type { Metadata } from "next";

function writerSlug(name: string) {
  return name.toLowerCase().replace(/['']/g, "").replace(/\s+/g, "-");
}

function getWriter(slug: string) {
  return CURATED_WRITERS.find((w) => writerSlug(w.name) === slug);
}

function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

export function generateStaticParams() {
  const writerParams = CURATED_WRITERS.map((w) => ({
    slug: writerSlug(w.name),
  }));
  const categoryParams = CATEGORIES.map((c) => ({ slug: c.id }));
  return [...categoryParams, ...writerParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // All authors page — shows every writer across all categories
  if (slug === "authors") {
    const title = `All ${CURATED_WRITERS.length}+ Writer Voice Profiles — Browse Every AI Writing Voice`;
    const description = `Browse all ${CURATED_WRITERS.length}+ AI writer voice profiles on DoppelWriter. From Hemingway to Paul Graham, Obama to Dr. Seuss — find the perfect voice for your writing.`;
    return {
      title,
      description,
      openGraph: { title, description, url: "https://doppelwriter.com/write-like/authors" },
      twitter: { card: "summary_large_image", title, description },
      alternates: { canonical: "https://doppelwriter.com/write-like/authors" },
    };
  }

  // Category hub metadata
  if (CATEGORY_IDS.has(slug)) {
    const category = getCategory(slug)!;
    const title = `Write Like ${category.label} — AI Writing Voices`;
    const description = `Write in the style of famous ${category.label.toLowerCase()}. DoppelWriter's AI captures each writer's unique voice — sentence rhythm, word choice, and personality. Choose a voice and start writing.`;
    return {
      title,
      description,
      openGraph: { title, description, url: `https://doppelwriter.com/write-like/${slug}` },
      twitter: { card: "summary_large_image", title, description },
      alternates: { canonical: `https://doppelwriter.com/write-like/${slug}` },
    };
  }

  // Writer page metadata
  const writer = getWriter(slug);
  if (!writer) return {};

  const title = `Write Like ${writer.name} — AI Writing in ${writer.name}'s Voice`;
  const description = `Use DoppelWriter to write like ${writer.name}. ${writer.bio} Our AI captures this distinctive voice so you can draft emails, essays, and content in ${writer.name}'s style.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://doppelwriter.com/write-like/${slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `https://doppelwriter.com/write-like/${slug}` },
  };
}

// ─── Category Hub ───

const CATEGORY_INTROS: Record<string, string> = {
  authors: "Literary giants who shaped how we read and write. From Hemingway's iceberg theory to Toni Morrison's lyrical power — write in any of their voices.",
  business: "The clearest thinkers in business and tech. Draft memos like Bezos, essays like Paul Graham, or shareholder letters like Buffett.",
  podcasters: "Creators and conversationalists who turned talking into an art form. Capture their warmth, curiosity, and storytelling instincts in your writing.",
  politicians: "History's greatest orators and leaders. Write speeches, letters, and persuasive prose in the voice of presidents, prime ministers, and changemakers.",
  historical: "Voices from centuries past that still resonate today. From Marcus Aurelius's meditations to Mark Twain's wit — timeless styles for modern writing.",
  childrens: "The authors who shaped our childhoods. Write with the whimsy of Dr. Seuss, the dark humor of Roald Dahl, or the warmth of Beverly Cleary.",
  journalists: "The reporters, essayists, and new journalists who made nonfiction sing. Sharp observation, narrative depth, and distinctive voice.",
  comedians: "Comedy writers who turned observations into art. Capture Seinfeld's precision, Tina Fey's wit, or David Sedaris's dry memoir style.",
  philosophers: "Deep thinkers who challenge how we see the world. Write with the aphoristic edge of Taleb, the wonder of Alan Watts, or the rigor of Hannah Arendt.",
  scientists: "Science writers who make complex ideas accessible and beautiful. From Carl Sagan's cosmic wonder to Mary Roach's irreverent curiosity.",
};

function CategoryHubPage({ categoryId }: { categoryId: string }) {
  const category = getCategory(categoryId)!;
  const writers = CURATED_WRITERS.filter((w) => w.category === categoryId);
  const otherCategories = CATEGORIES.filter((c) => c.id !== categoryId);

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: `Write Like ${category.label}`,
              description: CATEGORY_INTROS[categoryId] ?? `AI writing voices for ${category.label}`,
              url: `https://doppelwriter.com/write-like/${categoryId}`,
              isPartOf: { "@type": "WebApplication", name: "DoppelWriter" },
              numberOfItems: writers.length,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://doppelwriter.com" },
                { "@type": "ListItem", position: 2, name: "Write Like", item: "https://doppelwriter.com/write-like" },
                { "@type": "ListItem", position: 3, name: category.label },
              ],
            },
          ],
        }}
      />

      <nav className="border-b border-[var(--color-rule)] sticky top-0 bg-[var(--color-paper)]/90 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-display)] font-bold text-lg">DoppelWriter</Link>
          <Link href="/signup" className="text-sm px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] transition-colors">
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-ink-soft)] mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/write-like" className="hover:text-[var(--color-ink)] transition-colors">Write Like</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">{category.label}</span>
        </nav>

        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4">
          Write Like {category.label}
        </h1>
        <p className="text-xl text-[var(--color-ink-soft)] mb-12 leading-relaxed max-w-3xl">
          {CATEGORY_INTROS[categoryId] ?? `Explore AI writing voices for ${category.label}.`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {writers.map((w) => (
            <Link
              key={w.name}
              href={`/write-like/${writerSlug(w.name)}`}
              className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5 transition-colors hover:border-[var(--color-ink)]"
            >
              <p className="font-medium mb-1">{w.name}</p>
              <p className="text-sm text-[var(--color-ink-soft)] line-clamp-2">{w.bio}</p>
            </Link>
          ))}
        </div>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-6">Other Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {otherCategories.map((c) => (
              <Link
                key={c.id}
                href={`/write-like/${c.id}`}
                className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)] text-center"
              >
                <p className="font-medium text-sm">{c.label}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-rule)] py-8 text-center text-xs text-[var(--color-ink-mute)]">
        DoppelWriter
      </footer>
    </div>
  );
}

// ─── Writer Page ───

const CATEGORY_USE_CASES: Record<string, string[]> = {
  authors: ["blog-post", "essay", "substack-post", "speech"],
  business: ["cold-email", "linkedin-post", "newsletter", "investor-update"],
  podcasters: ["podcast-intro", "youtube-script", "blog-post", "twitter-thread"],
  politicians: ["speech", "press-release", "formal-letter", "linkedin-post"],
  historical: ["essay", "blog-post", "speech", "formal-letter"],
  childrens: ["blog-post", "birthday-message", "speech", "gofundme"],
  journalists: ["blog-post", "essay", "substack-post", "press-release"],
  comedians: ["best-man-speech", "wedding-speech", "blog-post", "twitter-thread"],
  philosophers: ["essay", "blog-post", "substack-post", "speech"],
  scientists: ["blog-post", "essay", "press-release", "podcast-intro"],
};

function WriterPage({ writer, slug }: { writer: (typeof CURATED_WRITERS)[number]; slug: string }) {
  const category = CATEGORIES.find((c) => c.id === writer.category);
  const categoryLabel = category?.label ?? writer.category;

  const useCaseSlugs = CATEGORY_USE_CASES[writer.category] ?? [];
  const relevantUseCases = useCaseSlugs
    .map((s) => USE_CASES.find((uc) => uc.slug === s))
    .filter(Boolean) as typeof USE_CASES;

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `Write Like ${writer.name}`,
              description: `AI-powered writing in ${writer.name}'s style`,
              isPartOf: { "@type": "WebApplication", name: "DoppelWriter" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://doppelwriter.com" },
                { "@type": "ListItem", position: 2, name: "Write Like", item: "https://doppelwriter.com/write-like" },
                { "@type": "ListItem", position: 3, name: categoryLabel, item: `https://doppelwriter.com/write-like/${writer.category}` },
                { "@type": "ListItem", position: 4, name: `Write Like ${writer.name}` },
              ],
            },
            {
              "@type": "Person",
              name: writer.name,
              description: writer.bio,
            },
          ],
        }}
      />

      <nav className="border-b border-[var(--color-rule)] sticky top-0 bg-[var(--color-paper)]/90 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-display)] font-bold text-lg">DoppelWriter</Link>
          <Link href="/signup" className="text-sm px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] transition-colors">
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-ink-soft)] mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/write-like" className="hover:text-[var(--color-ink)] transition-colors">Write Like</Link>
          <span>/</span>
          <Link href={`/write-like/${writer.category}`} className="hover:text-[var(--color-ink)] transition-colors">{categoryLabel}</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">Write Like {writer.name}</span>
        </nav>
        <p className="text-[var(--color-accent)] text-sm font-medium mb-3 uppercase tracking-wider">{writer.tag}</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4">
          Write Like {writer.name}
        </h1>
        <p className="text-xl text-[var(--color-ink-soft)] mb-12 leading-relaxed">{writer.bio}</p>

        <section className="space-y-8 mb-12">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-3">
              What Makes {writer.name}&apos;s Writing Distinctive
            </h2>
            <p className="text-[var(--color-ink-soft)] leading-relaxed">
              DoppelWriter analyzes {writer.name}&apos;s published work at two levels: the micro layer
              (sentence rhythm, word choice, punctuation habits, function word patterns) and the macro
              layer (paragraph structure, argument flow, transitions, pacing). The result is a forensic
              style profile that captures not just what makes the writing distinctive, but also the patterns and habits that define it.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-3">How It Works</h2>
            <ol className="space-y-3 text-[var(--color-ink-soft)]">
              <li className="flex gap-3">
                <span className="text-[var(--color-accent)] font-bold shrink-0">1.</span>
                Select {writer.name} as your writing voice from the Writers page
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--color-accent)] font-bold shrink-0">2.</span>
                Paste a draft to edit, or describe what you want to write
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--color-accent)] font-bold shrink-0">3.</span>
                DoppelWriter generates or edits in {writer.name}&apos;s voice with streaming output
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-3">Use Cases</h2>
            <ul className="space-y-2 text-[var(--color-ink-soft)]">
              <li>Draft essays and blog posts in {writer.name}&apos;s voice</li>
              <li>Rewrite existing content with {writer.name}&apos;s style and rhythm</li>
              <li>Learn {writer.name}&apos;s writing techniques by seeing them applied to your ideas</li>
              <li>Combine {writer.name}&apos;s voice with your own personal profile for a hybrid style</li>
            </ul>
          </div>
        </section>

        <div className="flex gap-4 mb-16">
          <Link
            href="/signup"
            className="px-8 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium transition-colors"
          >
            Start Writing Like {writer.name}
          </Link>
          <Link href="/write" className="px-8 py-3 border border-[var(--color-rule)] hover:border-[var(--color-ink)] rounded-[2px] text-[var(--color-ink-soft)] transition-colors">
            Browse All Voices
          </Link>
        </div>

        <EmailCapture source="writer_page" sourceSlug={slug} />

        {/* Internal linking — same-category writers */}
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-6">Other {categoryLabel} Voices</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CURATED_WRITERS.filter((w) => w.category === writer.category && w.name !== writer.name)
              .slice(0, 6)
              .map((w) => (
                <Link
                  key={w.name}
                  href={`/write-like/${writerSlug(w.name)}`}
                  className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)]"
                >
                  <p className="font-medium text-sm">{w.name}</p>
                  <p className="text-xs text-[var(--color-ink-mute)] mt-1 line-clamp-1">{w.bio}</p>
                </Link>
              ))}
          </div>
        </section>

        {/* Use case cross-links */}
        {relevantUseCases.length > 0 && (
          <section className="mt-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-6">
              What to Write in {writer.name}&apos;s Voice
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relevantUseCases.map((uc) => (
                <Link key={uc.slug} href={`/write/${uc.slug}`} className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-4 transition-colors hover:border-[var(--color-ink)]">
                  <p className="font-medium text-sm">Write My {uc.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-[var(--color-rule)] py-8 text-center text-xs text-[var(--color-ink-mute)]">
        DoppelWriter
      </footer>
    </div>
  );
}

// ─── All Authors Page (shows every writer across all categories) ───

function AllAuthorsPage() {
  const writersByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    writers: CURATED_WRITERS.filter((w) => w.category === cat.id),
  }));

  const CATEGORY_ICONS: Record<string, string> = {
    pen: "\u270F\uFE0F",
    briefcase: "\uD83D\uDCBC",
    mic: "\uD83C\uDF99\uFE0F",
    landmark: "\uD83C\uDFDB\uFE0F",
    scroll: "\uD83D\uDCDC",
    book: "\uD83D\uDCDA",
    newspaper: "\uD83D\uDCF0",
    laugh: "\uD83D\uDE02",
    brain: "\uD83E\uDDE0",
    microscope: "\uD83D\uDD2C",
  };

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: "All Writer Voice Profiles",
              description: `Browse all ${CURATED_WRITERS.length}+ AI writer voice profiles organized by category.`,
              url: "https://doppelwriter.com/write-like/authors",
              isPartOf: { "@type": "WebApplication", name: "DoppelWriter" },
              numberOfItems: CURATED_WRITERS.length,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://doppelwriter.com" },
                { "@type": "ListItem", position: 2, name: "Write Like", item: "https://doppelwriter.com/write-like" },
                { "@type": "ListItem", position: 3, name: "All Authors" },
              ],
            },
          ],
        }}
      />

      <nav className="border-b border-[var(--color-rule)] sticky top-0 bg-[var(--color-paper)]/90 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14 justify-between">
          <Link href="/" className="font-[family-name:var(--font-display)] font-bold text-lg">DoppelWriter</Link>
          <Link href="/signup" className="text-sm px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] transition-colors">
            Try Free
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-ink-soft)] mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/write-like" className="hover:text-[var(--color-ink)] transition-colors">Write Like</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">All Authors</span>
        </nav>

        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4">
          All {CURATED_WRITERS.length}+ Writer Voice Profiles
        </h1>
        <p className="text-xl text-[var(--color-ink-soft)] mb-12 leading-relaxed max-w-3xl">
          Every voice in DoppelWriter&apos;s library. Pick any writer below and start generating content in their distinctive style.
        </p>

        {/* Quick category nav */}
        <div className="flex flex-wrap gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              className="text-xs px-3 py-1.5 bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] transition-colors hover:border-[var(--color-ink)]"
            >
              {cat.label}
            </a>
          ))}
        </div>

        {writersByCategory.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="pb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{CATEGORY_ICONS[cat.icon] ?? ""}</span>
              <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold">
                <Link
                  href={`/write-like/${cat.id}`}
                  className="hover:text-[var(--color-accent)] transition-colors"
                >
                  {cat.label}
                </Link>
              </h2>
              <span className="text-[var(--color-ink-mute)] text-sm">({cat.writers.length})</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cat.writers.map((writer) => (
                <Link
                  key={writer.name}
                  href={`/write-like/${writerSlug(writer.name)}`}
                  className="bg-[var(--color-paper-deep)] border border-[var(--color-rule)] rounded-[2px] p-5 transition-colors hover:border-[var(--color-ink)] group"
                >
                  <p className="font-medium group-hover:text-[var(--color-accent)] transition-colors mb-1">
                    {writer.name}
                  </p>
                  <p className="text-[var(--color-ink-mute)] text-sm leading-relaxed line-clamp-2">
                    {writer.bio}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="py-16 text-center border-t border-[var(--color-rule)]">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
            Write like anyone. Sound like yourself.
          </h2>
          <p className="text-[var(--color-ink-soft)] mb-8 max-w-xl mx-auto">
            Pick a famous voice to learn from, or upload your own writing and let
            DoppelWriter clone your personal style. 5 free uses per month.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] rounded-[2px] font-medium text-lg transition-colors"
          >
            Start Writing Free
          </Link>
          <p className="text-[var(--color-ink-mute)] text-xs mt-3">No credit card required</p>
        </section>
      </main>

      <footer className="border-t border-[var(--color-rule)] py-8 text-center text-xs text-[var(--color-ink-mute)]">
        DoppelWriter
      </footer>
    </div>
  );
}

// ─── Route Handler ───

export default async function WriteLikePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // /write-like/authors shows ALL writers across every category
  if (slug === "authors") {
    return <AllAuthorsPage />;
  }

  // Check if this is a category hub page
  if (CATEGORY_IDS.has(slug)) {
    return <CategoryHubPage categoryId={slug} />;
  }

  // Otherwise it's a writer page
  const writer = getWriter(slug);
  if (!writer) notFound();

  return <WriterPage writer={writer} slug={slug} />;
}
