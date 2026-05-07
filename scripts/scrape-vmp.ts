/**
 * Scrapes Vinmonopolet's product catalogue via headless Chromium.
 *
 * The public REST endpoint /vmpws/v2/vmp/products is fronted by Cloudflare,
 * which 403's any non-browser request. We launch Playwright, navigate to the
 * site so the JS challenge passes and a cf_clearance cookie is set, then call
 * the JSON API from inside the browser context (page.evaluate(fetch)) — the
 * cookie carries automatically.
 *
 * Output: writes raw VMP records to src/data/vmp-raw.json. fetch-products.ts
 * is responsible for mapping → Product schema.
 */
import { chromium, type Browser, type Page } from "playwright";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src", "data", "vmp-raw.json");
const PROGRESS_LOG = path.join(ROOT, "src", "data", "vmp-progress.log");

const PAGE_SIZE = 100;
const REQUEST_DELAY_MS = 400;
const MAX_RETRIES_PER_PAGE = 3;
const NAV_TIMEOUT_MS = 60_000;
const FETCH_TIMEOUT_MS = 30_000;
const HARD_PAGE_LIMIT = parseInt(process.env.VMP_MAX_PAGES ?? "0", 10) || Infinity;

const BASE = "https://www.vinmonopolet.no";
const API_PATH = "/vmpws/v2/vmp/products";

type RawProduct = Record<string, unknown>;
interface ApiResponse {
  products?: RawProduct[];
  pagination?: { totalPages?: number; pageSize?: number; currentPage?: number; totalResults?: number };
  facets?: unknown;
}

async function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  await fs.appendFile(PROGRESS_LOG, line + "\n").catch(() => {});
}

async function warmCookies(page: Page) {
  await log("warming Cloudflare cookies via homepage…");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
  // Let the CF challenge JS run + any auto-redirects settle.
  await page.waitForTimeout(3500);
  // Also touch the products listing to make sure the API origin is exercised
  // from a "browsing" context.
  try {
    await page.goto(`${BASE}/search/?q=:relevance`, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });
    await page.waitForTimeout(2000);
  } catch (err) {
    await log(`(non-fatal) search nav failed: ${(err as Error).message}`);
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
      if (attempt === MAX_RETRIES_PER_PAGE) throw err;
      await page.waitForTimeout(2000 * attempt);
      // re-warm if stale
      if (msg.includes("403") || msg.includes("Cloudflare")) {
        await warmCookies(page);
      }
    }
  }
  throw new Error("unreachable");
}

async function main() {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(PROGRESS_LOG, "");
  await log(`starting scrape, pageSize=${PAGE_SIZE}, hardLimit=${HARD_PAGE_LIMIT === Infinity ? "∞" : HARD_PAGE_LIMIT}`);

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-dev-shm-usage",
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

    // Reduce automation fingerprint a touch.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    const page = await context.newPage();
    page.setDefaultTimeout(NAV_TIMEOUT_MS);

    await warmCookies(page);

    // First page primes us with totalPages.
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
