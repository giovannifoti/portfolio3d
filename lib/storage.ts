import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin, isSupabaseConfigured, supabaseBucket } from "@/lib/supabase";
import type { StoredFile } from "@/types/product";

const maxModelBytes = Number(process.env.MAX_MODEL_UPLOAD_MB || 40) * 1024 * 1024;
const maxImageBytes = Number(process.env.MAX_IMAGE_UPLOAD_MB || 8) * 1024 * 1024;
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function publicRoot() {
  return path.join(process.cwd(), "public");
}

export function resolvePublicPath(urlPath: string) {
  return path.join(publicRoot(), urlPath.replace(/^\//, ""));
}

function configuredPath(envName: string, fallback: string) {
  const configured = process.env[envName] || fallback;
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

function toPublicUrl(filePath: string) {
  const relative = path.relative(publicRoot(), filePath).split(path.sep).join("/");
  return `/${relative}`;
}

function safeName(originalName: string, fallback: string) {
  const extension = path.extname(originalName || fallback).toLowerCase();
  const safeBase = path
    .basename(originalName || fallback, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 58);

  return `${Date.now()}-${crypto.randomUUID()}-${safeBase || "file"}${extension}`;
}

async function storeFile(file: File, folder: string, fallbackName: string): Promise<StoredFile> {
  const fileName = safeName(file.name, fallbackName);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const storagePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from(supabaseBucket()).upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(supabaseBucket()).getPublicUrl(storagePath);
    return {
      url: data.publicUrl,
      storagePath,
      fileName: file.name || fallbackName,
      fileSize: buffer.length,
    };
  }

  const uploadDir = configuredPath("UPLOAD_DIR", `public/uploads/${folder}`);
  await fs.mkdir(uploadDir, { recursive: true });
  const diskPath = path.join(uploadDir, fileName);
  await fs.writeFile(diskPath, buffer);

  return {
    url: toPublicUrl(diskPath),
    storagePath: toPublicUrl(diskPath),
    fileName: file.name || fallbackName,
    fileSize: buffer.length,
  };
}

export async function saveModelUpload(file: File) {
  const extension = path.extname(file.name || "model.3mf").toLowerCase();
  if (extension !== ".3mf") {
    throw new Error("Sono supportati solo file .3mf");
  }

  if (file.size > maxModelBytes) {
    throw new Error(`Il file .3mf supera il limite di ${Math.round(maxModelBytes / 1024 / 1024)} MB`);
  }

  return storeFile(file, "models", "model.3mf");
}

export async function saveImageUpload(file: File, folder = "images") {
  const extension = path.extname(file.name || "image.webp").toLowerCase();
  if (!imageExtensions.has(extension)) {
    throw new Error("Sono supportate solo immagini .jpg, .png e .webp");
  }

  if (file.size > maxImageBytes) {
    throw new Error(`L'immagine supera il limite di ${Math.round(maxImageBytes / 1024 / 1024)} MB`);
  }

  return storeFile(file, folder, "image.webp");
}

export async function removeStoredFile(storagePath?: string) {
  if (!storagePath) return;

  if (isSupabaseConfigured() && !storagePath.startsWith("/")) {
    await getSupabaseAdmin().storage.from(supabaseBucket()).remove([storagePath]);
    return;
  }

  try {
    await fs.unlink(resolvePublicPath(storagePath));
  } catch {
    // File may already be gone; deletion should not fail the product operation.
  }
}
