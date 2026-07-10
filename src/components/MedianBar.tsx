import { percentVsMedian } from "@/lib/derive";
import { BarFill } from "@/components/motion";

/** Bar width in %: the category median sits at the 50 % mark. */
function barWidthPct(value: number, medianValue: number): number {
  if (!medianValue || medianValue <= 0) return 0;
  return Math.min(100, Math.max(5, (value / medianValue) * 50));
}

/**
 * Tiny data-viz: how a product's kr/l (alc) compares to the category median.
 * The center tick marks the median; the fill grows on reveal.
 */
export function MedianBar({
  value,
  medianValue,
  dotClass,
}: {
  value: number;
  medianValue: number;
  dotClass: string;
}) {
  if (!medianValue || medianValue <= 0) return null;
  const pct = percentVsMedian(value, medianValue);
  const label =
    pct === 0 ? "på snittet" : `${Math.abs(pct)} % ${pct < 0 ? "under" : "over"} snittet`;
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[0.08]">
        <BarFill pct={barWidthPct(value, medianValue)} className={`h-full rounded-full ${dotClass}`} />
        <span className="absolute inset-y-0 left-1/2 w-px bg-foreground/25" aria-hidden />
      </div>
      <span className="shrink-0 text-[10px] tabular-nums text-foreground/50">{label}</span>
    </div>
  );
}
