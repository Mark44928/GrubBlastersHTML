# AGENTS.md — Grub Blasters

> **MANDATORY READING.** Every AI agent and developer MUST read this file in full before touching ANY code in this repository. Violating these rules will break the game, corrupt user data, or ship broken builds to production. Treat every rule here as a hard constraint enforced by the codebase itself.

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
9. [Core State](#core-state)
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
20. [Manual Smoke Test](#manual-smoke-test)
21. [Deployment](#deployment)
22. [Pitfalls](#pitfalls-things-that-have-bitten-us)
23. [Function Reference](#function-reference)
24. [Performance Budget](#performance-budget)
25. [Security & Privacy](#security--privacy)

---

## Project Identity

**Grub Blasters** is a turn-based artillery game (Worms-style) shipped as **one dependency-free HTML file**. Two to four teams of worms blast each other across procedurally generated, fully destructible terrain on a zoomable 1400–2800 × 800 logical canvas, with a fuel-limited jetpack for mobility.

- **Live:** https://mark44928.github.io/GrubBlastersHTML/
- **Repo:** https://github.com/Mark44928/GrubBlastersHTML
- **Version:** 2.5.0 (The Evergreen Update)
- **File size:** ~224 KB (single file, no dependencies)
- **Language:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Target:** Mobile browsers (Android/iOS) + Desktop. PWA via inline `data:application/manifest+json` manifest.
- **Canvas:** 2D context, logical pixels, DPR-capped at 2

---

## Hard Rules (Non-Negotiable)

These rules are **absolute**. Violating any breaks the game or the build.

### Rule 1: One File. Forever.
The entire game lives in `index.html` (style, DOM, script). **Never split it.** Never add a `<script src>`, CDN, font, image, or audio file. Zero dependencies, no build step, no npm, no bundler, no transpiler. If you think you need a second file, you're wrong. Find another way.

### Rule 2: Exactly One `<script>` Block.
`make check` extracts the script with `/<script>([\s\S]*)<\/script>/` and runs `node --check`. A second `<script>` tag silently changes what gets checked — the regex matches the **FIRST** tag only. Verify with `grep -c '<script' index.html` (must be 1).

### Rule 3: Only Publish When Asked.
Do not `git commit` / `git push` unless the user explicitly asks. When asked, use `make publish MSG="..."`. Never force-push. Never amend published commits. Never push to branches other than `main`.

### Rule 4: Keep README Size Line In Sync.
README ends with "About N KB" (round(bytes/1024)). `make check` fails when it drifts. Run `make sync-size` after every `index.html` edit.

### Rule 5: Preserve Code Style.
Match surrounding style. Do not reformat. Do not "clean up" code. Do not rename variables. Do not add comments beyond section dividers. The codebase is dense and intentional.

### Rule 6: Respect Termux Rules.
Every shell command must run with `TMPDIR=/data/data/com.termux/files/usr/tmp`. No `sudo`, `systemctl`, or FHS paths. `$PREFIX=/data/data/com.termux/files/usr`.

### Rule 7: Never Commit Secrets.
No API keys, tokens, passwords, or personal data. The game has no backend and no secrets.

### Rule 8: Test Before Claiming Done.
Run `make check`. Run `make sync-size`. Verify manually. Never say "it works" without evidence. If you can't test (no browser), say so explicitly.

---

## Repository Layout

| Path | Purpose | Edit? |
|---|---|---|
| `index.html` | The entire game (style, DOM, script). ~182 KB. | Yes — this is where all work happens |
| `README.md` | Player-facing docs. | Yes — keep in sync with gameplay changes |
| `Makefile` | Dev tasks: check, serve, publish, verify. | Rarely |
| `AGENTS.md` | This file. | Yes — keep current |
| `.git/` | Git repository. | Never directly |

---

## Dev Environment (Termux on Android)

- **Platform:** Android Termux, Bionic libc, aarch64, single unprivileged user, no root.
- **$PREFIX:** `/data/data/com.termux/files/usr`
- **$HOME:** `/data/data/com.termux/files/home`
- **Required tools (all installed):** `node` (syntax check), `gh` (Pages status), `python3` (local server), `make`, `git`.
- **`gh` authenticated as:** `Mark44928`. GitHub Pages deploys from `main`.

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
| `make verify` | Wait 45s for Pages, check `status: built`, curl live URL expecting `200`. | After publish |
| `make publish MSG="..."` | `check` → `git add -A` → commit → push → `verify`. | Only when user asks |
| `make clean` | Remove temp extraction. | Cleanup |

**Standard edit cycle:** edit `index.html` → `TMPDIR=/data/data/com.termux/files/usr/tmp make check` → `TMPDIR=/data/data/com.termux/files/usr/tmp make sync-size` → re-check → (optional) `make publish MSG="..."`.

---

## Architecture of index.html

### Layout (3 layers)
1. **`<style>`** — all CSS (HUD, buttons, menu, safe-area insets, themes).
2. **DOM UI** — `#c` canvas, `#ui` overlay (`#top` team HUD, `#mid` timer + wind, `#bottom` controls) plus `#banner`, `#tip`, `#menu` start card, `#help`/`#custom`/`#settings` overlays, `#schemedit` scheme editor (z-index 10), `#rot` rotate overlay.
3. **`<script>`** — everything else, `'use strict'`.

---

## Coordinate Model
- **Logical world:** `W×H` default 1400×800. `W` dynamic per map (`MAPS`: Standard 1400 / Wide 2000 / Epic 2800; `H` stays 800). Set in `newGame()` before `resize()` + terrain/bg/scenery regeneration.
- **Camera:** `cam{x,y,z}` with `fit=min(innerWidth/W,innerHeight/H)` and `S()=fit*cam.z`. World→screen: `innerWidth/2+(X-cam.x)*S`. Pointer→world: `cam.x+(clientX-innerWidth/2)/S`.
- **`camClamp()`** locks view inside world when viewport smaller than map. `cam.z ∈ [1,ZMAX=6]`.
- **`camFollow(dt)`** targets active worm, midpoint of worm+target for targeted weapons, or first live non-mine projectile during settle.
- **`camManual`** pauses following. Movement input, fire, jump, charge, aim-tap and `startTurn` clear it.
- **All gameplay code speaks logical pixels only.**

---

## Terrain & Collision System
- **`genTerrain()`** rasterizes sine noise + Gaussian bumps. Ground fully solid below surface.
- **Floating islands (`isl>0`):** `islands[]` blobs with spawn slots.
- **`mask`** (`Uint8Array`, W×H) from alpha>100. `solid(x,y)` reads it.
- **`crater(x,y,r)`** — terrain removal (no-ops for `r<=0`). **`tunnel()`**/`tunnelSeg()`** — rim-less/rim-less capsule variants.
- **`hit(x,y)`** — 14-point worm hitbox (~9×16px coffin). **`wormHit(w,x,y,pad)`** — coffin expanded by pad (rockets 3, mines 8, sheep 3).
- **`hitW(w,x,y)`** — terrain + worms + props (`propSolid()`: 18×22 barrel, armed mine ±5/±6). Used by walk/stepWorm/gravity.
- **Water:** `WATER0=725`, rises during sudden death.

---

## Core State (Module-Level Globals)
- **Entity arrays:** `worms, proj, parts, texts, tracers, crates, graves, rings, leaves, clouds, pend, rain, snow, fireflies, bolts, barrels, barFx, fires, gas`
- **`state`:** `'menu' | 'aim' | 'settle' | 'over'` · **Turn:** `turnTeam` (0–3), `cur`, `retreat`, `quiet`/`settleT` · **Teams:** `teamCount`, `TC[4]`/`TN[4]`, `aiOn[4]`, `wins[4]`, `ammo[4]`, `lastWpn[4]`
- **Settings:** `diff, maxHP, turnSec, guide, muted, hap, radar, low, uiTheme, songOn, customs[]`, etc. (`manager.sh:16-25` defaults)
- **`inp`** — walk/aim booleans (+`jet`); **`paused`** — sim paused; **`dmgBoost`** — 1.5x Damage armed
- **Jetpack:** `fuel` (0–`FUEL`), `JET_T=1000`, `JET_DRAIN=55`/s · **Saucer:** `sau` (0–`SAU_F=240`), `SAU_T=1500` · **Kamikaze:** `w.kam` + charge speed 380px/s, gravity-free
- **Replay:** `rec` (20 Hz), `lastMovie`

---

## Turn Flow
```
startTurn() → sudden-death check → wind reroll → crate spawn → restore lastWpn → refill fuel → banner
Player: walk (58 px/s) → aim (clamp −1.2…1.45 rad) → charge (0.75/s) → jet (fuel-limited) → fire
After firing: state='settle' → retreat window (0/3/6 s, skip with FIRE) → ends when quiet or 25 s cap
endTurn() → next living team → gameOver() if ≤1 team remains
```
**Sudden death:** turn ≥ sdTurn: sea +20px/turn, 5 wither/turn from turn 17, 60% meteor from turn 19.
**Retreat:** `(wpn sheep/skunk/dragon/kamikaze/suicide OR ai)?0:RETV[retIdx]`

### Gravity & Damage
- **`G=620`**, `GV=G*GRAVK[gravIdx]` (Low .6 / Normal 1 / High 1.5).
- Fall damage when `vy>480`: `round((vy-480)/9)`.
- **`damageWorm(w,d,by,silent)`** — Shield absorbs one hit; `invuln` blocks all; `dmgBoost` ×1.5.
- **`killWorm(w,drown,by)`** — MUST set `w.hp=0`.
- **`explode(x,y,r,dmg,by,kb)`** — crater + radial knockback/damage (`f=1-d/(r+14)`), mine chains, shake `Math.min(26,r/4.5)`.

---

## Weapons System (44 weapons)

| Type | Weapons |
|---|---|
| **AIMLESS** (no aim tap) | dynamite, mine, sheep, cow, firepunch, skunk, saucer, xdmg, invuln, parachute, prod, suicide, skip, shield, earthquake, vampire, girder, vacuum |
| **TARGETED** (tap map, then FIRE) | airstrike, teleport, homing, magic, lightning, carpet, nuke, pigeon, donkey |
| **CHARGE** (hold to charge) | bazooka, grenade, holy, cluster, bunker, homing, magic, banana, dragon, mole, napalm, bundle, sticky, rubber |

**Key behaviors:** Bazooka ∞ammo, wind-affected, 0.25s grace. Sheep/Cow wander/detonate. Homing: 150px straight then track ≤3rad/s, duds after 5s. Magic bullet: r88, 9s timeout. Banana: 5 burst (30 HP minis + 10 HP core). Kamikaze: suicidal dig. Mine: 2s arm, <17px trigger, persists turns. Sticky: sticks on contact, 3.5s detonate. Donkey: targeted, vertical shaft, 100 dmg. **Always use `useAmmo(id)`** — direct decrement makes `NaN`.

**Damage Baseline (WA 3-star):** Bazooka/Grenade/Homing/Sheep-Cow 50/50/50/75 · Cluster 10+30×5 · Banana 10+30×5 · Holy/Magic 100 · Shotgun 25×2 · Dynamite/Mine 75/50 · Minigun 6×16 · Firepunch/Kamikaze/Dragon/Mole 30 · Suicide 30+poison · Blowtorch 15 · Airstrike/Carpet 30×5 · Donkey 100 · Barrel 60.

---

## AI System
- `aiTurn(dt)` — `wait → think → (gun|strike|walk|aim→charge) → done`.
- `DIFF[diff]` — Baby/Easy/Normal/Hard/Brutal tunes aim/power error.
- Baby/Easy: random target; Normal+: lowest-HP enemy. CPU teams: first `ceil(teamCount/2)` human.
- AI never gets retreat; weapon choice gated by `has(id)` + `ammoOf()>0`.
- `humanTurn()` gates player input. Count dry turns to prevent AI stall → draw.

---

## Rendering Pipeline
Painter's order: Shake → Background → Clouds → Terrain → Graves → Crates → Barrels → Fires → Worms → Gas → Aim aids → Projectiles → Tracers/rings → Particles → Leaves → Weather → Water → Floating texts → Crate radar → Vignette.

**High:** detailed sprites, gradient water, glow/trails, filmic vignette. **Medium:** trims particles/glow. **Low:** DPR=1, no weather/decor.

---

## Game Loop
`frame()`: `requestAnimationFrame`, `dt=min(33ms, elapsed)` scaled by `slowT>0?0.35:1`, then `update(dt)` + `draw()` + `hud()` + `songCheck()`. `paused` freezes sim, keeps rendering. Frame `catch` shows rate-limited `showError()`.

---

## Input System
- **Buttons:** `[data-k]` pointer capture. `#fire` hold. `#jump`. `#rst` restart. Shelf rebuilt by `buildWeps()`.
- **Canvas:** tap selects own worm (<22px) or aims. Drag aims. 2 pointers = pinch zoom. Right/middle drag = `panDrag`. Wheel zoom.
- **Keyboard:** `KM` maps arrows/WASD. `keyOf()` lowercases (CapsLock-proof). Space charge, Enter/Shift jump, J jetpack, 1–7 weapon, P/Esc pause, H help, R replay.
- **Backflip:** double-tap jump within 350ms → somersault. Third tap → low backflip.
- **Pause must gate:** `fire`/`startCharge`/`jump`/`setWpn`. Clear `inp` on `window blur`, `aimDrag` on `pointercancel`.

---

## Persistence (localStorage)
All reads guarded try/catch. Key entries:

| Key | Default | Notes |
|---|---|---|
| `gb_ui` | modern | modern/classic/gruvbox/tokyo/dark/nord/oled |
| `gb_diff` | 2 (Normal) | Migration via `gb_dv` |
| `gb_wnd` | 1 | Index→multiplier via `gb_wndv` (write marker!) |
| `gb_hp` | 100 | Legacy 0–2 index migration |
| `gb_tt` | 30s | Legacy 0–3 index migration |
| `gb_csch` | unset | Custom schemes JSON, max 24 |
| `gb_hap` | on | Haptics |
| `gb_barl` | on | on/oil/drum/off |

---

## Conventions (Code Style)
- **Compact vanilla JS:** terse names, dense one-liners, section dividers `/* --- x --- */`.
- Match surrounding style. No reformatting. No "clean up." Comments only for section dividers or *why*.
- Logical pixels everywhere. Canvas handles scaling.
- **New weapons:** append to `WEP`, add `fire()` branch, `updateProj()` + `drawProj()` handling, ammo in `SCH`, crate in `pickCrate()`, README. Utility weapons resolve inside `fire()`.
- **New settings:** `<select>` or `<input type=range>`, load in try block, handle in `selCh()` + `syncUI()`.
- **Commit messages:** one imperative summary line, details after colon.

---

## Change Checklist (Mandatory)
1. Edit `index.html` (and README if features changed).
2. `make check` → `SYNTAX OK` + size sync.
3. `make sync-size` → update README size line.
4. Re-run `make check`.
5. Manual smoke test (below) for systems touched.
6. `make publish MSG="..."` (only when user asks) — `verify` must show `"status":"built"` and `live: 200`.

---

## Manual Smoke Test (Condensed)
- [ ] Both modes × every difficulty. 4 teams vs CPU → 2v2. Ammo decrements; unlimited stays unlimited.
- [ ] Schemes: Greedy, Pro Mode, Bazooka Only. Turn arrows skip dead teams. Wind bends rockets.
- [ ] Targeted flow (airstrike/teleport/etc.), Sheep release+detonate, Mines arm/trigger/chains, Graves sink, Retreat skip.
- [ ] Pause ignores actions. PC hides touch pads, shows crosshair.
- [ ] 8px climb, worm slides through 10px holes, stand on heads, grenade rests on head, rocket contact-explodes, barrel chains, saucer boards/lands, parachute glides.
- [ ] Backflip (double-tap jump). Help/Settings pause+resume. Worm select. Jetpack fuel. Replay. Sudden death. Win/confetti/draw.
- [ ] 3-4 teams dead→endTurn skips. Scheme delete→empty editor. Import round-trips. Graphics H/M/L. Themes. Resize.

---

## Deployment
- GitHub Pages from `main`. ~30–60s after push.
- `make verify` waits 45s, checks `gh api repos/.../pages/builds/latest` for `status: built`, curls live URL expecting `200`.
- Never force-push. Deploy only from green `make check`.

---

## Pitfalls (Critical — Will Break the Game)
1. `killWorm` MUST set `w.hp=0` — ghost HP otherwise.
2. Worm mask deliberately narrow (9×16 coffin) — don't "fix" to match 17px art.
3. Use `hitW(w,…)` not `hit()` — ignores other worms and props.
4. `propSolid()` = 18×22 barrel + ±5/±6 armed mine. Mine trigger pad (8) must exceed solid half-width (5).
5. Barrels vertical-only — `updateWorld()` never moves `b.x`.
6. Crates are walk-through pickups, not solid.
7. Resting projectiles wake when support disappears (terrain/barrel/worm).
8. Keyboard through `keyOf()` — CapsLock breaks WASD without it.
9. Clear `inp` on `blur`, `aimDrag` on `pointercancel`.
10. `endTurn()` must skip dead teams — naive `%teamCount` spins with 3-4 teams.
11. Camera: no `sc`/`ox`/`oy` — always `cam.x+(clientX-innerWidth/2)/S()`.
12. `W`/`H` dynamic from `MAPS[mapIdx]` — rebuild cached state in `newGame()`.
13. Jetpack gated in `stepWorm()`: human `inp.jet && !aiOn[turnTeam]`, AI `w.aiJet>0`.
14. `startTurn()` re-clamps `wpn` from `lastWpn`.
15. Don't decrement ammo directly (`ammo[team][id]--`→`NaN`). Use `useAmmo(id)`.
16. Dropdown/keyboard 1–7 map into `wepList()`, not raw `WEP`.
17. `crater()` no-ops `r<=0`.
18. `drawReplay` skips exploded barrels: `if(!b2.dead)`.
19. `schIdx` clamped in `buildSchSel()` after deletion.
20. `cycleAmmo()` clamps to `VALS` (∞ is `VALS[0]=-1`).
21. `newGame()` resets `#msg`.
22. Charge ownership: `startCharge(src)` records `chargeHuman`/`chargeSrc`; `releaseFire(src)` refuses AI/other-device charges.
23. Explosions carry team: `explode()` pushes `{x,y,oil,by}` into `barFx`.
24. AI uses `GUIDE_V[wpn]` in `planShot`, not hardcoded bazooka speed.
25. Saucer landing: `vy=0` + `para=true` to avoid fall damage.
26. Mines detonate once: `p.struck` flag.
27. `startTurn()` with no living worm → `endTurn()`, not `return`.
28. Donkey uses `tunnelSeg()` per frame, never `crater()` or stacked circles.
29. `gb_wndv` marker written on every `gb_wnd` store or boot re-migrates.
30. Replays: `startRec()` BEFORE terrain changes (fire-punch, torch, girder, donkey).
31. Barrel push-out uses real hitbox (±9/±11), not ±14/±18.5.
32. Weapon shelf closes on `fire()`, `endTurn()`, `startTurn()` — `closeWepPan()`.
33. `targeted` weapons can't be `AIMLESS`. Don't mis-categorize.
34. `w.hp` uncapped — HUD bar width clamped, not HP.
35. Don't rename DOM ids — `$()` depends on them.
36. Team names via `innerHTML` on game-over → always `esc()`. Elsewhere `textContent`.
37. Every projectile needs `p.fuse!==undefined` check in `updateProj()`.
38. Unlimited-in-`SCH` weapons still call `useAmmo(id)`.
39. Melee/AoE skip shooter+team: `e!==w && e.team!==w.team`.
40. Pause/overlay must cancel charge: `charging=false;power=0`.
41. `localStorage` reads individually guarded (`lsGet`/`lsSet`).
42. Girder skips mask cells overlapping living worm hitboxes.
43. Settle gate ignores saucer riders: `!w.air||w.sau>0`.
44. Don't clear `w.para`/`w.chute` for airborne worms at turn start.
45. Every replay event has a handler in `tickReplay()`.
46. `cycleAmmo()` "+": skip `0` rung (∞→1). "−" on ∞: no-op.
47. Theme `.crow select`: no `background` shorthand (resets chevron).
48. `.card` needs its own surface (`var(--bg)`).
49. AI stall guard: `dryTurns` → draw.
50. Death feed: drowned/suicide need entries without kill stats.
51. `startCharge`/`releaseFire` must gate on `chargeHuman`.
52. `explode()` barrel blast carries `by` team for kill credit.
53. Mines detonate once — `chainFx` drains after `updateProj`.
54. `cycleAmmo()` imported values snapped to `VALS` (7→6, 9→8).
55. Every new projectile type MUST set `bn`/`fr` (or `rest`/`stuck`/`rocket` handling) — undefined fields NaN the physics on contact.

---

## Function Reference (Critical APIs)

**Terrain:** `solid(x,y)` | `hit(x,y)` | `hitW(w,x,y)` | `wormHit(w,x,y,pad)` | `normalAt(x,y)` | `crater(x,y,r)` | `tunnel(x,y,r)` | `tunnelSeg(x0,y0,x1,y1,r)` | `barrelAt(x,y)` | `boxNorm(o,x,y,hw,hh)` | `propSolid(x,y)`

**Worms:** `stepWorm(w,dt)` | `walk(w,dir,dt)` | `jump()` | `damageWorm(w,d,by,silent)` | `killWorm(w,drown,by)` | `wormAt(self,x,y)`

**Projectiles:** `updateProj(dt)` | `drawProj(p)` | `drawProjHi(p)` | `explode(x,y,r,dmg,by,kb)` | `fire()` | `startCharge()` | `releaseFire()`

**Rendering:** `draw()` | `drawWorm(w)`→`drawWormHi(w,d)` | `drawFire(f)`/`drawGas(g)` | `drawBarrel(b)`/`drawCrate(c)` | `mkVig()`

**Game Flow:** `newGame(mode)` | `startTurn()` | `endTurn()` | `gameOver(t)` | `restartMatch()` | `captureSnap()`

**Camera:** `camClamp()` | `panCam(dx,dy)` | `zoomBy(k)` | `camFollow(dt)` | `resize()`

**UI:** `hud()` | `banner(t,c)` | `tip(m,t)` | `buildTeams()` | `buildWeps()` | `toggleHelp/Custom/Settings(on)` | `togglePause()`

**Schemes:** `schAll()` | `wepList()` | `ammoOf(id)` | `useAmmo(id)` | `buildSchSel()` | `openScheme()`/`closeScheme()`

---

## Performance Budget
- **Target:** 60 FPS on mid-range Android.
- **Canvas:** `innerWidth*dpr × innerHeight*dpr`, DPR capped at 2 (1 in low).
- **Particles:** cap 400 (200 in low). Prune at limit.
- **Scenery:** clouds 4, leaves 12, rain 50, snow 50, fireflies 12 (0 in low). Cached cloud sprite.
- **Terrain mask:** W×H Uint8Array (~2.24 MB for 2800×800). **Replay:** 500 frames max.
- One heavy job at a time. Memory ~1.5-1.8 GB available; OOM killer terminates.

## Security & Privacy
- No backend, no server, no API calls. Pure client-side.
- No user data collected or transmitted.
- localStorage only (private-mode safe via try/catch).
- No external resources (fonts, images, scripts, audio files).
- No eval, no Function constructor, no dynamic code execution.

## History

This AGENTS.md is the **single source of truth**. If you find a discrepancy between this file and the code, the code wins — but update this file to match.

- v1.0.0 — Initial release: hot-seat, wind-blown destructible terrain, 13 weapons (incl. Mad Cow herd), aim guide, sudden death, procedural SFX.
- v1.0.1 — Solid hitboxes, optional Gemini AI, L/R weapon nav.
- v1.0.2 — Full customization (gravity, sudden death, retreat, fuel, team colors), straight kamikaze/mole digging.
- v1.0.3 — Aimable kamikaze, mole exit explosions, jump/backflip + footstep SFX, Real Time sky.
- v2.0.0 — The Exploding Feature Update: smooth donkey shafts, uncapped HP, installable PWA, native share.
- v2.0.1 — Aim guide for charged ballistics + per-weapon launch speeds.
- v2.0.2 — W:A damage-fidelity sweep + unified lob physics.
- v2.0.3 — Bug sweep (mine double-detonation, barrel kill credit, saucer landing, charge ownership, AI aim solver, girder placement, AI stall, turn-time migration).
- v2.5.0 — The Evergreen Update: Medium graphics tier + Everforest theme.

*The game is one file. The rules are absolute. The quality is non-negotiable.*

*Last updated: 2026-10-26 — Grub Blasters v2.5.0*
