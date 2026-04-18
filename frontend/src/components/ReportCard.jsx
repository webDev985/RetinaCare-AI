import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { generatePDF } from "../utils/generateReportPDF";
import { getClinicalAdvice } from "../utils/clinicalAdvice";

/* 🎨 COLORS */
const severityColors = {
  "No DR": "from-emerald-500 to-green-600",
  Mild: "from-yellow-400 to-yellow-600",
  Moderate: "from-orange-400 to-orange-600",
  Severe: "from-red-500 to-red-700",
  "Proliferative DR": "from-purple-500 to-purple-700",
};

/* 🔥 CLASS LABELS */
const CLASS_LABELS = {
  class_0: "No DR",
  class_1: "Mild",
  class_2: "Moderate",
  class_3: "Severe",
  class_4: "Proliferative DR",
};

/* 🧠 EXPLANATIONS */
const STAGE_EXPLANATIONS = {
  "No DR": "No retinal abnormalities detected. Healthy retina.",
  Mild: "Microaneurysms detected. Early stage diabetic retinopathy.",
  Moderate: "Increased hemorrhages and vascular leakage observed.",
  Severe: "Extensive retinal hemorrhages and vascular damage detected.",
  "Proliferative DR":
    "Abnormal new blood vessel growth detected. Critical stage.",
};

export default function ReportCard({ report }) {
  const [showModal, setShowModal] = useState(false);
  const [hoveredStage, setHoveredStage] = useState(null);

  const [patient, setPatient] = useState({
    name: "",
    age: "",
    bloodGroup: "",
  });

  const count = useMotionValue(0);
  const waveOffset = useMotionValue(314);

  const confidence = Math.min(100, Math.max(0, Number(report?.confidence || 0)));
  const rounded = useTransform(count, (v) => v.toFixed(1));

  const rawPrediction = report?.prediction || "class_0";
  const prediction = CLASS_LABELS[rawPrediction] || rawPrediction;

  const scores = report?.all_scores || {};

  const advice =
    getClinicalAdvice?.(prediction, confidence) ?? {
      level: "Clinical Review Required",
      advice: "Please consult a specialist.",
      color: "text-slate-300",
    };

  useEffect(() => {
    count.set(0);
    waveOffset.set(314);

    animate(count, confidence, { duration: 1.8 });
    animate(waveOffset, 314 - (314 * confidence) / 100, { duration: 2 });
  }, [report]);

  const handleGeneratePDF = () => {
    if (!patient.name || !patient.age || !patient.bloodGroup) {
      alert("Please fill all patient details");
      return;
    }

    generatePDF("report-card", prediction, confidence, patient);
    setShowModal(false);
  };

  if (!report) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-400 text-sm">
        Upload image and click <b>Analyze Retina</b>
      </div>
    );
  }

  return (
    <>
      <motion.div
        id="report-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 space-y-6 shadow-xl"
      >

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            AI Diagnosis
          </h2>

          <span className={`px-4 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${severityColors[prediction]}`}>
            {prediction}
          </span>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-3 gap-6 items-center">

          {/* CONFIDENCE */}
          <div className="flex flex-col items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800 p-5 relative">
            <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/10"></div>

            <motion.div
              className="relative w-28 h-28"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="56" cy="56" r="50" stroke="#1e293b" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="#38bdf8"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={314}
                  style={{ strokeDashoffset: waveOffset }}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                <motion.span>{rounded}</motion.span>%
              </div>
            </motion.div>

            <p className="text-xs text-slate-400 mt-2">
              Model Confidence
            </p>
          </div>

          {/* PROBABILITY */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-sm font-semibold text-slate-200">
              Severity Probability Distribution
            </p>

            {Object.keys(scores).map((key) => {
              const val = Math.min(100, Math.max(0, Number(scores[key] || 0)));
              const label = CLASS_LABELS[key] || key;
              const isActive = key === rawPrediction;

              return (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => setHoveredStage(label)}
                  onMouseLeave={() => setHoveredStage(null)}
                >

                  {/* TOOLTIP */}
                  {hoveredStage === label && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute -top-20 left-0 z-50"
                    >
                      <div className="px-4 py-2 text-xs rounded-xl 
                                      bg-slate-900/90 border border-cyan-400/30 
                                      shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                        🧠 {STAGE_EXPLANATIONS[label]}
                      </div>
                      <div className="w-8 h-[2px] bg-cyan-400 animate-pulse mt-1"></div>
                    </motion.div>
                  )}

                  <div className="flex justify-between text-xs text-slate-400">
                    <span className={isActive ? "text-cyan-400 font-semibold" : ""}>
                      {label}
                    </span>
                    <span>{val.toFixed(2)}%</span>
                  </div>

                  <motion.div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1.4 }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        label === "No DR"
                          ? "from-green-400 to-emerald-500"
                          : label === "Mild"
                          ? "from-yellow-400 to-orange-400"
                          : label === "Moderate"
                          ? "from-orange-400 to-red-400"
                          : label === "Severe"
                          ? "from-red-500 to-red-700"
                          : "from-purple-500 to-pink-500"
                      } ${isActive ? "shadow-lg scale-105" : ""}`}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CLINICAL CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl p-5 overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl shadow-lg"
        >
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-cyan-500 to-purple-500 blur-2xl"></div>

          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          />

          <p className="text-sm font-semibold text-cyan-400 mb-2">
            AI Clinical Recommendation
          </p>

          <p className={`text-sm font-semibold ${advice.color}`}>
            {advice.level}
          </p>

          <p className="text-sm text-slate-300 mt-2">
            {advice.advice}
          </p>
        </motion.div>

        {/* DOWNLOAD BUTTON */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold shadow-lg"
          >
            Download AI Medical Report
          </motion.button>
        </div>

      </motion.div>

      {/* 🔥 PREMIUM MODAL */}
      {showModal && (
        
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-[380px] p-8 rounded-3xl 
                 bg-gradient-to-br from-slate-900/90 to-slate-950/90 
                 border border-cyan-500/20 shadow-2xl overflow-hidden"
    >

      {/* 🌟 GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-2xl"></div>

      {/* HEADER */}
      <h3 className="text-xl font-semibold text-center 
                     bg-gradient-to-r from-cyan-400 to-purple-500 
                     bg-clip-text text-transparent mb-6">
        Patient Details
      </h3>

      {/* FORM */}
      <div className="space-y-5 relative z-10">

        {/* NAME */}
        <div className="relative">
          <input
            type="text"
            required
            value={patient.name}
            onChange={(e) => setPatient({ ...patient, name: e.target.value })}
            className="peer w-full px-4 py-3 rounded-xl bg-slate-900/70 
                       border border-slate-700 focus:border-cyan-400 
                       focus:ring-2 focus:ring-cyan-400/20 outline-none"
          />
          <label className="absolute left-3 -top-2 text-xs text-cyan-400 bg-slate-900 px-1">
            Patient Name
          </label>
        </div>

        {/* AGE */}
        <div className="relative">
          <input
            type="number"
            required
            value={patient.age}
            onChange={(e) => setPatient({ ...patient, age: e.target.value })}
            className="peer w-full px-4 py-3 rounded-xl bg-slate-900/70 
                       border border-slate-700 focus:border-purple-400 
                       focus:ring-2 focus:ring-purple-400/20 outline-none"
          />
          <label className="absolute left-3 -top-2 text-xs text-purple-400 bg-slate-900 px-1">
            Age
          </label>
        </div>

        {/* BLOOD GROUP */}
        <div className="relative">
          <select
            required
            value={patient.bloodGroup}
            onChange={(e) => setPatient({ ...patient, bloodGroup: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/70 
                       border border-slate-700 focus:border-pink-400 
                       focus:ring-2 focus:ring-pink-400/20 outline-none"
          >
            <option value="">Select Blood Group</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
          <label className="absolute left-3 -top-2 text-xs text-pink-400 bg-slate-900 px-1">
            Blood Group
          </label>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-2">

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGeneratePDF}
            className="flex-1 py-3 rounded-xl font-semibold 
                       bg-gradient-to-r from-green-500 to-emerald-600 
                       shadow-lg shadow-green-500/20"
          >
            Generate
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(false)}
            className="flex-1 py-3 rounded-xl font-semibold 
                       bg-gradient-to-r from-red-500 to-pink-600 
                       shadow-lg shadow-red-500/20"
          >
            Cancel
          </motion.button>

        </div>
      </div>

      {/* 🔥 SHIMMER TOP LINE */}
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
      />

    
          </motion.div>
        </div>
      )}
    </>
  );
}