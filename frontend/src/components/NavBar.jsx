import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const [time, setTime] = useState("");

  /* 🔥 LIVE CLOCK */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");

      setTime(`${hrs}:${mins}:${secs}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl 
                 bg-slate-900/70 border-b border-slate-800 
                 shadow-lg"
    >
      {/* 🔥 GRADIENT BORDER */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-40" />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* 🔥 LEFT SIDE */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <div className="absolute inset-0 blur-md bg-cyan-400/60 rounded-full" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              RetinaCare AI
            </h1>
            <span className="text-xs text-slate-400 tracking-wide">
              AI-Powered DR Detection
            </span>
          </div>
        </div>

        {/* 🔥 RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* STATUS */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 
                          rounded-full bg-slate-800/70 border border-slate-700 
                          text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Model Active
          </div>

          {/* 🔥 LIVE CLOCK */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-4 py-2 rounded-xl text-sm font-mono 
                       bg-gradient-to-r from-cyan-500/10 to-purple-500/10 
                       border border-cyan-500/30 text-cyan-300 
                       shadow-[0_0_12px_rgba(34,211,238,0.4)]"
          >
            {time}
          </motion.div>

          {/* LOGOUT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold rounded-lg 
                       bg-gradient-to-r from-red-500 to-pink-600 
                       hover:from-red-600 hover:to-pink-700 
                       shadow-lg shadow-red-500/20 transition-all"
          >
            Logout
          </motion.button>

        </div>
      </div>
    </motion.nav>
  );
}