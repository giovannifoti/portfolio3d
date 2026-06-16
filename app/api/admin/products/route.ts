import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/products";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { saveImageUpload, saveModelUpload } from "@/lib/storage";
import { sanitizeText } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const productSchema = z.object({
  title: z.string().min(2).max(120),
  shortDescription: z.string().min(8).max(240),
  description: z.string().min(12).max(5000),
  category: z.string().max(80).optional(),
});

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const products = await listProducts({
    query: url.searchParams.get("q") || undefined,
    category: url.searchParams.get("category") || undefined,
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!rateLimit(`admin-products:${requestIp(request)}`, 12, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra poco." }, { status: 429 });
  }

  const formData = await request.formData();
  const parsed = productSchema.safeParse({
    title: sanitizeText(String(formData.get("title") || ""), 120),
    shortDescription: sanitizeText(String(formData.get("shortDescription") || ""), 240),
    description: sanitizeText(String(formData.get("description") || ""), 5000),
    category: sanitizeText(String(formData.get("category") || "Oggetti stampati in 3D"), 80),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Dati prodotto non validi" }, { status: 400 });
  }

  const file = formData.get("file");
  const coverImage = formData.get("coverImage");
  const galleryFiles = formData.getAll("galleryImages").filter((item): item is File => item instanceof File && item.size > 0);
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Carica un file .3mf" }, { status: 400 });
  }

  if (!(coverImage instanceof File)) {
    return NextResponse.json({ error: "La copertina non e' stata generata" }, { status: 400 });
  }

  try {
    const [savedModel, savedCover, savedGallery] = await Promise.all([
      saveModelUpload(file),
      saveImageUpload(coverImage, "covers"),
      Promise.all(galleryFiles.slice(0, 8).map((galleryFile) => saveImageUpload(galleryFile, "gallery"))),
    ]);

    const product = await createProduct({
      title: parsed.data.title,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      category: parsed.data.category,
      modelUrl: savedModel.url,
      modelFileName: savedModel.fileName,
      modelStoragePath: savedModel.storagePath,
      coverImageUrl: savedCover.url,
      coverImageStoragePath: savedCover.storagePath,
      galleryImages: savedGallery.map((image) => image.url),
      galleryStoragePaths: savedGallery.map((image) => image.storagePath),
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload non riuscito" },
      { status: 400 },
    );
  }
}
