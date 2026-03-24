import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Email Tone Checker — Analyze Your Email's Tone | DoppelWriter",
  description:
    "Paste your email and instantly see how it sounds — professional, friendly, passive-aggressive, or something else. Free, no signup required.",
  openGraph: {
    title: "Free Email Tone Checker | DoppelWriter",
    description:
      "Analyze your email's tone before you send it. Free, instant, no signup.",
    url: "https://doppelwriter.com/tools/email-tone-checker",
  },
  alternates: { canonical: "https://doppelwriter.com/tools/email-tone-checker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
