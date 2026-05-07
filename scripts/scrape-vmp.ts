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
const CURSOR = path.join(OUT_DIR, "vmp-cursor.json");
const PROGRESS_LOG = path.join(OUT_DIR, "vmp-progress.log");
const FAIL_HTML = path.join(OUT_DIR, "cf-block.html");
const FAIL_PNG = path.join(OUT_DIR, "cf-block.png");

const PAGE_SIZE = 100;
const REQUEST_DELAY_MS = 700;
const PAUSE_EVERY_N_PAGES = 100;
const PAUSE_MS = 20_000;
const MAX_RETRIES_PER_PAGE = 5;
const RATE_LIMIT_BACKOFF_MS = 60_000;
const NAV_TIMEOUT_MS = 60_000;
const FETCH_TIMEOUT_MS = 30_000;
// Default batch: well under VMP's per-IP rate-limit threshold (~600 pages)
// so each hourly run finishes cleanly without throttling.
const DEFAULT_BATCH_PAGES = 150;
const BATCH_PAGES = parseInt(process.env.VMP_BATCH_PAGES ?? "", 10) || DEFAULT_BATCH_PAGES;
const HARD_PAGE_LIMIT = parseInt(process.env.VMP_MAX_PAGES ?? "0", 10) || Infinity;
const RESET_CURSOR = process.env.VMP_RESET_CURSOR === "1";

interface Cursor {
  nextPage: number;
  totalPages: number;
  totalResults: number;
  complete: boolean;
  sweep: number;
  lastUpdatedAt: string;
  lastBatchPages: number;
  lastBatchProductsAdded: number;
}

const EMPTY_CURSOR: Cursor = {
  nextPage: 0,
  totalPages: 0,
  totalResults: 0,
  complete: false,
  sweep: 1,
  lastUpdatedAt: "",
  lastBatchPages: 0,
  lastBatchProductsAdded: 0,
};

const BASE = "https://www.vinmonopolet.no";

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

  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(2000);
    const title = await page.title().catch(() => "");
    const url = page.url();
    if (!isCloudflareInterstitial(title, url)) {
      await log(`homepage cleared CF (title="${title}") after ${(i + 1) * 2}s`);
      return;
    }
    await log(`still on CF interstitial: title="${title}" url=${url}`);
  }
  await captureFailure(page, "homepage-still-on-CF-after-20s");
  throw new Error("Cloudflare interstitial did not clear within 20s.");
}

/**
 * Navigates to a search page, listens for vmpws XHRs, and returns the URL
 * pattern + sample response of the call that returns paginated products.
 * VMP's URL shape has shifted across releases; rather than guess, we sniff.
 */
async function discoverApiPattern(
  page: Page,
): Promise<{ urlTemplate: string; firstResponse: ApiResponse }> {
  await log("discovering vmpws product-listing URL by listening to /search/ XHRs…");

  type Captured = { url: string; body: ApiResponse };
  const captured: Captured[] = [];

  const handler = async (resp: import("playwright").Response) => {
    const url = resp.url();
    if (!url.includes("/vmpws/")) return;
    if (resp.status() !== 200) return;
    try {
      const ct = resp.headers()["content-type"] ?? "";
      if (!ct.includes("json")) return;
      const body = (await resp.json()) as ApiResponse;
      if (body && Array.isArray(body.products) && body.products.length > 0) {
        captured.push({ url, body });
        await log(`captured: ${url} (${body.products.length} products)`);
      }
    } catch {
      /* ignore parse failures */
    }
  };
  page.on("response", handler);

  try {
    await page.goto(`${BASE}/search/?q=:relevance:visibleInSearch:true&searchType=product`, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });
    // Let the SPA fire its XHRs.
    await page.waitForTimeout(8000);
    await page.mouse.move(400, 300);
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(2500);
  } finally {
    page.off("response", handler);
  }

  if (captured.length === 0) {
    await captureFailure(page, "no-vmpws-product-XHRs-captured");
    throw new Error(
      "Search page loaded but no /vmpws/ XHR returned a product listing. SPA shape changed?",
    );
  }

  // Take the most recent capture (likely the most-complete one with FULL fields
  // if the SPA chains progressively). Strip currentPage so we can paginate.
  const sample = captured[captured.length - 1];
  const u = new URL(sample.url);
  u.searchParams.delete("currentPage");
  u.searchParams.delete("page");
  // Bump pageSize for efficiency.
  u.searchParams.set("pageSize", String(PAGE_SIZE));
  // Force richest field set if not already.
  if (!u.searchParams.has("fields")) u.searchParams.set("fields", "FULL");

  const urlTemplate = u.toString();
  await log(`API pattern resolved: ${urlTemplate} (sample had ${sample.body.products?.length ?? 0} products)`);
  return { urlTemplate, firstResponse: sample.body };
}

async function fetchPage(page: Page, urlTemplate: string, pageNum: number): Promise<ApiResponse> {
  const u = new URL(urlTemplate);
  u.searchParams.set("currentPage", String(pageNum));
  const url = u.toString();
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
      // VMP rate limit: long back-off, don't churn cookies.
      if (msg.includes("429") || msg.includes("RateLimitingError")) {
        await log(`rate-limited; sleeping ${RATE_LIMIT_BACKOFF_MS / 1000}s before retry ${attempt + 1}`);
        await page.waitForTimeout(RATE_LIMIT_BACKOFF_MS);
      } else if (msg.includes("403") || msg.includes("Cloudflare")) {
        await page.waitForTimeout(3000);
        await warmCookies(page);
      } else {
        await page.waitForTimeout(2000 * attempt);
      }
    }
  }
  throw new Error("unreachable");
}

async function readCursor(): Promise<Cursor> {
  if (RESET_CURSOR) {
    await log("VMP_RESET_CURSOR=1 → starting fresh");
    return { ...EMPTY_CURSOR };
  }
  try {
    const buf = await fs.readFile(CURSOR, "utf8");
    const parsed = JSON.parse(buf) as Partial<Cursor>;
    return { ...EMPTY_CURSOR, ...parsed };
  } catch {
    return { ...EMPTY_CURSOR };
  }
}

async function writeCursor(c: Cursor): Promise<void> {
  c.lastUpdatedAt = new Date().toISOString();
  await fs.writeFile(CURSOR, JSON.stringify(c, null, 2));
}

async function loadExistingProducts(): Promise<Map<string, RawProduct>> {
  try {
    const buf = await fs.readFile(OUT, "utf8");
    const arr = JSON.parse(buf) as RawProduct[];
    const map = new Map<string, RawProduct>();
    for (const r of arr) {
      const code = (r.code ?? r.varenummer ?? r.id) as string | undefined;
      if (code) map.set(code, r);
    }
    return map;
  } catch {
    return new Map();
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(PROGRESS_LOG, "");

  const cursor = await readCursor();

  if (cursor.complete) {
    await log(
      `cursor reports complete (sweep ${cursor.sweep}, ${cursor.totalResults} products covered). Nothing to do.`,
    );
    return;
  }

  await log(
    `starting batch from page ${cursor.nextPage}, batchPages=${BATCH_PAGES}, sweep=${cursor.sweep}, hardLimit=${HARD_PAGE_LIMIT === Infinity ? "∞" : HARD_PAGE_LIMIT}`,
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

    const { urlTemplate, firstResponse } = await discoverApiPattern(page);

    const totalResults =
      firstResponse.pagination?.totalResults ?? firstResponse.products?.length ?? 0;
    const totalPages = firstResponse.pagination?.totalPages ?? 1;
    await log(`pagination: totalResults=${totalResults}, totalPages=${totalPages}`);

    // Existing data from prior runs — this batch merges into it.
    const existing = await loadExistingProducts();
    const startSize = existing.size;
    await log(`existing dataset: ${startSize} unique products`);

    const startPage = cursor.nextPage;
    const endPage = Math.min(totalPages, startPage + BATCH_PAGES, startPage + HARD_PAGE_LIMIT);
    await log(`this run: pages [${startPage}, ${endPage})`);

    let lastCompletedPage = startPage - 1;
    let consecutiveEmpty = 0;

    const flush = async (label: string) => {
      const arr = [...existing.values()];
      await fs.writeFile(OUT, JSON.stringify(arr));
      await log(`${label}: ${arr.length} unique products in ${OUT}`);
    };

    let aborted = false;
    let abortMsg = "";
    try {
      for (let p = startPage; p < endPage; p++) {
        await page.waitForTimeout(REQUEST_DELAY_MS);
        const resp = await fetchPage(page, urlTemplate, p);
        const batch = resp.products ?? [];

        for (const item of batch) {
          const code = (item.code ?? item.varenummer ?? item.id) as string | undefined;
          if (code) existing.set(code, item);
        }

        lastCompletedPage = p;

        if (batch.length === 0) {
          consecutiveEmpty++;
          if (consecutiveEmpty >= 3) {
            await log(`stopped early at page ${p + 1}: 3 consecutive empty pages — likely past end`);
            // Treat as completion of the sweep.
            cursor.complete = true;
            break;
          }
        } else {
          consecutiveEmpty = 0;
        }

        if ((p - startPage) % 25 === 0 || p === endPage - 1) {
          await log(`page ${p + 1}/${totalPages}: unique=${existing.size} (+${existing.size - startSize})`);
        }

        if (p > startPage && (p - startPage) % PAUSE_EVERY_N_PAGES === 0) {
          await flush(`checkpoint at page ${p + 1}`);
          await log(`pause ${PAUSE_MS / 1000}s before continuing…`);
          await page.waitForTimeout(PAUSE_MS);
        }
      }
    } catch (err) {
      aborted = true;
      abortMsg = (err as Error).message;
      await log(`batch aborted at page ${lastCompletedPage + 1}: ${abortMsg}`);
    }

    await flush(aborted ? "partial-save" : "batch-done");

    // Update cursor.
    cursor.totalPages = totalPages;
    cursor.totalResults = totalResults;
    cursor.lastBatchPages = Math.max(0, lastCompletedPage - startPage + 1);
    cursor.lastBatchProductsAdded = existing.size - startSize;
    if (cursor.complete) {
      // Stayed true if 3 empties triggered early stop.
    } else if (lastCompletedPage + 1 >= totalPages) {
      cursor.complete = true;
    } else {
      cursor.nextPage = lastCompletedPage + 1;
    }
    if (cursor.complete) {
      await log(
        `sweep ${cursor.sweep} complete: ${existing.size} unique products covering ${totalResults} catalogue.`,
      );
    } else {
      await log(
        `batch done. nextPage=${cursor.nextPage}/${totalPages}, +${cursor.lastBatchProductsAdded} new this run.`,
      );
    }
    await writeCursor(cursor);

    if (aborted && existing.size === startSize) {
      // No forward progress and no new products → propagate failure so the
      // workflow surfaces it.
      throw new Error(abortMsg || "batch made no progress");
    }
  } finally {
    await browser?.close();
  }
}

main().catch((err) => {
  console.error("[scrape] fatal:", err);
  process.exit(1);
});
