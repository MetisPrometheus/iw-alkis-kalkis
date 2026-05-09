import "server-only";
import productsRaw from "../data/products.json";
import metaRaw from "../data/products.meta.json";
import type { Product, ProductsMeta } from "./types";

const PRODUCTS = productsRaw as Product[];
const META = metaRaw as ProductsMeta;

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductsMeta(): ProductsMeta {
  return META;
}

export function getProductById(id: string): Product | null {
  return PRODUCTS.find((p) => p.id === id) ?? null;
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
