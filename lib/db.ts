import "server-only";

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let database: Database.Database | undefined;

function databasePath() {
  return path.resolve(process.cwd(), process.env.DATABASE_PATH || ".data/catalog.sqlite");
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'Oggetto 3D',
      short_description TEXT NOT NULL DEFAULT '',
      long_description TEXT NOT NULL DEFAULT '',
      print_file_path TEXT NOT NULL,
      print_file_name TEXT NOT NULL,
      print_file_type TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  `);
}

export function getDb() {
  if (!database) {
    const dbPath = databasePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    database = new Database(dbPath);
    database.pragma("journal_mode = WAL");
    migrate(database);
  }

  return database;
}
