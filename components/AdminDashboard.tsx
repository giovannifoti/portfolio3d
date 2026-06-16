"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import { Box, Eye, LogOut, Pencil, Trash2, Upload } from "lucide-react";
import type { Product } from "@/types/product";
import { formatDate } from "@/lib/utils";

type Status = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

export default function AdminDashboard({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState(initialProducts);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const stats = useMemo(() => {
    const views = products.reduce((sum, product) => sum + product.views, 0);
    const categories = new Set(products.map((product) => product.category)).size;
    return { products: products.length, views, categories };
  }, [products]);

  async function uploadProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus({ type: "error", message: "Seleziona un file .3mf." });
      return;
    }

    setStatus({ type: "loading", message: "Caricamento prodotto..." });
    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("category", category);
    formData.set("file", file);

    const response = await fetch("/api/admin/products", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json().catch(() => ({}))) as { product?: Product; error?: string };

    if (!response.ok || !payload.product) {
      setStatus({ type: "error", message: payload.error || "Upload non riuscito." });
      return;
    }

    setProducts((current) => [payload.product!, ...current]);
    setTitle("");
    setDescription("");
    setCategory("");
    if (fileRef.current) fileRef.current.value = "";
    setStatus({ type: "success", message: "Prodotto pubblicato nel catalogo." });
    router.refresh();
  }

  async function saveProduct(product: Product, formData: FormData) {
    setStatus({ type: "loading", message: "Salvataggio modifiche..." });
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") || product.title).trim(),
        category: String(formData.get("category") || product.category).trim(),
        description: String(formData.get("description") || product.description).trim(),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { product?: Product; error?: string };
    if (!response.ok || !payload.product) {
      setStatus({ type: "error", message: payload.error || "Salvataggio non riuscito." });
      return;
    }

    setProducts((current) => current.map((item) => (item.id === product.id ? payload.product! : item)));
    setStatus({ type: "success", message: "Prodotto aggiornato." });
    router.refresh();
  }

  async function remove(product: Product) {
    const confirmed = window.confirm(`Eliminare "${product.title}" dal catalogo?`);
    if (!confirmed) return;

    setStatus({ type: "loading", message: "Eliminazione prodotto..." });
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus({ type: "error", message: "Eliminazione non riuscita." });
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    setStatus({ type: "success", message: "Prodotto eliminato." });
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-zinc-950 dark:text-white">Gestione prodotti</h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Inserisci manualmente titolo e descrizione, carica il file `.3mf` e il sito mostra il modello in 3D nella scheda prodotto.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Esci
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Prodotti", stats.products],
          ["Visualizzazioni", stats.views],
          ["Categorie", stats.categories],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-lg p-5">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">{value}</div>
          </div>
        ))}
      </div>

      <form onSubmit={uploadProduct} className="glass grid gap-5 rounded-lg p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Titolo prodotto
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="focus-ring h-11 rounded-lg border border-black/10 bg-white/85 px-3 text-zinc-950 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Categoria
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Opzionale"
              className="focus-ring h-11 rounded-lg border border-black/10 bg-white/85 px-3 text-zinc-950 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Descrizione
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="focus-ring rounded-lg border border-black/10 bg-white/85 px-3 py-3 text-zinc-950 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
            required
          />
        </label>
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            File modello `.3mf`
            <input
              ref={fileRef}
              type="file"
              accept=".3mf"
              className="focus-ring h-11 rounded-lg border border-black/10 bg-white/85 px-3 py-2 text-sm text-zinc-950 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:file:bg-white dark:file:text-zinc-950"
              required
            />
          </label>
          <button
            type="submit"
            disabled={status.type === "loading"}
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Pubblica
          </button>
        </div>
      </form>

      {status.message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            status.type === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              : status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-zinc-200 bg-white text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <div className="grid gap-4">
        {products.map((product) => (
          <article key={product.id} className="rounded-lg border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/72">
            <div className="grid gap-4 lg:grid-cols-[72px_1fr_auto] lg:items-start">
              <div className="grid aspect-square place-items-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                <Box className="h-7 w-7" aria-hidden="true" />
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveProduct(product, new FormData(event.currentTarget));
                }}
                className="grid gap-3"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    Titolo
                    <input
                      name="title"
                      defaultValue={product.title}
                      className="focus-ring h-10 rounded-lg border border-black/10 bg-white px-3 text-sm text-zinc-950 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    Categoria
                    <input
                      name="category"
                      defaultValue={product.category}
                      className="focus-ring h-10 rounded-lg border border-black/10 bg-white px-3 text-sm text-zinc-950 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                    />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  Descrizione
                  <textarea
                    name="description"
                    defaultValue={product.description}
                    rows={3}
                    className="focus-ring rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  />
                </label>
                <div className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {product.printFileName} · 3MF · {formatDate(product.createdAt)} · {product.views} viste
                </div>
                <button className="focus-ring inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Salva
                </button>
              </form>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link
                  href={`/prodotti/${product.slug}`}
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Apri
                </Link>
                <button
                  type="button"
                  onClick={() => remove(product)}
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white dark:border-red-500/30 dark:text-red-300"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Elimina
                </button>
              </div>
            </div>
          </article>
        ))}

        {!products.length ? (
          <div className="glass rounded-lg p-8 text-center text-sm text-zinc-600 dark:text-zinc-300">
            Nessun prodotto presente. Carica il primo modello `.3mf` per popolare il catalogo.
          </div>
        ) : null}
      </div>
    </div>
  );
}
