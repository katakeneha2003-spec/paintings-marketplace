import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("products");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      navigate("/login");
      return;
    }
    api.getProducts().then(setProducts).catch((e) => setError(e.message));
    api.getOrders().then(setOrders).catch((e) => setError(e.message));
  }, []);

  async function handleDelete(id) {
    if (!confirm("Remove this painting from the shop?")) return;
    try {
      await api.deleteProduct(id);
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/");
  }

  return (
    <div className="container" style={{ padding: "48px 0 72px" }}>
      <div className="section-heading">
        <h2>Studio Dashboard</h2>
        <button className="btn btn-outline" onClick={logout}>Log Out</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <button className={tab === "products" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setTab("products")}>
          Paintings ({products.length})
        </button>
        <button className={tab === "orders" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setTab("orders")}>
          Orders ({orders.length})
        </button>
        <Link to="/admin/new" className="btn btn-outline">+ Add Painting</Link>
      </div>

      {tab === "products" && (
        <div className="table-scroll">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>₹{p.price.toLocaleString("en-IN")}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="btn btn-outline" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {tab === "orders" && (
        <div className="table-scroll">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Placed</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name} <br /><span style={{color:"var(--ink-soft)", fontSize:12}}>{o.customer_email}</span></td>
                <td>₹{o.total.toLocaleString("en-IN")}</td>
                <td>
                  <span className="pill">{o.payment_method === "online" ? "Paid Online" : "Cash on Delivery"}</span>
                </td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
