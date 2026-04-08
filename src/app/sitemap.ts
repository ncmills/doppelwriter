import type { MetadataRoute } from "next";
import { CURATED_WRITERS } from "@/lib/writer-builder";
import { CATEGORIES } from "@/lib/writer-data";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/lib/use-cases";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { NICHES } from "@/lib/niches";
import { ALTERNATIVES } from "@/lib/alternatives";

// Fixed date to avoid lastModified changing on every deploy
const LAST_CONTENT_UPDATE = new Date("2026-04-07");

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://doppelwriter.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/signup`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/vs/chatgpt`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/vs/jasper`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/vs/grammarly`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/vs/copyai`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/vs/writesonic`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/analyze`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/tools/email-tone-checker`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/sitemap-html`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/embed`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/write-like`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/alternatives`, lastModified: LAST_CONTENT_UPDATE, changeFrequency: "monthly", priority: 0.85 },
  ];

  const writerCategoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${baseUrl}/write-like/${c.id}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const writerPages: MetadataRoute.Sitemap = CURATED_WRITERS.map((w) => ({
    url: `${baseUrl}/write-like/${w.name.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const useCaseCategoryPages: MetadataRoute.Sitemap = USE_CASE_CATEGORIES.map((c) => ({
    url: `${baseUrl}/write/${c.id}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const useCasePages: MetadataRoute.Sitemap = USE_CASES.map((u) => ({
    url: `${baseUrl}/write/${u.slug}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const nicheIndexPage: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/for`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const nichePages: MetadataRoute.Sitemap = NICHES.map((n) => ({
    url: `${baseUrl}/for/${n.slug}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const alternativePages: MetadataRoute.Sitemap = ALTERNATIVES.map((a) => ({
    url: `${baseUrl}/alternatives/${a.slug}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...writerCategoryPages, ...writerPages, ...useCaseCategoryPages, ...useCasePages, ...blogPages, ...nicheIndexPage, ...nichePages, ...alternativePages];
}
