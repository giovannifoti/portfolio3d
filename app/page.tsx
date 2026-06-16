import Link from "next/link";
import { ArrowRight, Box, Upload } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const products = listProducts().slice(0, 3);

  return (
    <main>
      <section className="border-b border-black/5 bg-zinc-100/70 dark:border-white/10 dark:bg-zinc-900/50">
        <div className="mx-auto grid min-h-[520px] w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_420px] lg:items-center lg:px-8">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-zinc-700 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-200">
              <Box className="h-4 w-4" aria-hidden="true" />
              Catalogo manuale per modelli `.3mf`
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
                Catalogo Stampa 3D
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-700 dark:text-zinc-200 sm:text-lg">
                Una web app semplice per caricare prodotti stampati in 3D con titolo, descrizione e file `.3mf`, mostrando il modello in un render 3D interattivo nella pagina prodotto.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Scopri i prodotti
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/admin"
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white/70 px-5 text-sm font-semibold text-zinc-950 backdrop-blur-xl transition hover:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:hover:bg-zinc-900"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Carica un modello
              </Link>
            </div>
          </div>
          <div className="grid aspect-square place-items-center rounded-lg border border-black/10 bg-white/70 shadow-soft dark:border-white/10 dark:bg-zinc-950/55">
            <div className="grid h-44 w-44 place-items-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Box className="h-20 w-20" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-3">
            <div className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-950">
              <Box className="h-4 w-4" aria-hidden="true" />
              Catalogo
            </div>
            <h2 className="text-3xl font-semibold text-zinc-950 dark:text-white">Prodotti in evidenza</h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Ogni prodotto viene gestito manualmente dall&apos;area admin e visualizzato con il file `.3mf` caricato.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-black/10 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950"
          >
            Vai al catalogo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-lg p-8 text-center text-sm text-zinc-600 dark:text-zinc-300">
            Nessun prodotto caricato. Accedi all&apos;area admin per aggiungere il primo file `.3mf`.
          </div>
        )}
      </section>
    </main>
  );
}
