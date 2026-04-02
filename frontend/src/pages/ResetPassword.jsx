import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      showToast("success", "Password updated! Login now.");
      navigate("/login");
    } catch (err) {
      showToast("error", "Reset link expired or invalid");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden px-6">

      {/* Neon glow effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[450px] h-[450px] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-fuchsia-600/25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl shadow-2xl p-10 w-full max-w-md"
      >
        <motion.h2
          animate={{ scale: [0.9, 1.05, 1] }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold text-center bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-transparent bg-clip-text mb-4"
        >
          Reset Password
        </motion.h2>

        <p className="text-sm text-center text-gray-300 mb-4">
          Enter a new secure password for your account.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="password"
            placeholder="New Password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 focus:border-fuchsia-400"
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-xl font-semibold"
          >
            Update Password
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
