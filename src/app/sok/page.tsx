import { Toolbar } from "@/components/Toolbar";
import { ProductTable } from "@/components/ProductTable";
import { ProductCardGrid } from "@/components/ProductCardGrid";
import { DealRadar } from "@/components/DealRadar";
import { Paginator } from "@/components/Paginator";
import {
  filterProducts,
  getAllProducts,
  getCountries,
  sortProducts,
  type SortKey,
} from "@/lib/products";

const ALL_LAYOUTS = ["grid", "table", "deals"] as const;
const PAGE_SIZE = 60;

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
  const layoutParam = typeof sp.layout === "string" ? sp.layout : "grid";
  const layout = (ALL_LAYOUTS as readonly string[]).includes(layoutParam)
    ? (layoutParam as (typeof ALL_LAYOUTS)[number])
    : "grid";
  const land = typeof sp.land === "string" ? sp.land : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const minAbv = numParam(sp.minAbv);
  const maxAbv = numParam(sp.maxAbv);
  const minPris = numParam(sp.minPris);
  const maxPris = numParam(sp.maxPris);
  const page = Math.max(1, numParam(sp.page) ?? 1);

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
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageSlice = sorted.slice(pageStart, pageStart + PAGE_SIZE);
  const countries = getCountries(all);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Søk</h1>
        <p className="text-foreground/70">
          {q
            ? `Søker etter «${q}» — ${sorted.length.toLocaleString("nb-NO")} treff`
            : `${sorted.length.toLocaleString("nb-NO")} av ${all.length.toLocaleString("nb-NO")} produkter`}
          {totalPages > 1 && pageSlice.length > 0 && (
            <> · viser {pageStart + 1}–{pageStart + pageSlice.length}</>
          )}
        </p>
      </header>

      <Toolbar countries={countries} />

      {layout === "table" && <ProductTable products={pageSlice} />}
      {layout === "grid" && <ProductCardGrid products={pageSlice} />}
      {layout === "deals" && <DealRadar products={pageSlice} />}

      <Paginator
        currentPage={safePage}
        totalPages={totalPages}
        searchParams={sp}
        basePath="/sok"
      />
    </div>
  );
}

function numParam(v: string | string[] | undefined): number | null {
  if (typeof v !== "string" || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
