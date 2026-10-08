import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const content = fs.readFileSync(
  path.join(root, "supabase/functions/auth-email-hook/index.ts"),
  "utf8",
);

const args = {
  name: "auth-email-hook",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [{ name: "index.ts", content }],
};

fs.writeFileSync(path.join(root, ".tmp-mcp-args.json"), JSON.stringify(args));

console.log(
  [
    "ready",
    content.length,
    content.includes("resolveLang") ? "resolveLang=yes" : "resolveLang=no",
    content.includes("Confirm your VetoCrm") ? "confirm=yes" : "confirm=no",
    content.trim() === "PLACEHOLDER" ? "BAD" : "good",
  ].join(" "),
);
