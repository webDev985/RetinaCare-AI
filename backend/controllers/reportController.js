import path from "path";
import { fileURLToPath } from "url";
import Report from "../models/Report.js";
import { callML } from "../utils/callML.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= ANALYZE ================= */
export async function analyze(req, res) {
  console.log("🔥 ANALYZE API HIT");

  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image uploaded" });
    }

    const filepath = path.join(
      __dirname,
      "..",
      "uploads",
      req.file.filename
    );

    /* 🔥 ML CALL */
    let mlRespRaw;

    try {
      console.log("📡 Calling ML service...");
      mlRespRaw = await callML(filepath);
      console.log("✅ ML Response received");
    } catch (err) {
      console.error("❌ ML CALL FAILED:", err.message);

      return res.status(500).json({
        success: false,
        msg: "ML server not reachable",
      });
    }

    /* 🔥 NORMALIZE RESPONSE */
    const mlData = mlRespRaw.ml || mlRespRaw;

    if (!mlData || !mlData.prediction) {
      console.error("❌ Invalid ML response:", mlRespRaw);

      return res.status(500).json({
        success: false,
        msg: "Invalid ML response",
      });
    }

    /* 🚀 FAST MODE: DISABLE GRADCAM */
    let heatmap = null;

    // ✅ Only run GradCAM if explicitly enabled
    if (process.env.ENABLE_GRADCAM === "true") {
      console.log("⚠️ GradCAM enabled (slow mode)");

      const { spawn } = await import("child_process");

      try {
        const pythonPath =
          "C:\\Users\\shiva\\OneDrive\\Desktop\\DR_detection\\ml_service\\venv_py311\\Scripts\\python.exe";

        const gradcamPath =
          "C:\\Users\\shiva\\OneDrive\\Desktop\\DR_detection\\backend\\models\\gradcam.py";

        heatmap = await new Promise((resolve) => {
          const process = spawn(pythonPath, [gradcamPath, filepath]);

          let data = "";

          process.stdout.on("data", (chunk) => {
            data += chunk.toString();
          });

          process.on("close", () => {
            resolve(data.trim() || null);
          });

          process.on("error", () => {
            resolve(null);
          });
        });

      } catch {
        heatmap = null;
      }
    }

    /* 🔥 SAVE REPORT */
    const reportDoc = await Report.create({
      user: req.user._id,
      imagePath: `/uploads/${req.file.filename}`,
      prediction: mlData.prediction,
      report: mlData,
    });

    /* 🔥 FINAL RESPONSE */
    return res.json({
      success: true,
      ml: {
        ...mlData,
        heatmap: heatmap,
      },
      report: reportDoc,
    });

  } catch (err) {
    console.error("❌ Analyze error:", err);

    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
}

/* ================= LIST ================= */
export async function list(req, res) {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ reports });

  } catch (err) {
    console.error("❌ List reports error:", err);

    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
}

/* ================= GET REPORT ================= */
export async function getReport(req, res) {
  try {
    const id = req.params.id;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ msg: "Report not found" });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    res.json({ report });

  } catch (err) {
    console.error("❌ Get report error:", err);

    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
}