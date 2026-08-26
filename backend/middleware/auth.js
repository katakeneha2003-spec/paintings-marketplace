// middleware/auth.js
// Protects admin-only routes (adding/editing/deleting paintings).
import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization; // expects "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not logged in." });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired, please log in again." });
  }
}
