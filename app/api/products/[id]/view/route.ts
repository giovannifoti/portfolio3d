import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await incrementViews(id);
  return NextResponse.json({ ok: true });
}
