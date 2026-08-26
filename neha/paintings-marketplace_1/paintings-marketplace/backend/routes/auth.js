// routes/auth.js
// Very simple single-admin login (you, the artist).
// Credentials come from the .env file — never hard-code passwords in code.
import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();

// We hash the admin password from .env once, at startup, so we never
// compare plain text passwords directly.
let adminPasswordHash = null;
function getHash() {
  if (!adminPasswordHash) {
    adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  }
  return adminPasswordHash;
}

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const valid = bcrypt.compareSync(password, getHash());
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

export default router;
