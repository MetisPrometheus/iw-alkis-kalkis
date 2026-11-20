import { Toolbar } from "@/components/Toolbar";
import { ProductCardGrid } from "@/components/ProductCardGrid";
import { Paginator } from "@/components/Paginator";
import {
  filterProducts,
  getAllProducts,
  getCountriesFor,
  getSortedScope,
  parseSort,
} from "@/lib/products";
import { median } from "@/lib/derive";

const PAGE_SIZE = 60;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = {
  title: "Søk · alkis kalkis",
  description: "Søk i hele Vinmonopolet-utvalget.",
  // Belt and braces with robots.txt: /sok has unbounded query-string
  // variants and must never enter an index.
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sort = parseSort(sp.sort, "ppra");
  const land = typeof sp.land === "string" ? sp.land : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, numParam(sp.page) ?? 1);

  const all = getAllProducts();
  // Filtering an already-sorted list keeps its order, so no per-request sort.
  const sorted = filterProducts(getSortedScope(sort), {
    land: land || undefined,
    query: q || undefined,
  });
  // Medians over the current result set so the per-card bars compare
  // against "snittet" for what you're actually looking at.
  const medianPpra = median(
    sorted.filter((p) => p.prisPerLiterRenAlkohol > 0).map((p) => p.prisPerLiterRenAlkohol),
  );
  const medianPpl = median(sorted.filter((p) => p.prisPerLiter > 0).map((p) => p.prisPerLiter));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageSlice = sorted.slice(pageStart, pageStart + PAGE_SIZE);
  const countries = getCountriesFor();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-fluid-title font-bold">Søk</h1>
        <p className="tabular-nums text-foreground/70">
          {q
            ? `Søker etter «${q}» · ${sorted.length.toLocaleString("nb-NO")} treff`
            : `${sorted.length.toLocaleString("nb-NO")} av ${all.length.toLocaleString("nb-NO")} produkter`}
          {totalPages > 1 && pageSlice.length > 0 && (
            <> · viser {pageStart + 1}–{pageStart + pageSlice.length}</>
          )}
        </p>
      </header>

      <Toolbar countries={countries} />

      <ProductCardGrid products={pageSlice} medianPpra={medianPpra} medianPpl={medianPpl} />

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
