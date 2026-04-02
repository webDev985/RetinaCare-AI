import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import NavBar from "../components/NavBar";
import ReportCard from "../components/ReportCard";
import HospitalMap from "../components/HospitalMap";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);

  /* ================= FILE ================= */
  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setResult(null);

    if (f) setPreview(URL.createObjectURL(f));
  };

  /* ================= ANALYZE ================= */
  const analyze = async () => {
    if (!file) return alert("Upload image first");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        "http://localhost:8001/predict",
        formData
      );

      if (!res.data.success) {
        alert("Invalid image");
        return;
      }

      // ✅ correct data
      setResult(res.data.ml);

    } catch (err) {
      console.error(err);
      alert("Server error");
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

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <NavBar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TOP */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* HERO */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-800">
            <p className="text-xs tracking-widest text-cyan-400">
              RETINACARE · AI POWERED
            </p>

            <h1 className="text-3xl font-bold mt-3">
              Diabetic Retinopathy Detection with{" "}
              <span className="text-cyan-400">CNN + ViT</span>
            </h1>

            <p className="text-sm text-slate-400 mt-4">
              Upload fundus images & get instant DR severity report.
            </p>
          </div>

          {/* UPLOAD */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">

            <h3 className="text-lg font-semibold mb-3">
              Upload Retina Image
            </h3>

            <label className="block border border-dashed border-slate-700 p-6 text-center rounded-xl cursor-pointer">
              👁 Click to upload fundus image
              <input type="file" className="hidden" onChange={handleFile} />
            </label>

            {preview && (
              <img
                src={preview}
                className="mt-4 h-48 mx-auto rounded-xl object-contain"
              />
            )}

            <button
              onClick={analyze}
              className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 py-3 rounded-xl font-semibold"
            >
              {loading ? "Analyzing..." : "Analyze Retina"}
            </button>

          </div>
        </div>

        {/* REPORT */}
        <div className="mt-10">
          <p className="text-sm mb-2">Screening Report</p>
          <ReportCard report={result} />
        </div>

        {/* MAP (RESTORED) */}
        <div className="mt-10 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">
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
  );
}