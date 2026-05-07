import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatAbv, formatPris, formatVolum } from "@/lib/format";

export function ProductCardGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-foreground/10 p-10 text-center text-foreground/50">
        Ingen produkter passer filtrene.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/produkt/${p.id}`}
          className="group flex flex-col rounded-xl border border-foreground/10 bg-surface p-3 transition-all hover:border-accent/40 hover:shadow-lg"
        >
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
            {p.bildeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.bildeUrl}
                alt=""
                className="h-full w-auto object-contain p-2 transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <span className="text-5xl">🍾</span>
            )}
          </div>
          <div className="mt-3 flex flex-1 flex-col">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{p.navn}</h3>
            <p className="mt-0.5 text-xs text-foreground/50">
              {p.land ?? "—"} · {formatVolum(p.volumLiter)} · {formatAbv(p.alkoholProsent)}
            </p>
            <div className="mt-auto pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold tabular-nums">
                  {formatPris(p.pris)}
                </span>
                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-accent">
                  {formatPris(Math.round(p.prisPerLiterRenAlkohol))} /l ren
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
