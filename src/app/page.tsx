import { CategoryGrid } from "@/components/CategoryGrid";
import { DealCard, type DealTone } from "@/components/DealCard";
import {
  getCountByMainCategory,
  getProductsMeta,
  getTopDeals,
} from "@/lib/products";
import { KATEGORI_TRE } from "@/lib/categories";
import Link from "next/link";

export default function Home() {
  const counts = getCountByMainCategory();
  const perCategory = KATEGORI_TRE.map((kat) => {
    // Alkoholfritt has ABV ≈ 0, so kr/L pure alcohol is meaningless. Sort
    // those by raw kr/L instead.
    const sort = kat.slug === "annet" ? "ppl" : "ppra";
    const tone: DealTone = kat.slug === "annet" ? "free" : "alc";
    return {
      kat,
      tone,
      deals: getTopDeals(3, kat.slug, sort),
    };
  }).filter((x) => x.deals.length > 0);
  const meta = getProductsMeta();

  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Hva gir mest <span className="text-accent">promille</span> per krone i dag?
        </h1>
        <p className="max-w-2xl text-foreground/70">
          Alle Vinmonopolets {meta.count.toLocaleString("nb-NO")} produkter, sortert etter pris per liter
          ren alkohol — den eneste statistikken som teller. Velg en kategori under.
        </p>
        {meta.source !== "vmp-live" && (
          <p className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700">
            ⚠️ Bruker innebygd demosett ({meta.source}). Live polet-feed kobles på i prod.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bla etter kategori</h2>
        <CategoryGrid counts={counts} />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Beste i hver kategori</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {perCategory.map(({ kat, tone, deals }) => (
            <div key={kat.slug} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">
                  <span aria-hidden>{kat.emoji}</span> {kat.navn}
                  {tone === "free" && (
                    <span className="ml-2 text-xs font-normal text-sky-600">
                      (sortert: kr / liter)
                    </span>
                  )}
                </h3>
                <Link
                  href={`/kategori/${kat.slug}-alle`}
                  className="text-xs text-foreground/60 hover:text-accent"
                >
                  Alle {kat.navn.toLowerCase()} →
                </Link>
              </div>
              <div className="space-y-2">
                {deals.map((p, i) => (
                  <DealCard key={p.id} product={p} rank={i + 1} tone={tone} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
