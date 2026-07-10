import Link from "next/link";
import type { Product } from "@/lib/types";
import type { CategoryTint } from "@/lib/categories";
import { formatAbv, formatPris, formatVolum } from "@/lib/format";
import { AnimatedNumber } from "@/components/motion";
import { MedianBar } from "@/components/MedianBar";
import { BottleIcon } from "@/components/icons";

export type DealTone = "alc" | "free";

const DEFAULT_TINT: CategoryTint = {
  bg: "bg-surface-2",
  bgSoft: "bg-surface-2/45",
  text: "text-foreground/60",
  dot: "bg-foreground/60",
};

export function DealCard({
  product,
  rank,
  tone = "alc",
  tint = DEFAULT_TINT,
  medianValue,
}: {
  product: Product;
  rank?: number;
  tone?: DealTone;
  tint?: CategoryTint;
  /** Category median in the same unit as the card's metric (kr/l alc or kr/l). */
  medianValue?: number;
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

  const isTop = rank === 1;
  const showPpra = tone !== "free" && product.prisPerLiterRenAlkohol > 0;
  const metricLabel = showPpra ? "kr/l alc" : "kr/l";
  const metricValue = showPpra
    ? Math.round(product.prisPerLiterRenAlkohol)
    : Math.round(product.prisPerLiter);

  const imageNode = product.bildeUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.bildeUrl}
      alt=""
      className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105"
      loading="lazy"
    />
  ) : (
    <BottleIcon className={`h-10 w-10 ${tint.text}`} />
  );

  const goldBadge = isTop && (
    <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white shadow-card">
      #1
    </span>
  );

  return (
    <Link
      href={`/produkt/${product.id}`}
      className={`group block h-full rounded-2xl border border-foreground/10 bg-surface shadow-card transition-all hover:shadow-card-lg ${toneClasses.hover} ${
        isTop ? "ring-2 ring-gold/60" : ""
      }`}
    >
      {/* Mobile: vertical compact card (image on top, content below) */}
      <div className="flex h-full flex-col sm:hidden">
        <div className={`relative flex h-28 items-center justify-center overflow-hidden rounded-t-2xl ${tint.bg}`}>
          {goldBadge}
          {rank != null && !isTop && (
            <span
              className={`absolute left-1.5 top-1 font-display text-base font-bold tabular-nums ${toneClasses.rank}`}
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
          <div className="mt-auto space-y-1.5 pt-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tabular-nums text-foreground/70">
                {formatPris(product.pris)}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 font-display text-[11px] font-bold tabular-nums ${toneClasses.metricBg} ${toneClasses.metricValue}`}
              >
                <AnimatedNumber value={metricValue} /> {metricLabel}
              </span>
            </div>
            {medianValue != null && (
              <MedianBar value={metricValue} medianValue={medianValue} dotClass={tint.dot} />
            )}
          </div>
        </div>
      </div>

      {/* sm+: horizontal card */}
      <div className="hidden gap-4 p-4 sm:flex">
        {rank != null && (
          <div
            className={`relative flex w-10 shrink-0 items-start justify-center pt-1 font-display text-2xl font-bold tabular-nums ${
              isTop ? "text-gold" : toneClasses.rank
            }`}
          >
            #{rank}
          </div>
        )}
        <div className={`flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl ${tint.bg}`}>
          {imageNode}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{product.navn}</div>
          <div className="text-xs text-foreground/60">
            {product.land ?? "—"} · {product.produsent ?? "—"}
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs tabular-nums text-foreground/70">
            <span>{formatVolum(product.volumLiter)}</span>
            <span>{formatAbv(product.alkoholProsent)}</span>
            <span className="font-medium text-foreground">{formatPris(product.pris)}</span>
          </div>
          {medianValue != null && (
            <div className="mt-2 max-w-56">
              <MedianBar value={metricValue} medianValue={medianValue} dotClass={tint.dot} />
            </div>
          )}
        </div>
        <div className="flex flex-col items-end justify-center text-right">
          <div className={`text-xs uppercase tracking-wide ${toneClasses.metricLabel}`}>
            {metricLabel}
          </div>
          <div className={`font-display text-lg font-bold tabular-nums ${toneClasses.metricValue}`}>
            <AnimatedNumber value={metricValue} /> kr
          </div>
        </div>
      </div>
    </Link>
  );
}
