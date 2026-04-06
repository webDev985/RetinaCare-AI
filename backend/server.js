import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/report.js";
import hospitalRoutes from "./routes/hospitals.js";

// ✅ Load environment variables FIRST
dotenv.config();

// ✅ Create Express app BEFORE using it
const app = express();
const PORT = process.env.PORT || 5000;

// --------------------
// Middlewares
// --------------------
app.use(cors());
app.use(express.json());

// --------------------
// Static uploads folder
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------
// API Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/hospitals", hospitalRoutes); // ✅ NOW correct position

// --------------------
// MongoDB connection
// --------------------
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✔ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// --------------------
// Test Route
// --------------------
app.get("/", (req, res) => {
  res.send("Backend API Running ✔");
});

// --------------------
// Start Server for local development and non-Vercel deployment
// --------------------
if (!process.env.VERCEL) {
  app.listen(PORT, () =>
    console.log(`🚀 Backend running on http://localhost:${PORT}`)
  );
}

// Export for Vercel serverless
export default app;