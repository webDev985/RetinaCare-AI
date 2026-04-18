import React, { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      showToast("success", "Password reset email sent!");
    } catch (err) {
      showToast("error", "Email not registered");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden px-6">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      {/* 🔥 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative backdrop-blur-2xl bg-white/5 border border-white/10 
                   rounded-3xl shadow-2xl p-10 w-full max-w-md space-y-6"
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
            Password Recovery
          </p>
        </div>

        {/* 🔥 INFO */}
        <p className="text-sm text-center text-slate-400 leading-relaxed">
          Enter your registered email address.  
          We’ll send you instructions to reset your password securely.
        </p>

        {/* 🔥 FORM */}
        <form onSubmit={submit} className="space-y-5">

          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              type="email"
              placeholder="Enter your email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 
                         focus:outline-none focus:border-cyan-400 
                         focus:ring-2 focus:ring-cyan-400/20 transition"
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="w-full py-3 rounded-xl font-semibold 
                       bg-gradient-to-r from-cyan-500 to-fuchsia-500 
                       shadow-lg shadow-cyan-500/20 
                       hover:shadow-fuchsia-500/20 
                       transition-all"
          >
            Send Reset Link
          </motion.button>

        </form>

        {/* 🔥 BACK LINK */}
        <p className="text-sm text-center text-slate-400">
          Back to{" "}
          <Link
            to="/login"
            className="text-cyan-300 hover:text-cyan-400 font-medium"
          >
            Login
          </Link>
        </p>

      </motion.div>
    </div>
  );
}