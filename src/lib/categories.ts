import type { MainCategorySlug, SubCategorySlug } from "./types";

/** Icon key rendered by CategoryIcon in src/components/icons.tsx. */
export type CategoryIkon = "beer" | "wine" | "spirits" | "cider" | "drop";

/**
 * Pastel tint classes per category. Literal Tailwind class strings so the
 * content scanner picks them up; the underlying colors live in globals.css.
 */
export interface CategoryTint {
  /** Solid pastel surface — image plinths, icon squares. */
  bg: string;
  /** Softer wash for whole-card backgrounds. */
  bgSoft: string;
  /** Matching ink tone for icons/text on the pastel. */
  text: string;
  /** Small solid dot marker. */
  dot: string;
}

export interface CategoryNode {
  slug: MainCategorySlug;
  navn: string;
  ikon: CategoryIkon;
  beskrivelse: string;
  tint: CategoryTint;
  underkategorier: SubCategoryNode[];
}

export interface SubCategoryNode {
  slug: SubCategorySlug;
  navn: string;
}

export const KATEGORI_TRE: CategoryNode[] = [
  {
    slug: "ol",
    navn: "Øl",
    ikon: "beer",
    beskrivelse: "Pils, IPA, stout og resten",
    tint: {
      bg: "bg-tint-ol",
      bgSoft: "bg-tint-ol/45",
      text: "text-tone-ol",
      dot: "bg-tone-ol",
    },
    underkategorier: [
      { slug: "lager", navn: "Lager / Pils" },
      { slug: "ipa", navn: "IPA" },
      { slug: "ale", navn: "Ale" },
      { slug: "stout", navn: "Stout / Porter" },
      { slug: "hveteol", navn: "Hveteøl" },
      { slug: "annet-ol", navn: "Annet øl" },
    ],
  },
  {
    slug: "vin",
    navn: "Vin",
    ikon: "wine",
    beskrivelse: "Rødt, hvitt, rosé, bobler",
    tint: {
      bg: "bg-tint-vin",
      bgSoft: "bg-tint-vin/45",
      text: "text-tone-vin",
      dot: "bg-tone-vin",
    },
    underkategorier: [
      { slug: "rodvin", navn: "Rødvin" },
      { slug: "hvitvin", navn: "Hvitvin" },
      { slug: "rosevin", navn: "Rosévin" },
      { slug: "musserende", navn: "Musserende" },
      { slug: "sterkvin", navn: "Sterkvin" },
      { slug: "dessertvin", navn: "Dessertvin" },
      { slug: "fruktvin", navn: "Fruktvin" },
    ],
  },
  {
    slug: "brennevin",
    navn: "Brennevin",
    ikon: "spirits",
    beskrivelse: "Gin, whisky, vodka, akevitt",
    tint: {
      bg: "bg-tint-brennevin",
      bgSoft: "bg-tint-brennevin/45",
      text: "text-tone-brennevin",
      dot: "bg-tone-brennevin",
    },
    underkategorier: [
      { slug: "gin", navn: "Gin" },
      { slug: "vodka", navn: "Vodka" },
      { slug: "whisky", navn: "Whisky" },
      { slug: "rom", navn: "Rom" },
      { slug: "akevitt", navn: "Akevitt" },
      { slug: "cognac", navn: "Cognac & Brandy" },
      { slug: "likor", navn: "Likør" },
      { slug: "tequila", navn: "Tequila & Mezcal" },
      { slug: "annet-brennevin", navn: "Annet brennevin" },
    ],
  },
  {
    slug: "sider",
    navn: "Sider & Mjød",
    ikon: "cider",
    beskrivelse: "Eple, pære, bjørk",
    tint: {
      bg: "bg-tint-sider",
      bgSoft: "bg-tint-sider/45",
      text: "text-tone-sider",
      dot: "bg-tone-sider",
    },
    underkategorier: [
      { slug: "sider-tor", navn: "Tørr sider" },
      { slug: "sider-sot", navn: "Søt sider" },
    ],
  },
  {
    slug: "annet",
    navn: "Alkoholfritt",
    ikon: "drop",
    beskrivelse: "Null promille, samme stil",
    tint: {
      bg: "bg-tint-annet",
      bgSoft: "bg-tint-annet/45",
      text: "text-tone-annet",
      dot: "bg-tone-annet",
    },
    underkategorier: [
      { slug: "alkoholfritt", navn: "Alkoholfritt" },
    ],
  },
];

const SUB_BY_SLUG = new Map<SubCategorySlug, { sub: SubCategoryNode; main: CategoryNode }>();
const MAIN_BY_SLUG = new Map<MainCategorySlug, CategoryNode>();

for (const main of KATEGORI_TRE) {
  MAIN_BY_SLUG.set(main.slug, main);
  for (const sub of main.underkategorier) {
    SUB_BY_SLUG.set(sub.slug, { sub, main });
  }
}

export function getMainCategory(slug: string): CategoryNode | null {
  return MAIN_BY_SLUG.get(slug as MainCategorySlug) ?? null;
}

export function getSubCategory(
  slug: string,
): { sub: SubCategoryNode; main: CategoryNode } | null {
  return SUB_BY_SLUG.get(slug as SubCategorySlug) ?? null;
}

export function classifyVmpVaretype(
  hovedkategori: string,
  underkategori: string,
): { hoved: MainCategorySlug; under: SubCategorySlug } {
  const h = hovedkategori.toLowerCase();
  const u = underkategori.toLowerCase();

  // Alkoholfritt must be checked first — its name contains "ol" (alk-OL-fritt)
  // which would otherwise match the beer check below.
  if (h.includes("alkoholfri") || h.includes("alkoholfritt")) return { hoved: "annet", under: "alkoholfritt" };

  if (h.includes("øl") || h === "ol" || h.startsWith("ol ")) {
    // VMP labels IPAs as "India pale ale" — has no "ipa" substring, so check
    // both forms. IPA must come *before* the generic ale check.
    if (u.includes("ipa") || u.includes("india pale")) return { hoved: "ol", under: "ipa" };
    if (u.includes("stout") || u.includes("porter")) return { hoved: "ol", under: "stout" };
    if (u.includes("hvete") || u.includes("weiss") || u.includes("wit")) return { hoved: "ol", under: "hveteol" };
    if (u.includes("ale")) return { hoved: "ol", under: "ale" };
    if (u.includes("lager") || u.includes("pils") || u.includes("pilsner")) return { hoved: "ol", under: "lager" };
    return { hoved: "ol", under: "annet-ol" };
  }

  // VMP "Delvis avalkoholisert vin" (partially de-alcoholized, ~7-8%) is its
  // own main category. These are not alkoholfri — they're low-ABV wines —
  // and should land in the appropriate colour bucket via the sub-category.
  if (h.includes("avalkoholisert") || h.includes("av.alk")) {
    if (u.includes("rødvin") || u.includes("rod")) return { hoved: "vin", under: "rodvin" };
    if (u.includes("hvitvin") || u.includes("hvit")) return { hoved: "vin", under: "hvitvin" };
    if (u.includes("rosé") || u.includes("rose")) return { hoved: "vin", under: "rosevin" };
    return { hoved: "vin", under: "rodvin" };
  }

  if (h.includes("rødvin") || h.includes("rodvin")) return { hoved: "vin", under: "rodvin" };
  if (h.includes("hvitvin")) return { hoved: "vin", under: "hvitvin" };
  if (h.includes("rosé") || h.includes("rosevin")) return { hoved: "vin", under: "rosevin" };
  // Perlende vin (lightly sparkling) groups with musserende — same drinking
  // occasion, same shelf neighbours.
  if (h.includes("musserende") || h.includes("perlende") || h.includes("champagne") || h.includes("cava") || h.includes("prosecco")) return { hoved: "vin", under: "musserende" };
  // Aromatisert vin (vermouth, etc.) sits with the fortified bucket.
  if (h.includes("sterkvin") || h.includes("aromatisert") || h.includes("sherry") || h.includes("portvin") || h.includes("madeira")) return { hoved: "vin", under: "sterkvin" };
  if (h.includes("dessertvin")) return { hoved: "vin", under: "dessertvin" };
  if (h.includes("fruktvin") || h.includes("mjød") || h.includes("sake") || h.includes("met")) return { hoved: "vin", under: "fruktvin" };

  if (h.includes("brennevin") || h.includes("sprit")) {
    if (u.includes("gin")) return { hoved: "brennevin", under: "gin" };
    if (u.includes("vodka")) return { hoved: "brennevin", under: "vodka" };
    if (u.includes("whisky") || u.includes("whiskey") || u.includes("bourbon")) return { hoved: "brennevin", under: "whisky" };
    if (u.includes("rom")) return { hoved: "brennevin", under: "rom" };
    if (u.includes("akevitt") || u.includes("aquavit")) return { hoved: "brennevin", under: "akevitt" };
    // Druebrennevin = grape brandy (cognac/armagnac/grappa family).
    if (u.includes("cognac") || u.includes("brandy") || u.includes("armagnac") || u.includes("druebrennevin")) return { hoved: "brennevin", under: "cognac" };
    if (u.includes("likør") || u.includes("liqueur")) return { hoved: "brennevin", under: "likor" };
    if (u.includes("tequila") || u.includes("mezcal")) return { hoved: "brennevin", under: "tequila" };
    return { hoved: "brennevin", under: "annet-brennevin" };
  }

  if (h.includes("sider") || h.includes("cider")) {
    if (u.includes("søt") || u.includes("sweet")) return { hoved: "sider", under: "sider-sot" };
    return { hoved: "sider", under: "sider-tor" };
  }

  return { hoved: "annet", under: "alkoholfritt" };
}
