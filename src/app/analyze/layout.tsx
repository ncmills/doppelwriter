import type { Metadata } from "next";
import { buildOpenGraph } from "@/lib/og/metadata";

export const metadata: Metadata = {
  title: "Free Writing Voice Analyzer — Analyze Your Writing Style",
  description:
    "Paste any text and instantly analyze your writing voice. See sentence patterns, vocabulary level, tone, and which famous writers you sound like. Free, no signup required.",
  // NOTE: this layout sits at /analyze, which has NO colocated opengraph-image.
  // The colocated file lives one segment down at analyze/[slug]/.
  openGraph: buildOpenGraph({
    title: "Free Writing Voice Analyzer — Analyze Your Writing Style",
    description:
      "Paste any text and instantly analyze your writing voice. See sentence patterns, vocabulary level, tone, and which famous writers you sound like. Free, no signup required.",
    url: "/analyze",
  }),
  alternates: { canonical: "https://doppelwriter.com/analyze" },
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
