"use client";
import { useQueryStates, parseAsString, parseAsStringEnum, parseAsInteger } from "nuqs";

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

  return (
    <div className="space-y-2 rounded-xl border border-foreground/10 bg-surface p-3">
      <input
        type="search"
        placeholder="Søk…"
        value={state.q}
        onChange={(e) => setState({ q: e.target.value || null })}
        className="w-full rounded-md border border-foreground/15 bg-surface px-3 py-2 text-sm"
      />

      <div className="flex gap-2 text-sm">
        <select
          value={state.land}
          onChange={(e) => setState({ land: e.target.value || null })}
          className="min-w-0 flex-1 rounded-md border border-foreground/15 bg-surface px-2 py-2"
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
          className="min-w-0 flex-1 rounded-md border border-foreground/15 bg-surface px-2 py-2"
        >
          {SORT_VALUES.map((v) => (
            <option key={v} value={v}>
              {SORT_LABELS[v]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
