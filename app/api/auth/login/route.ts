import { NextResponse } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { rateLimit, requestIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!rateLimit(`login:${requestIp(request)}`, 12, 60_000)) {
    return NextResponse.json({ error: "Troppi tentativi. Riprova tra poco." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !verifyPassword(body.password)) {
    return NextResponse.json({ error: "Password non valida" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response);
  return response;
}
