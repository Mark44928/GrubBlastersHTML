import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "index.html"), "utf8");
const begin = src.indexOf("// >>> GIF_BEGIN");
const end = src.indexOf("// <<< GIF_END");
if (begin < 0 || end < 0) {
  console.error("FAIL: GIF markers missing");
  process.exit(1);
}
const { gifEncode } = new Function(`${src.slice(begin, end)}\nreturn { gifEncode };`)();
const w = 8, h = 6;
const frame = new Uint8ClampedArray(w * h * 4).fill(180);
const gif = gifEncode([frame, frame], w, h, 8, true);
const text = Buffer.from(gif).toString("latin1");
if (!text.startsWith("GIF89a")) {
  console.error("FAIL: bad GIF header");
  process.exit(1);
}
if (!text.includes("NETSCAPE2.0")) {
  console.error("FAIL: missing loop extension");
  process.exit(1);
}
if (gif[gif.length - 1] !== 0x3b) {
  console.error("FAIL: missing GIF trailer");
  process.exit(1);
}
if (gif.length < 200) {
  console.error("FAIL: suspiciously small GIF");
  process.exit(1);
}
console.log(`gif: ${gif.length} bytes, ${w}x${h}, 2 frames`);
