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
    payment_method TEXT DEFAULT 'cod',
    payment_status TEXT DEFAULT 'pending',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Safe migration: if you're running this against an OLDER paintings.db
// created before payments existed, add the new columns without wiping
// your existing orders. SQLite errors if a column already exists, so we
// just ignore that specific error.
const newColumns = [
  "ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cod'",
  "ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'",
  "ALTER TABLE orders ADD COLUMN razorpay_order_id TEXT",
  "ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT",
];
for (const sql of newColumns) {
  try {
    db.exec(sql);
  } catch (err) {
    // "duplicate column name" means it already exists — safe to ignore.
    if (!String(err.message).includes("duplicate column")) throw err;
  }
}

export default db;
