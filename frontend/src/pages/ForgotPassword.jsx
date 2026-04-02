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

      {/* Background futuristic glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-cyan-500/25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl shadow-2xl p-10 w-full max-w-md"
      >
        <motion.h2
          animate={{ scale: [0.9, 1.05, 1] }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold text-center bg-gradient-to-r from-fuchsia-300 to-cyan-300 text-transparent bg-clip-text mb-4"
        >
          Forgot Password?
        </motion.h2>

        <p className="text-sm text-center text-gray-300 mb-4">
          Enter your registered email.  
          We will send instructions to reset your password.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="email"
            placeholder="Your Email"
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 focus:border-cyan-400"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl font-semibold"
          >
            Send Reset Link
          </motion.button>
        </form>

        <p className="text-sm mt-4 text-center text-slate-400">
          Back to{" "}
          <Link to="/login" className="text-cyan-300 hover:text-cyan-400">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
