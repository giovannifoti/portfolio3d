import "server-only";

import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { removePublicFile } from "@/lib/storage";
import type { Product, ProductInput } from "@/types/product";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  long_description: string;
  print_file_path: string;
  print_file_name: string;
  print_file_type: "3mf";
  views: number;
  created_at: string;
  updated_at: string;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    description: row.long_description || row.short_description,
    printFilePath: row.print_file_path,
    printFileName: row.print_file_name,
    printFileType: row.print_file_type,
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function uniqueSlug(title: string, currentId?: string) {
  const db = getDb();
  const base = slugify(title) || "prodotto";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const row = db
      .prepare("SELECT id FROM products WHERE slug = ? AND id != ?")
      .get(candidate, currentId || "") as { id: string } | undefined;
    if (!row) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export function listProducts(filters?: { query?: string; category?: string }) {
  const db = getDb();
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters?.query) {
    clauses.push("(title LIKE ? OR short_description LIKE ? OR long_description LIKE ?)");
    const query = `%${filters.query}%`;
    params.push(query, query, query);
  }

  if (filters?.category && filters.category !== "Tutte") {
    clauses.push("category = ?");
    params.push(filters.category);
  }

  clauses.push("print_file_type = '3mf'");
  const where = `WHERE ${clauses.join(" AND ")}`;
  const rows = db.prepare(`SELECT * FROM products ${where} ORDER BY created_at DESC`).all(...params) as ProductRow[];
  return rows.map(mapProduct);
}

export function getProductById(id: string) {
  const row = getDb().prepare("SELECT * FROM products WHERE id = ? AND print_file_type = '3mf'").get(id) as ProductRow | undefined;
  return row ? mapProduct(row) : undefined;
}

export function getProductBySlug(slug: string) {
  const row = getDb().prepare("SELECT * FROM products WHERE slug = ? AND print_file_type = '3mf'").get(slug) as ProductRow | undefined;
  return row ? mapProduct(row) : undefined;
}

export function listCategories() {
  const rows = getDb().prepare("SELECT DISTINCT category FROM products ORDER BY category ASC").all() as Array<{ category: string }>;
  return rows.map((row) => row.category);
}

export async function createProduct(input: ProductInput) {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const slug = uniqueSlug(input.title);

  db.prepare(
    `INSERT INTO products (
      id, title, slug, category, print_file_path, print_file_name, print_file_type,
      short_description, long_description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.title,
    slug,
    input.category || "Oggetti stampati in 3D",
    input.fileUrl,
    input.fileName,
    input.fileType,
    input.description,
    input.description,
    now,
    now,
  );

  return getProductById(id);
}

export function updateProduct(id: string, values: { title: string; category: string; description: string }) {
  const existing = getProductById(id);
  if (!existing) return undefined;
  const slug = existing.title === values.title ? existing.slug : uniqueSlug(values.title, id);
  const updatedAt = new Date().toISOString();

  getDb()
    .prepare("UPDATE products SET title = ?, slug = ?, category = ?, short_description = ?, long_description = ?, updated_at = ? WHERE id = ?")
    .run(values.title, slug, values.category, values.description, values.description, updatedAt, id);

  return getProductById(id);
}

export function incrementViews(id: string) {
  getDb().prepare("UPDATE products SET views = views + 1 WHERE id = ?").run(id);
}

export async function deleteProduct(id: string) {
  const product = getProductById(id);
  if (!product) return false;

  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
  await removePublicFile(product.printFilePath);
  return true;
}
