import type { MetadataRoute } from "next";
import { getAllProducts, getProductsMeta } from "@/lib/products";
import { KATEGORI_TRE } from "@/lib/categories";

const BASE = "https://alkiskalkis.com";

/**
 * One sitemap for the whole catalog (36k URLs, well under the 50k spec
 * limit). Gives Google the full URL space up front so it stops discovering
 * products by wandering paginated listings.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(getProductsMeta().generatedAt);

  return [
    { url: BASE, lastModified },
    { url: `${BASE}/om`, lastModified },
    ...KATEGORI_TRE.map((c) => ({
      url: `${BASE}/kategori/${c.slug}`,
      lastModified,
    })),
    ...getAllProducts().map((p) => ({
      url: `${BASE}/produkt/${p.id}`,
      lastModified,
    })),
  ];
}
