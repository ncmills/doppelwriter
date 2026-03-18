import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/editor/", "/generate/", "/settings/", "/samples/"],
      },
    ],
    sitemap: "https://doppelwriter.com/sitemap.xml",
  };
}
