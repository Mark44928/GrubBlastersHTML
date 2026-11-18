import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const guards = [
  "if(state!=='menu'){syncTeams();syncUI();tip('Start a new match to change teams'",
  "if(state!=='menu'){syncTeams();syncUI();tip('Start a new match to change grubs per team'",
  "if(state!=='menu'){syncUI();tip('Start a new match to change the map'",
  "if(state!=='menu'){syncUI();tip('Start a new match to change islands'",
];
for (const guard of guards) {
  if (!src.includes(guard)) {
    console.error(`FAIL: missing in-match settings guard: ${guard}`);
    process.exit(1);
  }
}
console.log("settings-lock: structural match settings are guarded");
