import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import PostHogProvider from "@/components/PostHogProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://upload.wikimedia.org" />
        <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-ink)] focus:text-[var(--color-paper)]"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DoppelWriter",
            "url": "https://doppelwriter.com",
            "description": "AI-powered writing tool that clones your voice or lets you write like any famous author."
          }) }}
        />
        <SessionProvider>
          <PostHogProvider>{children}</PostHogProvider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
