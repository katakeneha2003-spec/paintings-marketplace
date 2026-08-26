// api.js — one place that knows how to talk to the backend.
// Every other file imports helpers from here instead of calling fetch() directly.
//
// Locally: VITE_API_URL is unset, so BASE is "/api" and Vite's dev proxy
// forwards that to http://localhost:4000/api (see vite.config.js).
// In production: VITE_API_URL is set in Vercel to your real Render backend
// URL, e.g. https://your-backend.onrender.com/api — because in production
// there is no dev proxy, so the frontend must be told the real address.
const BASE = import.meta.env.VITE_API_URL || "/api";

// Painting photos are stored on the BACKEND (e.g. /uploads/123.jpg).
// Locally, the Vite proxy makes that work as a relative path.
// In production, frontend and backend live on different domains, so a
// relative path would try to load the image from the frontend's own
// domain and fail. This turns it into a full, correct URL either way.
const API_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "";
export function assetUrl(path) {
  if (!path) return path;
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
}

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

export const api = {
  // ---- Products ----
  getProducts: (q = "") =>
    fetch(`${BASE}/products${q ? `?q=${encodeURIComponent(q)}` : ""}`).then(handle),

  getProduct: (id) => fetch(`${BASE}/products/${id}`).then(handle),

  createProduct: (formData) =>
    fetch(`${BASE}/products`, {
      method: "POST",
      headers: { ...authHeaders() }, // do NOT set Content-Type — the browser sets it for FormData
      body: formData,
    }).then(handle),

  updateProduct: (id, formData) =>
    fetch(`${BASE}/products/${id}`, {
      method: "PUT",
      headers: { ...authHeaders() },
      body: formData,
    }).then(handle),

  deleteProduct: (id) =>
    fetch(`${BASE}/products/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    }).then(handle),

  // ---- Orders ----
  createOrder: (order) =>
    fetch(`${BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    }).then(handle),

  getOrders: () => fetch(`${BASE}/orders`, { headers: { ...authHeaders() } }).then(handle),

  // ---- Payment (Razorpay) ----
  createPaymentOrder: (amount) =>
    fetch(`${BASE}/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    }).then(handle),

  verifyPayment: (payload) =>
    fetch(`${BASE}/payment/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  // ---- Auth ----
  login: (email, password) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle),
};
