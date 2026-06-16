import type { Metadata } from "next";
import CatalogFilters from "@/components/CatalogFilters";
import ProductCard from "@/components/ProductCard";
import { listCategories, listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogo prodotti",
  description: "Catalogo dei prodotti stampati in 3D con ricerca, filtri, render 3D e richieste WhatsApp.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const products = listProducts({ query: params.q, category: params.category });
  const categories = listCategories();

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-3">
        <h1 className="text-4xl font-semibold text-zinc-950 dark:text-white">Catalogo prodotti</h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Cerca per titolo, descrizione o categoria. Apri una scheda per visualizzare il modello `.3mf` in 3D.
        </p>
      </div>
      <CatalogFilters categories={categories} query={params.q} category={params.category} />
      {products.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-lg p-8 text-center text-sm text-zinc-600 dark:text-zinc-300">
          Nessun prodotto corrisponde ai filtri selezionati.
        </div>
      )}
    </main>
  );
}
