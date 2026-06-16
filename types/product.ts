export type Product = {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  modelUrl: string;
  modelFileName: string;
  modelFileType: "3mf";
  modelStoragePath?: string;
  coverImageUrl: string;
  coverImageStoragePath?: string;
  galleryImages: string[];
  galleryStoragePaths?: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  title: string;
  shortDescription: string;
  description: string;
  category?: string;
  modelUrl: string;
  modelFileName: string;
  modelStoragePath?: string;
  coverImageUrl: string;
  coverImageStoragePath?: string;
  galleryImages: string[];
  galleryStoragePaths?: string[];
};

export type ProductFilters = {
  query?: string;
  category?: string;
  sort?: "newest" | "oldest" | "title" | "views";
};

export type StoredFile = {
  url: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
};
