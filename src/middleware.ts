import { NextResponse, type NextRequest } from "next/server";

/**
 * Hard block for scrapers that ignore robots.txt. Runs at the edge, so a
 * blocked request never reaches (or bills) a serverless function. Keep the
 * list in sync with BLOCKED_BOTS in src/app/robots.ts; this regex also
 * catches generic headless tooling that never reads robots.txt at all.
 */
const BLOCKED_UA =
  /GPTBot|ChatGPT-User|ClaudeBot|Claude-Web|anthropic-ai|CCBot|Bytespider|Amazonbot|PetalBot|meta-externalagent|FacebookBot|Applebot-Extended|SemrushBot|AhrefsBot|MJ12bot|DotBot|DataForSeoBot|BLEXBot|serpstatbot|ImagesiftBot|Diffbot|Timpibot|omgili|YandexBot|SeznamBot|Baiduspider|Sogou|python-requests|python-httpx|aiohttp|Go-http-client|Scrapy|HeadlessChrome/i;

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BLOCKED_UA.test(ua)) {
    return new NextResponse(null, { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  // Skip static assets; robots.txt and sitemap.xml stay reachable for
  // everyone so blocked bots can still read the rules.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml).*)",
  ],
};
