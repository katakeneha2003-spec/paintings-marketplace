import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  useEffect(() => {
    setLoading(true);
    api
      .getProducts(q)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Original Acrylic Works</p>
          <h1>Paintings made by hand, one canvas at a time.</h1>
          <p>
            Browse original acrylic paintings, each photographed true to color and
            shipped directly from the studio to your wall.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="section-heading">
          <h2>{q ? `Results for "${q}"` : "Current Collection"}</h2>
          <span>{products.length} painting{products.length !== 1 ? "s" : ""}</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p>Loading paintings…</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No paintings here yet</h3>
            <p>Check back soon, or try a different search.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
