import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const allowedExtensions = new Set([".3mf"]);

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

export async function saveUpload(file: File) {
  const originalName = file.name || "model.3mf";
  const extension = path.extname(originalName).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error("Sono supportati solo file .3mf");
  }

  const uploadDir = configuredPath("UPLOAD_DIR", "public/uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const safeBase = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
  const filename = `${Date.now()}-${crypto.randomUUID()}-${safeBase || "model"}${extension}`;
  const diskPath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(diskPath, buffer);

  return {
    diskPath,
    urlPath: toPublicUrl(diskPath),
    fileName: originalName,
    fileSize: buffer.length,
    fileType: "3mf" as const,
  };
}

export async function removePublicFile(urlPath?: string) {
  if (!urlPath) return;
  try {
    await fs.unlink(resolvePublicPath(urlPath));
  } catch {
    // File may already be gone; deletion should not fail the product operation.
  }
}
