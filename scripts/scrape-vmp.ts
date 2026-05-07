/**
 * Scrapes Vinmonopolet's product catalogue via stealth-mode headless Chromium.
 *
 * The public REST endpoint /vmpws/v2/vmp/products is fronted by Cloudflare,
 * which 403's any non-browser request *and* aggressively flags vanilla
 * Playwright Chromium. We stack three defenses:
 *
 *   1. playwright-extra + puppeteer-extra-plugin-stealth → patches the dozens
 *      of fingerprinting vectors (navigator.webdriver, chrome.runtime,
 *      WebGL vendor, permissions, etc.) that CF's bot detector keys off.
 *   2. Full Chromium (channel: chromium), not chrome-headless-shell.
 *      Headless-shell is reliably detected; full Chromium with --headless=new
 *      is much harder to fingerprint.
 *   3. Realistic warm-up: navigate, wait for CF challenge to auto-resolve,
 *      detect the interstitial title, and bail out with diagnostics if it
 *      can't be cleared.
 *
 * Output: src/data/vmp-raw.json with raw VMP records. Failure artifacts:
 * src/data/cf-block.html + cf-block.png for debugging.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { chromium as chromiumExtra } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Browser, Page } from "playwright";

chromiumExtra.use(StealthPlugin());

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "data");
const OUT = path.join(OUT_DIR, "vmp-raw.json");
const PROGRESS_LOG = path.join(OUT_DIR, "vmp-progress.log");
const FAIL_HTML = path.join(OUT_DIR, "cf-block.html");
const FAIL_PNG = path.join(OUT_DIR, "cf-block.png");

const PAGE_SIZE = 100;
const REQUEST_DELAY_MS = 600;
const MAX_RETRIES_PER_PAGE = 3;
const NAV_TIMEOUT_MS = 60_000;
const FETCH_TIMEOUT_MS = 30_000;
const HARD_PAGE_LIMIT = parseInt(process.env.VMP_MAX_PAGES ?? "0", 10) || Infinity;

const BASE = "https://www.vinmonopolet.no";
const API_PATH = "/vmpws/v2/vmp/products";

type RawProduct = Record<string, unknown>;
interface ApiResponse {
  products?: RawProduct[];
  pagination?: {
    totalPages?: number;
    pageSize?: number;
    currentPage?: number;
    totalResults?: number;
  };
}

async function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  await fs.appendFile(PROGRESS_LOG, line + "\n").catch(() => {});
}

function isCloudflareInterstitial(title: string, url: string): boolean {
  const t = title.toLowerCase();
  return (
    t.includes("just a moment") ||
    t.includes("attention required") ||
    t.includes("cloudflare") ||
    url.includes("/cdn-cgi/challenge")
  );
}

async function captureFailure(page: Page, label: string) {
  try {
    const html = await page.content();
    await fs.writeFile(FAIL_HTML, html);
    await page.screenshot({ path: FAIL_PNG, fullPage: false }).catch(() => {});
    await log(
      `captured failure artifacts (${label}): ${FAIL_HTML} (${html.length} bytes), ${FAIL_PNG}`,
    );
  } catch (err) {
    await log(`failure-capture itself failed: ${(err as Error).message}`);
  }
}

async function warmCookies(page: Page) {
  await log("warming Cloudflare cookies via homepage…");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });

  // CF interstitial auto-redirects after 5s typically. Wait up to 20s for it
  // to clear. If it doesn't, we'll know — no point continuing.
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(2000);
    const title = await page.title().catch(() => "");
    const url = page.url();
    if (!isCloudflareInterstitial(title, url)) {
      await log(`homepage cleared CF (title="${title}") after ${(i + 1) * 2}s`);
      break;
    }
    await log(`still on CF interstitial: title="${title}" url=${url}`);
    if (i === 9) {
      await captureFailure(page, "homepage-still-on-CF-after-20s");
      throw new Error(
        "Cloudflare interstitial did not clear within 20s — bot detection likely flagged us.",
      );
    }
  }

  // Touch the search page so the API origin is exercised in a realistic flow.
  try {
    await page.goto(`${BASE}/search/?q=:relevance`, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });
    await page.waitForTimeout(2500);
    await page.mouse.move(400, 300);
    await page.mouse.move(500, 400);
  } catch (err) {
    await log(`(non-fatal) search nav: ${(err as Error).message}`);
  }
}

async function fetchPage(page: Page, pageNum: number): Promise<ApiResponse> {
  const url = `${BASE}${API_PATH}?q=:relevance&pageSize=${PAGE_SIZE}&currentPage=${pageNum}&fields=FULL`;
  for (let attempt = 1; attempt <= MAX_RETRIES_PER_PAGE; attempt++) {
    try {
      const json: ApiResponse = await page.evaluate(
        async ({ url, timeout }: { url: string; timeout: number }) => {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), timeout);
          try {
            const res = await fetch(url, {
              method: "GET",
              credentials: "include",
              headers: { Accept: "application/json" },
              signal: controller.signal,
            });
            if (!res.ok) {
              const txt = await res.text().catch(() => "");
              throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
            }
            return (await res.json()) as ApiResponse;
          } finally {
            clearTimeout(t);
          }
        },
        { url, timeout: FETCH_TIMEOUT_MS },
      );
      return json;
    } catch (err) {
      const msg = (err as Error).message;
      await log(`page ${pageNum} attempt ${attempt}/${MAX_RETRIES_PER_PAGE} failed: ${msg}`);
      if (attempt === MAX_RETRIES_PER_PAGE) {
        await captureFailure(page, `page-${pageNum}-final-attempt`);
        throw err;
      }
      await page.waitForTimeout(2000 * attempt);
      if (msg.includes("403") || msg.includes("Cloudflare")) {
        await warmCookies(page);
      }
    }
  }
  throw new Error("unreachable");
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(PROGRESS_LOG, "");
  await log(
    `starting scrape, pageSize=${PAGE_SIZE}, hardLimit=${HARD_PAGE_LIMIT === Infinity ? "∞" : HARD_PAGE_LIMIT}`,
  );

  let browser: Browser | null = null;
  try {
    browser = await chromiumExtra.launch({
      headless: true,
      channel: "chromium", // full Chromium, not chrome-headless-shell
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });
    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      locale: "nb-NO",
      timezoneId: "Europe/Oslo",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      extraHTTPHeaders: { "Accept-Language": "nb-NO,nb;q=0.9,en;q=0.8" },
    });

    const page = await context.newPage();
    page.setDefaultTimeout(NAV_TIMEOUT_MS);

    await warmCookies(page);

    const firstUrl = `${BASE}${API_PATH}?q=:relevance&pageSize=${PAGE_SIZE}&currentPage=0&fields=FULL`;
    await log(`first probe: ${firstUrl}`);
    const first = await fetchPage(page, 0);
    const totalPages = first.pagination?.totalPages ?? 1;
    const totalResults = first.pagination?.totalResults ?? first.products?.length ?? 0;
    await log(`pagination: totalPages=${totalPages}, totalResults=${totalResults}`);

    const all: RawProduct[] = [...(first.products ?? [])];
    const cap = Math.min(totalPages, HARD_PAGE_LIMIT);
    for (let p = 1; p < cap; p++) {
      await page.waitForTimeout(REQUEST_DELAY_MS);
      const resp = await fetchPage(page, p);
      const batch = resp.products ?? [];
      all.push(...batch);
      if (p % 10 === 0 || p === cap - 1) {
        await log(`page ${p + 1}/${cap}: cumulative=${all.length}`);
      }
    }

    await fs.writeFile(OUT, JSON.stringify(all));
    await log(`done: wrote ${all.length} raw records → ${OUT}`);
  } finally {
    await browser?.close();
  }
}

main().catch((err) => {
  console.error("[scrape] fatal:", err);
  process.exit(1);
});
