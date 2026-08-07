import fs from "fs";

const j = JSON.parse(
  fs.readFileSync(
    "C:/Users/bilal/.cursor/projects/c-Users-bilal-Desktop-Stage-Vetoapp/agent-tools/d28e455a-521d-4307-bfd5-ef6246862971.txt",
    "utf8",
  ),
);
console.log(
  JSON.stringify({
    name: j.name,
    len: j.files[0].content.length,
    temp: j.files[0].content.includes("TEMP_RESEED_TOKEN"),
    vivant: j.files[0].content.includes('status: "vivant"'),
  }),
);
