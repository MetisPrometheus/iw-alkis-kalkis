export function prisPerLiter(pris: number, volumLiter: number): number {
  if (!pris || !volumLiter || volumLiter <= 0) return 0;
  return pris / volumLiter;
}

export function prisPerLiterRenAlkohol(
  pris: number,
  volumLiter: number,
  alkoholProsent: number,
): number {
  if (!pris || !volumLiter || !alkoholProsent) return 0;
  if (volumLiter <= 0 || alkoholProsent <= 0) return 0;
  return pris / (volumLiter * (alkoholProsent / 100));
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Signed percent deviation from a median: -34 means "34 % under snittet",
 * +12 means "12 % over snittet". Returns 0 when the median is unusable.
 */
export function percentVsMedian(value: number, medianValue: number): number {
  if (!medianValue || medianValue <= 0) return 0;
  return Math.round(((value - medianValue) / medianValue) * 100);
}
