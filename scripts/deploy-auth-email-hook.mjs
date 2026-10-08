import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const indexPath = path.join(root, "supabase/functions/auth-email-hook/index.ts");
const content = fs.readFileSync(indexPath, "utf8");
if (content.trim() === "PLACEHOLDER" || content.includes("PLACEHOLDER_WILL_REPLACE")) {
  console.error("Refusing to deploy placeholder content");
  process.exit(1);
}
const payload = {
  name: "auth-email-hook",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [{ name: "index.ts", content }],
};
fs.writeFileSync(path.join(root, ".tmp-deploy-auth-email-hook.json"), JSON.stringify(payload));
console.log(JSON.stringify({ ok: true, contentLen: content.length, hasResolveLang: content.includes("resolveLang") }));
