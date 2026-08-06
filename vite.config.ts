import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { devStripeCheckoutPlugin } from "./vite-plugins/devStripeCheckout";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const SUPABASE_URL = env.VITE_SUPABASE_URL?.trim();
  const SUPABASE_PUBLISHABLE_KEY = (
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();
  const SUPABASE_PROJECT_ID = env.VITE_SUPABASE_PROJECT_ID?.trim() || "";

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY). " +
        "Copy .env.example to .env.local — never bake secrets/fallbacks into vite.config.",
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), ...(mode === "development" ? [devStripeCheckoutPlugin(env)] : [])],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        SUPABASE_PUBLISHABLE_KEY,
      ),
      ...(SUPABASE_PROJECT_ID
        ? {
            "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
              SUPABASE_PROJECT_ID,
            ),
          }
        : {}),
    },
  };
});
