import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import ProductShare from "@/components/ProductShare";
import ThreeModelViewer from "@/components/ThreeModelViewerClient";
import ViewTracker from "@/components/ViewTracker";
import { getProductBySlug, listProducts } from "@/lib/products";
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
    description: product.shortDescription,
    alternates: {
      canonical: `/prodotti/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      url: `${siteUrl()}/prodotti/${product.slug}`,
      type: "website",
      images: product.coverImageUrl ? [{ url: product.coverImageUrl, alt: product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription,
      images: product.coverImageUrl ? [product.coverImageUrl] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = (await listProducts({ category: product.category }))
    .filter((item) => item.id !== product.id)
    .slice(0, 3);
  const productUrl = `${siteUrl()}/prodotti/${product.slug}`;
  const galleryImages = [product.coverImageUrl, ...product.galleryImages].filter(Boolean);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    category: product.category,
    image: galleryImages,
    url: productUrl,
  };

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <ViewTracker productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Link
        href="/catalogo"
        className="focus-ring inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Torna al catalogo
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-4">
          <ThreeModelViewer fileUrl={product.modelUrl} />
          <div className="grid gap-3 rounded-lg border border-black/10 bg-white/70 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-300 sm:grid-cols-3">
            <span>File: {product.modelFileName}</span>
            <span>Categoria: {product.category}</span>
            <span>Visualizzazioni: {product.views}</span>
          </div>
          <ProductGallery images={galleryImages} title={product.title} />
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400">{product.category}</div>
            <h1 className="text-4xl font-semibold leading-tight text-zinc-950 dark:text-white">{product.title}</h1>
            <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-200">{product.shortDescription}</p>
            <p className="whitespace-pre-line text-base leading-8 text-zinc-700 dark:text-zinc-200">{product.description}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl(product.title)}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
              <ProductShare url={productUrl} />
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="grid gap-5 border-t border-black/5 pt-10 dark:border-white/10">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-zinc-950 dark:text-white">Prodotti correlati</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Altri articoli nella stessa categoria.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
