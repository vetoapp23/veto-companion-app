import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = JSON.parse(
  fs.readFileSync(path.join(root, ".tmp-deploy-auth-email-hook.json"), "utf8"),
);
fs.writeFileSync(path.join(root, ".tmp-mcp-args-out.json"), JSON.stringify(args));
console.log(
  JSON.stringify({
    contentLen: args.files[0].content.length,
    hasResolveLang: args.files[0].content.includes("resolveLang"),
    hasConfirm: args.files[0].content.includes("Confirm your VetoCrm"),
  }),
);
