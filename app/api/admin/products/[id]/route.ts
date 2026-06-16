import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct, getProductById, updateProduct } from "@/lib/products";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  shortDescription: z.string().min(8).max(240),
  description: z.string().min(1),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!rateLimit(`admin-product-update:${requestIp(request)}`, 40, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra poco." }, { status: 429 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  const parsed = updateSchema.safeParse(
    body
      ? {
          title: sanitizeText(String(body.title || ""), 120),
          category: sanitizeText(String(body.category || ""), 80),
          shortDescription: sanitizeText(String(body.shortDescription || ""), 240),
          description: sanitizeText(String(body.description || ""), 5000),
        }
      : null,
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati prodotto non validi" }, { status: 400 });
  }

  const product = await updateProduct(id, parsed.data);
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
