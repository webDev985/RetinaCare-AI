import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";
import ReportCard from "../components/ReportCard";
import HospitalMap from "../components/HospitalMap";

export default function Dashboard() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  

  /* 🔥 NEW SCAN STATE */
  const [isScanning, setIsScanning] = useState(false);

  /* 🔥 SESSION STATES */
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [aiPoints, setAiPoints] = useState([]);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  /* ================= SESSION TIMER ================= */
  useEffect(() => {
    let inactivityTimer;
    let warningTimer;
    let countdownInterval;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);

      setShowPopup(false);
      setCountdown(10);

      warningTimer = setTimeout(() => {
        setShowPopup(true);

        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              navigate("/");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 50000);

      inactivityTimer = setTimeout(() => {
        navigate("/");
      }, 60000);
    };

    ["mousemove", "keydown", "click", "scroll"].forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);

      ["mousemove", "keydown", "click", "scroll"].forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [navigate]);

  /* ================= FILE ================= */
  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setResult(null);
    setHeatmap(null); // ✅ ADD THIS
    setAiPoints([]);

    if (f) setPreview(URL.createObjectURL(f));
  };

  /* ================= ANALYZE ================= */
  const analyze = async () => {

    console.log("🔥 Analyze clicked");
    console.log("🔥 Sending request to backend...");

    if (!file) return alert("Upload image first");
    setLoading(true);
    setIsScanning(true); // 🔥 START SCAN

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
  "http://localhost:5001/api/reports/analyze",
  formData,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

      /* 🔥 DELAY RESULT (SCAN EFFECT) */
      setTimeout(() => {
        setResult(res.data.ml);
        setHeatmap(res.data.ml?.heatmap || null);
        setAiPoints(generateAIPoints(res.data.ml));
        setIsScanning(false);
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("❌ ML server not running or backend error");
      setResult(null);   // 🔥 IMPORTANT
      setHeatmap(null);
      setAiPoints([]);
      setIsScanning(false);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOCATION ================= */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setGeoLocation(null)
    );
  }, []);
//.............................
  const generateAIPoints = (mlData) => {
  if (!mlData?.all_scores) return [];

  const severityMap = {
    class_0: 1,
    class_1: 3,
    class_2: 5,
    class_3: 7,
    class_4: 10,
  };

  const predicted = mlData.prediction;
  const intensity = severityMap[predicted] || 2;

  const points = [];

  for (let i = 0; i < intensity; i++) {
    // 🔥 FIXED (deterministic positions)
    const seed = i * 37;

    points.push({
      top: `${20 + (seed % 60)}%`,
      left: `${20 + ((seed * 2) % 60)}%`,
      size: 4 + (i % 4),
    });
  }

  return points;
};
// ..................

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

        {/* BACKGROUND */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full" />
        </div>

        <NavBar />

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

          <div className="grid md:grid-cols-2 gap-8">

            {/* HERO */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-950 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-xl"
            >
              <p className="text-xs tracking-widest text-cyan-400">
                RETINACARE · AI POWERED
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-3">
                Diabetic Retinopathy Detection with{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                ViT
                </span>
              </h1>

              <p className="text-sm text-slate-400 mt-4">
                Upload retinal images and get AI-powered diagnosis instantly.
              </p>
            </motion.div>

            {/* UPLOAD */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">
                Upload Retina Image
              </h3>

              <label className="flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-cyan-400">
                <p className="text-sm text-slate-400">
                  👁 Click to upload fundus image
                </p>
                <input type="file" className="hidden" onChange={handleFile} />
              </label>

              {/*  IMAGE + SCAN OVERLAY */}
              {preview && (
  <div className="relative mt-4 flex justify-center">

    {/* ✅ FIXED CONTAINER */}
    <div className="relative w-fit overflow-hidden rounded-xl">

      {/* IMAGE */}
      <img
        src={preview}
        className="h-44 rounded-xl object-contain border border-slate-700"
      />

      {/* 🔍 SCANNING */}
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">

          <div className="absolute inset-0 bg-black/60"></div>

          <motion.div
            className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
            animate={{ y: [-80, 80] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />

          <motion.p
            className="absolute bottom-2 text-xs text-cyan-300"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            🧠 Scanning Retina...
          </motion.p>

        </div>
      )}

      {/* 🔥 REAL GRAD-CAM HEATMAP */}
        {!isScanning && result && heatmap && (
          <div className="absolute inset-0">
            <img
              src={`data:image/png;base64,${heatmap}`}
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
          </div>
        )}

      {/* 🟡 AI POINTS (OPTIONAL KEEP) */}
      {!isScanning && result && (
        <>
          {aiPoints.map((point, i) => (
            <motion.div
              key={i}
              className="absolute bg-cyan-400 rounded-full"
              style={{
                top: point.top,
                left: point.left,
                width: `${point.size}px`,
                height: `${point.size}px`,
              }}
              animate={{
                scale: [1, 2.5, 1],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: i * 0.2,
              }}
            />
          ))}
        </>
      )}

    </div>
  </div>
)}              

        <button
                onClick={analyze}
                className="mt-5 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600"
              >
                {loading ? "Analyzing..." : "Analyze Retina"}
              </button>
            </motion.div>
          </div>

          <ReportCard report={result} />

          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              Nearby Eye Hospitals
            </h3>

            <HospitalMap
              location={geoLocation}
              role={role}
              severity={result?.prediction}
            />
          </div>

        </div>
      </div>

      {/* SESSION POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center w-[300px]"
          >
            <h3 className="text-lg font-semibold text-red-400">
              Session Expiring
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              Redirecting in {countdown} seconds...
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
}