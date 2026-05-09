import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "alkis kalkis — finn billigste promille på Polet";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <NuqsAdapter>
          <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-baseline gap-2 font-semibold tracking-tight">
                <span className="text-xl">alkis kalkis</span>
                <span className="text-xs text-foreground/50">finn promille</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/sok" className="hover:text-foreground/100 text-foreground/70">Søk</Link>
                <Link href="/om" className="hover:text-foreground/100 text-foreground/70">Om</Link>
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
