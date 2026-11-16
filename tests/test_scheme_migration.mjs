import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "index.html"), "utf8");

const begin = src.indexOf("// >>> SCHEME_MIGRATE_BEGIN");
const end = src.indexOf("// <<< SCHEME_MIGRATE_END", begin);
if (begin < 0 || end < 0) {
  console.error("FAIL: scheme-migration markers missing");
  process.exit(1);
}
const wepMatch = /const WEP=(\[[\s\S]*?\]);\n/.exec(src);
const valsMatch = /const VALS=(\[[^\]]*\]);/.exec(src);
const snapMatch = /const snapIdx=[^\n]*\nconst snapVal=[^\n]*\n/.exec(src);
if (!wepMatch || !valsMatch || !snapMatch) {
  console.error("FAIL: could not extract WEP/VALS/snap helpers");
  process.exit(1);
}
const prelude =
  `const WEP=${wepMatch[1]};\n` +
  `const WEPID=new Set(WEP.map(w=>w.id));\n` +
  `const VALS=${valsMatch[1]};\n` +
  snapMatch[0];
const { sanitizeAmmo, WEP_ALIAS } = new Function(
  `${prelude}\n${src.slice(begin, end)}\nreturn { sanitizeAmmo, WEP_ALIAS };`
)();

let pass = 0;
let fail = 0;
function check(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass += 1;
  else {
    fail += 1;
    console.error(`FAIL ${label}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
  }
}

// every aliased old id must exist in WEP under its new id
const wid = new Set(eval(wepMatch[1]).map((w) => w.id));
for (const [oldId, newId] of Object.entries(WEP_ALIAS)) {
  check(`alias target exists: ${oldId}->${newId}`, wid.has(newId), true);
  check(`alias source renamed away: ${oldId}`, wid.has(oldId), false);
}

// pre-rename scheme keys migrate to their new ids with values snapped to VALS
check("old ids migrate", sanitizeAmmo({ boggy: 2, sheep: 1, firepunch: 8, scales: 1 }), { munch: 2, bouncer: 1, uppercut: 8, balance: 1 });
check("unknown ids dropped", sanitizeAmmo({ not_a_weapon: 3, boggy: 1 }), { munch: 1 });
check("explicit new id beats migrated old id", sanitizeAmmo({ boggy: 2, munch: 5 }), { munch: 5 });
check("negative values dropped", sanitizeAmmo({ holy: -1 }), {});
check("non-numeric values dropped", sanitizeAmmo({ holy: "5" }), {});
check("values clamped to 10", sanitizeAmmo({ boggy: 999 }), { munch: 10 });
check("empty scheme stays empty", sanitizeAmmo({}), {});

console.log(`scheme-migration: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
