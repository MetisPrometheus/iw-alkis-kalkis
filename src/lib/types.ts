export type MainCategorySlug =
  | "ol"
  | "vin"
  | "brennevin"
  | "sider"
  | "annet";

export type SubCategorySlug =
  | "rodvin"
  | "hvitvin"
  | "rosevin"
  | "musserende"
  | "sterkvin"
  | "dessertvin"
  | "fruktvin"
  | "gin"
  | "vodka"
  | "whisky"
  | "rom"
  | "akevitt"
  | "cognac"
  | "likor"
  | "tequila"
  | "annet-brennevin"
  | "lager"
  | "ale"
  | "stout"
  | "ipa"
  | "hveteol"
  | "annet-ol"
  | "sider-tor"
  | "sider-sot"
  | "alkoholfritt";

export interface Product {
  id: string;
  navn: string;
  volumLiter: number;
  pris: number;
  alkoholProsent: number;
  hovedkategori: MainCategorySlug;
  underkategori: SubCategorySlug;
  land: string | null;
  distrikt: string | null;
  produsent: string | null;
  argang: number | null;
  bildeUrl: string | null;
  vmpUrl: string;
  smaknotater: string | null;
  lukt: string | null;
  farge: string | null;
  passerTil: string[];
  raastoff: string | null;
  prisPerLiter: number;
  prisPerLiterRenAlkohol: number;
}

export interface ProductsMeta {
  generatedAt: string;
  source: "vmp-live" | "fixture" | "cached";
  count: number;
  notes: string[];
}
