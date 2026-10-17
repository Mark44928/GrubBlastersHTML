# AGENTS.md — Grub Blasters

Project guide for AI agents and developers. Read this before touching anything.

Grub Blasters is a turn-based artillery game (Worms-style) shipped as **one
dependency-free HTML file**. Two teams of worms blast each other across
procedurally generated, fully destructible terrain on a fixed 1400×800 logical
canvas.

**Live:** https://mark44928.github.io/GrubBlastersHTML/
**Repo:** https://github.com/Mark44928/GrubBlastersHTML

---

## Hard rules

1. **One file.** The entire game lives in `index.html` (style, DOM, script).
   Never split it, never add a `<script src>`, CDN, font, image, or audio file.
   Zero dependencies, no build step, no npm.
2. **Exactly one `<script>` block.** `make check` extracts it with the regex
   `/<script>([\s\S]*)<\/script>/` and runs `node --check`. A second `<script>`
   tag silently changes what gets checked.
3. **Only publish when asked.** Do not `git commit` / `git push` unless the
   user explicitly asks. When asked, use `make publish MSG="..."`.
4. **Keep the README size line in sync.** README ends with "About N KB"
   (round(bytes/1024)); `make check` fails when it drifts. `make sync-size`
   fixes it.
5. **Preserve the code style** (see Conventions).
6. **Respect the global Termux rules** for shell usage (TMPDIR, no sudo, no
   FHS paths). See the environment section below.

## Repository layout

| Path | Purpose |
|---|---|
| `index.html` | The entire game. |
| `README.md` | Player-facing docs. Keep features / controls / weapons tables current when gameplay changes. |
| `Makefile` | Dev tasks: check, serve, publish, verify. |
| `AGENTS.md` | This file. |

## Dev environment (Termux on Android)

- Every shell command must run with `TMPDIR=/data/data/com.termux/files/usr/tmp`.
- No `sudo`, `systemctl`, or FHS paths. `$PREFIX=/data/data/com.termux/files/usr`.
- Required tools, all installed: `node` (syntax check), `gh` (Pages status),
  `python3` (local server), `make`, `git`.
- `gh` is authenticated as `Mark44928`; GitHub Pages deploys from `main`.

## Make targets

| Target | What it does |
|---|---|
| `make` / `make help` | List targets. |
| `make check` | Extract script → `node --check` + README size sync. **Run before every publish.** |
| `make syntax` | JS syntax check only. |
| `make size` | Report file bytes/KB and what the README claims. |
| `make sync-size` | Rewrite README "About N KB" to match the file. |
| `make serve [PORT=8080]` | Local preview server. |
| `make open` | Open the live game on the device. |
| `make status` | Pages build status + live HTTP code. |
| `make verify` | Wait 45 s for the Pages build, then `status`. |
| `make publish MSG="..."` | `check` → `git add -A` → commit → push → `verify`. |
| `make clean` | Remove the temp extraction. |

## Architecture of index.html

### Layout

1. `<style>` — all CSS (HUD, buttons, menu, safe-area insets).
2. DOM UI: `#c` canvas, `#ui` overlay (`#top` team HUD, `#mid` timer + wind,
   `#bottom` controls) plus `#banner`, `#tip`, and the `#menu` start card.
3. `<script>` — everything else, `'use strict'`.

### Coordinate model

- Fixed logical world `W=1400 × H=800`; it never changes.
- `resize()` letterboxes: `sc=min(innerWidth/W, innerHeight/H)`, `ox`/`oy`
  center offsets, `dpr` capped at 2. Pointer→world: `(clientX-ox)/sc`.
- All gameplay code speaks logical pixels only.

### Terrain & collision

- `genTerrain()` rasterizes layered sine noise + Gaussian bumps into a
  `terrain` canvas; surface heights are sampled every 4 px (`surf()`).
- A `Uint8Array mask` (W×H) is rebuilt from alpha>100; `solid(x,y)` reads it.
- `crater(x,y,r)` cuts the canvas (dark rim + destination-out) and zeroes the
  mask — it is the ONLY way terrain changes.
- `hit(x,y)` tests a 7-point worm hitbox (`PTS`); `normalAt()` estimates bounce
  normals from the mask.
- Water line `WATER` starts at `WATER0=725` and rises during sudden death.

### Core state (module-level globals)

- Entity arrays: `worms, proj, parts, texts, tracers, crates, graves, rings,
  leaves, clouds, pend, rain, snow, fireflies`.
- `state`: `'menu' | 'aim' | 'settle' | 'over'`. `aim` = current worm may
  move/aim/fire; `settle` = projectiles resolving + retreat window; `over` =
  match finished.
- Turn: `turnTeam`, `turnNo`, `cur` (active worm), `cursor[team]` (rotation
  index), `retreat` (post-shot move window, 3 s), `quiet`/`settleT` (settle
  timeout: end turn after 1 s quiet or 25 s hard cap).
- Settings: `perTeam, diff, hpIdx, ttIdx, guide, muted` (persisted).
- `inp` = walk/aim booleans; `aimDrag` = map-drag aiming; `paused`.
- `lastWpn[team]` = per-team weapon memory; `wepPage` = shelf page; `target` =
  chosen spot for targeted weapons.

### Turn flow

`startTurn()` → sudden-death check (turn ≥ `SD_TURN=16`: sea rises 20 px/turn,
all worms take 5 wither damage/turn from turn 17, 60 % meteor chance from turn
19), wind reroll (±10), crate spawn (every 3rd turn, max 3 live), restore
`lastWpn`, banner. Player acts: walk (58 px/s), aim (clamp −1.2…1.45 rad),
charge (power ramps at 0.75/s), fire. After firing, `state='settle'`: 3 s
retreat window (skip with FIRE), then the turn ends when everything is quiet
(`quiet>1`). `endTurn()` flips team or calls `gameOver()`.

### Gravity & damage

- `G=620`. `stepWorm()` applies gravity with sub-stepping; fall damage when
  `vy>480`: `round((vy-480)/9)`.
- `damageWorm(w,d,by)` — stats tracking (`kdmg`, `kills`), flash, floating
  number. `killWorm(w,drown)` must leave `w.hp=0` (HUD reads hp of dead worms).
- Drowning: `w.y>WATER-6` or off-map (±30) → `killWorm(w,true)`.
- `explode(x,y,r,dmg,by)` — crater + radial knockback/damage
  (`f=1-d/(r+14)`), crate destruction, mine chain reactions (`chainFx`),
  rings, white flash for `r≥80`, screen shake.

### Weapons

`WEP` array drives shelf order; array index → id. 13 weapons, 7 per page. The
shelf shows page-local slots; keyboard `1–7` maps via `wepPage*7+(key-1)`.
`TARGETED=['airstrike','teleport']` use the two-step "tap map, then FIRE"
flow. `fire()` dispatches; behavior lives in `updateProj()` / `drawProj()`.

| id | Special handling |
|---|---|
| `bazooka` | Wind-affected rocket (`vx+=wind*4*dt`); explodes on solid/worm contact after age 0.25 s (so you can't blow yourself up instantly) |
| `grenade` | Bouncing (`bn`/`fr`), 3 s fuse |
| `dynamite` | Dropped at feet, 4 s fuse, r 78 dmg 80 |
| `shotgun` | Instant hitscan, 2 shots at 0.5 s spacing, r 16 dmg 26 |
| `airstrike` | Targeted; 5 bombs delivered via `pend` |
| `teleport` | Targeted; `doTeleport` validates the spot (≥24 px below the sky, above water, in bounds) |
| `sheep` | Wanders (`dir` flips at walls), detonates on an enemy <18 px or 8 s fuse; FIRE detonates on command; ignores its shooter |
| `hammer` | Melee check 42 px ahead, knockback vx 380 / vy −260, 30 dmg |
| `mine` | Arms after 2 s, trigger <17 px, persists across turns, explodes when caught in another blast |
| `holy` | Big blast r 85 dmg 75, choir SFX |
| `cluster` | Splits into 4 bomblets on fuse/water (`splitCluster`) |
| `uzi` | 6 hitscan shots with spread, 0.12 s apart |
| `torch` | `torchCut()` carves a ~110 px tunnel, 10 dmg per worm, insta-fire |

Ammo: `ammo[team]` object; missing keys = unlimited (`ammoOf()` returns
`Infinity`). Crates (`pickCrate`) only grant HP/ammo when actually useful.

### AI

`aiTurn(dt)` runs a per-turn state machine: `wait → think → (gun | strike |
walk | aim → charge) → done`. `DIFF[diff]` tunes aim error `an`, power error
`pn`, and walk threshold `thr`. Hard+ AI targets the lowest-HP enemy with
damage weighting (`pickTarget`). `aiOn[team]` marks CPU teams; `humanTurn()`
gates player input. AI never gets a retreat window.

### Rendering

Single `draw()` per frame, painter's order: shake → background → clouds →
terrain → graves → crates → worms → aim aids (barrel, reticle/target, guide
arc, charge dots, arrow) → projectiles → tracers/rings → particles → leaves →
weather → animated water → floating texts. `hud()` updates DOM bars, clock,
wind meter, and tips.

### Loop

`frame()`: `requestAnimationFrame`, `dt=min(33 ms, elapsed)`, then
`update(dt)` + `draw()` + `hud()`. `paused` freezes the simulation but keeps
rendering.

### Input

- Buttons: `[data-k]` elements (walk/aim pad) use pointer capture; `#fire` is
  press-and-hold; `#jump`; weapon buttons generated from `WEP`; `⇄` flips
  shelf pages.
- Canvas: tap selects one of your own worms (<22 px) or aims; drag aims
  continuously; targeted weapons set `target`. `pointercancel` and `blur` must
  clear interactive state.
- Keyboard: `KM` maps arrows/WASD; `keyOf()` lowercases single chars
  (CapsLock-proof); Space charge, Enter/Shift jump, 1–7 weapon, Q page,
  P/Esc pause.
- Pause must gate every action entry point (`fire`/`startCharge`/`jump`/
  `setWpn`).

### Persistence

| Key | Meaning | Default |
|---|---|---|
| `gb_diff` | AI difficulty index 0–3 | 1 (Normal) |
| `gb_per` | worms per team 2–4 | 3 |
| `gb_hp` | HP index 0–2 (100/150/200) | 0 |
| `gb_tt` | turn timer index 0–3 (20/30/45/60) | 1 (30 s) |
| `gb_guide` | aim guide `'1'`/`'0'` | off |
| `gb_mute` | mute `'1'`/`'0'` | off |

All reads are wrapped in try/catch (private-mode safe).

## Conventions

- Compact vanilla JS: terse names, dense one-liners, section dividers
  `/* ---------- x ---------- */`. Match surrounding style; do not reformat.
- Logical pixels everywhere; the canvas handles scaling, not CSS.
- New weapons: append to `WEP`, add a `fire()` branch, handling in
  `updateProj()` and a visual in `drawProj()`, starting ammo in `newGame()`,
  the crate pool in `pickCrate()`, and README tables. Shelf pages update
  automatically.
- New settings: button in `#menu` (or HUD), load inside the localStorage
  `try{}` block, persist in the click handler, document in README.
- No comments beyond the section dividers unless genuinely needed.
- Commit messages: one imperative summary line, details after a colon
  (see `git log`).

## Change checklist

1. Edit `index.html` (and README if features changed).
2. `make check` → `SYNTAX OK` + size sync.
3. Manual smoke test (below) for the systems touched.
4. `make publish MSG="..."` (only when the user asks) — it runs `verify`,
   which must show `"status":"built"` and `live: 200`.

## Manual smoke test

There are no automated tests; the game must be checked by hand:

- Start both modes (2 Players, vs Computer) and each difficulty once.
- Fire a weapon from each shelf page; verify ammo decrements and unlimited
  weapons stay unlimited.
- Targeted flow: airstrike / teleport — tap map, reticle appears, FIRE works.
- Sheep: release, detonate via FIRE; confirm enemy-touch detonation.
- Mine: drop, walk away, arming delay, proximity trigger, chain reaction.
- Kill and drown worms: HUD bars drop to 0 (no ghost HP); graves appear and
  sink.
- Retreat: move after firing, press FIRE to skip, turn ends when quiet.
- Pause mid-flight; actions while paused are ignored.
- Keyboard: walk, CapsLock on, blur the window mid-walk (no runaway).
- Sudden death: turn 16 sea rise + wither; meteors arrive shortly after.
- Win a match: confetti, score summary, menu returns, wins shown in HUD.
- Resize/rotate: HUD respects safe areas; fullscreen toggles.

## Deployment

- GitHub Pages from `main` (repo `Mark44928/GrubBlastersHTML`).
- Build takes ~30–60 s after push. `make verify` waits 45 s, checks
  `gh api repos/.../pages/builds/latest` for `status: built`, and curls the
  live URL expecting `200`.
- Never force-push; deploy only from a green `make check`.

## Pitfalls (things that have bitten us)

- `killWorm` must set `w.hp=0` — drowned / wither-killed worms otherwise show
  ghost HP in the team HUD bars.
- Keyboard goes through `keyOf()` — without it, CapsLock breaks WASD.
- Clear `inp` on `window blur` and `aimDrag` on `pointercancel`, or inputs
  stick after interruptions.
- Weapon index math: buttons exist for all 13, visibility is paged; keyboard
  selects `wepPage*7+i`. Never assume raw 1–13 indexes.
- `lastTick` must be reset to 99 in `startTurn()` or the countdown ticker
  misbehaves.
- Rockets skip their own shooter only for 0.25 s (`p.age>.25`); sheep/mines
  exclude `e!==p.shooter`. Keep shooter exclusion when adding projectiles.
- `retreat=(wpn==='sheep'||aiOn[turnTeam])?0:3` — AI and sheep get no retreat
  window.
- Don't rename DOM ids — `$()` lookups and the `el` HUD map depend on them:
  `c, banner, tip, fire, weps, time, wf, wtxt, sd, h0, h1, t0, t1, pause,
  snd, fs, quit, menu, msg, cnt, lvl, hp, tt, ag, b2, b1`.
- Keep `index.html` a single file. If it grows, tighten code — don't split.
