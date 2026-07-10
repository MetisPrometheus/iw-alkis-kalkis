"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { KATEGORI_TRE } from "@/lib/categories";
import { CategoryIcon, ChevronDownIcon } from "@/components/icons";

const SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;

export function CategoryGrid({ counts }: { counts?: Record<string, number> }) {
  const [open, setOpen] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {KATEGORI_TRE.map((kat) => {
        const isOpen = open === kat.slug;
        return (
          <motion.div
            key={kat.slug}
            whileHover={reduce ? undefined : { y: -3 }}
            whileTap={reduce ? undefined : { scale: 0.985 }}
            transition={SPRING}
            className={`rounded-2xl border border-black/5 ${kat.tint.card} shadow-card transition-shadow hover:shadow-card-lg`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : kat.slug)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 ${kat.tint.text}`}
                aria-hidden
              >
                <CategoryIcon ikon={kat.ikon} className="h-7 w-7" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="whitespace-nowrap text-lg font-semibold">{kat.navn}</h3>
                  <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-foreground/55 sm:text-xs">
                    {counts?.[kat.slug] != null
                      ? `${counts[kat.slug].toLocaleString("nb-NO")} produkter · `
                      : ""}
                    {kat.underkategorier.length} typer
                  </span>
                </div>
                <p className="text-sm text-foreground/60">{kat.beskrivelse}</p>
              </div>
              {reduce ? (
                <span className={`text-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden>
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              ) : (
                <motion.span
                  className="text-foreground/40"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={SPRING}
                  aria-hidden
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </motion.span>
              )}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 px-5 pb-5">
                    {kat.underkategorier.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/kategori/${sub.slug}`}
                        className="tappable flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${kat.tint.dot}`} aria-hidden />
                        <span>{sub.navn}</span>
                      </Link>
                    ))}
                    <Link
                      href={`/kategori/${kat.slug}-alle`}
                      className="tappable col-span-2 mt-1 rounded-lg border border-dashed border-foreground/15 px-3 py-2 text-center text-xs text-foreground/60 hover:bg-foreground/5"
                    >
                      Se alle {kat.navn.toLowerCase()} →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
