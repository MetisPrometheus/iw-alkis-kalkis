import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatAbv, formatPris, formatVolum } from "@/lib/format";

export function DealRadar({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-foreground/10 p-10 text-center text-foreground/50">
        Ingen produkter passer filtrene.
      </div>
    );
  }

  const ppras = products.map((p) => p.prisPerLiterRenAlkohol);
  const min = Math.min(...ppras);
  const max = Math.max(...ppras);
  const range = Math.max(1, max - min);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-xs text-foreground/60">
        <span>Beste deal: {formatPris(Math.round(min))} / l alc</span>
        <span>Verste: {formatPris(Math.round(max))} / l alc</span>
      </div>
      <ol className="space-y-1.5">
        {products.map((p, i) => {
          const score = 1 - (p.prisPerLiterRenAlkohol - min) / range;
          const widthPct = Math.max(8, Math.round(score * 100));
          return (
            <li key={p.id}>
              <Link
                href={`/produkt/${p.id}`}
                className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-foreground/10 bg-surface px-3 py-2 transition-colors hover:border-accent/40"
              >
                <div
                  className="deal-bar pointer-events-none absolute inset-y-0 left-0 -z-0 opacity-15 transition-opacity group-hover:opacity-25"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="z-10 w-8 shrink-0 text-right text-sm tabular-nums text-foreground/50">
                  #{i + 1}
                </span>
                <div className="z-10 min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.navn}</div>
                  <div className="truncate text-xs text-foreground/50">
                    {p.land ?? "—"} · {formatVolum(p.volumLiter)} · {formatAbv(p.alkoholProsent)}
                  </div>
                </div>
                <div className="z-10 hidden text-right text-xs text-foreground/50 sm:block">
                  {formatPris(p.pris)}
                </div>
                <div className="z-10 w-24 shrink-0 text-right text-sm font-bold tabular-nums text-accent">
                  {formatPris(Math.round(p.prisPerLiterRenAlkohol))}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
