import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function AdminAddProduct() {
  const [form, setForm] = useState({
    title: "", description: "", price: "", medium: "Acrylic on canvas",
    width_cm: "", height_cm: "", stock: "1",
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
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
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append("image", imageFile);
      await api.createProduct(formData);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ padding: "48px 0 72px" }}>
      <div className="section-heading"><h2>Add a Painting</h2></div>
      <form className="form-card" onSubmit={handleSubmit} encType="multipart/form-data">
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label>Title</label>
          <input required value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows="3" value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div className="field">
          <label>Price (₹)</label>
          <input type="number" min="0" required value={form.price} onChange={(e) => update("price", e.target.value)} />
        </div>
        <div className="field">
          <label>Medium</label>
          <input value={form.medium} onChange={(e) => update("medium", e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Width (cm)</label>
            <input type="number" min="0" value={form.width_cm} onChange={(e) => update("width_cm", e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Height (cm)</label>
            <input type="number" min="0" value={form.height_cm} onChange={(e) => update("height_cm", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Stock (usually 1 — originals are one-of-a-kind)</label>
          <input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
        </div>
        <div className="field">
          <label>Photo of the painting</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Saving…" : "Publish Painting"}
        </button>
      </form>
    </div>
  );
}
