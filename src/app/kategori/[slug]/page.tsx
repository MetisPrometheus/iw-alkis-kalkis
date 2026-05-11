import { notFound } from "next/navigation";
import Link from "next/link";
import { Toolbar } from "@/components/Toolbar";
import { ProductCardGrid } from "@/components/ProductCardGrid";
import { Paginator } from "@/components/Paginator";
import {
  filterProducts,
  getAllProducts,
  getCountries,
  sortProducts,
  type SortKey,
} from "@/lib/products";
import {
  getMainCategory,
  getSubCategory,
  KATEGORI_TRE,
} from "@/lib/categories";

const PAGE_SIZE = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  const subSlugs = KATEGORI_TRE.flatMap((m) => m.underkategorier.map((s) => s.slug));
  const mainAllSlugs = KATEGORI_TRE.map((m) => `${m.slug}-alle`);
  return [...subSlugs, ...mainAllSlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const resolved = resolveSlug(slug);
  if (!resolved) return { title: "Ikke funnet" };
  return {
    title: `${resolved.title} — alkis kalkis`,
    description: `Bla og sortér ${resolved.title.toLowerCase()} etter pris per liter ren alkohol.`,
  };
}

function resolveSlug(slug: string):
  | { kind: "main-all"; title: string; mainSlug: string; sub: null }
  | { kind: "sub"; title: string; mainSlug: string; subSlug: string }
  | null {
  if (slug.endsWith("-alle")) {
    const mainSlug = slug.slice(0, -"-alle".length);
    const main = getMainCategory(mainSlug);
    if (!main) return null;
    return { kind: "main-all", title: `Alle ${main.navn.toLowerCase()}`, mainSlug, sub: null };
  }
  const sub = getSubCategory(slug);
  if (!sub) return null;
  return {
    kind: "sub",
    title: sub.sub.navn,
    mainSlug: sub.main.slug,
    subSlug: sub.sub.slug,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolved = resolveSlug(slug);
  if (!resolved) notFound();

  const sp = await searchParams;
  // Alkoholfritt has no meaningful kr/L ren alkohol — default to plain
  // kr/L for those routes.
  const isAlkFri = resolved.mainSlug === "annet";
  const defaultSort: SortKey = isAlkFri ? "ppl" : "ppra";
  const sort = (typeof sp.sort === "string" ? sp.sort : defaultSort) as SortKey;
  const land = typeof sp.land === "string" ? sp.land : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, numParam(sp.page) ?? 1);

  const all = getAllProducts();
  const filtered = filterProducts(all, {
    hovedkategori: resolved.mainSlug,
    underkategori: resolved.kind === "sub" ? resolved.subSlug : undefined,
    land: land || undefined,
    query: q || undefined,
  });
  const sorted = sortProducts(filtered, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pageSlice = sorted.slice(pageStart, pageEnd);
  const countries = getCountries(
    filterProducts(all, { hovedkategori: resolved.mainSlug }),
  );
  const mainCat = getMainCategory(resolved.mainSlug);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-xs text-foreground/60">
        <Link href="/" className="hover:text-foreground">Forsiden</Link>
        <span>›</span>
        {mainCat && resolved.kind === "sub" ? (
          <>
            <Link href={`/kategori/${mainCat.slug}-alle`} className="hover:text-foreground">
              {mainCat.navn}
            </Link>
            <span>›</span>
            <span className="text-foreground">{resolved.title}</span>
          </>
        ) : (
          <span className="text-foreground">{resolved.title}</span>
        )}
      </nav>

      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold sm:text-4xl">
          <span aria-hidden>{mainCat?.emoji}</span>
          {resolved.title}
        </h1>
        <div className="text-sm text-foreground/70">
          Viser {pageSlice.length === 0 ? 0 : pageStart + 1}–{pageStart + pageSlice.length} av{" "}
          {sorted.length.toLocaleString("nb-NO")}
        </div>
      </header>

      {mainCat && resolved.kind === "main-all" && (
        <div className="flex flex-wrap gap-2">
          {mainCat.underkategorier.map((sub) => (
            <Link
              key={sub.slug}
              href={`/kategori/${sub.slug}`}
              className="rounded-full border border-foreground/15 px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <span aria-hidden>{sub.emoji}</span> {sub.navn}
            </Link>
          ))}
        </div>
      )}

      <Toolbar countries={countries} />

      <ProductCardGrid products={pageSlice} />

      <Paginator currentPage={safePage} totalPages={totalPages} searchParams={sp} />
    </div>
  );
}

function numParam(v: string | string[] | undefined): number | null {
  if (typeof v !== "string" || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
