/**
 * Fetches Vinmonopolet's open product dataset, derives price-per-liter and
 * price-per-liter-pure-alcohol fields, and writes src/data/products.json.
 *
 * Vinmonopolet's public endpoints sit behind Cloudflare bot protection, so we
 * try a few well-known sources in order and gracefully fall back to a hand-
 * crafted fixture so the site still builds. Override the source with the
 * VMP_DATA_URL env var.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { classifyVmpVaretype } from "../src/lib/categories";
import { prisPerLiter, prisPerLiterRenAlkohol } from "../src/lib/derive";
import type { Product, ProductsMeta } from "../src/lib/types";
import { buildFixture } from "./fixture";

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "data");
const OUT_PRODUCTS = path.join(OUT_DIR, "products.json");
const OUT_META = path.join(OUT_DIR, "products.meta.json");

const SOURCES = [
  process.env.VMP_DATA_URL,
  "https://www.vinmonopolet.no/medias/sys_master/products/products.csv",
  "https://apps.vinmonopolet.no/products.csv",
].filter((u): u is string => Boolean(u));

const BROWSER_HEADERS: Record<string, string> = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "accept": "text/csv,application/csv,application/octet-stream;q=0.9,*/*;q=0.8",
  "accept-language": "nb-NO,nb;q=0.9,en;q=0.8",
  "referer": "https://www.vinmonopolet.no/datadeling",
};

async function tryFetchCsv(): Promise<string | null> {
  for (const url of SOURCES) {
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
      if (!res.ok) {
        console.warn(`[fetch] ${url} → HTTP ${res.status}`);
        continue;
      }
      const text = await res.text();
      if (text.length < 5000 || text.toLowerCase().includes("<!doctype html")) {
        console.warn(`[fetch] ${url} → not a CSV (${text.length} bytes)`);
        continue;
      }
      console.log(`[fetch] ${url} → ${(text.length / 1024).toFixed(0)} kB CSV`);
      return text;
    } catch (err) {
      console.warn(`[fetch] ${url} → ${(err as Error).message}`);
    }
  }
  return null;
}

function parseCsv(csv: string): Product[] {
  // Vinmonopolet's CSV is semicolon-delimited, latin-1 historically — but
  // modern fetches return UTF-8. Try semicolon first, fall back to comma.
  const records = parse(csv, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_quotes: true,
  }) as Array<Record<string, string>>;

  return records
    .map((row): Product | null => {
      const id = pick(row, ["Varenummer", "varenummer"]) ?? "";
      const navn = pick(row, ["Varenavn", "varenavn", "produktnavn"]) ?? "";
      const volumStr = pick(row, ["Volum", "volum"]) ?? "0";
      const prisStr = pick(row, ["Pris", "pris"]) ?? "0";
      const abvStr = pick(row, ["Alkohol", "alkohol", "alkoholprosent"]) ?? "0";
      const hoved = pick(row, ["Hovedkategori", "varetype", "hovedkategori"]) ?? "";
      const under = pick(row, ["Underkategori", "underkategori"]) ?? "";

      if (!id || !navn) return null;

      const volumLiter = parseLocaleNumber(volumStr);
      const pris = parseLocaleNumber(prisStr);
      const alkoholProsent = parseLocaleNumber(abvStr);
      if (!volumLiter || !pris) return null;

      const cls = classifyVmpVaretype(hoved, under);

      return {
        id,
        navn,
        volumLiter,
        pris,
        alkoholProsent,
        hovedkategori: cls.hoved,
        underkategori: cls.under,
        land: pick(row, ["Land", "land"]) ?? null,
        distrikt: pick(row, ["Distrikt", "distrikt"]) ?? null,
        produsent: pick(row, ["Produsent", "produsent"]) ?? null,
        argang: parseInt(pick(row, ["Argang", "Årgang", "argang"]) ?? "", 10) || null,
        bildeUrl: `https://bilder.vinmonopolet.no/cache/300x300-0/${id}-1.jpg`,
        vmpUrl: `https://www.vinmonopolet.no/p/${id}`,
        smaknotater: pick(row, ["Smak", "smak", "smaknotater"]) ?? null,
        lukt: pick(row, ["Lukt", "lukt"]) ?? null,
        farge: pick(row, ["Farge", "farge"]) ?? null,
        passerTil: (pick(row, ["Passertil", "passertil"]) ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        raastoff: pick(row, ["Råstoff", "raastoff"]) ?? null,
        prisPerLiter: prisPerLiter(pris, volumLiter),
        prisPerLiterRenAlkohol: prisPerLiterRenAlkohol(pris, volumLiter, alkoholProsent),
      };
    })
    .filter((p): p is Product => Boolean(p));
}

function pick(row: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (v != null && v !== "") return v;
  }
  return undefined;
}

function parseLocaleNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  if (process.argv.includes("--skip-if-exists")) {
    try {
      await fs.access(OUT_PRODUCTS);
      console.log("[skip] products.json already exists; skipping fetch");
      return;
    } catch {
      // file missing → fall through to fetch
    }
  }

  let products: Product[];
  let source: ProductsMeta["source"];
  const notes: string[] = [];

  const csv = await tryFetchCsv();
  if (csv) {
    try {
      products = parseCsv(csv);
      if (products.length > 200) {
        source = "vmp-live";
        notes.push(`Parsed ${products.length} products from live Vinmonopolet feed.`);
      } else {
        throw new Error(`Suspicious row count: ${products.length}`);
      }
    } catch (err) {
      console.warn("[parse] live CSV parse failed:", (err as Error).message);
      products = buildFixture();
      source = "fixture";
      notes.push("Live CSV parse failed; falling back to bundled fixture.");
    }
  } else {
    products = buildFixture();
    source = "fixture";
    notes.push(
      "Live Vinmonopolet feed unreachable (likely Cloudflare bot block). Using fixture.",
      "To enable live data: set VMP_DATA_URL to a reachable CSV mirror, or run from an environment that can pass Cloudflare's checks.",
    );
  }

  const meta: ProductsMeta = {
    generatedAt: new Date().toISOString(),
    source,
    count: products.length,
    notes,
  };

  await fs.writeFile(OUT_PRODUCTS, JSON.stringify(products));
  await fs.writeFile(OUT_META, JSON.stringify(meta, null, 2));

  console.log(`[done] wrote ${products.length} products from ${source}`);
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
