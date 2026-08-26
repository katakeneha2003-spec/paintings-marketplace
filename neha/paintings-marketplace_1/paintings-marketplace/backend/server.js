// server.js — entry point for the backend API
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import authRouter from "./routes/auth.js";
import paymentRouter from "./routes/payment.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Locally, CORS_ORIGIN is unset, so we allow all origins (simplest for dev).
// In production, set CORS_ORIGIN in Render to your exact Vercel URL, e.g.
// https://your-store.vercel.app — this stops other websites from calling
// your API using your logged-in admin's browser session.
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());      // parses JSON request bodies

// Serve uploaded painting images statically, e.g. GET /uploads/1234-photo.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("Painting marketplace API is running.");
});

// Catch-all error handler (e.g. multer file-size errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Something went wrong." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
