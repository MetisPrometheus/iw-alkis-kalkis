import type { MetadataRoute } from "next";

/**
 * Crawlers that either train AI models or bulk-scrape for SEO tooling.
 * They generate the bulk of our serverless invocations without sending
 * a single visitor. Well-behaved ones honor this file; the rest are
 * blocked by src/middleware.ts.
 */
export const BLOCKED_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "PetalBot",
  "meta-externalagent",
  "FacebookBot",
  "Applebot-Extended",
  "Google-Extended",
  "SemrushBot",
  "AhrefsBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
  "serpstatbot",
  "ImagesiftBot",
  "Diffbot",
  "Timpibot",
  "omgili",
  "YandexBot",
  "SeznamBot",
  "Baiduspider",
  "Sogou",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...BLOCKED_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
      // /sok is an unbounded crawl trap: every q/sort/land/page combination
      // is a unique uncacheable SSR render. Nothing there needs indexing;
      // product and category pages carry the SEO weight via the sitemap.
      // The same goes for category pages with a query string (?sort, ?page,
      // ?land, ?q): every combination is a fresh server render. Crawlers get
      // the base category pages and every product via the sitemap instead.
      { userAgent: "*", disallow: ["/sok", "/*?"] },
    ],
    sitemap: "https://alkiskalkis.com/sitemap.xml",
  };
}
