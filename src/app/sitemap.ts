import type { MetadataRoute } from "next";
import { CURATED_WRITERS } from "@/lib/writer-builder";
import { USE_CASES } from "@/lib/use-cases";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://doppelwriter.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];

  const writerPages: MetadataRoute.Sitemap = CURATED_WRITERS.map((w) => ({
    url: `${baseUrl}/write-like/${w.name.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const useCasePages: MetadataRoute.Sitemap = USE_CASES.map((u) => ({
    url: `${baseUrl}/write/${u.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...writerPages, ...useCasePages];
}
