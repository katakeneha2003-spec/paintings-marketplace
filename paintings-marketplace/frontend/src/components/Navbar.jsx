import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { count } = useCart();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem("admin_token");

  function onSearch(e) {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          Gallery<span className="brand-mark">&amp;</span>Co.
        </Link>

        <form className="search-box" onSubmit={onSearch}>
          <input
            placeholder="Search paintings…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        <nav className="nav-links">
          <Link to="/">Shop</Link>
          <Link to="/cart">Cart{count > 0 && <span className="cart-badge">{count}</span>}</Link>
          {isAdmin ? <Link to="/admin">Admin</Link> : <Link to="/login">Artist Login</Link>}
        </nav>
      </div>
    </header>
  );
}
