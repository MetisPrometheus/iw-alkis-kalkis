const NOK = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const NOK_DECIMAL = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const NUMBER = new Intl.NumberFormat("nb-NO", {
  maximumFractionDigits: 1,
});

export function formatPris(value: number): string {
  return NOK.format(value);
}

export function formatPrisDecimal(value: number): string {
  return NOK_DECIMAL.format(value);
}

export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

export function formatVolum(liter: number): string {
  if (liter < 1) return `${Math.round(liter * 100)} cl`;
  return `${formatNumber(liter)} l`;
}

export function formatAbv(prosent: number): string {
  return `${formatNumber(prosent)} %`;
}

export function formatPpra(value: number): string {
  return formatPris(Math.round(value)) + " / l alc";
}
