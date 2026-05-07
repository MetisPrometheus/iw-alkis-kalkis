import { Toolbar } from "@/components/Toolbar";
import { ProductTable } from "@/components/ProductTable";
import { ProductCardGrid } from "@/components/ProductCardGrid";
import { DealRadar } from "@/components/DealRadar";
import {
  filterProducts,
  getAllProducts,
  getCountries,
  sortProducts,
  type SortKey,
} from "@/lib/products";

const ALL_LAYOUTS = ["table", "grid", "deals"] as const;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = {
  title: "Søk — alkis kalkis",
  description: "Søk i hele Vinmonopolet-utvalget.",
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sort = (typeof sp.sort === "string" ? sp.sort : "ppra") as SortKey;
  const layoutParam = typeof sp.layout === "string" ? sp.layout : "table";
  const layout = (ALL_LAYOUTS as readonly string[]).includes(layoutParam)
    ? (layoutParam as (typeof ALL_LAYOUTS)[number])
    : "table";
  const land = typeof sp.land === "string" ? sp.land : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const minAbv = numParam(sp.minAbv);
  const maxAbv = numParam(sp.maxAbv);
  const minPris = numParam(sp.minPris);
  const maxPris = numParam(sp.maxPris);

  const all = getAllProducts();
  const filtered = filterProducts(all, {
    land: land || undefined,
    query: q || undefined,
    minAbv: minAbv ?? undefined,
    maxAbv: maxAbv ?? undefined,
    minPris: minPris ?? undefined,
    maxPris: maxPris ?? undefined,
  });
  const sorted = sortProducts(filtered, sort);
  const countries = getCountries(all);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Søk</h1>
        <p className="text-foreground/70">
          {q
            ? `Søker etter «${q}» — ${sorted.length} treff`
            : `${sorted.length} av ${all.length} produkter`}
        </p>
      </header>

      <Toolbar countries={countries} />

      {layout === "table" && <ProductTable products={sorted} />}
      {layout === "grid" && <ProductCardGrid products={sorted} />}
      {layout === "deals" && <DealRadar products={sorted} />}
    </div>
  );
}

function numParam(v: string | string[] | undefined): number | null {
  if (typeof v !== "string" || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
