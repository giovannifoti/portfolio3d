import Link from "next/link";
import { Box, MessageCircle } from "lucide-react";
import type { Product } from "@/types/product";
import { whatsappUrl } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-black/10 bg-white/78 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-zinc-900/72">
      <Link href={`/prodotti/${product.slug}`} className="block">
        <div className="grid aspect-[4/3] place-items-center bg-zinc-100 transition group-hover:bg-zinc-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
          <div className="grid h-20 w-20 place-items-center rounded-lg bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white">
            <Box className="h-9 w-9" aria-hidden="true" />
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{product.category}</div>
          <Link href={`/prodotti/${product.slug}`} className="block text-lg font-semibold text-zinc-950 dark:text-white">
            {product.title}
          </Link>
          <p className="line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{product.description}</p>
        </div>
        <a
          href={whatsappUrl(product.title)}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </article>
  );
}
