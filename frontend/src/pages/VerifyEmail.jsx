import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [status, setStatus] = useState("Verifying your email...");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus(res.data.msg || "Email verified successfully!");
        setSuccess(true);

        showToast("success", "Email verified! Redirecting...");

        setTimeout(() => navigate("/login"), 2500);
      } catch (err) {
        setStatus(
          err.response?.data?.msg ||
            "Verification link is invalid or expired."
        );
        setSuccess(false);

        showToast("error", "Verification failed.");
      }
    };

    verify();
  }, [token, navigate, showToast]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden px-6">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/20 blur-[120px] rounded-full" />
      </div>

      {/* 🔥 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-2xl bg-white/5 border border-white/10 
                   rounded-3xl shadow-2xl p-10 w-full max-w-md space-y-6 text-center"
      >

        {/* 🔥 LOGO */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>

          <h2 className="text-3xl font-semibold bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-transparent bg-clip-text">
            RetinaCare AI
          </h2>

          <p className="text-xs text-slate-400">
            Email Verification
          </p>
        </div>

        {/* 🔥 STATUS ICON */}
        <div className="text-4xl">
          {success === null && "⏳"}
          {success === true && "✅"}
          {success === false && "❌"}
        </div>

        {/* 🔥 STATUS TEXT */}
        <motion.p
          key={status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm font-medium ${
            success === true
              ? "text-green-400"
              : success === false
              ? "text-red-400"
              : "text-slate-300"
          }`}
        >
          {status}
        </motion.p>

        {/* 🔥 EXTRA MESSAGE */}
        {success && (
          <p className="text-xs text-slate-400">
            Redirecting to login...
          </p>
        )}

      </motion.div>
    </div>
  );
}