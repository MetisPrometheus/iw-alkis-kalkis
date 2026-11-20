import "server-only";
import productsRaw from "../data/products.json";
import metaRaw from "../data/products.meta.json";
import type { Product, ProductsMeta } from "./types";
import { median } from "./derive";

const PRODUCTS = productsRaw as Product[];
const META = metaRaw as ProductsMeta;

// Crawlers open thousands of pages a day, and every render used to scan or
// sort all 36k products. Everything below is computed once per server
// instance and reused, so a render only looks things up and slices.
const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));
const memo = new Map<string, unknown>();
function remember<T>(key: string, make: () => T): T {
  if (!memo.has(key)) memo.set(key, make());
  return memo.get(key) as T;
}

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductsMeta(): ProductsMeta {
  return META;
}

export function getProductById(id: string): Product | null {
  return BY_ID.get(id) ?? null;
}

/** One category scope (a main category, optionally one subcategory) with its
    medians, computed once. Callers must not mutate the arrays. */
export function getScope(hovedkategori?: string, underkategori?: string): {
  products: Product[];
  medianPpra: number;
  medianPpl: number;
} {
  return remember(`scope:${hovedkategori ?? ""}:${underkategori ?? ""}`, () => {
    const products = filterProducts(PRODUCTS, { hovedkategori, underkategori });
    return {
      products,
      medianPpra: median(products.filter((p) => p.prisPerLiterRenAlkohol > 0).map((p) => p.prisPerLiterRenAlkohol)),
      medianPpl: median(products.filter((p) => p.prisPerLiter > 0).map((p) => p.prisPerLiter)),
    };
  });
}

/** A scope sorted one way, computed once. Filtering this keeps the order, so
    land and text filters never need another sort. */
export function getSortedScope(sort: SortKey, hovedkategori?: string, underkategori?: string): Product[] {
  return remember(`sorted:${sort}:${hovedkategori ?? ""}:${underkategori ?? ""}`, () =>
    sortProducts(getScope(hovedkategori, underkategori).products, sort),
  );
}

/** A product's rank by kr per litre pure alcohol within its subcategory. */
export function getRankInSubcategory(product: Product): number {
  const ranks = remember(`rank:${product.underkategori}`, () => {
    const map = new Map<string, number>();
    getSortedScope("ppra", undefined, product.underkategori).forEach((p, i) => map.set(p.id, i + 1));
    return map;
  });
  return ranks.get(product.id) ?? 0;
}

/** Countries in a main category (or everything), computed once. */
export function getCountriesFor(hovedkategori?: string): string[] {
  return remember(`countries:${hovedkategori ?? ""}`, () =>
    getCountries(hovedkategori ? getScope(hovedkategori).products : PRODUCTS),
  );
}

export function getCountries(products: Product[] = PRODUCTS): string[] {
  const set = new Set<string>();
  for (const p of products) if (p.land) set.add(p.land);
  return [...set].sort((a, b) => a.localeCompare(b, "nb-NO"));
}

export type SortKey =
  | "ppra"
  | "ppra-desc"
  | "ppl"
  | "ppl-desc"
  | "pris"
  | "pris-desc"
  | "abv"
  | "abv-desc"
  | "volum-desc"
  | "navn";

const SORT_KEYS: readonly SortKey[] = ["ppra", "ppra-desc", "ppl", "ppl-desc", "pris", "pris-desc", "abv", "abv-desc", "volum-desc", "navn"];

/** A sort from the URL, or the fallback when it is missing or unknown (an
    unknown key used to fall through sortProducts and break the page). */
export function parseSort(value: unknown, fallback: SortKey): SortKey {
  return typeof value === "string" && (SORT_KEYS as readonly string[]).includes(value) ? (value as SortKey) : fallback;
}

export interface ProductFilters {
  hovedkategori?: string;
  underkategori?: string;
  query?: string;
  minPris?: number;
  maxPris?: number;
  minAbv?: number;
  maxAbv?: number;
  land?: string;
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  const q = filters.query?.toLowerCase().trim();

  return products.filter((p) => {
    if (filters.hovedkategori && p.hovedkategori !== filters.hovedkategori) return false;
    if (filters.underkategori && p.underkategori !== filters.underkategori) return false;
    if (filters.land && p.land !== filters.land) return false;
    if (filters.minPris != null && p.pris < filters.minPris) return false;
    if (filters.maxPris != null && p.pris > filters.maxPris) return false;
    if (filters.minAbv != null && p.alkoholProsent < filters.minAbv) return false;
    if (filters.maxAbv != null && p.alkoholProsent > filters.maxAbv) return false;
    if (q) {
      const haystack =
        `${p.navn} ${p.produsent ?? ""} ${p.land ?? ""} ${p.hovedkategori} ${p.underkategori}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "ppra":
      return copy.sort((a, b) => a.prisPerLiterRenAlkohol - b.prisPerLiterRenAlkohol);
    case "ppra-desc":
      return copy.sort((a, b) => b.prisPerLiterRenAlkohol - a.prisPerLiterRenAlkohol);
    case "ppl":
      return copy.sort((a, b) => a.prisPerLiter - b.prisPerLiter);
    case "ppl-desc":
      return copy.sort((a, b) => b.prisPerLiter - a.prisPerLiter);
    case "pris":
      return copy.sort((a, b) => a.pris - b.pris);
    case "pris-desc":
      return copy.sort((a, b) => b.pris - a.pris);
    case "abv":
      return copy.sort((a, b) => a.alkoholProsent - b.alkoholProsent);
    case "abv-desc":
      return copy.sort((a, b) => b.alkoholProsent - a.alkoholProsent);
    case "volum-desc":
      return copy.sort((a, b) => b.volumLiter - a.volumLiter);
    case "navn":
      return copy.sort((a, b) => a.navn.localeCompare(b.navn, "nb-NO"));
  }
}

export function getTopDeals(
  limit = 5,
  hovedkategori?: string,
  sort: SortKey = "ppra",
): Product[] {
  // For ppl-sorted picks (alkoholfritt), require a positive ppl rather than
  // ppra so we don't drop the 0% products.
  const requireField = sort.startsWith("ppl") ? "prisPerLiter" : "prisPerLiterRenAlkohol";
  let pool = PRODUCTS.filter((p) => (p[requireField] ?? 0) > 0);
  if (hovedkategori) pool = pool.filter((p) => p.hovedkategori === hovedkategori);
  return sortProducts(pool, sort).slice(0, limit);
}

export function getCountByMainCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of PRODUCTS) {
    counts[p.hovedkategori] = (counts[p.hovedkategori] ?? 0) + 1;
  }
  return counts;
}

export function getCategoryStats(hovedkategori: string): {
  count: number;
  cheapestPpra: number;
  medianPpra: number;
} {
  const pool = PRODUCTS.filter(
    (p) => p.hovedkategori === hovedkategori && p.prisPerLiterRenAlkohol > 0,
  );
  if (pool.length === 0) return { count: 0, cheapestPpra: 0, medianPpra: 0 };
  const ppras = pool.map((p) => p.prisPerLiterRenAlkohol).sort((a, b) => a - b);
  return {
    count: pool.length,
    cheapestPpra: ppras[0],
    medianPpra: ppras[Math.floor(ppras.length / 2)],
  };
}
