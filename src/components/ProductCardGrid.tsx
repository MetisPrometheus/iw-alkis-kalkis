import Link from "next/link";
import type { Product } from "@/lib/types";
import { getMainCategory } from "@/lib/categories";
import { formatAbv, formatPris, formatVolum } from "@/lib/format";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { MedianBar } from "@/components/MedianBar";
import { BottleIcon } from "@/components/icons";

export function ProductCardGrid({
  products,
  medianPpra,
  medianPpl,
}: {
  products: Product[];
  /** Median kr/l ren alkohol for the set — enables the per-card median bar. */
  medianPpra?: number;
  /** Median kr/l for products without meaningful ABV (alkoholfritt). */
  medianPpl?: number;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-foreground/10 p-10 text-center text-foreground/50">
        Ingen produkter passer filtrene.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => {
        const tint = getMainCategory(p.hovedkategori)?.tint;
        const plinth = tint?.bg ?? "bg-surface-2";
        const showPpra = p.prisPerLiterRenAlkohol > 0;
        const metricValue = showPpra
          ? Math.round(p.prisPerLiterRenAlkohol)
          : Math.round(p.prisPerLiter);
        const medianValue = showPpra ? medianPpra : medianPpl;
        return (
          <Reveal key={p.id} delay={(i % 4) * 0.05} className="h-full">
            <Link
              href={`/produkt/${p.id}`}
              className="group flex h-full flex-col rounded-2xl border border-foreground/10 bg-surface p-3 shadow-card transition-all hover:border-accent/40 hover:shadow-card-lg"
            >
              <div className={`flex h-40 items-center justify-center overflow-hidden rounded-xl ${plinth}`}>
                {p.bildeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.bildeUrl}
                    alt=""
                    className="h-full w-auto object-contain p-2 transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <BottleIcon className={`h-12 w-12 ${tint?.text ?? "text-foreground/40"}`} />
                )}
              </div>
              <div className="mt-3 flex flex-1 flex-col">
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{p.navn}</h3>
                <p className="mt-0.5 text-xs text-foreground/50">
                  {p.land ?? "—"} · {formatVolum(p.volumLiter)} · {formatAbv(p.alkoholProsent)}
                </p>
                <div className="mt-auto space-y-2 pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-base font-semibold tabular-nums">
                      {formatPris(p.pris)}
                    </span>
                    {showPpra ? (
                      <span className="rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums bg-accent/10 text-accent">
                        <AnimatedNumber value={metricValue} /> kr /l alc
                      </span>
                    ) : (
                      <span className="rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums bg-sky-500/10 text-sky-600">
                        <AnimatedNumber value={metricValue} /> kr /l
                      </span>
                    )}
                  </div>
                  {medianValue != null && medianValue > 0 && (
                    <MedianBar
                      value={metricValue}
                      medianValue={medianValue}
                      dotClass={tint?.dot ?? "bg-accent"}
                    />
                  )}
                </div>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
