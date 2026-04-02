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
      
      {/* RETINA GLOW BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      {/* CARD CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl shadow-2xl p-10 w-full max-w-md"
      >
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-semibold text-center bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-transparent bg-clip-text mb-6"
        >
          RetinaCare Login
        </motion.h2>

        <form onSubmit={submit} className="space-y-5">
          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            onChange={onChange}
            className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 focus:outline-none focus:border-cyan-400"
          />
          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="password"
            name="password"
            placeholder="Enter password"
            required
            onChange={onChange}
            className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 focus:outline-none focus:border-cyan-400"
          />

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-cyan-300 hover:text-cyan-400"
            >
              Forgot Password?
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl font-semibold"
          >
            Login
          </motion.button>
        </form>

        <p className="text-sm mt-4 text-center text-gray-300">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-cyan-300 hover:text-cyan-400">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
