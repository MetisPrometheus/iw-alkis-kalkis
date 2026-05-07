"use client";
import Link from "next/link";
import { useState } from "react";
import { KATEGORI_TRE } from "@/lib/categories";

export function CategoryGrid() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {KATEGORI_TRE.map((kat) => {
        const isOpen = open === kat.slug;
        return (
          <div
            key={kat.slug}
            className={`group rounded-2xl border border-foreground/10 bg-gradient-to-br ${kat.bgClass} bg-surface transition-all`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : kat.slug)}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <span className="text-4xl" aria-hidden>{kat.emoji}</span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{kat.navn}</h3>
                  <span className="text-xs text-foreground/50">
                    {kat.underkategorier.length} typer
                  </span>
                </div>
                <p className="text-sm text-foreground/60">{kat.beskrivelse}</p>
              </div>
              <span
                className={`text-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="grid grid-cols-2 gap-2 px-5 pb-5">
                {kat.underkategorier.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/kategori/${sub.slug}`}
                    className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span aria-hidden>{sub.emoji}</span>
                    <span>{sub.navn}</span>
                  </Link>
                ))}
                <Link
                  href={`/kategori/${kat.slug}-alle`}
                  className="col-span-2 mt-1 rounded-lg border border-dashed border-foreground/15 px-3 py-2 text-center text-xs text-foreground/60 hover:bg-foreground/5"
                >
                  Se alle {kat.navn.toLowerCase()} →
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
