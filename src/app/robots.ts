import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/doppelwrite/", "/create/", "/settings/", "/profile/"],
      },
      { userAgent: "GPTBot", allow: "/", disallow: ["/api/", "/dashboard/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/api/", "/dashboard/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/api/", "/dashboard/"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/api/", "/dashboard/"] },
    ],
    sitemap: "https://doppelwriter.com/sitemap.xml",
  };
}
