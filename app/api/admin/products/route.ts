import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/products";
import { saveUpload } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const products = listProducts({
    query: url.searchParams.get("q") || undefined,
    category: url.searchParams.get("category") || undefined,
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const file = formData.get("file");

  if (!title) {
    return NextResponse.json({ error: "Inserisci un titolo prodotto" }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ error: "Inserisci una descrizione prodotto" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Carica un file .3mf" }, { status: 400 });
  }

  try {
    const saved = await saveUpload(file);
    const product = await createProduct({
      title,
      description,
      category,
      fileUrl: saved.urlPath,
      fileName: saved.fileName,
      fileType: saved.fileType,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload non riuscito" },
      { status: 400 },
    );
  }
}
