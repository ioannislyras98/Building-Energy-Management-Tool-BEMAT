import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Parse allowedHosts από environment variable
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(",").map((host) => host.trim())
    : undefined;

  return {
    server: {
      host: "0.0.0.0",
      port: 3000,
      watch: {
        usePolling: true,
      },
      allowedHosts: allowedHosts,
    },
    plugins: [react()],
    css: {
      postcss: "./postcss.config.js",
    },
    resolve: {
      alias: {
        "jwt-decode": "jwt-decode/build/esm/index.js",
      },
    },
  };
});
