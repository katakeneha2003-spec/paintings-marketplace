import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { assetUrl } from "../api.js";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Browse the collection and add a painting you love.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: 72 }}>
      <div className="section-heading"><h2>Your Cart</h2></div>

      {items.map((item) => (
        <div className="cart-row" key={item.id}>
          {item.image_url ? <img src={assetUrl(item.image_url)} alt={item.title} /> : <div style={{width:76,height:76,background:"var(--canvas-dim)"}} />}
          <div className="cart-row-info">
            <p style={{ fontWeight: 600, margin: "0 0 4px" }}>{item.title}</p>
            <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 14 }}>₹{item.price.toLocaleString("en-IN")}</p>
          </div>
          <input
            type="number"
            min="1"
            className="qty-input"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
          />
          <button className="btn btn-outline" onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}

      <div style={{ maxWidth: 340, marginLeft: "auto", marginTop: 24 }}>
        <div className="cart-summary total">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
