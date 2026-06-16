import { Search } from "lucide-react";

export default function CatalogFilters({
  categories,
  query,
  category,
}: {
  categories: string[];
  query?: string;
  category?: string;
}) {
  return (
    <form className="glass grid gap-3 rounded-lg p-3 sm:grid-cols-[1fr_220px_auto]" action="/catalogo">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Cerca prodotti"
          className="focus-ring h-11 w-full rounded-lg border border-black/10 bg-white/80 pl-10 pr-3 text-sm text-zinc-950 dark:border-white/10 dark:bg-zinc-950/50 dark:text-white"
        />
      </label>
      <select
        name="category"
        defaultValue={category || "Tutte"}
        className="focus-ring h-11 rounded-lg border border-black/10 bg-white/80 px-3 text-sm text-zinc-950 dark:border-white/10 dark:bg-zinc-950/50 dark:text-white"
      >
        <option>Tutte</option>
        {categories.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <button className="focus-ring h-11 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
        Filtra
      </button>
    </form>
  );
}
