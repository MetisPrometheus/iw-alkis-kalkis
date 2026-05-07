// Hand-crafted fixture for bootstrap. Real prices from public reference points
// circa late-2025; values may drift. Replaced on first successful live fetch.
import type { Product } from "../src/lib/types";
import { prisPerLiter, prisPerLiterRenAlkohol } from "../src/lib/derive";

type Seed = Omit<Product, "prisPerLiter" | "prisPerLiterRenAlkohol" | "vmpUrl" | "bildeUrl">;

const seeds: Seed[] = [
  // === ØL — LAGER ===
  s("0085101", "Aass Klassisk", 0.5, 39.9, 4.5, "ol", "lager", "Norge", "Aass Bryggeri", null, "Klassisk norsk lager"),
  s("0089001", "Hansa Pilsner", 0.5, 36.9, 4.7, "ol", "lager", "Norge", "Hansa Borg", null, "Friskt pilsmaltete"),
  s("0086901", "Ringnes Pils", 0.5, 36.9, 4.7, "ol", "lager", "Norge", "Ringnes", null, "Norges mest solgte øl"),
  s("0084401", "Frydenlund Pilsner", 0.5, 36.9, 4.7, "ol", "lager", "Norge", "Ringnes", null, "Pilstype med tørr finish"),
  s("0079801", "Carlsberg", 0.5, 38.9, 5.0, "ol", "lager", "Danmark", "Carlsberg", null, null),
  s("0082501", "Heineken", 0.5, 41.9, 5.0, "ol", "lager", "Nederland", "Heineken", null, null),
  s("0082502", "Tuborg Grøn", 0.5, 38.9, 4.6, "ol", "lager", "Danmark", "Tuborg", null, null),
  s("0089101", "Aass Bayer", 0.5, 39.9, 4.5, "ol", "lager", "Norge", "Aass Bryggeri", null, "Mørk lager"),

  // === ØL — IPA ===
  s("1305602", "Lervig Lucky Jack", 0.33, 47.9, 4.7, "ol", "ipa", "Norge", "Lervig Aktiebryggeri", null, "Tropisk session IPA"),
  s("1300101", "Nøgne Ø IPA", 0.5, 65.9, 6.5, "ol", "ipa", "Norge", "Nøgne Ø", null, "Norges første moderne IPA"),
  s("1305610", "Cloudwater DIPA", 0.44, 109.9, 8.0, "ol", "ipa", "Storbritannia", "Cloudwater", null, "Saftig DIPA"),
  s("1305620", "BrewDog Punk IPA", 0.33, 44.9, 5.4, "ol", "ipa", "Storbritannia", "BrewDog", null, "Tropisk og bitter"),
  s("1305630", "Amundsen Ipa Lover", 0.33, 49.9, 6.8, "ol", "ipa", "Norge", "Amundsen", null, "NEIPA"),

  // === ØL — STOUT ===
  s("1305640", "Guinness Draught", 0.44, 49.9, 4.2, "ol", "stout", "Irland", "Guinness", null, "Klassisk irsk dry stout"),
  s("1305650", "Nøgne Ø Imperial Stout", 0.5, 79.9, 9.0, "ol", "stout", "Norge", "Nøgne Ø", null, "Tjæremørk imperial"),

  // === ØL — ALE ===
  s("1305660", "Newcastle Brown Ale", 0.55, 47.9, 4.7, "ol", "ale", "Storbritannia", "Heineken UK", null, "Mørk klassiker"),
  s("1305670", "Sierra Nevada Pale Ale", 0.355, 49.9, 5.6, "ol", "ale", "USA", "Sierra Nevada", null, "Pioneer pale ale"),

  // === ØL — HVETE ===
  s("1305680", "Erdinger Weissbier", 0.5, 51.9, 5.3, "ol", "hveteol", "Tyskland", "Erdinger", null, "Banan og nellik"),
  s("1305690", "Hoegaarden", 0.33, 38.9, 4.9, "ol", "hveteol", "Belgia", "Hoegaarden", null, "Belgisk witbier"),

  // === RØDVIN ===
  s("0192401", "Cono Sur Bicicleta Cabernet Sauvignon", 0.75, 119.9, 13.0, "vin", "rodvin", "Chile", "Cono Sur", 2023, "Mørk frukt, godt drikkeklart"),
  s("0481901", "Salentein Reserve Malbec", 0.75, 169.9, 14.0, "vin", "rodvin", "Argentina", "Bodegas Salentein", 2022, "Saftig og krydret"),
  s("1052301", "Masi Campofiorin", 0.75, 199.9, 13.0, "vin", "rodvin", "Italia", "Masi Agricola", 2021, "Italiensk klassiker"),
  s("0192501", "Catena Malbec", 0.75, 199.9, 13.5, "vin", "rodvin", "Argentina", "Catena Zapata", 2022, "Mørk bær og krydder"),
  s("0481902", "Pago de los Capellanes Crianza", 0.75, 269.9, 14.0, "vin", "rodvin", "Spania", "Pago de los Capellanes", 2020, "Tempranillo med kraft"),
  s("0192601", "Penfolds Bin 8", 0.75, 249.9, 14.5, "vin", "rodvin", "Australia", "Penfolds", 2021, "Cabernet/Shiraz"),
  s("0481910", "Tabalí Reserva Pinot Noir", 0.75, 149.9, 13.5, "vin", "rodvin", "Chile", "Viña Tabalí", 2022, "Lett og frisk pinot"),
  s("0481920", "Château Talbot", 0.75, 749.9, 13.5, "vin", "rodvin", "Frankrike", "Château Talbot", 2018, "Saint-Julien grand cru"),

  // === HVITVIN ===
  s("0480101", "Villa Maria Sauvignon Blanc", 0.75, 159.9, 13.0, "vin", "hvitvin", "New Zealand", "Villa Maria", 2023, "Sprudlende NZ-klassiker"),
  s("0480102", "Cloudy Bay Sauvignon Blanc", 0.75, 269.9, 13.5, "vin", "hvitvin", "New Zealand", "Cloudy Bay", 2023, "Stjerne fra Marlborough"),
  s("0480103", "Riesling Trimbach", 0.75, 199.9, 12.5, "vin", "hvitvin", "Frankrike", "Trimbach", 2022, "Tørr alsace-riesling"),
  s("0480104", "Wakefield Chardonnay", 0.75, 149.9, 13.5, "vin", "hvitvin", "Australia", "Wakefield Wines", 2022, "Smørmykt og fruktig"),
  s("0480105", "Pieropan Soave Classico", 0.75, 169.9, 12.0, "vin", "hvitvin", "Italia", "Pieropan", 2022, null),

  // === ROSÉ ===
  s("0480201", "Whispering Angel", 0.75, 199.9, 13.0, "vin", "rosevin", "Frankrike", "Château d'Esclans", 2023, "Provence-rosé"),
  s("0480202", "Mateus Rosé", 0.75, 109.9, 11.0, "vin", "rosevin", "Portugal", "Mateus", null, "Lett perlende"),

  // === MUSSERENDE ===
  s("0480301", "Mionetto Prosecco", 0.75, 139.9, 11.0, "vin", "musserende", "Italia", "Mionetto", null, "Italiensk klassiker"),
  s("0480302", "Cava Codorníu Brut", 0.75, 119.9, 11.5, "vin", "musserende", "Spania", "Codorníu", null, "Tørr cava"),
  s("0480303", "Moët & Chandon Brut Impérial", 0.75, 549.9, 12.0, "vin", "musserende", "Frankrike", "Moët & Chandon", null, "Champagne-klassiker"),
  s("0480304", "Veuve Clicquot Brut", 0.75, 599.9, 12.0, "vin", "musserende", "Frankrike", "Veuve Clicquot", null, "Gult etikett"),

  // === STERKVIN ===
  s("0480401", "Sandeman Ruby Port", 0.75, 199.9, 19.5, "vin", "sterkvin", "Portugal", "Sandeman", null, "Klassisk ruby"),
  s("0480402", "Tio Pepe Fino Sherry", 0.75, 149.9, 15.0, "vin", "sterkvin", "Spania", "González Byass", null, "Bonetørr fino"),

  // === GIN ===
  s("0420101", "Hendrick's Gin", 0.7, 519.9, 41.4, "brennevin", "gin", "Storbritannia", "William Grant & Sons", null, "Agurk og rose"),
  s("0420102", "Tanqueray London Dry", 0.7, 449.9, 47.3, "brennevin", "gin", "Storbritannia", "Tanqueray", null, "Klassisk london dry"),
  s("0420103", "Bombay Sapphire", 0.7, 419.9, 40.0, "brennevin", "gin", "Storbritannia", "Bombay Spirits", null, "Friskt og blomstrete"),
  s("0420104", "Monkey 47 Schwarzwald Dry", 0.5, 689.9, 47.0, "brennevin", "gin", "Tyskland", "Black Forest Distillers", null, "47 botanikk"),
  s("0420105", "Bareksten Botanical Gin", 0.5, 569.9, 46.0, "brennevin", "gin", "Norge", "Oss Craft Distillery", null, "Norsk vill gin"),
  s("0420106", "Gordon's London Dry", 0.7, 339.9, 37.5, "brennevin", "gin", "Storbritannia", "Gordon's", null, "Rimelig klassiker"),

  // === VODKA ===
  s("0420201", "Absolut", 0.7, 369.9, 40.0, "brennevin", "vodka", "Sverige", "Absolut Company", null, "Hvete-vodka"),
  s("0420202", "Smirnoff No. 21", 0.7, 339.9, 37.5, "brennevin", "vodka", "Russland", "Smirnoff", null, "Tre ganger destillert"),
  s("0420203", "Belvedere", 0.7, 539.9, 40.0, "brennevin", "vodka", "Polen", "Belvedere", null, "Polsk rugvodka"),
  s("0420204", "Vikingfjord", 0.7, 319.9, 37.5, "brennevin", "vodka", "Norge", "Arcus", null, "Norsk vodka"),
  s("0420205", "Grey Goose", 0.7, 599.9, 40.0, "brennevin", "vodka", "Frankrike", "Grey Goose", null, "Fransk premium"),

  // === WHISKY ===
  s("0410101", "Jack Daniel's Old No. 7", 0.7, 469.9, 40.0, "brennevin", "whisky", "USA", "Jack Daniel's", null, "Tennessee whiskey"),
  s("0410102", "Highland Park 12 år", 0.7, 619.9, 40.0, "brennevin", "whisky", "Storbritannia", "Highland Park", null, "Orkney single malt"),
  s("0410103", "Lagavulin 16 år", 0.7, 1099.9, 43.0, "brennevin", "whisky", "Storbritannia", "Lagavulin", null, "Kraftig torvet Islay"),
  s("0410104", "Glenfiddich 12 år", 0.7, 569.9, 40.0, "brennevin", "whisky", "Storbritannia", "Glenfiddich", null, "Speyside single malt"),
  s("0410105", "Jameson Irish", 0.7, 449.9, 40.0, "brennevin", "whisky", "Irland", "Jameson", null, "Trippeldestillert"),
  s("0410106", "Aberlour 12 år Double Cask", 0.7, 649.9, 40.0, "brennevin", "whisky", "Storbritannia", "Aberlour", null, "Sherry-finish"),

  // === ROM ===
  s("0410201", "Bacardi Carta Blanca", 0.7, 379.9, 37.5, "brennevin", "rom", "Puerto Rico", "Bacardi", null, "Hvit rom"),
  s("0410202", "Captain Morgan Spiced Gold", 0.7, 379.9, 35.0, "brennevin", "rom", "Jamaica", "Captain Morgan", null, "Krydret"),
  s("0410203", "Diplomático Reserva Exclusiva", 0.7, 769.9, 40.0, "brennevin", "rom", "Venezuela", "Diplomático", null, "Søt premium"),

  // === AKEVITT ===
  s("0410301", "Linie Aquavit", 0.7, 449.9, 41.5, "brennevin", "akevitt", "Norge", "Arcus", null, "Bruner over ekvator"),
  s("0410302", "Gammel Opland", 0.7, 449.9, 41.5, "brennevin", "akevitt", "Norge", "Arcus", null, "Karve og dill"),
  s("0410303", "Løiten Linie", 0.7, 449.9, 41.5, "brennevin", "akevitt", "Norge", "Arcus", null, "Mild fatlagret"),

  // === COGNAC ===
  s("0410401", "Hennessy VS", 0.7, 569.9, 40.0, "brennevin", "cognac", "Frankrike", "Hennessy", null, "Klassisk VS"),
  s("0410402", "Rémy Martin VSOP", 0.7, 729.9, 40.0, "brennevin", "cognac", "Frankrike", "Rémy Martin", null, "Mild og rund"),

  // === LIKØR ===
  s("0410501", "Baileys Original", 0.7, 369.9, 17.0, "brennevin", "likor", "Irland", "Baileys", null, "Whisky og krem"),
  s("0410502", "Jägermeister", 0.7, 419.9, 35.0, "brennevin", "likor", "Tyskland", "Mast-Jägermeister", null, "56 urter"),

  // === TEQUILA ===
  s("0410601", "Olmeca Blanco", 0.7, 419.9, 38.0, "brennevin", "tequila", "Mexico", "Olmeca", null, "Ung tequila"),

  // === SIDER ===
  s("1305711", "Somersby Apple", 0.5, 39.9, 4.5, "sider", "sider-sot", "Danmark", "Carlsberg", null, "Søt eple"),
  s("1305712", "Berentsens Eplesider Tørr", 0.5, 49.9, 6.5, "sider", "sider-tor", "Norge", "Berentsens Brygghus", null, "Tørr norsk sider"),
];

function s(
  id: string,
  navn: string,
  volumLiter: number,
  pris: number,
  alkoholProsent: number,
  hovedkategori: Product["hovedkategori"],
  underkategori: Product["underkategori"],
  land: string | null,
  produsent: string | null,
  argang: number | null,
  smaknotater: string | null,
): Seed {
  return {
    id,
    navn,
    volumLiter,
    pris,
    alkoholProsent,
    hovedkategori,
    underkategori,
    land,
    distrikt: null,
    produsent,
    argang,
    smaknotater,
    lukt: null,
    farge: null,
    passerTil: [],
    raastoff: null,
  };
}

export function buildFixture(): Product[] {
  return seeds.map((seed) => ({
    ...seed,
    bildeUrl: `https://bilder.vinmonopolet.no/cache/300x300-0/${seed.id}-1.jpg`,
    vmpUrl: `https://www.vinmonopolet.no/p/${seed.id}`,
    prisPerLiter: prisPerLiter(seed.pris, seed.volumLiter),
    prisPerLiterRenAlkohol: prisPerLiterRenAlkohol(
      seed.pris,
      seed.volumLiter,
      seed.alkoholProsent,
    ),
  }));
}
