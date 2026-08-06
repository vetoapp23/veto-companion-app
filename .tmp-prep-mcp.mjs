import fs from "fs";

const content = fs.readFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/supabase/functions/seed-demo-users/index.ts",
  "utf8",
);

// Write MCP-ready args as a single-line JSON for the agent to load
const args = {
  name: "seed-demo-users",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [{ name: "index.ts", content }],
};

fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-mcp-args.json",
  JSON.stringify(args),
);

console.log(
  [
    "ready",
    content.length,
    content.includes("TEMP_RESEED_TOKEN") ? "temp=yes" : "temp=no",
    content.includes('status: "vivant"') ? "vivant=yes" : "vivant=no",
    content.includes("PLACEHOLDER") ? "BAD" : "good",
  ].join(" "),
);
