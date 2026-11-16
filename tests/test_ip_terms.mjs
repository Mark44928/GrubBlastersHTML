import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const files = ["index.html", "README.md", "AGENTS.md", "legacy/grub-blasters.html", "legacy/4b843022-grub-blasters.html"];
const banned = [
  "Boggy",
  "Worms",
  "Team17",
  "Wormsong",
  "Hedgewars",
  "Holy Hand Grenade",
  "Concrete Donkey",
  "Old Woman",
  "Mad Cows",
  "Homing Pigeon",
  "Banana Bomb",
  "Dragon Ball",
  "Mole Bomb",
  "Fire Punch",
  "Scales of Justice",
  "Shoryuken",
];
let failed = false;
for (const name of files) {
  const text = readFileSync(join(here, "..", name), "utf8");
  for (const term of banned) {
    if (text.includes(term)) {
      console.error(`FAIL ${name}: banned IP term "${term}"`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("ip-terms: clean");
