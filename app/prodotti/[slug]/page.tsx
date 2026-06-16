import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import ThreeModelViewer from "@/components/ThreeModelViewerClient";
import ViewTracker from "@/components/ViewTracker";
import { getProductBySlug } from "@/lib/products";
import { siteUrl, whatsappUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      url: `${siteUrl()}/prodotti/${product.slug}`,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <ViewTracker productId={product.id} />
      <Link
        href="/catalogo"
        className="focus-ring inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Torna al catalogo
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-4">
          <ThreeModelViewer fileUrl={product.printFilePath} />
          <div className="grid gap-3 rounded-lg border border-black/10 bg-white/70 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-300 sm:grid-cols-3">
            <span>File: 3MF</span>
            <span>Categoria: {product.category}</span>
            <span>Visualizzazioni: {product.views}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">{product.category}</div>
            <h1 className="text-4xl font-semibold leading-tight text-zinc-950 dark:text-white">{product.title}</h1>
            <p className="whitespace-pre-line text-base leading-8 text-zinc-700 dark:text-zinc-200">{product.description}</p>
            <a
              href={whatsappUrl(product.title)}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Richiedi informazioni su WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
