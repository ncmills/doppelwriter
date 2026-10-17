import type { Metadata } from "next";

// SURFACE-SWEEP 2026-10-16: /write is a client page, so it inherited the homepage <title>.
// The category pages and /write/[slug] under it set their own titles, which still win.
export const metadata: Metadata = {
  title: "Write in your voice",
  description:
    "Pick a writing task and DoppelWriter drafts it in your own voice, not generic AI style.",
};

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
