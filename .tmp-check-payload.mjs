import fs from "fs";
import { spawn } from "child_process";

// This helper is only used to confirm payload; deploy goes through MCP.
const payload = JSON.parse(
  fs.readFileSync("c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-seed-deploy.json", "utf8"),
);
console.log(
  JSON.stringify({
    name: payload.name,
    verify_jwt: payload.verify_jwt,
    entrypoint_path: payload.entrypoint_path,
    contentLen: payload.files[0].content.length,
    hasVivant: payload.files[0].content.includes('status: "vivant"'),
    hasTemp: payload.files[0].content.includes("TEMP_RESEED_TOKEN"),
  }),
);
