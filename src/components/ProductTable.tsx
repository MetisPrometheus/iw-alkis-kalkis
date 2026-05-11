import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatAbv, formatPris, formatPrisDecimal, formatVolum } from "@/lib/format";

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-foreground/10">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-foreground/60">
          <tr>
            <th className="px-3 py-2">Navn</th>
            <th className="px-3 py-2">Volum</th>
            <th className="px-3 py-2">Alk</th>
            <th className="px-3 py-2 text-right">Pris</th>
            <th className="px-3 py-2 text-right">Kr / l</th>
            <th className="px-3 py-2 text-right">
              <span className="text-accent">Kr / l alc</span>
            </th>
            <th className="px-3 py-2">Land</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={p.id}
              className={`border-t border-foreground/5 ${i % 2 === 0 ? "bg-surface" : "bg-surface-2/40"} hover:bg-accent/5`}
            >
              <td className="max-w-[24ch] truncate px-3 py-2">
                <Link href={`/produkt/${p.id}`} className="font-medium hover:underline">
                  {p.navn}
                </Link>
                {p.produsent && (
                  <div className="truncate text-xs text-foreground/50">{p.produsent}</div>
                )}
              </td>
              <td className="px-3 py-2 tabular-nums">{formatVolum(p.volumLiter)}</td>
              <td className="px-3 py-2 tabular-nums">{formatAbv(p.alkoholProsent)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatPris(p.pris)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-foreground/70">
                {formatPrisDecimal(p.prisPerLiter)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-semibold text-accent">
                {formatPris(Math.round(p.prisPerLiterRenAlkohol))}
              </td>
              <td className="px-3 py-2 text-foreground/70">{p.land ?? "—"}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-foreground/50">
                Ingen produkter passer filtrene.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
