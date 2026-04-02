import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Literata } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import PostHogProvider from "@/components/PostHogProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://doppelwriter.com"),
  title: {
    default: "DoppelWriter — AI Writing That Sounds Like You",
    template: "%s | DoppelWriter",
  },
  description:
    "AI-powered writing tool that clones your voice or lets you write like Paul Graham, Hemingway, or any author. Edit drafts and generate content in any style.",
  keywords: [
    "AI writing tool",
    "write in my voice",
    "AI ghostwriter",
    "write like Paul Graham",
    "AI writing style",
    "voice cloning writing",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doppelwriter.com",
    siteName: "DoppelWriter",
    title: "DoppelWriter — AI Writing That Sounds Like You",
    description: "Clone your writing voice or write like any famous author.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DoppelWriter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoppelWriter — AI Writing That Sounds Like You",
    description: "Clone your writing voice or write like any famous author.",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://doppelwriter.com",
    types: {
      "application/rss+xml": "https://doppelwriter.com/blog/rss.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://upload.wikimedia.org" />
        <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${literata.variable} antialiased bg-[#0C0A09] text-[#FAFAF9]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DoppelWriter",
            "url": "https://doppelwriter.com",
            "sameAs": [
              "https://idonthaveawill.com",
              "https://whatpeptidesdo.com",
              "https://tourdefore.com",
              "https://imfrustrated.org"
            ]
          }) }}
        />
        <SessionProvider>
          <PostHogProvider>{children}</PostHogProvider>
        </SessionProvider>
        <footer className="py-4 text-center">
          <p className="text-[10px] text-stone-800/30">
            <a href="https://whatpeptidesdo.com" className="hover:text-stone-700/40 transition-colors">whatpeptidesdo.com</a>
            {" · "}
            <a href="https://idonthaveawill.com" className="hover:text-stone-700/40 transition-colors">idonthaveawill.com</a>
            {" · "}
            <a href="https://imfrustrated.org" className="hover:text-stone-700/40 transition-colors">imfrustrated.org</a>
          </p>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
