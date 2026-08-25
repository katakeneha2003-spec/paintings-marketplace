// db.js
// Sets up a local SQLite database file (paintings.db).
// SQLite = a full database that lives in a single file on disk.
// No separate database server to install — perfect for a solo first project.
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "paintings.db"));

db.pragma("journal_mode = WAL");

// Create tables if they do not already exist.
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    medium TEXT DEFAULT 'Acrylic on canvas',
    width_cm REAL,
    height_cm REAL,
    stock INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    address TEXT NOT NULL,
    items_json TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
