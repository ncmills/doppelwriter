import type { Metadata } from "next";
import { buildOpenGraph } from "@/lib/og/metadata";

export const metadata: Metadata = {
  title: "Free Email Tone Checker — Analyze Your Email's Tone",
  description:
    "Paste your email and instantly see how it sounds — professional, friendly, passive-aggressive, or something else. Free, no signup required.",
  openGraph: buildOpenGraph({
    title: "Free Email Tone Checker",
    description:
      "Analyze your email's tone before you send it. Free, instant, no signup.",
    url: "/tools/email-tone-checker",
  }),
  alternates: { canonical: "https://doppelwriter.com/tools/email-tone-checker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
