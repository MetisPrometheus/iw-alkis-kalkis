import type { Metadata, Viewport } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SearchIcon } from "@/components/icons";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const SITE_TITLE = "alkis kalkis · finn billigste promille på Polet";
const SITE_DESC =
  "Sammenlign Vinmonopolets utvalg etter pris per liter ren alkohol. Best deal-radar, kategoriknappene og mer.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    type: "website",
    locale: "nb_NO",
    siteName: "alkis kalkis",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb">
      <body className={`${geistSans.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-background font-sans text-foreground`}>
        <NuqsAdapter>
          <header className="sticky top-0 z-30 border-b border-foreground/10 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6">
              <Link href="/" className="tappable flex shrink-0 items-baseline gap-2 tracking-tight">
                <span className="text-xl font-semibold">
                  alkis <span className="text-accent">kalkis</span>
                </span>
                <span className="whitespace-nowrap text-xs text-foreground/50">finn promille</span>
              </Link>
              <form action="/sok" className="relative min-w-0 flex-1 sm:max-w-xs sm:ml-auto">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                <input
                  type="search"
                  name="q"
                  placeholder="Søk…"
                  aria-label="Søk"
                  className="w-full rounded-full border border-foreground/10 bg-white/70 py-1.5 pl-9 pr-3 text-sm shadow-card outline-none transition-colors placeholder:text-foreground/40 focus:border-accent/40 focus:bg-white"
                />
              </form>
              <nav className="flex shrink-0 items-center gap-4 text-sm">
                <Link href="/sok" className="tappable text-foreground/70 hover:text-foreground">Søk</Link>
                <Link href="/om" className="tappable text-foreground/70 hover:text-foreground">Om</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">{children}</main>
          <footer className="mx-auto mt-16 max-w-6xl border-t border-foreground/10 px-4 py-8 text-xs text-foreground/50">
            <p>
              Data hentet fra <a className="underline" href="https://www.vinmonopolet.no/datadeling" target="_blank" rel="noreferrer">Vinmonopolets åpne data</a>.
              Priser kan endres. Drikk med måte.
            </p>
          </footer>
        </NuqsAdapter>
      </body>
    </html>
  );
}
