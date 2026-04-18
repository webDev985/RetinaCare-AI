import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showToast("success", "Login successful!");
      navigate("/dashboard");
    } catch (err) {
      showToast("error", "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden px-6">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />
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
            Secure Login Portal
          </p>
        </div>

        {/* 🔥 FORM */}
        <form onSubmit={submit} className="space-y-5">

          {/* EMAIL */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              onChange={onChange}
              className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 
                         focus:outline-none focus:border-cyan-400 
                         focus:ring-2 focus:ring-cyan-400/20 transition"
            />
          </motion.div>

          {/* PASSWORD */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              required
              onChange={onChange}
              className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 
                         focus:outline-none focus:border-cyan-400 
                         focus:ring-2 focus:ring-cyan-400/20 transition"
            />
          </motion.div>

          {/* FORGOT */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-cyan-300 hover:text-cyan-400 transition"
            >
              Forgot Password?
            </Link>
          </div>

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="w-full py-3 rounded-xl font-semibold 
                       bg-gradient-to-r from-cyan-500 to-fuchsia-500 
                       shadow-lg shadow-cyan-500/20 
                       hover:shadow-fuchsia-500/20 
                       transition-all"
          >
            Login
          </motion.button>

        </form>

        {/* SIGNUP */}
        <p className="text-sm text-center text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-300 hover:text-cyan-400 font-medium"
          >
            Sign up
          </Link>
        </p>

      </motion.div>
    </div>
  );
}