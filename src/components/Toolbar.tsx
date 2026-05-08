"use client";
import { useQueryStates, parseAsString, parseAsStringEnum, parseAsInteger } from "nuqs";

const SORT_VALUES = [
  "ppra",
  "ppra-desc",
  "pris",
  "pris-desc",
  "abv",
  "abv-desc",
  "volum-desc",
  "navn",
] as const;

const LAYOUT_VALUES = ["grid", "table", "deals"] as const;

const SORT_LABELS: Record<(typeof SORT_VALUES)[number], string> = {
  ppra: "Best deal (kr/l ren) ↑",
  "ppra-desc": "Verste deal (kr/l ren) ↓",
  pris: "Pris ↑",
  "pris-desc": "Pris ↓",
  abv: "Alkohol % ↑",
  "abv-desc": "Alkohol % ↓",
  "volum-desc": "Volum ↓",
  navn: "Navn A-Å",
};

const LAYOUT_LABELS: Record<(typeof LAYOUT_VALUES)[number], { label: string; emoji: string }> = {
  table: { label: "Tabell", emoji: "📊" },
  grid: { label: "Bilder", emoji: "🖼️" },
  deals: { label: "Deal-radar", emoji: "🎯" },
};

export function Toolbar({ countries }: { countries: string[] }) {
  const [state, setStateRaw] = useQueryStates(
    {
      sort: parseAsStringEnum([...SORT_VALUES]).withDefault("ppra"),
      layout: parseAsStringEnum([...LAYOUT_VALUES]).withDefault("grid"),
      land: parseAsString.withDefault(""),
      minAbv: parseAsInteger,
      maxAbv: parseAsInteger,
      minPris: parseAsInteger,
      maxPris: parseAsInteger,
      q: parseAsString.withDefault(""),
      page: parseAsInteger,
    },
    { shallow: false },
  );

  // Reset page=1 whenever a filter/sort/layout-changing patch is applied so we
  // don't end up on an empty page after narrowing the result set.
  type Patch = Parameters<typeof setStateRaw>[0];
  const setState = (patch: Patch) => {
    const filterKeys = ["sort", "land", "minAbv", "maxAbv", "minPris", "maxPris", "q"] as const;
    const touchesFilter = filterKeys.some((k) => k in (patch as Record<string, unknown>));
    return setStateRaw(touchesFilter ? { ...patch, page: null } : patch);
  };

  return (
    <div className="space-y-3 rounded-xl border border-foreground/10 bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-foreground/10 bg-surface-2 p-0.5">
          {LAYOUT_VALUES.map((v) => {
            const active = state.layout === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setState({ layout: v })}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:text-foreground"
                }`}
                aria-pressed={active}
              >
                <span aria-hidden>{LAYOUT_LABELS[v].emoji}</span>
                <span>{LAYOUT_LABELS[v].label}</span>
              </button>
            );
          })}
        </div>

        <label className="ml-auto flex items-center gap-2 text-xs text-foreground/60">
          <span>Sortér</span>
          <select
            value={state.sort}
            onChange={(e) => setState({ sort: e.target.value as (typeof SORT_VALUES)[number] })}
            className="rounded-md border border-foreground/15 bg-surface px-2 py-1 text-xs"
          >
            {SORT_VALUES.map((v) => (
              <option key={v} value={v}>
                {SORT_LABELS[v]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <input
          type="search"
          placeholder="Søk i denne kategorien…"
          value={state.q}
          onChange={(e) => setState({ q: e.target.value || null })}
          className="min-w-[12ch] flex-1 rounded-md border border-foreground/15 bg-surface px-2 py-1.5"
        />

        {countries.length > 0 && (
          <select
            value={state.land}
            onChange={(e) => setState({ land: e.target.value || null })}
            className="rounded-md border border-foreground/15 bg-surface px-2 py-1.5"
          >
            <option value="">Alle land</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <RangeInput
          label="Pris"
          unit="kr"
          minValue={state.minPris}
          maxValue={state.maxPris}
          onChange={(min, max) => setState({ minPris: min, maxPris: max })}
        />
        <RangeInput
          label="Alk %"
          unit="%"
          minValue={state.minAbv}
          maxValue={state.maxAbv}
          onChange={(min, max) => setState({ minAbv: min, maxAbv: max })}
        />

        {(state.q || state.land || state.minAbv != null || state.maxAbv != null || state.minPris != null || state.maxPris != null) && (
          <button
            type="button"
            onClick={() =>
              setState({
                q: null,
                land: null,
                minAbv: null,
                maxAbv: null,
                minPris: null,
                maxPris: null,
              })
            }
            className="rounded-md border border-foreground/15 px-2 py-1.5 text-foreground/60 hover:bg-surface-2"
          >
            Nullstill filter
          </button>
        )}
      </div>
    </div>
  );
}

function RangeInput({
  label,
  unit,
  minValue,
  maxValue,
  onChange,
}: {
  label: string;
  unit: string;
  minValue: number | null;
  maxValue: number | null;
  onChange: (min: number | null, max: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-foreground/15 bg-surface px-2 py-1">
      <span className="text-foreground/50">{label}</span>
      <input
        type="number"
        placeholder="min"
        value={minValue ?? ""}
        onChange={(e) => {
          const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
          onChange(Number.isFinite(v) ? v : null, maxValue);
        }}
        className="w-14 bg-transparent text-right outline-none"
      />
      <span className="text-foreground/30">–</span>
      <input
        type="number"
        placeholder="max"
        value={maxValue ?? ""}
        onChange={(e) => {
          const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
          onChange(minValue, Number.isFinite(v) ? v : null);
        }}
        className="w-14 bg-transparent text-right outline-none"
      />
      <span className="text-foreground/40">{unit}</span>
    </div>
  );
}
