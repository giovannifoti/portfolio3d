import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "portfolio_admin";
const MAX_AGE = 60 * 60 * 8;

function secret() {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function verifyPassword(password: string) {
  const configured = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "admin");
  if (!configured) return false;
  const left = Buffer.from(password);
  const right = Buffer.from(configured);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function createSessionValue() {
  const payload = JSON.stringify({
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function isValidSession(value?: string) {
  if (!value) return false;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature || sign(encoded) !== signature) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return payload.role === "admin" && Number(payload.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidSession(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  return null;
}

export function setSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
