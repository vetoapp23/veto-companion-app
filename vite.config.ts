import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Fallback values so production builds never end up with an undefined
  // Supabase URL/key (which throws "supabaseUrl is required." at startup).
  const SUPABASE_URL =
    env.VITE_SUPABASE_URL || "https://pkcsgysdwnpisumshlwy.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrY3NneXNkd25waXN1bXNobHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDA3MTAsImV4cCI6MjA5NTkxNjcxMH0.43sdKoNAqM7mEd_qF-8INmC0Azh-4_TbK7cSe91EppU";
  const SUPABASE_PROJECT_ID =
    env.VITE_SUPABASE_PROJECT_ID || "pkcsgysdwnpisumshlwy";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        SUPABASE_PUBLISHABLE_KEY
      ),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
        SUPABASE_PROJECT_ID
      ),
    },
  };
});
