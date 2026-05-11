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
          metricBg: "bg-sky-500/10",
          hover: "hover:border-sky-500/40",
        }
      : {
          rank: "text-accent",
          metricLabel: "text-foreground/50",
          metricValue: "text-accent",
          metricBg: "bg-accent/10",
          hover: "hover:border-accent/40",
        };

  const showPpra = tone !== "free" && product.prisPerLiterRenAlkohol > 0;
  const metricLabel = showPpra ? "kr/l alc" : "kr/l";
  const metricValue = showPpra
    ? Math.round(product.prisPerLiterRenAlkohol)
    : Math.round(product.prisPerLiter);
  const metricInline = `${formatPris(metricValue).replace("kr ", "")} ${metricLabel}`;

  const imageNode = product.bildeUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.bildeUrl}
      alt=""
      className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105"
      loading="lazy"
    />
  ) : (
    <span className="text-2xl">🍾</span>
  );

  return (
    <Link
      href={`/produkt/${product.id}`}
      className={`group block rounded-xl border border-foreground/10 bg-surface transition-colors ${toneClasses.hover}`}
    >
      {/* Mobile: vertical compact card (image on top, content below) */}
      <div className="flex flex-col sm:hidden">
        <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-t-xl bg-surface-2">
          {rank != null && (
            <span
              className={`absolute left-1.5 top-1 text-base font-bold tabular-nums ${toneClasses.rank}`}
            >
              #{rank}
            </span>
          )}
          {imageNode}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-2.5">
          <div className="line-clamp-2 text-xs font-semibold leading-snug">
            {product.navn}
          </div>
          <div className="truncate text-[11px] text-foreground/60">
            {product.land ?? "—"} · {formatAbv(product.alkoholProsent)}
          </div>
          <div className="mt-auto flex items-baseline justify-between pt-1">
            <span className="text-[11px] text-foreground/70">
              {formatPris(product.pris)}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${toneClasses.metricBg} ${toneClasses.metricValue}`}
            >
              {metricInline}
            </span>
          </div>
        </div>
      </div>

      {/* sm+: horizontal card */}
      <div className="hidden gap-4 p-4 sm:flex">
        {rank != null && (
          <div
            className={`flex w-10 shrink-0 items-start justify-center pt-1 text-2xl font-bold tabular-nums ${toneClasses.rank}`}
          >
            #{rank}
          </div>
        )}
        <div className="flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-2">
          {imageNode}
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
          <div className={`text-xs uppercase tracking-wide ${toneClasses.metricLabel}`}>
            {metricLabel}
          </div>
          <div className={`text-lg font-bold tabular-nums ${toneClasses.metricValue}`}>
            {formatPris(metricValue).replace("kr ", "")} kr
          </div>
        </div>
      </div>
    </Link>
  );
}
