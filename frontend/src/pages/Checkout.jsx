import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api.js";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ customer_name: "", customer_email: "", address: "" });
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" | "cod"
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const cartItemsPayload = () => items.map((i) => ({ id: i.id, quantity: i.quantity }));

  // ---- Cash on Delivery: straightforward, no payment gateway involved ----
  async function placeCodOrder() {
    const result = await api.createOrder({
      ...form,
      items: cartItemsPayload(),
    });
    setOrderId(result.orderId);
    clearCart();
  }

  // ---- Online payment: opens Razorpay's secure popup ----
  async function payOnline() {
    if (typeof window.Razorpay === "undefined") {
      throw new Error("Payment system failed to load. Check your internet connection and try again.");
    }

    // Step 1: ask OUR backend to create a Razorpay order (server-to-server,
    // uses our secret key — the browser never sees it).
    const paymentOrder = await api.createPaymentOrder(total);

    // Step 2: open Razorpay's Checkout popup with that order.
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        order_id: paymentOrder.id,
        name: "Gallery & Co.",
        description: "Original acrylic painting purchase",
        prefill: {
          name: form.customer_name,
          email: form.customer_email,
        },
        theme: { color: "#e4572e" },
        handler: async function (response) {
          // Step 3: send the payment result to OUR backend to verify it's
          // genuine (see backend/routes/payment.js) — only then is the
          // order actually saved and stock reduced.
          try {
            const result = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customer_name: form.customer_name,
              customer_email: form.customer_email,
              address: form.address,
              items: cartItemsPayload(),
            });
            resolve(result);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled."));
          },
        },
      });
      rzp.on("payment.failed", function (response) {
        reject(new Error(response.error?.description || "Payment failed."));
      });
      rzp.open();
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (paymentMethod === "cod") {
        await placeCodOrder();
      } else {
        const result = await payOnline();
        setOrderId(result.orderId);
        clearCart();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Order placed — #{orderId}</h3>
          <p>A confirmation email is on its way to {form.customer_email}. Thank you!</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/")}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="container"><p style={{padding: "48px 0"}}>Your cart is empty.</p></div>;
  }

  return (
    <div className="container" style={{ padding: "48px 0 72px" }}>
      <div className="section-heading"><h2>Checkout</h2></div>
      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label>Full name</label>
          <input required value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} />
        </div>
        <div className="field">
          <label>Email (your confirmation is sent here)</label>
          <input type="email" required value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} />
        </div>
        <div className="field">
          <label>Shipping address</label>
          <textarea rows="3" required value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        <div className="field">
          <label>Payment method</label>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 400, textTransform: "none" }}>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              Pay Online (Card / UPI / Netbanking)
            </label>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 400, textTransform: "none" }}>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
          </div>
        </div>

        <div className="cart-summary total">
          <span>Total due</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting
            ? paymentMethod === "online" ? "Opening payment window…" : "Placing order…"
            : paymentMethod === "online" ? "Pay & Place Order" : "Place Order (Pay on Delivery)"}
        </button>
      </form>
    </div>
  );
}
