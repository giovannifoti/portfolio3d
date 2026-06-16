import "server-only";

import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { removeStoredFile } from "@/lib/storage";
import { parseJsonArray, slugify } from "@/lib/utils";
import type { Product, ProductFilters, ProductInput } from "@/types/product";

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
  model_storage_path?: string;
  cover_image_path?: string;
  cover_storage_path?: string;
  gallery_images?: string;
  gallery_storage_paths?: string;
  views: number;
  created_at: string;
  updated_at: string;
};

type SupabaseProductRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  long_description: string;
  model_url: string;
  model_file_name: string;
  model_file_type: "3mf";
  model_storage_path: string | null;
  cover_image_url: string;
  cover_storage_path: string | null;
  gallery_images: string[] | null;
  gallery_storage_paths: string[] | null;
  views: number;
  created_at: string;
  updated_at: string;
};

function mapLocalProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    shortDescription: row.short_description,
    description: row.long_description || row.short_description,
    modelUrl: row.print_file_path,
    modelFileName: row.print_file_name,
    modelFileType: "3mf",
    modelStoragePath: row.model_storage_path || row.print_file_path,
    coverImageUrl: row.cover_image_path || "",
    coverImageStoragePath: row.cover_storage_path || "",
    galleryImages: parseJsonArray(row.gallery_images),
    galleryStoragePaths: parseJsonArray(row.gallery_storage_paths),
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSupabaseProduct(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    shortDescription: row.short_description,
    description: row.long_description,
    modelUrl: row.model_url,
    modelFileName: row.model_file_name,
    modelFileType: "3mf",
    modelStoragePath: row.model_storage_path || undefined,
    coverImageUrl: row.cover_image_url,
    coverImageStoragePath: row.cover_storage_path || undefined,
    galleryImages: row.gallery_images || [],
    galleryStoragePaths: row.gallery_storage_paths || [],
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function uniqueSlug(title: string, currentId?: string) {
  const base = slugify(title) || "prodotto";
  let candidate = base;
  let suffix = 2;

  while (true) {
    if (isSupabaseConfigured()) {
      let query = getSupabaseAdmin().from("products").select("id").eq("slug", candidate).limit(1);
      if (currentId) query = query.neq("id", currentId);
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return candidate;
    } else {
      const row = getDb()
        .prepare("SELECT id FROM products WHERE slug = ? AND id != ?")
        .get(candidate, currentId || "") as { id: string } | undefined;
      if (!row) return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function sortClause(sort: ProductFilters["sort"]) {
  if (sort === "oldest") return "created_at ASC";
  if (sort === "title") return "title ASC";
  if (sort === "views") return "views DESC";
  return "created_at DESC";
}

export async function listProducts(filters?: ProductFilters) {
  if (isSupabaseConfigured()) {
    let query = getSupabaseAdmin().from("products").select("*");

    if (filters?.query) {
      const value = filters.query.replace(/[%_,]/g, " ").trim();
      query = query.or(`title.ilike.%${value}%,short_description.ilike.%${value}%,long_description.ilike.%${value}%`);
    }

    if (filters?.category && filters.category !== "Tutte") {
      query = query.eq("category", filters.category);
    }

    if (filters?.sort === "oldest") query = query.order("created_at", { ascending: true });
    else if (filters?.sort === "title") query = query.order("title", { ascending: true });
    else if (filters?.sort === "views") query = query.order("views", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapSupabaseProduct(row as SupabaseProductRow));
  }

  const clauses: string[] = ["print_file_type = '3mf'"];
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

  const rows = getDb()
    .prepare(`SELECT * FROM products WHERE ${clauses.join(" AND ")} ORDER BY ${sortClause(filters?.sort)}`)
    .all(...params) as ProductRow[];
  return rows.map(mapLocalProduct);
}

export async function getProductById(id: string) {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin().from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSupabaseProduct(data as SupabaseProductRow) : undefined;
  }

  const row = getDb().prepare("SELECT * FROM products WHERE id = ? AND print_file_type = '3mf'").get(id) as ProductRow | undefined;
  return row ? mapLocalProduct(row) : undefined;
}

export async function getProductBySlug(slug: string) {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin().from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSupabaseProduct(data as SupabaseProductRow) : undefined;
  }

  const row = getDb().prepare("SELECT * FROM products WHERE slug = ? AND print_file_type = '3mf'").get(slug) as ProductRow | undefined;
  return row ? mapLocalProduct(row) : undefined;
}

export async function listCategories() {
  const products = await listProducts();
  return Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export async function createProduct(input: ProductInput) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const slug = await uniqueSlug(input.title);
  const category = input.category || "Oggetti stampati in 3D";

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin().from("products").insert({
      id,
      title: input.title,
      slug,
      category,
      short_description: input.shortDescription,
      long_description: input.description,
      model_url: input.modelUrl,
      model_file_name: input.modelFileName,
      model_file_type: "3mf",
      model_storage_path: input.modelStoragePath || "",
      cover_image_url: input.coverImageUrl,
      cover_storage_path: input.coverImageStoragePath || "",
      gallery_images: input.galleryImages,
      gallery_storage_paths: input.galleryStoragePaths || [],
      views: 0,
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(error.message);
    return getProductById(id);
  }

  getDb()
    .prepare(
      `INSERT INTO products (
        id, title, slug, category, print_file_path, print_file_name, print_file_type,
        model_storage_path, cover_image_path, cover_storage_path, gallery_images, gallery_storage_paths,
        short_description, long_description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.title,
      slug,
      category,
      input.modelUrl,
      input.modelFileName,
      "3mf",
      input.modelStoragePath || input.modelUrl,
      input.coverImageUrl,
      input.coverImageStoragePath || input.coverImageUrl,
      JSON.stringify(input.galleryImages),
      JSON.stringify(input.galleryStoragePaths || []),
      input.shortDescription,
      input.description,
      now,
      now,
    );

  return getProductById(id);
}

export async function updateProduct(
  id: string,
  values: { title: string; category: string; shortDescription: string; description: string },
) {
  const existing = await getProductById(id);
  if (!existing) return undefined;
  const slug = existing.title === values.title ? existing.slug : await uniqueSlug(values.title, id);
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("products")
      .update({
        title: values.title,
        slug,
        category: values.category,
        short_description: values.shortDescription,
        long_description: values.description,
        updated_at: updatedAt,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return getProductById(id);
  }

  getDb()
    .prepare(
      "UPDATE products SET title = ?, slug = ?, category = ?, short_description = ?, long_description = ?, updated_at = ? WHERE id = ?",
    )
    .run(values.title, slug, values.category, values.shortDescription, values.description, updatedAt, id);

  return getProductById(id);
}

export async function incrementViews(id: string) {
  if (isSupabaseConfigured()) {
    const product = await getProductById(id);
    if (!product) return;
    await getSupabaseAdmin()
      .from("products")
      .update({ views: product.views + 1 })
      .eq("id", id);
    return;
  }

  getDb().prepare("UPDATE products SET views = views + 1 WHERE id = ?").run(id);
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id);
  if (!product) return false;

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin().from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
  }

  await Promise.all([
    removeStoredFile(product.modelStoragePath),
    removeStoredFile(product.coverImageStoragePath),
    ...(product.galleryStoragePaths || []).map((storagePath) => removeStoredFile(storagePath)),
  ]);

  return true;
}
