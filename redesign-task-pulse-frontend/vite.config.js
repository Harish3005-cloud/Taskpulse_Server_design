import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts:["sb-v328s6s7lxoq.vercel.run",],
  },
  
});
