import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api.js";

// This is a STUB checkout: it records the order and clears the cart,
// but does not take real payment. See README "Adding real payments"
// for how to wire up Stripe or Razorpay before you go live.
export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ customer_name: "", customer_email: "", address: "" });
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api.createOrder({
        ...form,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      });
      setOrderId(result.orderId);
      clearCart();
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
          <p>A confirmation would normally be emailed here. Thank you!</p>
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
          <label>Email</label>
          <input type="email" required value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} />
        </div>
        <div className="field">
          <label>Shipping address</label>
          <textarea rows="3" required value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        <div className="cart-summary total">
          <span>Total due</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Placing order…" : "Place Order"}
        </button>
      </form>
    </div>
  );
}
