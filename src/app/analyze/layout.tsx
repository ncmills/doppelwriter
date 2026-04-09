import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Writing Voice Analyzer — Analyze Your Writing Style",
  description:
    "Paste any text and instantly analyze your writing voice. See sentence patterns, vocabulary level, tone, and which famous writers you sound like. Free, no signup required.",
  openGraph: {
    title: "Free Writing Voice Analyzer — Analyze Your Writing Style",
    description:
      "Paste any text and instantly analyze your writing voice. See sentence patterns, vocabulary level, tone, and which famous writers you sound like. Free, no signup required.",
    url: "https://doppelwriter.com/analyze",
  },
  alternates: { canonical: "https://doppelwriter.com/analyze" },
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
