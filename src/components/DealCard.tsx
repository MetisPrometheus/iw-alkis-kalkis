import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatAbv, formatPris, formatVolum } from "@/lib/format";

export type DealTone = "alc" | "free";

export function DealCard({
  product,
  rank,
  tone = "alc",
}: {
  product: Product;
  rank?: number;
  tone?: DealTone;
}) {
  // Free-tone uses sky blue; alc-tone uses the site accent (red).
  const toneClasses =
    tone === "free"
      ? {
          rank: "text-sky-600",
          metricLabel: "text-foreground/50",
          metricValue: "text-sky-600",
          hover: "hover:border-sky-500/40",
        }
      : {
          rank: "text-accent",
          metricLabel: "text-foreground/50",
          metricValue: "text-accent",
          hover: "hover:border-accent/40",
        };

  const showPpra = tone !== "free" && product.prisPerLiterRenAlkohol > 0;
  const metricLabel = showPpra ? "kr/l ren" : "kr/l";
  const metricValue = showPpra
    ? Math.round(product.prisPerLiterRenAlkohol)
    : Math.round(product.prisPerLiter);

  return (
    <Link
      href={`/produkt/${product.id}`}
      className={`group flex gap-4 rounded-xl border border-foreground/10 bg-surface p-4 transition-colors ${toneClasses.hover}`}
    >
      {rank != null && (
        <div className={`flex w-10 shrink-0 items-start justify-center pt-1 text-2xl font-bold tabular-nums ${toneClasses.rank}`}>
          #{rank}
        </div>
      )}
      <div className="hidden h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-2 sm:flex">
        {product.bildeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.bildeUrl}
            alt=""
            className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-2xl">🍾</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{product.navn}</div>
        <div className="text-xs text-foreground/60">
          {product.land ?? "—"} · {product.produsent ?? "—"}
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-foreground/70">
          <span>{formatVolum(product.volumLiter)}</span>
          <span>{formatAbv(product.alkoholProsent)}</span>
          <span className="font-medium text-foreground">{formatPris(product.pris)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-center text-right">
        <div className={`text-xs uppercase tracking-wide ${toneClasses.metricLabel}`}>{metricLabel}</div>
        <div className={`text-lg font-bold tabular-nums ${toneClasses.metricValue}`}>
          {formatPris(metricValue).replace("kr ", "")} kr
        </div>
      </div>
    </Link>
  );
}
