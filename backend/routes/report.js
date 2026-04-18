import express from "express";
import auth from "../middleware/authMiddleware.js";
import { analyze, list, getReport } from "../controllers/reportController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

/* 🔥 FIXED MULTER STORAGE (KEEP EXTENSION) */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // ✅ keep extension
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ================= ROUTES ================= */
router.post("/analyze", auth, upload.single("image"), analyze);
router.get("/", auth, list);
router.get("/:id", auth, getReport);

export default router;