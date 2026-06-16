"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

const pageSize = 9;

export default function CatalogClient({ products, categories }: { products: Product[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tutte");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return products
      .filter((product) => {
        const matchesQuery =
          !q ||
          product.title.toLowerCase().includes(q) ||
          product.shortDescription.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q);
        const matchesCategory = category === "Tutte" || product.category === category;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sort === "views") return b.views - a.views;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [category, products, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visiblePage = Math.min(page, totalPages);
  const pageProducts = filtered.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);

  function resetPage(action: () => void) {
    action();
    setPage(1);
  }

  return (
    <div className="grid gap-6">
      <div className="glass grid gap-3 rounded-lg p-3 lg:grid-cols-[1fr_220px_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => resetPage(() => setQuery(event.target.value))}
            placeholder="Cerca prodotti"
            className="focus-ring h-11 w-full rounded-lg border border-black/10 bg-white/80 pl-10 pr-3 text-sm text-zinc-950 dark:border-white/10 dark:bg-zinc-950/50 dark:text-white"
          />
        </label>
        <select
          value={category}
          onChange={(event) => resetPage(() => setCategory(event.target.value))}
          className="focus-ring h-11 rounded-lg border border-black/10 bg-white/80 px-3 text-sm text-zinc-950 dark:border-white/10 dark:bg-zinc-950/50 dark:text-white"
        >
          <option>Tutte</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => resetPage(() => setSort(event.target.value))}
          className="focus-ring h-11 rounded-lg border border-black/10 bg-white/80 px-3 text-sm text-zinc-950 dark:border-white/10 dark:bg-zinc-950/50 dark:text-white"
        >
          <option value="newest">Piu recenti</option>
          <option value="oldest">Meno recenti</option>
          <option value="title">Titolo</option>
          <option value="views">Piu visti</option>
        </select>
      </div>

      {pageProducts.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-lg p-8 text-center text-sm text-zinc-600 dark:text-zinc-300">
          Nessun prodotto corrisponde ai filtri selezionati.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-300">
        <span>
          {filtered.length} prodotti · pagina {visiblePage} di {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={visiblePage === 1}
            className="focus-ring h-10 rounded-lg border border-black/10 px-3 font-semibold disabled:opacity-40 dark:border-white/10"
          >
            Precedente
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={visiblePage === totalPages}
            className="focus-ring h-10 rounded-lg border border-black/10 px-3 font-semibold disabled:opacity-40 dark:border-white/10"
          >
            Successiva
          </button>
        </div>
      </div>
    </div>
  );
}
