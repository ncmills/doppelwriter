import { BLOG_POSTS } from "@/lib/blog-posts";

export async function GET() {
  const posts = BLOG_POSTS.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://doppelwriter.com/blog/${post.slug}</link>
      <guid isPermaLink="true">https://doppelwriter.com/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>team@doppelwriter.com (DoppelWriter)</author>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DoppelWriter Blog</title>
    <link>https://doppelwriter.com/blog</link>
    <description>AI writing that sounds like you. Tips, guides, and insights on voice-matched writing.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://doppelwriter.com/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
