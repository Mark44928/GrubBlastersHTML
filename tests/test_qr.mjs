import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "index.html"), "utf8");
const begin = src.indexOf("var qrcode=");
const end = src.indexOf("\n'use strict';", begin);
if (begin < 0 || end < 0) {
  console.error("FAIL: embedded qrcode library not found");
  process.exit(1);
}
const qrcode = new Function(`${src.slice(begin, end)}\nreturn qrcode;`)();
const qr = qrcode(0, "M");
qr.addData("https://mark44928.github.io/GrubBlastersHTML/#m=TEST");
qr.make();
const svg = qr.createSvgTag({ cellSize: 4, margin: 8, scalable: true });
if (!svg.startsWith("<svg") || !svg.includes("<path")) {
  console.error("FAIL: QR SVG generation failed");
  process.exit(1);
}
console.log(`qr: SVG generated (${svg.length} chars)`);
