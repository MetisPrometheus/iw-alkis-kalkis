/**
 * Maps Vinmonopolet vmpws v2 API JSON records → our Product schema. Field
 * names are best-effort — VMP has historically returned several shapes
 * across versions. Anything missing falls back gracefully.
 */
import { classifyVmpVaretype } from "../src/lib/categories";
import { prisPerLiter, prisPerLiterRenAlkohol } from "../src/lib/derive";
import type { Product } from "../src/lib/types";

type Raw = Record<string, unknown>;

function asStr(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function asNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(",", ".").replace(/[^\d.\-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function pickStr(obj: Raw, ...keys: string[]): string | null {
  for (const k of keys) {
    const direct = asStr(obj[k]);
    if (direct) return direct;
    const nested = obj[k];
    if (nested && typeof nested === "object") {
      const inner = pickStr(nested as Raw, "name", "value", "formattedValue");
      if (inner) return inner;
    }
  }
  return null;
}

function pickNum(obj: Raw, ...keys: string[]): number {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = asNum(v);
      if (n) return n;
    }
    if (v && typeof v === "object") {
      const nested = v as Raw;
      const candidate = nested.value ?? nested.formattedValue;
      const n = asNum(candidate);
      if (n) return n;
    }
  }
  return 0;
}

function pickArrayStrings(obj: Raw, key: string): string[] {
  const v = obj[key];
  if (!Array.isArray(v)) return [];
  return v
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        const e = entry as Raw;
        return asStr(e.name) ?? asStr(e.value) ?? null;
      }
      return null;
    })
    .filter((s): s is string => Boolean(s));
}

export function mapVmpRecord(raw: Raw): Product | null {
  const id = pickStr(raw, "code", "varenummer", "id");
  const navn = pickStr(raw, "name", "varenavn", "title");
  if (!id || !navn) return null;

  // VMP returns volume in centiliters as a raw number (e.g. 75 for 0.75 l, 300
  // for 3 l). Our schema stores liters, so divide by 100. We also round to 3
  // decimals to drop float-point junk like 27.500000000000004.
  const volumeRaw = pickNum(raw, "volume", "volum");
  const volumLiter = volumeRaw > 0 ? Math.round((volumeRaw / 100) * 1000) / 1000 : 0;
  const pris = pickNum(raw, "price", "pris");
  const alkoholProsent = pickNum(raw, "alcohol", "alkohol", "alcoholPercentage");
  if (!volumLiter || !pris) return null;

  const hovedNavn = pickStr(raw, "main_category", "hovedkategori") ?? "";
  const underNavn = pickStr(raw, "main_sub_category", "underkategori") ?? "";
  const cls = classifyVmpVaretype(hovedNavn, underNavn);

  const land = pickStr(raw, "main_country", "land");
  const distrikt = pickStr(raw, "district", "distrikt");
  const produsent = pickStr(raw, "main_producer", "producer", "produsent");
  const argangStr = pickStr(raw, "year", "vintage", "argang", "Årgang");
  const argang = argangStr ? parseInt(argangStr, 10) || null : null;

  const raastoffJoined = pickArrayStrings(raw, "raw_material").join(", ") || null;
  const raastoff = pickStr(raw, "raw_material") ?? raastoffJoined;

  const passerTil = pickArrayStrings(raw, "main_pairing");

  // Image URLs. VMP v2 returns an `images` array with multiple sizes.
  let bildeUrl: string | null = null;
  const images = raw.images;
  if (Array.isArray(images) && images.length > 0) {
    const candidate = images.find((i) => {
      if (!i || typeof i !== "object") return false;
      const im = i as Raw;
      return im.format === "product" || im.format === "cartIcon" || im.format === "zoom";
    }) as Raw | undefined;
    bildeUrl = pickStr(candidate ?? (images[0] as Raw), "url");
    if (bildeUrl && bildeUrl.startsWith("/")) {
      bildeUrl = `https://bilder.vinmonopolet.no${bildeUrl}`;
    }
  }
  if (!bildeUrl) {
    bildeUrl = `https://bilder.vinmonopolet.no/cache/300x300-0/${id}-1.jpg`;
  }

  const urlSlug = pickStr(raw, "url");
  const vmpUrl = urlSlug
    ? urlSlug.startsWith("http")
      ? urlSlug
      : `https://www.vinmonopolet.no${urlSlug}`
    : `https://www.vinmonopolet.no/p/${id}`;

  return {
    id,
    navn,
    volumLiter,
    pris,
    alkoholProsent,
    hovedkategori: cls.hoved,
    underkategori: cls.under,
    land,
    distrikt,
    produsent,
    argang,
    bildeUrl,
    vmpUrl,
    smaknotater: pickStr(raw, "taste", "smak", "smaknotater"),
    lukt: pickStr(raw, "smell", "lukt"),
    farge: pickStr(raw, "color", "farge"),
    passerTil,
    raastoff,
    prisPerLiter: prisPerLiter(pris, volumLiter),
    prisPerLiterRenAlkohol: prisPerLiterRenAlkohol(pris, volumLiter, alkoholProsent),
  };
}

export function mapAll(records: Raw[]): Product[] {
  const out: Product[] = [];
  for (const r of records) {
    const p = mapVmpRecord(r);
    if (p) out.push(p);
  }
  return out;
}
