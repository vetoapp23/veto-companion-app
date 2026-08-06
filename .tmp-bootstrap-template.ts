/**
 * Bootstrap loader for seed-demo-users.
 * Decodes gzip+base64 embedded source and dynamic-imports it.
 */
import { gunzipSync } from "node:zlib";
import { Buffer } from "node:buffer";

const B64 = ""; // filled by build script

const code = gunzipSync(Buffer.from(B64, "base64")).toString("utf8");
const blob = new Blob([code], { type: "application/typescript" });
const url = URL.createObjectURL(blob);
await import(url);
