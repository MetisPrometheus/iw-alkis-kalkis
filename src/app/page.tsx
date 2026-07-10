import { CategoryGrid } from "@/components/CategoryGrid";
import { DealCard, type DealTone } from "@/components/DealCard";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { AlertIcon, CategoryIcon } from "@/components/icons";
import {
  getAllProducts,
  getCategoryStats,
  getCountByMainCategory,
  getProductsMeta,
  getTopDeals,
} from "@/lib/products";
import { median } from "@/lib/derive";
import { KATEGORI_TRE } from "@/lib/categories";
import Link from "next/link";

export default function Home() {
  const counts = getCountByMainCategory();
  const all = getAllProducts();
  const perCategory = KATEGORI_TRE.map((kat) => {
    // Alkoholfritt has ABV ≈ 0, so kr/L pure alcohol is meaningless. Sort
    // those by raw kr/L instead.
    const sort = kat.slug === "annet" ? "ppl" : "ppra";
    const tone: DealTone = kat.slug === "annet" ? "free" : "alc";
    // Median in the same unit as the cards' metric, across the whole category.
    const medianValue =
      tone === "free"
        ? median(
            all
              .filter((p) => p.hovedkategori === kat.slug && p.prisPerLiter > 0)
              .map((p) => p.prisPerLiter),
          )
        : getCategoryStats(kat.slug).medianPpra;
    return {
      kat,
      tone,
      medianValue,
      deals: getTopDeals(3, kat.slug, sort),
    };
  }).filter((x) => x.deals.length > 0);
  const meta = getProductsMeta();

  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="space-y-3">
        <h1 className="text-fluid-display font-display font-bold">
          Hva gir mest <span className="text-accent">promille</span> per krone i dag?
        </h1>
        <p className="max-w-2xl text-sm text-foreground/70">
          Alle Vinmonopolets{" "}
          <AnimatedNumber
            value={meta.count}
            duration={1.4}
            className="font-display text-base font-bold text-foreground"
          />{" "}
          produkter, sortert etter pris per liter ren alkohol — den eneste
          statistikken som teller.
        </p>
        {meta.source !== "vmp-live" && (
          <p className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700">
            <AlertIcon className="h-4 w-4 shrink-0" aria-hidden />
            Bruker innebygd demosett ({meta.source}). Live polet-feed kobles på i prod.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-fluid-section font-display font-semibold">Bla etter kategori</h2>
        <CategoryGrid counts={counts} />
      </section>

      <section className="space-y-6">
        <h2 className="text-fluid-section font-display font-semibold">Beste i hver kategori</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {perCategory.map(({ kat, tone, medianValue, deals }) => (
            <div key={kat.slug} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${kat.tint.bg} ${kat.tint.text}`}
                    aria-hidden
                  >
                    <CategoryIcon ikon={kat.ikon} className="h-[18px] w-[18px]" />
                  </span>
                  {kat.navn}
                  {tone === "free" && (
                    <span className="text-xs font-normal text-sky-600">
                      (sortert: kr / liter)
                    </span>
                  )}
                </h3>
                <Link
                  href={`/kategori/${kat.slug}-alle`}
                  className="tappable text-xs text-foreground/60 hover:text-accent"
                >
                  Alle {kat.navn.toLowerCase()} →
                </Link>
              </div>
              {/* Mobile: horizontal snap carousel. sm+: stacked rows. */}
              <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-1 sm:gap-2 sm:overflow-visible sm:p-0">
                {deals.map((p, i) => (
                  <Reveal
                    key={p.id}
                    delay={i * 0.07}
                    className="w-[72%] min-w-[15rem] shrink-0 snap-start sm:w-auto sm:min-w-0"
                  >
                    <DealCard
                      product={p}
                      rank={i + 1}
                      tone={tone}
                      tint={kat.tint}
                      medianValue={medianValue}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
