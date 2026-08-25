import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, assetUrl } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="container"><div className="error-banner">{error}</div></div>;
  if (!product) return <div className="container"><p>Loading…</p></div>;

  return (
    <div className="container">
      <div className="detail-grid">
        <div className="detail-image">
          {product.image_url ? (
            <img src={assetUrl(product.image_url)} alt={product.title} />
          ) : (
            <div style={{ aspectRatio: "4/5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              No image yet
            </div>
          )}
        </div>

        <div>
          <h1 className="detail-title">{product.title}</h1>
          <p style={{ color: "var(--ink-soft)" }}>{product.description}</p>
          <p className="detail-price">₹{product.price.toLocaleString("en-IN")}</p>

          <div className="detail-meta-row">
            <div><span>Medium</span>{product.medium}</div>
            {product.width_cm && product.height_cm && (
              <div><span>Dimensions</span>{product.width_cm} × {product.height_cm} cm</div>
            )}
            <div><span>Availability</span>{product.stock > 0 ? `${product.stock} in stock` : "Sold out"}</div>
          </div>

          {added && <div className="success-banner">Added to cart.</div>}

          <button
            className="btn btn-primary btn-block"
            disabled={product.stock <= 0}
            onClick={() => {
              addToCart(product, 1);
              setAdded(true);
            }}
          >
            {product.stock > 0 ? "Add to Cart" : "Sold Out"}
          </button>
          <button className="btn btn-outline btn-block" style={{ marginTop: 10 }} onClick={() => navigate("/cart")}>
            Go to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
