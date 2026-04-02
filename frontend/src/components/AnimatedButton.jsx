import React from "react";
import { motion } from "framer-motion";

const AnimatedButton = ({ children, className = "", ...props }) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className={
      "px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold shadow-md hover:bg-sky-700 transition " +
      className
    }
    {...props}
  >
    {children}
  </motion.button>
);

export default AnimatedButton;
