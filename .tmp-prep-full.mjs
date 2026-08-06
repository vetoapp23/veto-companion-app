import fs from "fs";

const src = fs.readFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/supabase/functions/seed-demo-users/index.ts",
  "utf8",
);

// Deploy as plain multi-file: index.ts is the full source (no bootstrap)
const args = {
  name: "seed-demo-users",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [{ name: "index.ts", content: src }],
};

fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-full-deploy-args.json",
  JSON.stringify(args),
);

// Also write content-only for verification
console.log(
  JSON.stringify({
    len: src.length,
    vivant: src.includes('status: "vivant"'),
    temp: src.includes("TEMP_RESEED_TOKEN"),
    placeholder: src.includes("PLACEHOLDER") || src.includes("loaded from disk"),
    boot: src.includes("DecompressionStream"),
  }),
);
