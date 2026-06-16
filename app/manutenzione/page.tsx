import Link from "next/link";
import { Wrench } from "lucide-react";

export const metadata = {
  title: "Manutenzione",
  description: "Pagina temporanea di manutenzione del catalogo.",
};

export default function MaintenancePage() {
  return (
    <main className="mx-auto grid min-h-[62vh] w-full max-w-3xl place-items-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="grid gap-6">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <Wrench className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold text-zinc-950 dark:text-white">Sito in manutenzione</h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Il catalogo tornera&apos; disponibile a breve.
          </p>
        </div>
        <Link
          href="/"
          className="focus-ring mx-auto inline-flex h-11 items-center justify-center rounded-lg border border-black/10 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950"
        >
          Vai alla home
        </Link>
      </div>
    </main>
  );
}
