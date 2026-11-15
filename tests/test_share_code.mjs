import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "index.html"), "utf8");
const begin = src.indexOf("function b64uEncode");
const end = src.indexOf("function buildSetupCode");
if (begin < 0 || end < 0) {
  console.error("FAIL: setup-code codec not found in index.html");
  process.exit(1);
}
const { b64uEncode, b64uDecode } = new Function(`${src.slice(begin, end)}\nreturn { b64uEncode, b64uDecode };`)();

const payload = { v: 1, tm: 2, tn: ["RÉD", "蓝队"], wn: 1.25, ui: "bluney" };
const code = b64uEncode(JSON.stringify(payload));
const back = JSON.parse(b64uDecode(code));
if (JSON.stringify(back) !== JSON.stringify(payload)) {
  console.error("FAIL: share-code roundtrip mismatch");
  process.exit(1);
}
if (/[+/=]/.test(code)) {
  console.error("FAIL: share code is not URL-safe");
  process.exit(1);
}
console.log(`share-code: roundtrip OK (${code.length} chars)`);
