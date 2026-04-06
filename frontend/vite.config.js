import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // For web deployment
  build: {
    outDir: "dist",
  },
});
