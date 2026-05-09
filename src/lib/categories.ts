import type { MainCategorySlug, SubCategorySlug } from "./types";

export interface CategoryNode {
  slug: MainCategorySlug;
  navn: string;
  emoji: string;
  beskrivelse: string;
  bgClass: string;
  underkategorier: SubCategoryNode[];
}

export interface SubCategoryNode {
  slug: SubCategorySlug;
  navn: string;
  emoji: string;
}

export const KATEGORI_TRE: CategoryNode[] = [
  {
    slug: "ol",
    navn: "Øl",
    emoji: "🍺",
    beskrivelse: "Pils, IPA, stout og resten",
    bgClass: "from-amber-500/20 to-yellow-600/10",
    underkategorier: [
      { slug: "lager", navn: "Lager / Pils", emoji: "🍻" },
      { slug: "ipa", navn: "IPA", emoji: "🌿" },
      { slug: "ale", navn: "Ale", emoji: "🍺" },
      { slug: "stout", navn: "Stout / Porter", emoji: "🖤" },
      { slug: "hveteol", navn: "Hveteøl", emoji: "🌾" },
      { slug: "annet-ol", navn: "Annet øl", emoji: "🍶" },
    ],
  },
  {
    slug: "vin",
    navn: "Vin",
    emoji: "🍷",
    beskrivelse: "Rødt, hvitt, rosé, bobler",
    bgClass: "from-rose-700/20 to-purple-700/10",
    underkategorier: [
      { slug: "rodvin", navn: "Rødvin", emoji: "🍷" },
      { slug: "hvitvin", navn: "Hvitvin", emoji: "🥂" },
      { slug: "rosevin", navn: "Rosévin", emoji: "🌸" },
      { slug: "musserende", navn: "Musserende", emoji: "🍾" },
      { slug: "sterkvin", navn: "Sterkvin", emoji: "🍯" },
      { slug: "dessertvin", navn: "Dessertvin", emoji: "🍮" },
      { slug: "fruktvin", navn: "Fruktvin", emoji: "🍓" },
    ],
  },
  {
    slug: "brennevin",
    navn: "Brennevin",
    emoji: "🥃",
    beskrivelse: "Gin, whisky, vodka, akevitt",
    bgClass: "from-emerald-700/20 to-teal-700/10",
    underkategorier: [
      { slug: "gin", navn: "Gin", emoji: "🌲" },
      { slug: "vodka", navn: "Vodka", emoji: "❄️" },
      { slug: "whisky", navn: "Whisky", emoji: "🥃" },
      { slug: "rom", navn: "Rom", emoji: "🏝️" },
      { slug: "akevitt", navn: "Akevitt", emoji: "🇳🇴" },
      { slug: "cognac", navn: "Cognac & Brandy", emoji: "🍂" },
      { slug: "likor", navn: "Likør", emoji: "🍫" },
      { slug: "tequila", navn: "Tequila & Mezcal", emoji: "🌵" },
      { slug: "annet-brennevin", navn: "Annet brennevin", emoji: "🍶" },
    ],
  },
  {
    slug: "sider",
    navn: "Sider & Mjød",
    emoji: "🍏",
    beskrivelse: "Eple, pære, bjørk",
    bgClass: "from-lime-600/20 to-green-700/10",
    underkategorier: [
      { slug: "sider-tor", navn: "Tørr sider", emoji: "🍏" },
      { slug: "sider-sot", navn: "Søt sider", emoji: "🍎" },
    ],
  },
  {
    slug: "annet",
    navn: "Alkoholfritt",
    emoji: "💧",
    beskrivelse: "Null promille, samme stil",
    bgClass: "from-sky-600/20 to-blue-700/10",
    underkategorier: [
      { slug: "alkoholfritt", navn: "Alkoholfritt", emoji: "💧" },
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
