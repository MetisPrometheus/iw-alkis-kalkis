"use client";
import { useQueryStates, parseAsString, parseAsStringEnum, parseAsInteger } from "nuqs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SearchIcon } from "@/components/icons";

const SORT_VALUES = [
  "ppra",
  "ppra-desc",
  "ppl",
  "ppl-desc",
  "pris",
  "pris-desc",
  "abv",
  "abv-desc",
  "volum-desc",
  "navn",
] as const;

const SORT_LABELS: Record<(typeof SORT_VALUES)[number], string> = {
  ppra: "Best deal (kr/l alc) ↑",
  "ppra-desc": "Verste deal (kr/l alc) ↓",
  ppl: "Billigst per liter ↑",
  "ppl-desc": "Dyrest per liter ↓",
  pris: "Pris ↑",
  "pris-desc": "Pris ↓",
  abv: "Alkohol % ↑",
  "abv-desc": "Alkohol % ↓",
  "volum-desc": "Volum ↓",
  navn: "Navn A-Å",
};

const CHIP_SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onRemove}
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.85 }}
      transition={reduce ? { duration: 0 } : CHIP_SPRING}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <span>{label}</span>
      <span aria-hidden>×</span>
    </motion.button>
  );
}

export function Toolbar({ countries }: { countries: string[] }) {
  const [state, setStateRaw] = useQueryStates(
    {
      sort: parseAsStringEnum([...SORT_VALUES]).withDefault("ppra"),
      land: parseAsString.withDefault(""),
      q: parseAsString.withDefault(""),
      page: parseAsInteger,
    },
    { shallow: false },
  );

  // Reset page=1 whenever a filter/sort-changing patch is applied so we
  // don't end up on an empty page after narrowing the result set.
  type Patch = Parameters<typeof setStateRaw>[0];
  const setState = (patch: Patch) => {
    const filterKeys = ["sort", "land", "q"] as const;
    const touchesFilter = filterKeys.some((k) => k in (patch as Record<string, unknown>));
    return setStateRaw(touchesFilter ? { ...patch, page: null } : patch);
  };

  const hasChips = Boolean(state.q || state.land);

  return (
    <div className="space-y-2 rounded-2xl border border-foreground/10 bg-surface p-3 shadow-card">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          type="search"
          placeholder="Søk…"
          value={state.q}
          onChange={(e) => setState({ q: e.target.value || null })}
          className="w-full rounded-xl border border-foreground/15 bg-surface py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-accent/40"
        />
      </div>

      <div className="flex gap-2 text-sm">
        <select
          value={state.land}
          onChange={(e) => setState({ land: e.target.value || null })}
          className="min-w-0 flex-1 rounded-xl border border-foreground/15 bg-surface px-2 py-2 outline-none transition-colors focus:border-accent/40"
        >
          <option value="">Alle land</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={state.sort}
          onChange={(e) => setState({ sort: e.target.value as (typeof SORT_VALUES)[number] })}
          className="min-w-0 flex-1 rounded-xl border border-foreground/15 bg-surface px-2 py-2 outline-none transition-colors focus:border-accent/40"
        >
          {SORT_VALUES.map((v) => (
            <option key={v} value={v}>
              {SORT_LABELS[v]}
            </option>
          ))}
        </select>
      </div>

      {hasChips && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <AnimatePresence mode="popLayout">
            {state.q && (
              <FilterChip
                key="chip-q"
                label={`«${state.q}»`}
                onRemove={() => setState({ q: null })}
              />
            )}
            {state.land && (
              <FilterChip
                key="chip-land"
                label={state.land}
                onRemove={() => setState({ land: null })}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
