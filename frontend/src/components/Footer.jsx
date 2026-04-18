import React from "react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950 text-slate-400">

      {/* GRADIENT LINE */}
      <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-40"></div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        {/* BRAND */}
        <div>
          <h2 className="text-xl font-bold text-white">
            RetinaCare AI
          </h2>
          <p className="text-sm mt-2">
            AI-Powered Diabetic Retinopathy Detection System
          </p>
        </div>

        {/* ABOUT */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">
            About
          </h3>
          <p className="text-xs leading-relaxed">
            This system uses CNN and Vision Transformers to detect diabetic retinopathy 
            and provide AI-assisted clinical recommendations.
          </p>
        </div>

        {/* TECH */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">
            Tech Stack
          </h3>
          <p className="text-xs">
            React • Node.js • MongoDB • CNN • ViT • FastAPI
          </p>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="text-center px-6 pb-4">
        <p className="text-xs text-red-400">
          ⚠️ This tool is for screening purposes only and should not replace professional medical diagnosis.
        </p>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-slate-800 py-4 text-center text-xs">
        © 2026 RetinaCare AI • Developed by Shivam Singh
      </div>

    </footer>
  );
}