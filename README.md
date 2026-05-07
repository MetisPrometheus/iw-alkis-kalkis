# alkis kalkis

Søkbar prisliste over Vinmonopolets sortiment, sortert etter pris per liter ren alkohol.

Live: <https://alkiskalkis.vercel.app>

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind v3
- Data: Vinmonopolet open data CSV → daily prebuild snapshot → static read
- URL state: nuqs
- Deploy: Vercel

## Lokal kjøring

```sh
npm install
npm run dev
```

`predev` kjører `scripts/fetch-products.ts` og oppretter `src/data/products.json` hvis den mangler. Live VMP-feed er bak Cloudflare; uten en gyldig kilde brukes det innebygde fixture-settet (~70 produkter).

## Live data

`scripts/fetch-products.ts` prøver:

1. `$VMP_DATA_URL` (override – sett denne til en CSV-mirror du har)
2. `https://www.vinmonopolet.no/medias/sys_master/products/products.csv`
3. `https://apps.vinmonopolet.no/products.csv`

Cloudflare-blokkering på direkte fetch er forventet. To realistiske produksjonsruter:

- **Vinmonopolet partner-API**: Registrer for `apis.vinmonopolet.no`, sett `VMP_DATA_URL` (eller utvid skriptet for `Ocp-Apim-Subscription-Key`).
- **Daglig refresh**: Vercel Cron Job → Deploy Hook for å trigge ny build hver natt. Skriptet kjører som `prebuild`.

## Mappestruktur

```
scripts/
  fetch-products.ts   CSV → JSON snapshot (kjører som prebuild + predev)
  fixture.ts          ~70 hardkodete produkter for offline/CF-blokkert kjøring
src/
  app/
    page.tsx                  forside med kategori-grid + deal-hero
    kategori/[slug]/page.tsx  kategori- og underkategori-side med 3 layouts
    produkt/[id]/page.tsx     enkeltprodukt
    sok/page.tsx              fritekstsøk
    om/page.tsx               hva er dette og hvordan regnes det
  components/
    CategoryGrid.tsx          klikkbare kategori-kort med expand
    Toolbar.tsx               URL-state filter, sort, layout-toggle (nuqs)
    ProductTable.tsx          tabellvisning
    ProductCardGrid.tsx       bilde-grid
    DealRadar.tsx             gamified leaderboard med score-bars
    DealCard.tsx              gjenbrukbart kompakt deal-kort
  lib/
    types.ts                  Product, ProductsMeta, kategori-slugs
    categories.ts             kategori-tre + VMP varetype-mapping
    derive.ts                 kr/l og kr/l ren alkohol
    products.ts               loadAll, filter, sort, getTopDeals (server-only)
    format.ts                 nb-NO formatering
  data/
    products.json             gitignorert – generert ved build
    products.meta.json        gitignorert – generert ved build
```

## Utregning

```
kr / l ren alkohol = pris ÷ (volum_liter × alkoholprosent ÷ 100)
```

Drikk med måte.
