import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct, getProductById, updateProduct } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati prodotto non validi" }, { status: 400 });
  }

  const product = updateProduct(id, parsed.data);
  if (!product) return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const deleted = await deleteProduct(id);
  if (!deleted) return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
