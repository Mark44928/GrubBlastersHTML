# AGENTS.md — Grub Blasters

> **MANDATORY READING.** Every AI agent and developer MUST read this file in full before touching ANY code in this repository. This is not optional. This is not a suggestion. Violating these rules will break the game, corrupt user data, or ship broken builds to production. Treat every rule here as a hard constraint enforced by the codebase itself.

---

## TABLE OF CONTENTS

1. [Project Identity](#project-identity)
2. [Hard Rules (Non-Negotiable)](#hard-rules-non-negotiable)
3. [Repository Layout](#repository-layout)
4. [Dev Environment (Termux on Android)](#dev-environment-termux-on-android)
5. [Make Targets](#make-targets)
6. [Architecture of index.html](#architecture-of-indexhtml)
7. [Coordinate Model](#coordinate-model)
8. [Terrain & Collision System](#terrain--collision-system)
9. [Core State (Module-Level Globals)](#core-state-module-level-globals)
10. [Turn Flow](#turn-flow)
11. [Gravity & Damage](#gravity--damage)
12. [Weapons System (44 weapons)](#weapons-system-44-weapons)
13. [AI System](#ai-system)
14. [Rendering Pipeline](#rendering-pipeline)
15. [Game Loop](#game-loop)
16. [Input System](#input-system)
17. [Persistence (localStorage)](#persistence-localstorage)
18. [Conventions (Code Style)](#conventions-code-style)
19. [Change Checklist (Mandatory)](#change-checklist-mandatory)
20. [Manual Smoke Test (80+ items)](#manual-smoke-test-80-items)
21. [Deployment](#deployment)
22. [Pitfalls (Things That Have Bitten Us)](#pitfalls-things-that-have-bitten-us)
23. [Function Reference (Critical APIs)](#function-reference-critical-apis)
24. [Debugging Guide](#debugging-guide)
25. [Performance Budget](#performance-budget)
26. [Security & Privacy](#security--privacy)

---

## Project Identity

**Grub Blasters** is a turn-based artillery game (Worms-style) shipped as **one dependency-free HTML file**. Two to four teams of worms blast each other across procedurally generated, fully destructible terrain on a zoomable 1400–2800 × 800 logical canvas, with a fuel-limited jetpack for mobility.

- **Live:** https://mark44928.github.io/GrubBlastersHTML/
- **Repo:** https://github.com/Mark44928/GrubBlastersHTML
- **Version:** 2.5.0 (The Evergreen Update)
- **File size:** ~224 KB (single file, no dependencies)
- **Language:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Target:** Mobile browsers (Android/iOS) + Desktop. Installable PWA: the manifest ships as an inline `data:application/manifest+json;base64` `<link>` (keeps Rule 1 intact); because a data URI has no base URL, `start_url`/`scope` are absolute (`https://mark44928.github.io/GrubBlastersHTML/`) — regenerate the data URI if the site URL ever changes.
- **Canvas:** 2D context, logical pixels, DPR-capped at 2
- **Audio:** Web Audio API (synthesized, no audio files)

---

## Hard Rules (Non-Negotiable)

These rules are **absolute**. Violating any of them will break the game or the build. No exceptions. No "just this once." No "I'll fix it later."

### Rule 1: One File. Forever.
The entire game lives in `index.html` (style, DOM, script). **Never split it.** Never add a `<script src>`, CDN, font, image, or audio file. Zero dependencies, no build step, no npm, no bundler, no transpiler. If you think you need a second file, you're wrong. Find another way.

### Rule 2: Exactly One `<script>` Block.
`make check` extracts the script with the regex `/<script>([\s\S]*)<\/script>/` and runs `node --check`. A second `<script>` tag silently changes what gets checked — the regex matches the FIRST `<script>` tag only, so a second block would be invisible to the syntax checker. One block. Always. Verify with `grep -c '<script' index.html` (must be 1).

### Rule 3: Only Publish When Asked.
Do not `git commit` / `git push` unless the user explicitly asks. When asked, use `make publish MSG="..."`. Never force-push. Never amend published commits. Never push to branches other than `main`.

### Rule 4: Keep README Size Line In Sync.
README ends with "About N KB" (round(bytes/1024)). `make check` fails when it drifts. Run `make sync-size` after every `index.html` edit. This is automated — do not manually edit the size line.

### Rule 5: Preserve Code Style.
Match surrounding style. Do not reformat. Do not "clean up" code. Do not rename variables. Do not add comments beyond section dividers. The codebase is dense and intentional.

### Rule 6: Respect Termux Rules.
Every shell command must run with `TMPDIR=/data/data/com.termux/files/usr/tmp`. No `sudo`, `systemctl`, or FHS paths. `$PREFIX=/data/data/com.termux/files/usr`. See the global Termux directive for full rules.

### Rule 7: Never Commit Secrets.
No API keys, tokens, passwords, or personal data in the repository. The game has no backend and no secrets, but if you add any (you shouldn't), they go in `.gitignore`d files only.

### Rule 8: Test Before Claiming Done.
Run `make check`. Run `make sync-size`. Verify manually. Never say "it works" without evidence. If you can't test (no browser), say so explicitly.

---

## Repository Layout

| Path | Purpose | Edit? |
|---|---|---|
| `index.html` | The entire game (style, DOM, script). ~182 KB. | Yes — this is where all work happens |
| `README.md` | Player-facing docs. Features, controls, weapons tables. | Yes — keep in sync with gameplay changes |
| `Makefile` | Dev tasks: check, serve, publish, verify. | Rarely |
| `AGENTS.md` | This file. Project guide for AI agents. | Yes — keep current |
| `.git/` | Git repository. | Never directly |

---

## Dev Environment (Termux on Android)

- **Platform:** Android Termux, Bionic libc, aarch64, single unprivileged user, no root.
- **$PREFIX:** `/data/data/com.termux/files/usr`
- **$HOME:** `/data/data/com.termux/files/home`
- **Required tools (all installed):** `node` (syntax check), `gh` (Pages status), `python3` (local server), `make`, `git`.
- **`gh` authenticated as:** `Mark44928`. GitHub Pages deploys from `main`.
- **Local server:** `python3 -m http.server 8080` (log to `$PREFIX/var/log/gb-serve.log`)
- **Every shell command:** `TMPDIR=/data/data/com.termux/files/usr/tmp <command>`
- **No sudo, systemctl, or FHS paths.** Ever.

---

## Make Targets

| Target | What it does | When to use |
|---|---|---|
| `make` / `make help` | List targets. | First time |
| `make check` | Extract script → `node --check` + README size sync. | **Before every publish. After every edit.** |
| `make syntax` | JS syntax check only. | Quick check |
| `make size` | Report file bytes/KB and what README claims. | Debugging size |
| `make sync-size` | Rewrite README "About N KB" to match file. | After every index.html edit |
| `make serve [PORT=8080]` | Local preview server. | Testing |
| `make open` | Open the live game on the device. | Manual test |
| `make status` | Pages build status + live HTTP code. | After publish |
| `make verify` | Wait 45 s for Pages build, then `status`. | After publish |
| `make publish MSG="..."` | `check` → `git add -A` → commit → push → `verify`. | Only when user asks |
| `make clean` | Remove temp extraction. | Cleanup |

**Standard edit cycle:**
```bash
# 1. Edit index.html
# 2. Check
TMPDIR=/data/data/com.termux/files/usr/tmp make check
# 3. Sync size
TMPDIR=/data/data/com.termux/files/usr/tmp make sync-size
# 4. Re-check
TMPDIR=/data/data/com.termux/files/usr/tmp make check
# 5. (If publishing) make publish MSG="..."
```

---

## Architecture of index.html

### Layout (3 layers)
1. **`<style>`** — all CSS (HUD, buttons, menu, safe-area insets, themes).
2. **DOM UI** — `#c` canvas, `#ui` overlay (`#top` team HUD, `#mid` timer + wind, `#bottom` controls) plus `#banner`, `#tip`, `#menu` start card, `#help`/`#custom`/`#settings` overlays, `#schemedit` scheme editor (z-index 10), `#rot` rotate overlay.
3. **`<script>`** — everything else, `'use strict'`.

### Coordinate Model
- **Logical world:** `W×H` default 1400×800. `W` is dynamic per map (`MAPS`: Standard 1400 / Wide 2000 / Epic 2800; `H` stays 800). Set in `newGame()` before `resize()` + terrain/bg/scenery regeneration.
- **Camera:** `cam{x,y,z}` with `fit=min(innerWidth/W,innerHeight/H)` and `S()=fit*cam.z` (CSS px per world px). World→screen: `innerWidth/2+(X-cam.x)*S`. Pointer→world: `cam.x+(clientX-innerWidth/2)/S` (used in `aimTo` and pinch handler).
- **`camClamp()`** locks view inside world when viewport smaller than map (centers an axis otherwise). `cam.z ∈ [1,ZMAX=6]`.
- **`camFollow(dt)`** (end of `update`) smoothly targets active worm, midpoint of worm+target for targeted weapons, or first live non-mine projectile during settle.
- **`camManual`** pauses following. `panCam(dx,dy)` pans by screen px and sets it. Movement input, fire, jump, charge, aim-tap and `startTurn` clear it.
- **`resize()`** recomputes `dpr` (cap 2), canvas bitmap, `fit`, vignette canvas, re-clamps camera.
- **All gameplay code speaks logical pixels only.** Never use CSS pixels in game logic.

### Terrain & Collision
- **`genTerrain()`** rasterizes layered sine noise + Gaussian bumps into a `terrain` canvas (surface heights sampled every 4 px). Ground is fully solid below surface — no buried voids.
- **Floating islands (`isl>0`):** `islands[]` of `{cx,hw,ty,th}` blobs. `seg=W/isl`, `hw≤seg*.38`, jitter ±.07seg so they never overlap, bottoms stay above `WATER0`. Spawn slots spread per island.
- **`mask`** (`Uint8Array`, W×H) rebuilt from alpha>100. `solid(x,y)` reads it.
- **`crater(x,y,r)`** — cuts canvas (dark rim + destination-out) and zeroes mask. THE ONLY explosion-style terrain change. No-ops for `r<=0`.
- **`tunnel(x,y,r)`** — rim-less variant (destination-out + mask only).
- **`tunnelSeg(x0,y0,x1,y1,r)`** — capsule form. Used by kamikaze, mole, blowtorch.
- **`hit(x,y)`** — tests 14-point worm hitbox (`PTS`, coffin silhouette ~9×16 px).
- **`wormHit(w,x,y,pad)`** — same coffin expanded by projectile mask. Rockets/missiles pad 3, shotgun/uzi pad 1, mines pad 8, sheep pad 3.
- **`walk()`** climbs up to 8 px. Coffin slips through worm-wide hole (10 px in integer mask grid).
- **`hitW(w,x,y)`** — tests terrain mask + other worms + `propSolid()`. Used by `walk()`, `stepWorm()` gravity, `doTeleport()`.
- **`propSolid(x,y)`** — 18×22 box of live barrels + ±5/±6 box of armed mines.
- **Water line `WATER`** starts at `WATER0=725`, rises during sudden death.

### Core State (Module-Level Globals)
- **Entity arrays:** `worms, proj, parts, texts, tracers, crates, graves, rings, leaves, clouds, pend, rain, snow, fireflies, bolts, barrels, barFx, fires, gas`.
- **`state`:** `'menu' | 'aim' | 'settle' | 'over'`.
- **Turn:** `turnTeam` (0–3), `turnNo`, `cur` (active worm), `cursor[team]`, `retreat`, `quiet`/`settleT`.
- **Teams:** `teamCount` (2–4). `TC[4]`/`TN[4]` colors/names. `aiOn[4]`, `wins[4]`, `kdmg[4]`, `kills[4]`, `ammo[4]`, `lastWpn[4]`.
- **Settings:** `perTeam, diff, maxHP, turnSec, guide, muted, hap, radar, low, skyIdx, terIdx, wxIdx, teamCount, schIdx, windK, cratesOn, barrelsOn, barrelOil, barrelDrum, mapIdx, isl, wsel, gravIdx, sdIdx, retIdx, fuelIdx, colIdx, autoRep, uiTheme, songOn, customs[]`.
- **`inp`** — walk/aim booleans (+`jet`). **`aimDrag`** — map-drag aiming. **`paused`** — sim paused.
- **`jumpT`** — last jump timestamp (double-tap backflip). **`jetSndT`**/**`walkSndT`** — SFX throttles.
- **`lastWpn[team]`** — per-team weapon memory. **`target`** — chosen spot for targeted weapons. **`wepList()`** — active shelf.
- **`dmgBoost`** — 1.5x Damage armed for rest of turn.
- **Jetpack:** per-worm `fuel` (0–`FUEL`). Thrust `JET_T=1000`, drain `JET_DRAIN=55`/s.
- **Flying Saucer:** per-worm `sau` (0–`SAU_F=240`). Thrust `SAU_T=1500`, drain `SAU_DRAIN=38`/s.
- **Kamikaze:** `w.kam` + `w.kdx`/`w.kdy`. Charge speed 380 px/s, gravity-free.
- **Match restart:** `matchSnap` snapshot. `restartMatch()` restores from copy.
- **Explosions & feedback:** `explode()` shake `Math.min(26,r/4.5)`, haptics for `r≥60`, `boomFx`. Kill combos: DOUBLE/TRIPLE/QUAD KILL within 1500 ms. Killcam slow-mo when match ends.
- **Fire & poison:** `fires[]`, `gas[]`. Ground fires deal 5 silent damage every 0.45 s. Poison caps at 2 stacks, 5 HP/turn (never fatal). The shield absorbs the poison tick (it is consumed, not bypassed). The shield lives until the owner's **next** turn starts (it is cleared after the poison tick), so it can also block a blast during the opponent's turn — unlike `invuln`, which expires at the start of the next turn.
- **Turn replay:** `rec` records at 20 Hz. `lastMovie` stored on turn end. Replay re-stamps events on copied terrain canvas.

---

## Turn Flow

```
startTurn() → sudden-death check → wind reroll → crate spawn → restore lastWpn → refill fuel → banner
Player acts: walk (58 px/s) → aim (clamp −1.2…1.45 rad) → charge (0.75/s) → jet (fuel-limited) → fire
After firing: state='settle' → retreat window (0/3/6 s, skip with FIRE) → turn ends when quiet (quiet>1) or 25 s hard cap
endTurn() → next living team → gameOver() if ≤1 team remains
```

**Sudden death (turn ≥ sdTurn):** sea rises 20 px/turn, all worms take 5 wither/turn from turn 17, 60% meteor chance from turn 19.

**Retreat expression:** `(wpn==='sheep'||wpn==='skunk'||wpn==='dragon'||wpn==='kamikaze'||wpn==='suicide'||aiOn[turnTeam])?0:RETV[retIdx]`

---

## Gravity & Damage

- **`G=620`**, scaled to `GV=G*GRAVK[gravIdx]` (Low .6 / Normal 1 / High 1.5). Applied to worms, projectiles, animals, barrels, crates, aim guide, AI simBaz/planShot. Graves stay cosmetic.
- **`stepWorm()`** applies gravity with sub-stepping. Fall damage when `vy>480`: `round((vy-480)/9)`.
- **`damageWorm(w,d,by,silent)`** — stats tracking, flash, floating number. Shield absorbs one hit. Invuln blocks all. dmgBoost multiplies by 1.5.
- **`killWorm(w,drown,by)`** — MUST set `w.hp=0`. Combo tracking for enemy kills only.
- **Drowning:** `w.y>WATER-6` or off-map (±30) → `killWorm(w,true)`.
- **`explode(x,y,r,dmg,by,kb)`** — crater + radial knockback/damage (`f=1-d/(r+14)`), crate destruction, mine chain reactions, rings, screen shake.

---

## Weapons System (44 weapons)

### Shelf & Selection
- `WEP` array drives shelf order. Array index → id.
- `wepList()` returns active shelf (Bazooka Only returns just bazooka).
- Custom drop-up built by `buildWeps()`. `#weps` button shows active weapon icon/name/ammo.
- `updateWeps()` rebuilds on fire, crate pickup, turn start.
- Keyboard `1–7` maps into `wepList()` indexes.
- `fire()` refuses anything not in `wepList()` or with `ammoOf(...)===0` (except saucer landing).

### AIMLESS (no aim change on map tap)
`'dynamite','mine','sheep','cow','firepunch','skunk','saucer','xdmg','invuln','parachute','prod','suicide','skip','shield','earthquake','vampire','girder','vacuum'`

### TARGETED (tap map, then FIRE)
`'airstrike','teleport','homing','magic','lightning','carpet','nuke','pigeon','donkey'`

### CHARGE (charge on hold)
`'bazooka','grenade','holy','cluster','bunker','homing','magic','banana','dragon','mole','napalm','bundle','sticky','rubber'`

### Weapon Table

| id | Type | Ammo | Special |
|---|---|---|---|
| `bazooka` | Rocket | ∞ | Wind-affected, explodes on contact after 0.25s grace |
| `grenade` | Bouncing | ∞ | 3s fuse, bounces off worms |
| `dynamite` | Dropped | 2 | 4s fuse, r78 dmg80 |
| `shotgun` | Hitscan | ∞ | 2 shots, 0.5s spacing, r16 dmg26 |
| `airstrike` | Targeted | 1 | 5 bombs via pend |
| `teleport` | Targeted | 2 | Validates spot (≥24px below sky, above water, in bounds) |
| `sheep` | Animal | 1 | Wanders, detonates on enemy <18px or 8s fuse; FIRE detonates |
| `cow` | Animal | 1 | Herd of 3, 95 px/s, explodes on any worm/wall/edge/10s fuse |
| `xdmg` | Utility | 2 | Sets dmgBoost, returns early (no settle) |
| `kamikaze` | Charge | 2 | Suicidal dig, explodes on contact/bounds/water/timeout |
| `minigun` | Hitscan | 1 | 16 shots, dmg6, spread .09, 0.07s spacing |
| `firepunch` | Melee | ∞ | Uppercut 22px ahead, 60px above, 30 dmg, carves terrain |
| `invuln` | Utility | 2 | Immune to damage/fall/poison for rest of turn |
| `mine` | Projectile | 1 | Arms after 2s, trigger <17px, persists across turns |
| `holy` | Lobbed | 1 | r85 dmg75, choir SFX |
| `cluster` | Lobbed | 1 | Splits into 4 bomblets on fuse/water |
| `uzi` | Hitscan | 2 | 6 shots, spread, 0.12s apart |
| `torch` | Instant | 1 | Carves ~110px tunnel, 10 dmg/worm |
| `homing` | Targeted+Charged | 1 | Flies 150px straight then homes ≤3 rad/s, duds after 5s |
| `bunker` | Rocket | 1 | 3 stacked blasts (r50/34/28) carve vertical tunnel |
| `magic` | Targeted+Charged | 1 | Superweapon, r88 dmg85 holy-sized blast, 9s timeout |
| `banana` | Lobbed | 1 | 3s fuse, splits into 5 bananas |
| `dragon` | Bouncing | 1 | Very bouncy, no retreat, FIRE detonates, 6 bounces auto |
| `mole` | Drilling | 2 | Tunnels through rock, explodes on emerge/worm/5s/water |
| `lightning` | Targeted | 2 | 5 jagged bolts, r30 dmg40 |
| `saucer` | Utility | 1 | Boards craft, fly underwater, FIRE lands |
| `cow` | Animal | 1 | Herd of 3 |
| `napalm` | Charged lob | 1 | Bursts into ground fires |
| `bundle` | Charged lob | 1 | Pops into 3 dynamite sticks |
| `carpet` | Targeted | 1 | 5 bombers strafe target |
| `nuke` | Targeted | 1 | r190 dmg140 + 2× r88, mushroom cloud |
| `pigeon` | Targeted instant | 1 | Flies through terrain, r40 dmg70 |
| `skunk` | Animal | 1 | Collects crates, sprays poison gas, FIRE detonates |
| `parachute` | Utility | 2 | Glide, steer, land without fall damage, turn continues |
| `prod` | Instant | 3 | Shoves worm (no damage) |
| `suicide` | Instant | 2 | Sacrifices worm, poison cloud |
| `skip` | Instant | ∞ | Ends turn immediately |
| `shield` | Utility | 2 | Absorbs one hit (damage/fall/poison), then shatters |
| `earthquake` | Instant | 1 | Damages all grounded enemies, no crater |
| `vampire` | Melee | 2 | Drains 35 HP, heals attacker |
| `sticky` | Charged lob | 2 | Sticks on first contact (`p.stuck`, no gravity, no rest-wake), detonates after 3.5s |
| `rubber` | Charged lob | 2 | 4s fuse with a visible countdown, near-perfect restitution — ricochets wildly before blowing |
| `donkey` | Targeted | 1 | Drops a concrete donkey from the sky at the marked spot; it smashes down to the waterline, carving one smooth straight shaft (a `tunnelSeg` per solid span per frame, never stacked circles), hammering worms in the column, shaking nearby worms loose and setting off crates and barrels on the way (your own team is spared) |
| `girder` | Utility | 2 | Places solid 80×8 platform (never inside a worm) |
| `vacuum` | Utility | 2 | Pulls all crates toward worm |

**Ammo:** `ammo[team]` object; missing keys = unlimited. Always use `useAmmo(id)`.

### Damage Baseline (Worms Armageddon, 3-star power)

Weapon damage follows WA's published default values (WA manual + Neoseeker W:A Weapon Guide tables). Do not "balance" these silently — a change here is a fidelity change.

| Weapon | WA dmg | Weapon | WA dmg |
|---|---|---|---|
| Bazooka | 50 | Homing missile | 50 |
| Grenade | 50 | Homing pigeon | 75 |
| Cluster bomb | 20 + 20 × 5 clusters | Holy grenade | 100 |
| Banana bomb | 75 (main + each banana) | Magic bullet | 100 |
| Shotgun | 25 × 2 | Dynamite | 75 |
| Uzi | ~8 × 6 | Mine | 50 |
| Minigun | 6 × 16 | Sheep / Mad cow | 75 |
| Fire punch | 30 | Dragon ball | 30 |
| Kamikaze | 30 | Mole bomb | 30 |
| Suicide bomber | 30 + poison 5/turn | Blowtorch | 15 per worm |
| Airstrike | 30 per bomb (×5) | Carpet bomb | 30 per bomb |
| Concrete donkey | 100 per worm hammered | Barrel | 60 |

**Custom schemes:** `customs[]` in `gb_csch`, max 24 on load. `schAll()` = `SCH` + customs.

---

## AI System

- `aiTurn(dt)` — state machine: `wait → think → (gun | strike | walk | aim → charge) → done`.
- `DIFF[diff]` — Baby/Easy/Normal/Hard/Brutal. Tunes aim error, power error, walk threshold.
- Baby/Easy pick targets randomly; Normal+ targets lowest-HP enemy.
- CPU teams: first `ceil(teamCount/2)` are human (hot-seat), rest are CPU. 4 teams = 2v2.
- AI never gets retreat window. AI weapon choice gated by `has(id)` + `ammoOf()>0`.
- Walk-phase blocked worms fire 0.6s jet burst from same fuel budget.
- `humanTurn()` gates player input. `inp` never steers AI worm.

---

## Rendering Pipeline

Painter's order per frame:
1. Shake → 2. Background → 3. Parallax clouds → 4. Terrain → 5. Graves → 6. Crates → 7. Barrels → 8. Fires → 9. Worms (jet flame + poison) → 10. Gas → 11. Aim aids (barrel, reticle, guide arc, charge dots, arrow, fuel gauge) → 12. Projectiles → 13. Tracers/rings → 14. Particles → 15. Leaves → 16. Weather → 17. Water → 18. Floating texts → 19. Crate radar → 20. Vignette.

- `hud()` updates DOM bars, clock, wind meter (clamped 50% width), tips.
- Team chips built once per game by `buildTeams()`.
- **High graphics (default):** detailed worm sprite (`drawWormHi`), high-detail terrain (grass fringes, strata, pebbles), layered sky + cached cloud sprite, gradient water with shimmer, `drawProjHi` glow/trails, richer fire/gas/props and a filmic vignette. Every upgrade gated on `!low` (glow/trails on `!low&&!med`).
- **Medium graphics:** keeps detailed terrain, cloud sprites, fire/gas and the vignette (DPR still 2) but trims particle counts, glow halos, tracer glow, rain/snow density and the ground-splash debris count — `!med&&!low` gates the expensive extras.
- **Low graphics:** caps DPR at 1, no clouds/leaves/fireflies/rain/snow/vignette, coarsens water mesh. Cosmetic only — must never change gameplay.

---

## Game Loop

`frame()`: `requestAnimationFrame`, `dt=min(33ms, elapsed)` scaled by `slowT>0?0.35:1`, then `update(dt)` + `draw()` + `hud()` + `songCheck()`. `slowT` decays on the **same scaled clock** as the simulation, so it measures game-time. `paused` freezes sim but keeps rendering. The frame `catch` shows a rate-limited `showError()`.

---

## Input System

- **Buttons:** `[data-k]` elements use pointer capture. `#fire` press-and-hold. `#jump`. `#rst` restart. Weapon shelf rebuilt by `buildWeps()`.
- **Canvas:** tap selects own worm (<22px, Worm Select on) or aims. Drag aims. Two pointers = pinch zoom + midpoint pan. Right/middle drag = `panDrag`. Wheel zooms. `+`/`-`/`=` keys zoom.
- **`PC` check:** UA + maxTouchPoints. Adds `body.pc`. Desktop hides touch pads, shows crosshair, mouse aim + wheel zoom.
- **`rotCheck()`:** shows `#rot` overlay in portrait on touch devices. Pauses sim. Exits on PC.
- **Keyboard:** `KM` maps arrows/WASD. `keyOf()` lowercases (CapsLock-proof). Space charge, Enter/Shift jump, J jetpack, `+`/`-` zoom, 1–7 weapon, P/Esc pause, H help, R replay, S slow-mo (replay).
- **Backflip:** double-tap jump within 350ms → backwards somersault. Third tap → low backflip.
- **Help overlay:** pauses sim, restores paused state on close. Swallows keys while open.
- **Settings/Customize overlays:** mirror pause dance. `#schemedit` closes on Esc.
- **Replay keys:** FIRE cycles play/3×/pause, S slow-mo, Esc/Enter/🎬 close.
- **Pause must gate every action entry point:** `fire`/`startCharge`/`jump`/`setWpn`.

---

## Persistence (localStorage)

All reads wrapped in try/catch (private-mode safe). 30+ keys. See full table in original AGENTS.md. Key ones:

| Key | Default | Notes |
|---|---|---|
| `gb_ui` | modern | modern/classic/gruvbox/tokyo/dark/nord/oled |
| `gb_diff` | 2 (Normal) | Baby-shifted migration via `gb_dv` |
| `gb_wnd` | 1 | Index→value migration via `gb_wndv` |
| `gb_hp` | 100 | Legacy 0–2 index migration |
| `gb_tt` | 30s | Legacy 0–3 index migration |
| `gb_csch` | unset | Custom schemes JSON, max 24 |
| `gb_hap` | on | Haptics |
| `gb_barl` | on | on/oil/drum/off |

---

## Conventions (Code Style)

- **Compact vanilla JS:** terse names, dense one-liners, section dividers `/* ---------- x ---------- */`.
- **Match surrounding style.** Do not reformat. Do not "clean up."
- **No comments beyond section dividers** unless genuinely needed.
- **Logical pixels everywhere.** Canvas handles scaling.
- **New weapons:** append to `WEP`, add `fire()` branch, handling in `updateProj()` and visual in `drawProj()`, starting ammo in `SCH` loadouts, crate pool in `pickCrate()`, README tables. Utility weapons return/resolve inside `fire()`.
- **New settings:** `<select>` or `<input type="range">`, load in localStorage try block, handle in `selCh()` + bind list + `syncUI()`, document in README.
- **Commit messages:** one imperative summary line, details after colon.

---

## Change Checklist (Mandatory)

1. Edit `index.html` (and README if features changed).
2. `make check` → `SYNTAX OK` + size sync.
3. `make sync-size` → update README size line.
4. Re-run `make check`.
5. Manual smoke test (below) for systems touched.
6. `make publish MSG="..."` (only when user asks) — runs `verify`, must show `"status":"built"` and `live: 200`.

---

## Manual Smoke Test (80+ items)

### Core Gameplay
- [ ] Start both modes (Local Multiplayer, vs Computer) and each difficulty.
- [ ] 4 teams vs Computer → 2v2 split (two human, two CPU).
- [ ] Fire weapons from dropdown; verify ammo decrements, unlimited stay unlimited.
- [ ] Try each scheme: Greedy (all unlimited), Pro Mode (no airstrike), Bazooka Only (single weapon).
- [ ] 4 teams: HUD chips, team names, banner colors, turn arrows cycle through living teams.
- [ ] Wind on Storm: meter stays in HUD, rockets bend hard.
- [ ] Targeted flow: airstrike/teleport/homing/magic — tap map, reticle appears, FIRE works.
- [ ] Sheep: release, detonate via FIRE, enemy-touch detonation.
- [ ] Mad Cows: herd of 3, explode on first worm/wall, splash in water.
- [ ] Mine: drop, walk away, arming delay, proximity trigger, chain reaction, walk into armed trips before solid block.
- [ ] Kill and drown worms: HUD bars drop to 0 (no ghost HP), graves appear and sink.
- [ ] Retreat: move after firing, FIRE skips, turn ends when quiet.
- [ ] Pause mid-flight; actions while paused ignored.
- [ ] Keyboard: walk, CapsLock on, blur mid-walk (no runaway).

### Physics & Collision
- [ ] Blast worm-wide hole, drop worm in — slips through.
- [ ] Climb 8px ledge automatically.
- [ ] Walk into worm — blocked or climbed.
- [ ] Stand on worm's head; move bottom worm → top falls.
- [ ] Grenade bounces off worm body, rests on head until fuse.
- [ ] Mine arms into "mine hat" on worm head.
- [ ] Rockets explode on contact (not bounce).
- [ ] Barrels: shoot → erupts, chains. Jump on (solid, 22px). Blast ground → drops. Rising water deletes submerged.

### UI & Controls
- [ ] PC: touch pads hidden, mouse aim + wheel zoom, hint shows keyboard, no rotate overlay.
- [ ] Rotate to portrait → reminder shows, sim pauses. Rotate back → resumes.
- [ ] Ammo shelf: empty weapon greys ×0, CPU stops choosing, "Out of ammo" tip.
- [ ] Weapon shelf: opens panel, follows active weapon, greys empty, closes on outside tap, 1–7 keys.
- [ ] Backflip: double-tap jump → somersault, third tap → low backflip.
- [ ] Help: H opens, pauses, Esc/H/P closes, restores paused state.
- [ ] Settings: pauses while open, resumes on close.
- [ ] Customize: Done/Esc closes, all settings persist.
- [ ] Worm Select: tap own worm → switches, fuel bar follows.
- [ ] Jetpack: hold 🚀/J, fuel drains, stops at 0, refills next turn.
- [ ] Saucer: FIRE boards, fly underwater, FIRE lands, dry over water drowns.
- [ ] Parachute: glide, steer, land no damage, turn continues.
- [ ] Replay: 🎬/R, FIRE cycles play/3×/pause, S slow-mo, Esc/Enter closes, Auto Replay works.
- [ ] Restart: 🔄 confirms, restores same match from snapshot.
- [ ] Share: native sheet on phone, copy on desktop.

### Weapons (new)
- [ ] Homing missile: mark target, charge, homes in, duds after ~5s.
- [ ] Bunker buster: 3-blast tunnel.
- [ ] Magic bullet: spirals to mark, holy-sized blast, 1 per team, 9s timeout.
- [ ] Banana bomb: 5 bananas burst in sequence.
- [ ] Dragon ball: bounces, FIRE detonates, 6 bounces auto, extra knockback.
- [ ] Mole: tunnels, explodes on emerge/worm/5s/water.
- [ ] Lightning: 5 bolts, hits above cover.
- [ ] Minigun: 16 bullets.
- [ ] Kamikaze: charges, detonates, always kills worm.
- [ ] 1.5x Damage: arms for turn, HUD shows 💪, damages 1.5×.
- [ ] Shield: absorbs one hit, shatters.
- [ ] Earthquake: damages grounded enemies.
- [ ] Vampire: drains 35, heals.
- [ ] Sticky bomb: sticks, detonates 3.5s.
- [ ] Rubber nade: bounces wildly.
- [ ] Girder: places solid platform.
- [ ] Concrete donkey: vertical shaft.
- [ ] Crate vacuum: pulls crates.

### Edge Cases
- [ ] Sudden death: turn 16 sea rise + wither, meteors.
- [ ] Win match: confetti, score summary, menu returns.
- [ ] All teams dead → draw.
- [ ] 3-4 teams with dead teams → endTurn skips correctly.
- [ ] Scheme deletion leaves empty editor (no ghost).
- [ ] Import schemes round-trips.
- [ ] Graphics toggle: High / Medium / Low — Low strips weather/decor, High keeps everything, Medium trims particle counts/glow for mid-range phones.
- [ ] Theme switch: all 8 themes render correctly.
- [ ] Resize/rotate: HUD safe areas, fullscreen toggle.

---

## Deployment

- GitHub Pages from `main`. Build takes ~30–60s after push.
- `make verify` waits 45s, checks `gh api repos/.../pages/builds/latest` for `status: built`, curls live URL expecting `200`.
- Never force-push. Deploy only from green `make check`.

---

## Pitfalls (Things That Have Bitten Us)

### Critical (will break the game)
1. **`killWorm` must set `w.hp=0`** — drowned/wither-killed worms show ghost HP otherwise.
2. **Worm mask is deliberately narrow (9×16 coffin)** — narrower than the ~17px drawn sprite. Don't "fix" `PTS`/`halfW` to match artwork.
3. **Movement/terrain checks must use `hitW(w,...)`** — plain `hit()` ignores other worms and solid props.
4. **Solid props are part of `hitW` via `propSolid()`** — barrel 18×22, armed mine ±5/±6. Mine trigger pad (8) must exceed solid half-width (5).
5. **Barrel physics is vertical-only** — `updateWorld()` never moves `b.x`. `barrelAt()`/`boxNorm(barrel,x,y,9,11)` for projectiles.
6. **Don't make crates solid** — in Worms Armageddon they're walk-through pickups.
7. **Resting projectile wakes when support disappears** — terrain, barrel, OR worm. Dropping worm term burns dragon's 6 bounce taps in 6 frames.
8. **Keyboard goes through `keyOf()`** — without it, CapsLock breaks WASD.
9. **Clear `inp` on `window blur` and `aimDrag` on `pointercancel`** — inputs stick after interruptions.
10. **`endTurn()` must skip dead teams** — naive `(turnTeam+1)%teamCount` spins forever with 3-4 teams.
11. **Camera removed `sc`/`ox`/`oy`** — pointer→world is always `cam.x+(clientX-innerWidth/2)/S()`.
12. **`W`/`H` are dynamic** — `newGame()` sets `W` from `MAPS[mapIdx]`. Anything cached at boot must be rebuilt.
13. **Jetpack gated in `stepWorm()`** — human: `inp.jet && !aiOn[turnTeam]`, AI: `w.aiJet>0`. Fuel refilled per team in `startTurn()`.
14. **`startTurn()` re-clamps `wpn`** from `lastWpn` — schemes can remove weapons.
15. **`lastTick` must reset to 99** in `startTurn()` or countdown ticker misbehaves.
16. **Rockets skip shooter for 0.25s** (`p.age>.25`); sheep and cows exclude `e!==p.shooter`. **Mines do NOT** — WA lets you blow yourself up on your own mine, so the mine trigger tests every worm, yours included.
17. **`retreat` expression** — AI, sheep, skunk, dragon, kamikaze, suicide get no retreat. Parachute returns before this line.
18. **Replay safety** — early-return `fire()` branches skip `startRec()`. Restart/quit null `rec`/`rep`/`repC`/`lastMovie`.
19. **Digs must use `tunnelSeg()`/`tunnel()`**, never `crater()` — crater discs paint scorch rings. Keep mole trail ≥10px behind head (`lim=md-10`).
20. **`crater()` no-ops for `r<=0`** — prevents phantom scorch marks in replays.
21. **Exploded barrels must be skipped in `drawReplay()`** — `if(!b2.dead)`.
22. **`schIdx` must be clamped** in `buildSchSel()` after scheme deletion.
23. **`cycleAmmo()` must clamp to nearest `VALS`** — imported values (7, 9) aren't in the ladder.
24. **Stale game-over message** — `newGame()` must reset `#msg`.
25. **Dead code removal** — remove invuln tip in `startTurn()` (fires after clearing invuln).

### High (will cause bugs)
26. **Never decrement ammo directly** (`ammo[team][id]--`) — absent keys become `NaN`. Use `useAmmo(id)`.
27. **Weapon index math** — dropdown maps option index into `wepList()`; keys 1–7 do same. Never assume raw `WEP` indexes.
28. **Don't rename DOM ids** — `$()` lookups depend on them. Full list in original AGENTS.md.
29. **Team names via `innerHTML`** on game-over screen — always `esc()`. Elsewhere `textContent`.
30. **Keep `index.html` a single file** — if it grows, tighten code, don't split.

### Medium (will look or feel wrong)
31. **Every projectile needs a detonation trigger** — the generic path is `updateProj()`'s `if(p.fuse!==undefined&&!dead)`. `rubber` shipped without a `fuse`, so it never blew up, `proj.every(p=>p.type==='mine')` stayed false and every later turn burned the full 25 s settle cap.
32. **Unlimited-in-`SCH` weapons still need `useAmmo(id)`** — `bazooka`, `grenade`, `shotgun` and `firepunch` are absent from the built-in ammo objects (⇒ unlimited), but the scheme editor can give them a finite count. `useAmmo()` is a no-op when the key is absent, so always call it.
33. **Melee/AoE weapons must skip the shooter and their own team** — `vampire` healed 35 HP when it drained a teammate; `donkey` damaged the shooter. Test `e!==w && e.team!==w.team` and heal only what was actually drained (`min(35,e.hp)` measured before the hit).
34. **Digs use `tunnel()`/`tunnelSeg()`, never `crater()`** — `donkey` looped `crater()` down the column and painted a black scorch stripe, then `tunnel()` painted a column of overlapping circle lips. The donkey collects the solid-cell span each frame and carves ONE `tunnelSeg(p.x, y-prev, p.x, lastSolidY, 17)` per frame, so successive segments share endpoints and the union is a clean rod.
35. **`cycleAmmo()` ladder** — ∞ is `VALS[0]=-1`, so "+" must skip the `0` rung (∞ → 1) and "−" on ∞ is a no-op. Imported counts are snapped onto `VALS` (7 → 6, 9 → 8) so ± stays consistent with what the panel shows.
36. **`gb_wndv` is the "wind value is a multiplier" marker** — write it whenever `gb_wnd` is stored (and unconditionally at boot), or the legacy index→multiplier migration re-runs and silently rewrites a legitimate wind value (0 → 0.5, 2 → 1.75).
37. **Replay frames are timestamped, not indexed by a fixed stride** — `tickRec()` keeps the `.05` overshoot (`rec.acc-=.05`) and `tickReplay()` walks the recorded frame times; `repFrame()` interpolates with the real `a.t`/`b.t`. A fixed `floor(t/.05)` freezes the last 17–25 % of every replay.
38. **The recorder must exist before the terrain changes** — call `startRec()` *before* `tunnel()`/`tunnelSeg()` in the fire-punch, torch, girder and donkey branches, and let the shared tail re-use it (`if(!rec)startRec()`) instead of re-creating it.
39. **Pause and every overlay must cancel a charge** — `charging`/`power` survive a pause, so a shot fires by itself (or is silently swallowed) on resume. Reset `charging=false;power=0` in `togglePause`/`toggleHelp`/`toggleSettings`/`rotCheck`.
40. **The weapon shelf panel must close on fire and on turn change** — `closeWepPan()` in `fire()`, `endTurn()` and `startTurn()`, otherwise it covers the playfield and survives turn boundaries.
41. **Theme rules must not use the `background` shorthand on `.crow select`** — it resets `background-image` and the chevron disappears. Use `background-color` and keep the base rule's image.
42. **The menu card needs its own surface** — in the non-modern themes `#menu` and `.card` shared `var(--bg2)`, so the card vanished into its own backdrop. Give `.card` `var(--bg)` (OLED Dark: `#101010`).
43. **localStorage reads are individually guarded** (`lsGet`/`lsSet`) — one throw in the boot block used to discard every setting read after it.
44. **The girder must not materialise inside a worm** — a worm inside the 80×8 slab can neither walk (the climb is 8 px) nor fall (`hitW` blocks it) and is frozen for the whole match. Skip mask cells that overlap a living worm's hitbox.
45. **The settle gate must ignore saucer riders** — a worm in the flying saucer never touches the ground (`w.air` stays true), so `worms.every(w=>!w.alive||!w.air)` never passes and the turn burns the full 25 s cap. Use `!w.air||w.sau>0` and allow landing during the settle.
46. **Per-turn resets must not cancel a mid-air state** — clearing `w.para`/`w.chute` for every worm at every turn start makes a gliding worm free-fall (and take fall damage) the moment the turn passes. Only clear them for grounded worms.
47. **Every recorded replay event needs a handler** — `explode()` records `{k:'b'}`; without a `'b'` branch in `tickReplay()` the replay shows the crater but no flash, ring or sound.
48. **The wind migration must persist its result** — after converting a legacy index to a multiplier, write the value back to `gb_wnd`, or the next boot re-reads the raw index.
49. **Solid props must not teleport worms** — the barrel push-out used a band wider than the barrel's own box (±14/±18.5 vs ±9/±11), so a worm standing *near* a barrel was shoved 16 px every frame. Use the barrel's real hitbox.
50. **The AI needs an out when it has no usable weapon** — `endTurn()` from `aiTurn()` can cycle forever if every team's ammo is 0. Count dry turns (`dryTurns`) and end the match as a draw.
51. **The death feed must show every death** — `killWorm()` only pushed a feed entry when `by!=null&&by!==w.team`, so drowned worms (and suicides) never appeared in the ☠ feed. Unattributed deaths get their own entry (drowned / went out with a bang) without touching the kill stats.
52. **Utilities that need a spot must be in `TARGETED`** — the concrete donkey is dropped from the sky at the marked spot, not at the shooter's feet; `AIMLESS` weapons ignore the tap, so a targeted weapon left in `AIMLESS` can never be aimed.
53. **Worm HP has no upper cap** — health crates and the vampire can push `w.hp` ABOVE `maxHP` (start HP), like Worms Armageddon's health-beyond-base healing. Never clamp `w.hp` to `maxHP`; the team HUD bar must clamp its width (`Math.min(100, s/(perTeam*maxHP)*100)`). The HP slider spans 50–500 and stored values are floored at 50 only — no `Math.min(200,...)`.
55. **A charge belongs to whoever started it** — `startCharge(src)` records `chargeHuman`/`chargeSrc`; `releaseFire(src)` refuses when the charge is the AI's (`chargeHuman` false) or the release comes from the other device. Without this the player can hijack the CPU's charge and fire its shot at partial power.
56. **Barrel and oil-drum blasts must carry the team** — `explode()` pushes `{x,y,oil,by}` into `barFx`; the drain explodes with `b.by`. A `null` team means no kill credit and no kill-feed entry for a 60-damage barrel kill.
57. **The AI must solve with the weapon's own muzzle speed** — `planShot(w,tg,dir,wpn)` uses `GUIDE_V[wpn]`, never a hardcoded bazooka curve, or the AI's bunker shots solve for a shell it never fires.
58. **Landing the saucer must not kill you** — on landing set `vy=0` and `para=true` so the worm glides down; otherwise a high flight ends in lethal fall damage.
59. **A mine must not detonate twice** — `explode()` sets `p.struck` and queues the mine in `chainFx`, which drains after `updateProj`; the mine's own trigger must test `!p.struck` or it can fire again in the same frame.
60. **`startTurn()` must always leave a playable state** — if the team has no living worm, call `endTurn()` instead of `return`; a bare `return` leaves `state='settle'` and the turn is consumed with nobody owning it.

54. **Weapon damage is WA-fidelity, not balance** — grenade 50, holy 100, cluster 20 + 20×5, banana 75, shotgun 25×2, uzi 8×6, sheep/cow 75, dragon ball 30, mole 30, homing 50, pigeon 75, magic 100, dynamite/mine 75/50, kamikaze 30, suicide 30 + poison, blowtorch 15, donkey 100, airstrike/carpet 30 per bomb, barrel 60. See the Damage Baseline table. The aim-guide `GUIDE_V` map must mirror each weapon's real `fire()` speed — same source of truth, never a second hand-tuned table.

---

## Function Reference (Critical APIs)

### Terrain
- `solid(x,y)` — returns true if mask cell is solid.
- `hit(x,y)` — tests 14-point worm hitbox against terrain.
- `hitW(w,x,y)` — tests terrain + worms + props.
- `wormHit(w,x,y,pad)` — coffin hitbox expanded by pad.
- `normalAt(x,y)` — estimates bounce normal from mask.
- `crater(x,y,r)` — removes terrain (r>0 only).
- `tunnel(x,y,r)` — rim-less crater.
- `tunnelSeg(x0,y0,x1,y1,r)` — capsule tunnel.
- `barrelAt(x,y)` — finds barrel at position.
- `boxNorm(o,x,y,hw,hh)` — box collision normal.
- `propSolid(x,y)` — barrel/mine solid check.

### Worms
- `stepWorm(w,dt)` — physics step (gravity, jet, para, kamikaze).
- `walk(w,dir,dt)` — walk with 8px climb.
- `jump()` — jump/backflip.
- `damageWorm(w,d,by,silent)` — apply damage.
- `killWorm(w,drown,by)` — kill (must set hp=0).
- `wormAt(self,x,y)` — check if any worm at position.

### Projectiles
- `updateProj(dt)` — projectile physics.
- `drawProj(p)` — projectile rendering (calls `drawProjHi` in high mode first).
- `drawProjHi(p)` — high-graphics overlay: additive muzzle flash, speed trail and type-specific glow (`PGLOW`).
- `drawWater(t,lv)` — water rendering, gradient/shimmer in high mode.
- `explode(x,y,r,dmg,by,kb)` — explosion.
- `fire()` — weapon dispatch.
- `startCharge()` — charge or fire.
- `releaseFire()` — release charge.

### Rendering
- `draw()` — main draw loop: background, terrain, worms, props, projectiles, particles, weather, water, effects. High mode branches gated on `!low`.
- `drawWorm(w)` — worm rendering; delegates to `drawWormHi` in high mode.
- `drawWormHi(w,d)` — detailed worm sprite (team-tinted body, gradient, eyes, jet/saucer).
- `drawFire(f)` / `drawGas(g)` — high-mode flames with shared gradient / gradient-free gas blobs.
- `drawBarrel(b)` / `drawCrate(c)` / `drawGrave(g)` / `drawCloud(c)` — high-mode gradient/shaded versions.
- `mkVig()` — filmic vignette (light leak + grain), recreated on resize/theme in high mode.

### Game Flow
- `newGame(mode)` — new match.
- `startTurn()` — begin turn.
- `endTurn()` — end turn, advance.
- `gameOver(t)` — end match.
- `restartMatch()` — replay same match from snapshot.
- `captureSnap()` — snapshot for restart.

### Camera
- `camClamp()` — clamp camera to world.
- `panCam(dx,dy)` — pan camera.
- `zoomBy(k)` — zoom.
- `camFollow(dt)` — follow target.
- `resize()` — recompute on resize.

### UI
- `hud()` — update HUD DOM.
- `banner(t,c)` — show banner.
- `tip(m,t)` — show tip.
- `buildTeams()` — build team chips.
- `buildWeps()` — build weapon shelf.
- `updateWeps()` — update weapon shelf.
- `toggleHelp(on)` — help overlay.
- `toggleCustom(on)` — customize overlay.
- `toggleSettings(on)` — settings overlay.
- `togglePause()` — pause/unpause.

### Schemes
- `schAll()` — all schemes (built-in + custom).
- `wepList()` — active weapon list.
- `ammoOf(id)` — ammo count (Infinity if unlimited).
- `useAmmo(id)` — decrement ammo (safe for missing keys).
- `buildSchSel()` — rebuild scheme select.
- `openScheme()` / `closeScheme()` — scheme editor.

---

## Debugging Guide

### Common Issues
1. **"oldString not found"** — check exact whitespace/indentation. Use larger context.
2. **"Found multiple matches"** — provide more surrounding lines or use `replaceAll`.
3. **Syntax error after edit** — run `node --check` on extracted script.
4. **Size mismatch** — run `make sync-size`.
5. **Game won't load** — check browser console for JS errors.
6. **Inputs stick** — check `blur` handler clears `inp`.
7. **Camera wrong** — check `camClamp()` called after `cam` changes.
8. **Ammo becomes NaN** — check `useAmmo()` used, not direct decrement.
9. **Dead team selected** — check `endTurn()` skips dead teams.
10. **Ghost HP** — check `killWorm()` sets `w.hp=0`.

### How to Extract & Check Script
```bash
python3 -c "
import re
s=open('index.html').read()
m=re.search(r'<script>([\s\S]*)</script>',s)
open('/tmp/gb.js','w').write(m.group(1))
"
node --check /tmp/gb.js
```

### How to Find Functions
```bash
grep -n "function funcName" index.html
grep -n "const funcName" index.html
```

### How to Trace State
Add `console.log()` temporarily (remove before commit). Check browser DevTools.

---

## Performance Budget

- **Target:** 60 FPS on mid-range Android phones.
- **Canvas pixels:** `innerWidth*dpr × innerHeight*dpr`, DPR capped at 2 (or 1 in low graphics).
- **Particle cap:** 400 (200 in low). Prune at limit.
- **Scenery:** clouds 4, leaves 12, rain 50, snow 50, fireflies 12 (0 in low). Cloud sprites are cached to a single `cloudSprite` canvas in high mode.
- **Terrain mask:** W×H Uint8Array (2.24 MB for 2800×800).
- **Replay buffer:** 500 frames max (~25s at 20 Hz).
- **No more than one heavy job at a time** (builds, dev server, tests).
- **Memory:** ~1.5-1.8 GB available on target device. OOM killer will terminate.
- **High-graphics cost:** `!low` adds per-frame gradients for water, fires, large particles, rings and projectiles, plus a cached cloud sprite and detailed terrain texture baked once into the terrain canvas; `!med` gates the highest-cost extras (projectile glow, tracer glow, particle glow halos, full particle counts). The fire renderer shares one flame gradient across all tongues and the gas renderer uses flat circles instead of per-blob gradients to keep frame time low; toggle to Medium for 60 FPS on mid-range phones, Low for older devices.

---

## Security & Privacy

- No backend, no server, no API calls. Pure client-side.
- No user data collected or transmitted.
- localStorage only (device-local, private-mode safe via try/catch).
- No external resources (fonts, images, scripts, audio files).
- All rendering via Canvas 2D (no innerHTML with untrusted data except team names via `esc()`).
- Share uses Web Share API or clipboard (no third-party services).
 - No eval, no Function constructor, no dynamic code execution.

---

## History

Grub Blasters was created by Mark44928 and launched October 2026 (repo created 2026-10-17) as a deliberately single, dependency-free HTML file — Worms-style artillery with procedural Web-Audio SFX, destructible terrain, and wind. It ships on GitHub Pages (https://mark44928.github.io/GrubBlastersHTML/) under MIT, and every release since was a tagged commit:

- v1.0.0 — Initial release: hot-seat, wind-blown destructible terrain, 13 weapons (incl. Mad Cow herd), aim guide, sudden death, procedural SFX.
- v1.0.1 — Solid hitboxes, optional Gemini AI (API key), L/R weapon nav.
- v1.0.2 — Full customization (gravity, sudden death, retreat, fuel, team colors), straight kamikaze/mole digging.
- v1.0.3 — Aimable kamikaze, mole exit explosions, jump/backflip + footstep SFX, Real Time sky.
- v2.0.0 — The Exploding Feature Update: smooth donkey shafts, uncapped HP, installable PWA + manifest, native share.
- v2.0.1 — Aim guide for charged ballistics + per-weapon launch speeds.
- v2.0.2 — Worms Armageddon damage-fidelity sweep + unified lob physics.
- v2.0.3 — Bug sweep (mine double-detonation, barrel kill credit, saucer landing, charge ownership, AI aim solver, girder placement, AI stall, turn-time migration).
- v2.5.0 — The Evergreen Update: Medium graphics tier + Everforest theme.

## Final Notes


This AGENTS.md is the **single source of truth** for working on Grub Blasters. If you find a discrepancy between this file and the code, the code wins — but update this file to match. If you find a bug not documented here, add it to the Pitfalls section. If you add a feature, document it in the appropriate section. Keep this file current. Keep it accurate. Keep it brutal.

**The game is one file. The rules are absolute. The quality is non-negotiable.**

---

*Last updated: 2026-10-24*
*Grub Blasters v2.5.0 — The Evergreen Update*
