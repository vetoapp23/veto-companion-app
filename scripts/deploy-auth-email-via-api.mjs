import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REF = process.env.SUPABASE_PROJECT_REF || "yoskgnuoyjczxsdrgjwv";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const argsPath = path.join(root, ".tmp-mcp-args.json");

if (!TOKEN) {
  console.error("NO_TOKEN");
  process.exit(2);
}

const args = JSON.parse(fs.readFileSync(argsPath, "utf8"));
const content = args.files?.[0]?.content ?? "";
if (!content.includes("resolveLang") || content.trim() === "PLACEHOLDER") {
  console.error("INVALID_PAYLOAD");
  process.exit(3);
}

const form = new FormData();
form.append(
  "metadata",
  new Blob(
    [
      JSON.stringify({
        name: args.name,
        entrypoint_path: args.entrypoint_path,
        verify_jwt: args.verify_jwt,
      }),
    ],
    { type: "application/json" },
  ),
);
for (const f of args.files) {
  form.append("file", new Blob([f.content], { type: "application/typescript" }), f.name);
}

const url = `https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=${encodeURIComponent(args.name)}`;
const res = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}` },
  body: form,
});
const text = await res.text();
console.log(res.status, text);
process.exit(res.ok ? 0 : 1);
