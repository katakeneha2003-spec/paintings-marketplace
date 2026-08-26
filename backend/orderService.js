// orderService.js
// The single place that actually writes an order to the database and
// reduces stock. Both the Cash-on-Delivery flow (routes/orders.js) and
// the online-payment flow (routes/payment.js) call this SAME function
// after they've each done their own checks (payment verified, etc.) —
// so the "actually place the order" logic only exists once.
import db from "./db.js";

export function createOrderRecord({
  customer_name,
  customer_email,
  address,
  items, // [{ id, quantity }, ...]
  payment_method, // 'cod' | 'online'
  payment_status, // 'pending_cod' | 'paid'
  razorpay_order_id = null,
  razorpay_payment_id = null,
}) {
  if (!customer_name || !customer_email || !address || !items?.length) {
    throw new Error("Missing order details.");
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
      detailedItems.push({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
      });
      db.prepare(`UPDATE products SET stock = stock - ? WHERE id = ?`).run(item.quantity, item.id);
    }

    return db
      .prepare(
        `INSERT INTO orders
          (customer_name, customer_email, address, items_json, total, payment_method, payment_status, razorpay_order_id, razorpay_payment_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        customer_name,
        customer_email,
        address,
        JSON.stringify(detailedItems),
        total,
        payment_method,
        payment_status,
        razorpay_order_id,
        razorpay_payment_id
      );
  });

  const result = transaction();
  return { orderId: result.lastInsertRowid, total, items: detailedItems };
}
