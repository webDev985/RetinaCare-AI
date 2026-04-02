import express from "express";
import auth from "../middleware/authMiddleware.js";
import { analyze, list, getReport } from "../controllers/reportController.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/analyze", auth, upload.single("image"), analyze);
router.get("/", auth, list);
router.get("/:id", auth, getReport);

export default router;
