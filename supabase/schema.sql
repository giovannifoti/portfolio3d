create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Oggetti stampati in 3D',
  short_description text not null,
  long_description text not null,
  model_url text not null,
  model_file_name text not null,
  model_file_type text not null default '3mf' check (model_file_type = '3mf'),
  model_storage_path text,
  cover_image_url text not null,
  cover_storage_path text,
  gallery_images text[] not null default '{}',
  gallery_storage_paths text[] not null default '{}',
  views integer not null default 0 check (views >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_views_idx on public.products (views desc);
create index if not exists products_search_idx on public.products using gin (
  to_tsvector('simple', title || ' ' || short_description || ' ' || long_description || ' ' || category)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-assets',
  'product-assets',
  true,
  41943040,
  array[
    'model/3mf',
    'application/octet-stream',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.products enable row level security;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Public product assets are readable" on storage.objects;
create policy "Public product assets are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-assets');
