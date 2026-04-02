import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { generatePDF } from "../utils/generateReportPDF";
import { getClinicalAdvice } from "../utils/clinicalAdvice";

const severityColors = {
  No_DR: "from-emerald-500 to-green-600",
  Mild: "from-yellow-400 to-yellow-600",
  Moderate: "from-orange-400 to-orange-600",
  Severe: "from-red-500 to-red-700",
  Proliferate_DR: "from-purple-500 to-purple-700",
};

export default function ReportCard({ report }) {
  const [showModal, setShowModal] = useState(false);
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    bloodGroup: "",
  });

  const count = useMotionValue(0);
  const waveOffset = useMotionValue(314);

  // ✅ Always safe number
  const confidence = Math.min(
    100,
    Math.max(0, Number(report?.confidence || 0))
  );

  // ✅ Smooth decimal animation
  const rounded = useTransform(count, (v) => v.toFixed(1));

  /* ================= SAFE DATA ================= */
  const prediction = report?.prediction || "No_DR";
  const scores = report?.all_scores || {};

  const advice =
    getClinicalAdvice?.(prediction) ?? {
      level: "Clinical Review Required",
      advice:
        "AI screening completed. Please consult an ophthalmologist for confirmation.",
      color: "text-slate-300",
    };

  /* ================= FIXED ANIMATION ================= */
  useEffect(() => {
    // reset before animation
    count.set(0);
    waveOffset.set(314);

    animate(count, confidence, {
      duration: 1.8,
      ease: "easeOut",
    });

    animate(waveOffset, 314 - (314 * confidence) / 100, {
      duration: 2,
      ease: "easeInOut",
    });

  }, [report]); // ✅ IMPORTANT: trigger when new result comes

  /* ================= PDF ================= */
  const handleGeneratePDF = () => {
    if (!patient.name || !patient.age || !patient.bloodGroup) {
      alert("Please fill all patient details");
      return;
    }
    generatePDF("report-card", prediction, confidence, patient);
    setShowModal(false);
  };

  /* ================= SAFE EARLY RETURN ================= */
  if (!report) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-400 text-sm">
        Upload a retina image and click <b>Analyze Retina</b> to generate an AI report.
      </div>
    );
  }

  return (
    <>
      <motion.div
        id="report-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-6 space-y-6"
      >

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-400">
              AI Diagnosis Summary
            </p>
            <h2 className="text-xl font-semibold text-slate-100">
              Diabetic Retinopathy Screening
            </h2>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${
                severityColors[prediction]
              }`}
            >
              {prediction.replace("_", " ")}
            </span>
            <span className={`text-xs font-semibold ${advice.color}`}>
              {advice.level}
            </span>
          </div>
        </div>

        {/* CONFIDENCE WAVE */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800 p-5">

            <motion.div
              className="relative w-28 h-28"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >

              <svg className="w-full h-full rotate-[-90deg]">
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="none"
                />

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

              {/* ✅ FIXED CONFIDENCE DISPLAY */}
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                <motion.span>{rounded}</motion.span>%
              </div>

            </motion.div>

            <p className="text-xs text-slate-400 mt-2">
              Model Confidence
            </p>
          </div>

          {/* PROBABILITY DISTRIBUTION */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-sm font-semibold text-slate-200">
              Severity Probability Distribution
            </p>

            {Object.keys(severityColors).map((key) => {
              const val = Math.min(
                100,
                Math.max(0, Number(scores[key] || 0))
              );

              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{key.replace("_", " ")}</span>
                    <span>{val.toFixed(2)}%</span>
                  </div>

                  <motion.div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1.4 }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        severityColors[key]
                      }`}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CLINICAL */}
        <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4">
          <p className="text-sm font-semibold text-slate-200">
            Clinical Recommendation
          </p>
          <p className={`text-xs font-medium mt-2 ${advice.color}`}>
            {advice.level}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {advice.advice}
          </p>
        </div>

        {/* DOWNLOAD */}
        <div className="flex justify-center pt-2">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowModal(true)}
            className="px-8 py-3 rounded-xl text-sm font-semibold text-white
                       bg-gradient-to-r from-sky-500 to-fuchsia-600
                       shadow-lg shadow-sky-500/20"
          >
            Download AI Medical Report (PDF)
          </motion.button>
        </div>

            </motion.div>

      {/* 👇 PASTE YOUR MODAL CODE HERE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl w-80 border border-slate-700 space-y-4">

            <h3 className="text-lg font-semibold text-center text-white">
              Enter Patient Details
            </h3>

            <input
              type="text"
              placeholder="Patient Name"
              className="w-full p-2 rounded bg-slate-800 text-white"
              value={patient.name}
              onChange={(e) =>
                setPatient({ ...patient, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Age"
              className="w-full p-2 rounded bg-slate-800 text-white"
              value={patient.age}
              onChange={(e) =>
                setPatient({ ...patient, age: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Blood Group"
              className="w-full p-2 rounded bg-slate-800 text-white"
              value={patient.bloodGroup}
              onChange={(e) =>
                setPatient({ ...patient, bloodGroup: e.target.value })
              }
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleGeneratePDF}
                className="flex-1 bg-green-600 py-2 rounded font-semibold"
              >
                Generate PDF
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-red-600 py-2 rounded font-semibold"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  );
}
