import fs from "fs";

const p = "c:/Users/bilal/Desktop/Stage/Vetoapp/supabase/functions/seed-demo-users/index.ts";
const c = fs.readFileSync(p, "utf8");
const payload = {
  name: "seed-demo-users",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [{ name: "index.ts", content: c }],
};
fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-seed-deploy.json",
  JSON.stringify(payload),
);
console.log(
  JSON.stringify({
    len: c.length,
    hasVivant: c.includes('status: "vivant"'),
    hasTemp: c.includes("TEMP_RESEED_TOKEN"),
  }),
);
