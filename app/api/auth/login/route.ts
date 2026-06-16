import { NextResponse } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !verifyPassword(body.password)) {
    return NextResponse.json({ error: "Password non valida" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response);
  return response;
}
