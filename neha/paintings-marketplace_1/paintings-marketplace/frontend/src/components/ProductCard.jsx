import React from "react";
import { Link } from "react-router-dom";
import { assetUrl } from "../api.js";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="painting-card">
      <div className="painting-frame">
        {product.image_url ? (
          <img src={assetUrl(product.image_url)} alt={product.title} />
        ) : (
          <span className="placeholder">No image yet</span>
        )}
      </div>
      <div className="placard">
        <p className="placard-title">{product.title}</p>
        <p className="placard-meta">
          {product.medium}
          {product.width_cm && product.height_cm ? ` · ${product.width_cm}×${product.height_cm} cm` : ""}
        </p>
        <span className="placard-price">₹{product.price.toLocaleString("en-IN")}</span>
        {product.stock <= 0 && <span className="placard-stock">Sold</span>}
      </div>
    </Link>
  );
}
