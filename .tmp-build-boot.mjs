import fs from "fs";
import zlib from "zlib";

const src = fs.readFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/supabase/functions/seed-demo-users/index.ts",
  "utf8",
);
const b64 = zlib.gzipSync(Buffer.from(src, "utf8")).toString("base64");

const boot =
  `// Auto-generated gzip bootstrap for seed-demo-users deploy\n` +
  `const B64 = "${b64}";\n` +
  `\n` +
  `async function boot() {\n` +
  `  const bin = Uint8Array.from(atob(B64), (c) => c.charCodeAt(0));\n` +
  `  const ds = new DecompressionStream("gzip");\n` +
  `  const stream = new Blob([bin]).stream().pipeThrough(ds);\n` +
  `  const code = await new Response(stream).text();\n` +
  `  const mod = await import("data:application/typescript," + encodeURIComponent(code));\n` +
  `  return mod;\n` +
  `}\n` +
  `\n` +
  `await boot();\n`;

fs.writeFileSync(
  "c:/Users/bilal/Desktop/Stage/Vetoapp/.tmp-boot-index.ts",
  boot,
);
console.log("boot bytes", boot.length, "has vivant in src", src.includes('status: "vivant"'));
