import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatAbv, formatPris, formatPrisDecimal, formatVolum } from "@/lib/format";

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="max-h-[70vh] overflow-auto rounded-2xl border border-foreground/10 bg-surface shadow-card">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-foreground/60">
          <tr>
            <th className="sticky top-0 z-10 border-b border-foreground/10 bg-white/90 px-4 py-3 backdrop-blur">Navn</th>
            <th className="sticky top-0 z-10 border-b border-foreground/10 bg-white/90 px-4 py-3 backdrop-blur">Volum</th>
            <th className="sticky top-0 z-10 border-b border-foreground/10 bg-white/90 px-4 py-3 backdrop-blur">Alk</th>
            <th className="sticky top-0 z-10 border-b border-foreground/10 bg-white/90 px-4 py-3 text-right backdrop-blur">Pris</th>
            <th className="sticky top-0 z-10 border-b border-foreground/10 bg-white/90 px-4 py-3 text-right backdrop-blur">Kr / l</th>
            <th className="sticky top-0 z-10 border-b border-foreground/10 bg-white/90 px-4 py-3 text-right backdrop-blur">
              <span className="text-accent">Kr / l alc</span>
            </th>
            <th className="sticky top-0 z-10 border-b border-foreground/10 bg-white/90 px-4 py-3 backdrop-blur">Land</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p.id}
              className="border-t border-foreground/5 transition-colors first:border-t-0 hover:bg-accent/5"
            >
              <td className="max-w-[24ch] truncate px-4 py-3">
                <Link href={`/produkt/${p.id}`} className="font-medium hover:underline">
                  {p.navn}
                </Link>
                {p.produsent && (
                  <div className="truncate text-xs text-foreground/50">{p.produsent}</div>
                )}
              </td>
              <td className="px-4 py-3 tabular-nums">{formatVolum(p.volumLiter)}</td>
              <td className="px-4 py-3 tabular-nums">{formatAbv(p.alkoholProsent)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatPris(p.pris)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground/70">
                {formatPrisDecimal(p.prisPerLiter)}
              </td>
              <td className="px-4 py-3 text-right font-display tabular-nums font-semibold text-accent">
                {formatPris(Math.round(p.prisPerLiterRenAlkohol))}
              </td>
              <td className="px-4 py-3 text-foreground/70">{p.land ?? "-"}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-foreground/50">
                Ingen produkter passer filtrene.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
