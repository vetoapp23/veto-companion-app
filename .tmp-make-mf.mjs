import fs from "fs";
import crypto from "crypto";

const src = fs.readFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/supabase/functions/seed-demo-users/index.ts",
  "utf8",
);
const args = {
  name: "seed-demo-users",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [
    { name: "index.ts", content: 'import "./seed_impl.ts";\n' },
    { name: "seed_impl.ts", content: src },
  ],
};
fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-mf-args.json",
  JSON.stringify(args),
);

// Also write seed_impl alone for hashing
fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-mf/seed_impl.ts",
  src,
);
fs.mkdirSync("c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-mf", { recursive: true });
fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-mf/index.ts",
  'import "./seed_impl.ts";\n',
);
fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-mf/seed_impl.ts",
  src,
);

console.log(
  JSON.stringify({
    sha: crypto.createHash("sha256").update(src).digest("hex").slice(0, 12),
    len: src.length,
    vivant: src.includes('status: "vivant"'),
    temp: src.includes("TEMP_RESEED_TOKEN"),
    argsBytes: fs.statSync("c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-mf-args.json").size,
  }),
);
