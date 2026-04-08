import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// const env = loadEnv(mode, process.cwd(), "");

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.API_KEY),
    },
  };
});
