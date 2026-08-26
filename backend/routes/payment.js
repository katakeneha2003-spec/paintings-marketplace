// routes/payment.js
// Handles real online payments through Razorpay. The flow is deliberately
// split into two steps, which is the industry-standard secure pattern:
//
//   1. POST /create-order  — our SERVER asks Razorpay to create an order.
//      The browser never talks to Razorpay's servers directly for this
//      part, and our secret key never leaves the backend.
//   2. POST /verify        — after the customer pays in Razorpay's popup,
//      the browser gets back a payment id + signature. We NEVER trust
//      that at face value (a malicious browser could fake a "success"
//      message) — we recompute the signature ourselves using our secret
//      key and compare. Only if it matches do we actually save the order
//      and reduce stock.
import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createOrderRecord } from "../orderService.js";
import { sendOrderConfirmationEmail } from "../emailService.js";

const router = Router();

function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payment/create-order — step 1
router.post("/create-order", async (req, res) => {
  const { amount } = req.body; // amount in rupees, e.g. 4500
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid order amount." });
  }
  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise, not rupees
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    // We send back the PUBLIC key_id (safe to expose) so the frontend can
    // open the Razorpay Checkout popup. The key_secret never leaves this file.
    res.json({ id: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ error: "Could not start payment. Please try again." });
  }
});

// POST /api/payment/verify — step 2
router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customer_name,
    customer_email,
    address,
    items,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment verification details." });
  }

  // Recompute the expected signature ourselves — this is the step that
  // actually proves the payment is genuine and wasn't faked by the browser.
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const providedBuffer = Buffer.from(razorpay_signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const isValid =
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  // timingSafeEqual (not ===) prevents a timing attack where an attacker
  // could guess the correct signature one byte at a time.

  if (!isValid) {
    return res.status(400).json({ error: "Payment verification failed. No order was placed." });
  }

  try {
    const result = createOrderRecord({
      customer_name,
      customer_email,
      address,
      items,
      payment_method: "online",
      payment_status: "paid",
      razorpay_order_id,
      razorpay_payment_id,
    });

    await sendOrderConfirmationEmail({
      to: customer_email,
      orderId: result.orderId,
      items: result.items,
      total: result.total,
      paymentMethod: "Online Payment (Razorpay)",
    });

    res.status(201).json({ orderId: result.orderId, total: result.total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
