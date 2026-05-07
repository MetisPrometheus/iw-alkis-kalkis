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
