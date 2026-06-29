// MDX element + custom-component map for engine-generated posts.
// Styled with the site's semantic design tokens (per CLAUDE.md).
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { Callout, WriteCTA, DataHook, KeyStat } from "./BlogComponents";

export const mdxComponents: MDXComponents = {
  h2: (p: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-10 mb-3 text-2xl font-bold tracking-tight text-[var(--color-fg-strong)]" {...p} />
  ),
  h3: (p: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 mb-2 text-xl font-semibold text-[var(--color-fg-strong)]" {...p} />
  ),
  h4: (p: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold text-[var(--color-fg-strong)]" {...p} />
  ),
  p: (p: ComponentPropsWithoutRef<"p">) => (
    <p className="my-4 leading-relaxed text-[var(--color-fg)]" {...p} />
  ),
  ul: (p: ComponentPropsWithoutRef<"ul">) => <ul className="my-4 list-disc space-y-1 pl-6 text-[var(--color-fg)]" {...p} />,
  ol: (p: ComponentPropsWithoutRef<"ol">) => <ol className="my-4 list-decimal space-y-1 pl-6 text-[var(--color-fg)]" {...p} />,
  li: (p: ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...p} />,
  a: ({ href = "#", ...p }: ComponentPropsWithoutRef<"a">) => {
    const external = /^https?:\/\//.test(href);
    const cls = "font-medium text-[var(--color-brand)] underline underline-offset-2 hover:opacity-80";
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...p} />
    ) : (
      <Link href={href} className={cls} {...p} />
    );
  },
  strong: (p: ComponentPropsWithoutRef<"strong">) => <strong className="font-semibold text-[var(--color-fg-strong)]" {...p} />,
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-6 border-l-4 border-[var(--color-border)] pl-4 italic text-[var(--color-fg-muted)]" {...p} />
  ),
  hr: () => <hr className="my-10 border-[var(--color-border)]" />,
  table: (p: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...p} />
    </div>
  ),
  thead: (p: ComponentPropsWithoutRef<"thead">) => <thead className="bg-[var(--color-surface-raised)]" {...p} />,
  th: (p: ComponentPropsWithoutRef<"th">) => <th className="border border-[var(--color-border)] px-3 py-2 font-semibold" {...p} />,
  td: (p: ComponentPropsWithoutRef<"td">) => <td className="border border-[var(--color-border)] px-3 py-2" {...p} />,
  code: (p: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded bg-[var(--color-surface-raised)] px-1.5 py-0.5 text-sm text-[var(--color-fg-strong)]" {...p} />
  ),
  Callout,
  WriteCTA,
  DataHook,
  KeyStat,
};
