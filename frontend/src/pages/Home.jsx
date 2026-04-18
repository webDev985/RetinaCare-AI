import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const auth = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      {/* 🔥 HERO SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            AI-Powered{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Retina Analysis
            </span>
          </h1>

          <p className="text-slate-400 mt-6">
            Detect diabetic retinopathy using CNN + Vision Transformer
            and receive intelligent clinical insights instantly.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() =>
                // auth ? navigate("/dashboard") : 
                navigate("/login")
              }
              className="px-6 py-3 rounded-xl font-semibold 
                         bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg"
            >
              {auth ? "Go to Dashboard" : "Get Started"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/signup")}
              className="px-6 py-3 rounded-xl border border-slate-700"
            >
              Create Account
            </motion.button>
          </div>
        </motion.div>

        {/* 🔥 RETINA ANIMATION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <div className="relative w-64 h-64">

            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl"></div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 border-2 border-cyan-400/30 rounded-full"
            />

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
            />

            <div className="absolute inset-12 rounded-full bg-slate-900"></div>

          </div>
        </motion.div>
      </div>

      {/* 🔥 FEATURES SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">

        {[
          {
            title: "Deep Learning Model",
            desc: "CNN + Vision Transformer for high accuracy detection",
          },
          {
            title: "AI Recommendations",
            desc: "Dynamic clinical insights based on prediction confidence",
          },
          {
            title: "Smart Navigation",
            desc: "Locate nearest eye hospitals instantly",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8 }}
            className="bg-slate-900/70 border border-slate-800 
                       rounded-2xl p-6 backdrop-blur-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-cyan-400">
              {item.title}
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              {item.desc}
            </p>
          </motion.div>
        ))}

      </div>

      {/* 🔥 ABOUT SECTION */}
      <div className="text-center px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold">
          Why RetinaCare AI?
        </h2>

        <p className="text-slate-400 mt-4 text-sm leading-relaxed">
          RetinaCare AI is designed to assist early detection of diabetic retinopathy
          using advanced deep learning techniques. It combines CNN and Vision
          Transformer models to provide reliable predictions and intelligent
          clinical support.
        </p>
      </div>

      {/* 🔥 CTA */}
      <div className="text-center pb-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-xl 
                     bg-gradient-to-r from-purple-500 to-pink-500"
        >
          Start Analysis
        </motion.button>
      </div>

    </div>
  );
}