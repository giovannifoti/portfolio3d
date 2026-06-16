import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Box, Grid3X3, LockKeyhole } from "lucide-react";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import { siteUrl } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Catalogo Stampa 3D",
    template: "%s | Catalogo Stampa 3D",
  },
  description: "Portfolio moderno e minimalista per prodotti stampati in 3D con schede manuali e render 3D interattivi.",
  openGraph: {
    title: "Catalogo Stampa 3D",
    description: "Prodotti stampati in 3D presentati con schede manuali e render 3D interattivi.",
    url: siteUrl(),
    siteName: "Catalogo Stampa 3D",
    locale: "it_IT",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-black/5 bg-white/72 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
            <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-950 dark:text-white">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  <Box className="h-4 w-4" aria-hidden="true" />
                </span>
                3D Catalog
              </Link>
              <div className="flex items-center gap-1">
                <Link
                  href="/catalogo"
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-900/5 dark:text-zinc-200 dark:hover:bg-white/10"
                >
                  <Grid3X3 className="h-4 w-4" aria-hidden="true" />
                  Catalogo
                </Link>
                <Link
                  href="/admin"
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-900/5 dark:text-zinc-200 dark:hover:bg-white/10"
                >
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  Admin
                </Link>
                <ThemeToggle />
              </div>
            </nav>
          </header>
          {children}
          <footer className="border-t border-black/5 py-8 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <span>Catalogo professionale per prodotti stampati in 3D.</span>
              <span>Render 3D interattivi e schede prodotto manuali.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
