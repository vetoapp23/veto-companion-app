import fs from "fs";
import path from "path";

const root = "c:/Users/bilal/Desktop/Stage/Vetoapp/supabase/functions/seed-demo-users";
const src = fs.readFileSync(path.join(root, "index.ts"), "utf8");

// Split into 3 roughly equal character chunks at newline boundaries for multi-file deploy.
// index.ts reconstructs and dynamic-imports via Blob URL is unreliable;
// instead we use proper TS modules.

// Find split points near 1/3 and 2/3 at line boundaries
const lines = src.split("\n");
const target1 = Math.floor(src.length / 3);
const target2 = Math.floor((2 * src.length) / 3);
let acc = 0;
let i1 = 0;
let i2 = 0;
for (let i = 0; i < lines.length; i++) {
  acc += lines[i].length + 1;
  if (!i1 && acc >= target1) i1 = i;
  if (!i2 && acc >= target2) i2 = i;
}

// Actually for valid TS we can't arbitrary-split. Use a different strategy:
// Write the full source as seed_impl.ts and a one-liner index.ts.
const impl = src;
const index = 'import "./seed_impl.ts";\n';

const outDir = "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-seed-deploy";
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "seed_impl.ts"), impl);
fs.writeFileSync(path.join(outDir, "index.ts"), index);

const args = {
  name: "seed-demo-users",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [
    { name: "index.ts", content: index },
    { name: "seed_impl.ts", content: impl },
  ],
};
fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-multifile-args.json",
  JSON.stringify(args),
);
console.log(
  JSON.stringify({
    indexLen: index.length,
    implLen: impl.length,
    total: index.length + impl.length,
    vivant: impl.includes('status: "vivant"'),
    temp: impl.includes("TEMP_RESEED_TOKEN"),
  }),
);
