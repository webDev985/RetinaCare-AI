import path from "path";
import { fileURLToPath } from "url";
import Report from "../models/Report.js";
import { callML } from "../utils/callML.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function analyze(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image uploaded" });
    }

    const filepath = path.join(__dirname, "..", "uploads", req.file.filename);

    const mlResp = await callML(filepath);

    const reportDoc = await Report.create({
      user: req.user._id,
      imagePath: `/uploads/${req.file.filename}`,
      prediction: mlResp.ml?.prediction || mlResp.prediction,
      report: mlResp
    });

    return res.json({
      success: true,
      ml: mlResp,
      report: reportDoc
    });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
}

export async function list(req, res) {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({
      createdAt: -1
    });
    res.json({ reports });
  } catch (err) {
    console.error("List reports error:", err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function getReport(req, res) {
  try {
    const id = req.params.id;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ msg: "Report not found" });
    if (report.user.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: "Forbidden" });

    res.json({ report });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ msg: "Server error" });
  }
}
