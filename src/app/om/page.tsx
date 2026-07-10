import Link from "next/link";
import { getProductsMeta } from "@/lib/products";

export const metadata = {
  title: "Om · alkis kalkis",
  description: "Hva er alkis kalkis, hvor kommer dataene fra, hvordan regnes pris per liter ren alkohol?",
};

export default function AboutPage() {
  const meta = getProductsMeta();
  return (
    <article className="prose prose-invert mx-auto max-w-2xl space-y-6 text-foreground">
      <h1 className="text-fluid-title font-bold">Om alkis kalkis</h1>
      <p className="text-foreground/80">
        En søkbar prisliste over Vinmonopolets sortiment, sortert etter <strong>pris per liter ren alkohol</strong>.
      </p>

      <h2 className="text-fluid-section font-semibold">Hvordan regnes det?</h2>
      <pre className="overflow-x-auto rounded-2xl border border-foreground/10 bg-surface-2 p-4 font-mono text-sm tabular-nums shadow-card">
        kr / l ren = pris ÷ (volum_liter × alkoholprosent ÷ 100)
      </pre>
      <p className="text-foreground/80">
        En 0,7-liters whisky til 500 kr med 40 % alk gir: 500 / (0,7 × 0,40) = ca. 1786 kr/l ren.
        Sammenlign det med en 0,5-liter pils til 40 kr og 4,7 % alk: 40 / (0,5 × 0,047) = ca. 1702 kr/l ren.
        Pilsen vinner, knepent.
      </p>

      <h2 className="text-fluid-section font-semibold">Datakilde</h2>
      <p className="text-foreground/80">
        Data hentes daglig fra{" "}
        <a className="underline" href="https://www.vinmonopolet.no/datadeling" target="_blank" rel="noreferrer">
          Vinmonopolets åpne datasett
        </a>
        . Sist oppdatert: <code>{meta.generatedAt}</code> (kilde: <code>{meta.source}</code>, {meta.count} produkter).
      </p>
      {meta.notes.length > 0 && (
        <ul className="list-disc space-y-1 pl-6 text-sm text-foreground/70">
          {meta.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}

      <h2 className="text-fluid-section font-semibold">Drikk med måte</h2>
      <p className="text-foreground/80">
        Dette nettstedet er en pris-sammenligning, ikke en oppfordring til å bli full billig.
        Ring <a className="underline" href="tel:80031245">Hjelpelinjen 800 31 245</a> hvis alkohol skaper problemer.
      </p>

      <p className="pt-4">
        <Link href="/" className="tappable inline-block text-accent hover:underline">← Tilbake</Link>
      </p>
    </article>
  );
}
