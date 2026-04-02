import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/signup", form);
      showToast("success", res.data.msg || "Check your email to verify!");
      navigate("/login");
    } catch (err) {
      showToast("error", "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden px-6">
      
      {/* GLOW EFFECTS */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-fuchsia-600/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl shadow-2xl p-10 w-full max-w-md"
      >
        <h2 className="text-3xl font-semibold text-center bg-gradient-to-r from-fuchsia-300 to-cyan-300 text-transparent bg-clip-text mb-6">
          Create Account
        </h2>

        <form onSubmit={submit} className="space-y-5">
          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="text"
            name="name"
            placeholder="Full Name"
            required
            onChange={onChange}
            className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 focus:border-fuchsia-400"
          />
          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={onChange}
            className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 focus:border-fuchsia-400"
          />
          <motion.input
            whileFocus={{ scale: 1.03 }}
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={onChange}
            className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 focus:border-fuchsia-400"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-xl font-semibold"
          >
            Sign Up
          </motion.button>
        </form>

        <p className="text-sm mt-4 text-center text-gray-300">
          Already registered?{" "}
          <Link to="/login" className="text-fuchsia-300 hover:text-fuchsia-400">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
