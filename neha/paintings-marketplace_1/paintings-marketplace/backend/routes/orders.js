// routes/orders.js
// Handles Cash-on-Delivery checkout. For ONLINE payment, see routes/payment.js
// instead — that flow verifies a real Razorpay payment before saving anything.
// Both flows ultimately call the same createOrderRecord() in orderService.js.
import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { createOrderRecord } from "../orderService.js";
import { sendOrderConfirmationEmail } from "../emailService.js";
import db from "../db.js";

const router = Router();

// POST /api/orders — Cash on Delivery checkout (no payment happens now)
router.post("/", async (req, res) => {
  const { customer_name, customer_email, address, items } = req.body;

  try {
    const result = createOrderRecord({
      customer_name,
      customer_email,
      address,
      items,
      payment_method: "cod",
      payment_status: "pending_cod", // money is collected later, on delivery
    });

    await sendOrderConfirmationEmail({
      to: customer_email,
      orderId: result.orderId,
      items: result.items,
      total: result.total,
      paymentMethod: "Cash on Delivery",
    });

    res.status(201).json({ orderId: result.orderId, total: result.total });
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
