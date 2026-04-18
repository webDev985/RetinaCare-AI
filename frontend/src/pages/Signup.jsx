import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

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

      {/* 🔥 BACKGROUND GLOW */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
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
          <div className="w-12 h-12 rounded-full bg-fuchsia-400/20 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-pulse"></div>
          </div>

          <h2 className="text-3xl font-semibold bg-gradient-to-r from-fuchsia-300 to-cyan-300 text-transparent bg-clip-text">
            RetinaCare AI
          </h2>

          <p className="text-xs text-slate-400">
            Create Your Account
          </p>
        </div>

        {/* 🔥 FORM */}
        <form onSubmit={submit} className="space-y-5">

          {/* NAME */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              onChange={onChange}
              className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 
                         focus:outline-none focus:border-fuchsia-400 
                         focus:ring-2 focus:ring-fuchsia-400/20 transition"
            />
          </motion.div>

          {/* EMAIL */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              onChange={onChange}
              className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 
                         focus:outline-none focus:border-fuchsia-400 
                         focus:ring-2 focus:ring-fuchsia-400/20 transition"
            />
          </motion.div>

          {/* PASSWORD */}
          <motion.div whileFocus={{ scale: 1.02 }}>
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              required
              onChange={onChange}
              className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 
                         focus:outline-none focus:border-fuchsia-400 
                         focus:ring-2 focus:ring-fuchsia-400/20 transition"
            />
          </motion.div>

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="w-full py-3 rounded-xl font-semibold 
                       bg-gradient-to-r from-fuchsia-500 to-cyan-500 
                       shadow-lg shadow-fuchsia-500/20 
                       hover:shadow-cyan-500/20 
                       transition-all"
          >
            Create Account
          </motion.button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-sm text-center text-gray-400">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-fuchsia-300 hover:text-fuchsia-400 font-medium"
          >
            Login
          </Link>
        </p>

      </motion.div>
    </div>
  );
}