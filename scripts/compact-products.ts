/**
 * Writes src/data/products.compact.json from src/data/products.json.
 *
 * The app used to import the full 21 MB products.json, and every cold
 * serverless start spent ~300 ms CPU compiling it. The compact file keeps one
 * row per product without repeated key names, and leaves out what the app can
 * rebuild: the image URL and shop link (both follow the product id) and the
 * two price-per-litre figures (derived from price, volume and ABV). Any value
 * that does not follow those rules is kept in `extra`, so nothing is lost.
 * lib/products.ts expands it back into Product objects.
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { Product } from "../src/lib/types";
import { prisPerLiter, prisPerLiterRenAlkohol } from "../src/lib/derive";

const DIR = path.join(process.cwd(), "src", "data");
export const ROW_FIELDS = ["id", "navn", "volumLiter", "pris", "alkoholProsent", "hovedkategori", "underkategori", "land", "distrikt"] as const;
const DERIVED = ["bildeUrl", "vmpUrl", "prisPerLiter", "prisPerLiterRenAlkohol"] as const;
const NULLABLE = ["produsent", "argang", "smaknotater", "lukt", "farge", "passerTil", "raastoff"] as const;

export const imageUrl = (id: string) => `https://bilder.vinmonopolet.no/cache/300x300-0/${id}-1.jpg`;

async function main() {
  const products = JSON.parse(await fs.readFile(path.join(DIR, "products.json"), "utf8")) as Product[];
  const rows: unknown[][] = [];
  const extra: Record<string, Partial<Product>> = {};
  for (const p of products) {
    rows.push(ROW_FIELDS.map((k) => p[k] ?? null));
    const keep: Partial<Product> = {};
    const expected: Record<string, unknown> = {
      bildeUrl: imageUrl(p.id),
      vmpUrl: null, // any real shop link is kept below
      prisPerLiter: prisPerLiter(p.pris, p.volumLiter),
      prisPerLiterRenAlkohol: prisPerLiterRenAlkohol(p.pris, p.volumLiter, p.alkoholProsent),
    };
    for (const k of DERIVED) if (k !== "vmpUrl" && p[k] !== expected[k]) Object.assign(keep, { [k]: p[k] });
    for (const k of NULLABLE) {
      const v = p[k] as unknown;
      if (v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)) Object.assign(keep, { [k]: v });
    }
    if (Object.keys(keep).length) extra[p.id] = keep;
  }
  const out = { v: 1, fields: ROW_FIELDS, rows, extra };
  await fs.writeFile(path.join(DIR, "products.compact.json"), JSON.stringify(out));
  const kept = Object.keys(extra).length;
  console.log(`[compact] ${products.length} products, ${kept} with extra fields`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
