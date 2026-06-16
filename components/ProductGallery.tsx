"use client";

import { X } from "lucide-react";
import { useState } from "react";

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!images.length) return null;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className="focus-ring overflow-hidden rounded-lg border border-black/10 bg-zinc-100 text-left transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-zinc-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={`${title} - immagine ${index + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </button>
        ))}
      </div>

      {activeImage ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/82 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="focus-ring absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-lg bg-white text-zinc-950"
            aria-label="Chiudi galleria"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeImage} alt={title} className="max-h-[86vh] max-w-[92vw] rounded-lg object-contain" />
        </div>
      ) : null}
    </>
  );
}
