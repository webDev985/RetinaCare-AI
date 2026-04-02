import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // ⬅ VERY IMPORTANT FOR ELECTRON OFFLINE
  build: {
    outDir: "dist",
  },
});
