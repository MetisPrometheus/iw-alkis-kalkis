import { notFound } from "next/navigation";
import Link from "next/link";
import {
  filterProducts,
  getAllProducts,
  getProductById,
  sortProducts,
} from "@/lib/products";
import { getMainCategory, getSubCategory } from "@/lib/categories";
import { median } from "@/lib/derive";
import { formatAbv, formatPris, formatVolum } from "@/lib/format";
import { AnimatedNumber } from "@/components/motion";
import { MedianBar } from "@/components/MedianBar";
import { BottleIcon } from "@/components/icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Render on demand. With 15k+ products, prerendering every page at build
// time bloats the build to >30 min and isn't worth it for the long tail.
// Next.js will cache rendered pages on first hit (ISR-style).
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const p = getProductById(id);
  if (!p) return { title: "Ikke funnet" };
  return {
    title: `${p.navn} — alkis kalkis`,
    description: `${p.navn} fra ${p.produsent ?? "ukjent"} — ${formatPris(p.pris)}, ${formatAbv(p.alkoholProsent)}.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const mainCat = getMainCategory(product.hovedkategori);
  const subCat = getSubCategory(product.underkategori);

  const subPool = sortProducts(
    filterProducts(getAllProducts(), {
      underkategori: product.underkategori,
    }),
    "ppra",
  );
  const rankInSub = subPool.findIndex((p) => p.id === product.id) + 1;
  const subMedianPpra = median(
    subPool.filter((p) => p.prisPerLiterRenAlkohol > 0).map((p) => p.prisPerLiterRenAlkohol),
  );
  const ppra = Math.round(product.prisPerLiterRenAlkohol);

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-1 text-xs text-foreground/60">
        <Link href="/" className="hover:text-foreground">Forsiden</Link>
        <span>›</span>
        {mainCat && (
          <>
            <Link href={`/kategori/${mainCat.slug}-alle`} className="hover:text-foreground">
              {mainCat.navn}
            </Link>
            <span>›</span>
          </>
        )}
        {subCat && (
          <Link href={`/kategori/${subCat.sub.slug}`} className="hover:text-foreground">
            {subCat.sub.navn}
          </Link>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <div
          className={`flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-foreground/10 shadow-card md:h-96 ${
            mainCat?.tint.bg ?? "bg-surface"
          }`}
        >
          {product.bildeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.bildeUrl}
              alt={product.navn}
              className="h-full w-auto object-contain p-6"
            />
          ) : (
            <BottleIcon className={`h-24 w-24 ${mainCat?.tint.text ?? "text-foreground/40"}`} />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground/50">
              {subCat?.sub.navn ?? mainCat?.navn ?? "Produkt"}
              {rankInSub > 0 && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 tabular-nums ${
                    rankInSub === 1
                      ? "bg-gold/15 font-semibold text-gold ring-1 ring-gold/40"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  #{rankInSub} i {subCat?.sub.navn ?? "kategori"}
                </span>
              )}
            </p>
            <h1 className="mt-1 text-fluid-title font-display font-bold">{product.navn}</h1>
            <p className="mt-1 text-foreground/70">
              {[product.produsent, product.land, product.distrikt, product.argang]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Pris" value={formatPris(product.pris)} />
            <Stat label="Volum" value={formatVolum(product.volumLiter)} />
            <Stat label="Alkohol" value={formatAbv(product.alkoholProsent)} />
            <div className="rounded-2xl border border-foreground/10 bg-accent/10 p-3 shadow-card">
              <div className="text-xs uppercase tracking-wide text-foreground/50">Kr / l alc</div>
              <div className="font-display text-lg font-semibold tabular-nums text-accent">
                {ppra > 0 ? (
                  <>
                    <AnimatedNumber value={ppra} /> kr
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          {ppra > 0 && subMedianPpra > 0 && (
            <div className="rounded-2xl border border-foreground/10 bg-surface p-3 shadow-card">
              <div className="mb-2 text-xs uppercase tracking-wide text-foreground/50">
                Mot snittet i {subCat?.sub.navn.toLowerCase() ?? "kategorien"}
              </div>
              <MedianBar
                value={ppra}
                medianValue={subMedianPpra}
                dotClass={mainCat?.tint.dot ?? "bg-accent"}
              />
            </div>
          )}

          {product.smaknotater && (
            <Detail title="Smak">{product.smaknotater}</Detail>
          )}
          {product.lukt && <Detail title="Lukt">{product.lukt}</Detail>}
          {product.farge && <Detail title="Farge">{product.farge}</Detail>}
          {product.passerTil.length > 0 && (
            <Detail title="Passer til">{product.passerTil.join(", ")}</Detail>
          )}
          {product.raastoff && (
            <Detail title="Råstoff">{product.raastoff}</Detail>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={product.vmpUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="tappable rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-card transition-shadow hover:opacity-90 hover:shadow-card-lg"
            >
              Kjøp på Vinmonopolet ↗
            </a>
            {subCat && (
              <Link
                href={`/kategori/${subCat.sub.slug}`}
                className="tappable rounded-full border border-foreground/15 px-5 py-2.5 text-sm hover:bg-surface-2"
              >
                Sammenlign {subCat.sub.navn.toLowerCase()}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-surface p-3 shadow-card">
      <div className="text-xs uppercase tracking-wide text-foreground/50">{label}</div>
      <div className="font-display text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-foreground/5 bg-surface p-3 shadow-card">
      <div className="text-xs uppercase tracking-wide text-foreground/50">{title}</div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
