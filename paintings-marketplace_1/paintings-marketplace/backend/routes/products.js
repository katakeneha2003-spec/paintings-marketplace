// routes/products.js
// Public routes: anyone can view paintings.
// Admin-only routes: only you (logged in) can add/edit/delete.
import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// --- Image upload setup ---
// Uploaded painting photos are saved into backend/uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

// GET /api/products  — list all paintings (with optional search)
router.get("/", (req, res) => {
  const { q } = req.query;
  let rows;
  if (q) {
    rows = db
      .prepare(
        `SELECT * FROM products WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC`
      )
      .all(`%${q}%`, `%${q}%`);
  } else {
    rows = db.prepare(`SELECT * FROM products ORDER BY created_at DESC`).all();
  }
  res.json(rows);
});

// GET /api/products/:id — single painting detail
router.get("/:id", (req, res) => {
  const row = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: "Painting not found." });
  res.json(row);
});

// POST /api/products — add a new painting (admin only, with image upload)
router.post("/", requireAdmin, upload.single("image"), (req, res) => {
  const { title, description, price, medium, width_cm, height_cm, stock } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: "Title and price are required." });
  }
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db
    .prepare(
      `INSERT INTO products (title, description, price, medium, width_cm, height_cm, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      title,
      description || "",
      Number(price),
      medium || "Acrylic on canvas",
      width_cm ? Number(width_cm) : null,
      height_cm ? Number(height_cm) : null,
      stock ? Number(stock) : 1,
      image_url
    );

  const newProduct = db.prepare(`SELECT * FROM products WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id — edit a painting (admin only)
router.put("/:id", requireAdmin, upload.single("image"), (req, res) => {
  const existing = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Painting not found." });

  const { title, description, price, medium, width_cm, height_cm, stock } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : existing.image_url;

  db.prepare(
    `UPDATE products SET title=?, description=?, price=?, medium=?, width_cm=?, height_cm=?, stock=?, image_url=? WHERE id=?`
  ).run(
    title ?? existing.title,
    description ?? existing.description,
    price ? Number(price) : existing.price,
    medium ?? existing.medium,
    width_cm ? Number(width_cm) : existing.width_cm,
    height_cm ? Number(height_cm) : existing.height_cm,
    stock !== undefined ? Number(stock) : existing.stock,
    image_url,
    req.params.id
  );

  const updated = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
  res.json(updated);
});

// DELETE /api/products/:id — remove a painting (admin only)
router.delete("/:id", requireAdmin, (req, res) => {
  const result = db.prepare(`DELETE FROM products WHERE id = ?`).run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Painting not found." });
  res.json({ success: true });
});

export default router;
