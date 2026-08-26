// routes/products.js
// Public routes: anyone can view paintings.
// Admin-only routes: only you (logged in) can add/edit/delete.
//
// Images are uploaded to Cloudinary (permanent cloud storage), NOT saved
// to this server's own disk — Render's free tier has no persistent disk,
// so anything saved locally gets wiped on every restart/redeploy.
import { Router } from "express";
import multer from "multer";
import db from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { uploadImageBuffer } from "../cloudinary.js";

const router = Router();

// Store the uploaded file in memory (not on disk) just long enough to
// forward it to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
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
router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  const { title, description, price, medium, width_cm, height_cm, stock } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: "Title and price are required." });
  }

  try {
    let image_url = null;
    if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer);
      image_url = result.secure_url; // a permanent https:// link, never expires
    }

    const insertResult = db
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

    const newProduct = db.prepare(`SELECT * FROM products WHERE id = ?`).get(insertResult.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Could not save the painting. Check your Cloudinary settings." });
  }
});

// PUT /api/products/:id — edit a painting (admin only)
router.put("/:id", requireAdmin, upload.single("image"), async (req, res) => {
  const existing = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Painting not found." });

  try {
    const { title, description, price, medium, width_cm, height_cm, stock } = req.body;
    let image_url = existing.image_url;
    if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer);
      image_url = result.secure_url;
    }

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
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Could not update the painting." });
  }
});

// DELETE /api/products/:id — remove a painting (admin only)
router.delete("/:id", requireAdmin, (req, res) => {
  const result = db.prepare(`DELETE FROM products WHERE id = ?`).run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Painting not found." });
  res.json({ success: true });
});

export default router;
