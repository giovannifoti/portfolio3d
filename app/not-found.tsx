import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[62vh] w-full max-w-3xl place-items-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="grid gap-6">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <SearchX className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold text-zinc-950 dark:text-white">Pagina non trovata</h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Il prodotto o la pagina richiesta non e&apos; disponibile.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="focus-ring mx-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Torna al catalogo
        </Link>
      </div>
    </main>
  );
}
