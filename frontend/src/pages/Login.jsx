import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { token } = await api.login(email, password);
      localStorage.setItem("admin_token", token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container" style={{ padding: "64px 0" }}>
      <div className="section-heading"><h2>Artist Login</h2></div>
      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block">Log In</button>
      </form>
    </div>
  );
}
