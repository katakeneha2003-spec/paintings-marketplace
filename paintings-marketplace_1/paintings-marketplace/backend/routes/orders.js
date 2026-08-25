// routes/orders.js
// Handles checkout. This starter version records the order in the database
// and reduces stock, but does NOT process real payments.
// See README "Adding real payments" section for how to plug in Stripe/Razorpay.
import { Router } from "express";
import db from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// POST /api/orders — customer checks out
router.post("/", (req, res) => {
  const { customer_name, customer_email, address, items } = req.body;
  // items = [{ id, quantity }, ...]

  if (!customer_name || !customer_email || !address || !items?.length) {
    return res.status(400).json({ error: "Missing order details." });
  }

  let total = 0;
  const detailedItems = [];

  const transaction = db.transaction(() => {
    for (const item of items) {
      const product = db.prepare(`SELECT * FROM products WHERE id = ?`).get(item.id);
      if (!product) throw new Error(`Painting ${item.id} no longer exists.`);
      if (product.stock < item.quantity) {
        throw new Error(`Only ${product.stock} left of "${product.title}".`);
      }
      total += product.price * item.quantity;
      detailedItems.push({ id: product.id, title: product.title, price: product.price, quantity: item.quantity });

      db.prepare(`UPDATE products SET stock = stock - ? WHERE id = ?`).run(item.quantity, item.id);
    }

    return db
      .prepare(
        `INSERT INTO orders (customer_name, customer_email, address, items_json, total) VALUES (?, ?, ?, ?, ?)`
      )
      .run(customer_name, customer_email, address, JSON.stringify(detailedItems), total);
  });

  try {
    const result = transaction();
    res.status(201).json({ orderId: result.lastInsertRowid, total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders — admin views all orders
router.get("/", requireAdmin, (req, res) => {
  const rows = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all();
  res.json(rows.map((r) => ({ ...r, items_json: JSON.parse(r.items_json) })));
});

export default router;
