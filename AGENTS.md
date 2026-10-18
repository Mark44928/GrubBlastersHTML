# AGENTS.md — Grub Blasters

Project guide for AI agents and developers. Read this before touching anything.

Grub Blasters is a turn-based artillery game (Worms-style) shipped as **one
dependency-free HTML file**. Two to four teams of worms blast each other across
procedurally generated, fully destructible terrain on a zoomable 1400–2800 × 800
logical canvas, with a fuel-limited jetpack for mobility.

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

- Logical world `W×H` default 1400×800; `W` is dynamic per map (`MAPS`:
  Standard 1400 / Wide 2000 / Epic 2800; `H` stays 800), set in `newGame()`
  before `resize()` + terrain/bg/scenery regeneration. Boot uses the default.
- Camera: `cam{x,y,z}` with `fit=min(innerWidth/W,innerHeight/H)` and
  `S()=fit*cam.z` (CSS px per world px). World→screen: `innerWidth/2+(X-cam.x)*S`.
  Pointer→world: `cam.x+(clientX-innerWidth/2)/S` (used in `aimTo` and the
  pinch handler). `camClamp()` locks the view inside the world when the
  viewport is smaller than the map (centers an axis otherwise), `cam.z ∈ [1,ZMAX=6]`.
- `camFollow(dt)` (end of `update`) smoothly targets the active worm, the
  midpoint of worm+`target` for targeted weapons, or the first live
  non-mine projectile during settle.
- `resize()` recomputes `dpr` (cap 2), canvas bitmap, `fit`, the vignette
  canvas and re-clamps the camera.
- All gameplay code speaks logical pixels only.

### Terrain & collision

- `genTerrain()` rasterizes layered sine noise + Gaussian bumps into a
  `terrain` canvas (surface heights sampled every 4 px); the ground is fully
  solid below the surface — no buried voids.
- A `Uint8Array mask` (W×H) is rebuilt from alpha>100; `solid(x,y)` reads it.
- `crater(x,y,r)` cuts the canvas (dark rim + destination-out) and zeroes the
  mask — it is the ONLY way terrain changes.
- `hit(x,y)` tests a 14-point worm hitbox (`PTS`, a coffin silhouette ~9 px wide
  × 16 px tall — the real Worms mask, narrower than the drawn sprite) against
  terrain; `normalAt()` estimates bounce normals from the mask;
  `wormHit(w,x,y,pad)` is the same coffin (half-width profile `halfW`: widest
  4.5 px at mid-body, tapering to 1 px at the feet (+8) and 2 px at the head
  (−8), center `w.y`) expanded by the projectile's own mask: rockets/missiles
  (`pad 3`), shotgun/uzi bullets (`pad 1`), mines (`pad 5`), sheep (`pad 3`).
  `walk()` climbs up to 8 px (real Worms step height) and the coffin slips
  through a worm-wide hole (10 px in the integer mask grid).
  New projectile-vs-worm checks must use `wormHit`, not center distances.
- Worms are solid to each other: `hitW(w,x,y)` tests the terrain mask plus
  every other living worm's coffin (`wormAt`), and it is what `walk()`,
  `stepWorm()` gravity and `doTeleport()` validation use — so worms block each
  other, can be stood on (worm stacking) and fall when their footing moves
  away.
- Water line `WATER` starts at `WATER0=725` and rises during sudden death.

### Core state (module-level globals)

- Entity arrays: `worms, proj, parts, texts, tracers, crates, graves, rings,
  leaves, clouds, pend, rain, snow, fireflies`.
- `state`: `'menu' | 'aim' | 'settle' | 'over'`. `aim` = current worm may
  move/aim/fire; `settle` = projectiles resolving + retreat window; `over` =
  match finished.
- Turn: `turnTeam` (0–3), `turnNo`, `cur` (active worm), `cursor[team]` (rotation
  index), `retreat` (post-shot move window, 3 s), `quiet`/`settleT` (settle
  timeout: end turn after 1 s quiet or 25 s hard cap).
- Teams: `teamCount` (2–4). `TC[4]`/`TN[4]` are the team colors/names (TN index
  0–3, editable). `aiOn[4]`, `wins[4]`, `kdmg[4]`, `kills[4]`, `ammo[4]`,
  `lastWpn[4]` are all 4-wide regardless of `teamCount`.
- Settings: `perTeam, diff, hpIdx, ttIdx, guide, muted, skyIdx, terIdx, wxIdx, low`
  plus `teamCount, schIdx (scheme), wndIdx (wind), cratesOn` (persisted, see
  below). `SCH` = Normal / Greedy / Pro Mode / Bazooka Only; `WND` scales wind
  (light .5 / normal 1 / storm 1.75).
- `inp` = walk/aim booleans (+`jet`). `aimDrag` = map-drag aiming. `paused` (`helpWasPaused`
  remembers it while the Help overlay is open). `jumpT` = timestamp of the last
  jump, used for the double-tap backflip. `jetSndT` throttles the thruster SFX.
- `lastWpn[team]` = per-team weapon memory; `wepPage` = shelf page; `target` =
  chosen spot for targeted weapons; `wepList()` = active shelf (filtered to
  `bazooka` only in Bazooka Only scheme).
- Jetpack: per-worm `fuel` (0–`FUEL=150`), thrust `JET_T=1000` vs `G=620` while
  held, drain `JET_DRAIN=55`/s; human turns use `inp.jet`, AI turns use
  `w.aiJet`/`w.aiJetDir` bursts set in the walk phase, only during
  aim/retreat; refilled for the whole team in `startTurn()`. Draws an exhaust
  flame (`w.jet`) and a fuel bar above the active worm.

### Turn flow

`startTurn()` → sudden-death check (turn ≥ `SD_TURN=16`: sea rises 20 px/turn,
all worms take 5 wither damage/turn from turn 17, 60 % meteor chance from turn
19), wind reroll (±10 × `WND[wndIdx].k`), crate spawn (every 3rd turn if
`cratesOn`, max 3 live), restore `lastWpn`, refill jetpack fuel for the whole
team, banner. Player acts: walk (58 px/s), aim (clamp −1.2…1.45 rad),
charge (power ramps at 0.75/s), jet (hold, fuel-limited), fire. After firing,
`state='settle'`: 3 s retreat window (skip with FIRE, jet allowed), then the turn ends when
everything is quiet (`quiet>1`). `endTurn()` advances to the next *living* team
and calls `gameOver()` when ≤1 team remains; if the whole team is dead it keeps
scanning (never loops forever, even with 4 teams).

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

`WEP` array drives shelf order; array index → id. 15 weapons, 7 per page, but
all rendering/selection goes through `wepList()` (Bazooka Only returns just the
bazooka). The shelf shows page-local slots; keyboard `1–7` maps via
`wepPage*7+(key-1)` into `wepList()`, and weapon buttons are rebuilt by
`buildWeps()` (a `⇄` page button is hidden when there is only one page).
`⇄`/Q cycle `wepPage` modulo the page count (3 pages now). `updateWeps()` hides
zero-ammo weapons (`visibility:hidden`) and restores them whenever ammo
returns — it reruns on fire, crate pickup and turn start.
`TARGETED=['airstrike','teleport','homing']` use the two-step "tap map, then FIRE"
flow. `fire()` refuses anything not in `wepList()` or with `ammoOf(...)===0`.
`fire()` dispatches; behavior lives in `updateProj()` / `drawProj()`.

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
| `homing` | Targeted (tap to mark); fires bazooka-like, then after a 1 s launch phase steers ≤3 rad/s at the mark (no wind/gravity while locked, can fly under water); after 5 s it duds and drops; explodes on contact or within 14 px of the mark; 45 dmg |
| `bunker` | Rocket that drills on impact: three stacked blasts (r 50/34/28) carve a vertical tunnel |

Ammo: `ammo[team]` object; missing keys = unlimited (`ammoOf()` returns
`Infinity`). Always spend ammo via `useAmmo(id)` — it only decrements keys that
exist, so Greedy/Bazooka schemes stay unlimited instead of becoming `NaN`.
`SCH[schIdx].ammo()` produces the starting loadout (Normal, Greedy `{}`, Pro
Mode one-of-each minus airstrike, Bazooka Only `{}`). Crates (`pickCrate`) only
grant HP/ammo when actually useful, and ammo crates turn into HP when the loadout
has no grantable keys (Greedy).

### AI

`aiTurn(dt)` runs a per-turn state machine: `wait → think → (gun | strike |
walk | aim → charge) → done`. `DIFF[diff]` tunes aim error `an`, power error
`pn`, and walk threshold `thr`. Hard+ AI targets the lowest-HP enemy with
damage weighting (`pickTarget`). `aiOn[team]` marks CPU teams; `humanTurn()`
gates player input. In cpu mode the first `ceil(teamCount/2)` teams are the
player's (hot-seat) and the rest are CPU — 4 teams is always 2 vs 2, never
1 vs 3. AI never gets a retreat window. AI weapon choice is gated
by `has(id)` (= id present in `wepList()`) plus an `ammoOf(...)>0` check, so
schemes never strand the AI on an unavailable weapon. When a `walk`-phase
worm is blocked it fires a 0.6 s jet burst (`w.aiJet`/`w.aiJetDir`) from the
same fuel budget as the player, so the jetpack is fair vs CPU; human `inp`
never steers an AI worm.

### Rendering

Single `draw()` per frame, painter's order: shake → background → parallax
clouds (`(cam.x-W/2)*.45` offset) → terrain → graves → crates → worms (with jet
flame) → aim aids (barrel, reticle/target, guide arc, charge dots, arrow, fuel
gauge) → projectiles → tracers/rings → particles → leaves →
weather → animated water → floating texts → screen-space vignette (`vig`, rebuilt
on resize). `hud()` updates DOM bars, clock,
wind meter (clamped to 50 % width so Storm reads correctly), and tips. Team
chips are built once per game by `buildTeams()` (per-team name, HP bar, and
`.act` highlight on the current team); `#teams` uses a `t2`/`t3`/`t4` class.
Canvas text uses the `FONT` stack; the title/banner/clock use a condensed
display stack via CSS. **Low graphics** (`low`) is cosmetic-only: `resize()`
caps `dpr` at 1 (4× fewer pixels on most phones), and it draws no clouds,
leaves, fireflies or vignette, spawns minimal rain/snow without terrain
speckle, coarsens the water mesh, thins scenery/particle counts and lowers the
particle cap. It must never change gameplay, damage, or terrain.

### Loop

`frame()`: `requestAnimationFrame`, `dt=min(33 ms, elapsed)`, then
`update(dt)` + `draw()` + `hud()`. `paused` freezes the simulation but keeps
rendering.

### Input

- Buttons: `[data-k]` elements (walk/aim pad + `#jet`) use pointer capture;
  `#fire` is press-and-hold; `#jump`; weapon buttons rebuilt from `wepList()`
  by `buildWeps()`; `⇄` flips shelf pages.
- Canvas: tap selects one of your own worms (<22 px) or aims; drag aims
  continuously; targeted weapons set `target`. Two pointers = pinch zoom
  (`cvPts` map, baseline recorded on second pointerdown); wheel zooms on
  desktop; `+`/`-`/`=` keys zoom. `pointercancel` and `blur` must clear
  interactive state.
- `PC` (UA + `maxTouchPoints` check) adds `body.pc`: desktop CSS hides the
  touch pad groups (`#bottom>.grp:not(#weps)`), shows a crosshair cursor, and
  the menu hint switches to keyboard text; weapons are clickable with the
  mouse (the shelf uses `pointerdown`) as well as 1–7/Q. `rotCheck()` (called from
  `resize()`) shows the `#rot` overlay when a touch device is in portrait and
  pauses/unpauses the sim (`rotWasPaused`); the `booted` flag gates the
  pause logic so the boot-time `resize()` can't touch `state` before it is
  declared. `rotCheck()` exits immediately on PC. `togglePause()` refuses to
  unpause while `rotOn` (overlay up), and `toggleHelp()` keeps the sim paused
  when closing Help in portrait.
- Keyboard: `KM` maps arrows/WASD; `keyOf()` lowercases single chars
  (CapsLock-proof); Space charge, Enter/Shift jump, J jetpack, `+`/`-` zoom,
  1–7 weapon, Q page, P/Esc pause, H help.
- Backflip: `jump()` checks `now-jumpT<350` while airborne and flips
  (`w.flip=1`, `w.lowFlip=0`, backwards `vx=-dir*120`, `vy=-330` — higher than a
  normal jump); a third tap within the window flattens it into the low backflip
  (`w.lowFlip=1`, `vy≥-200`). `stepWorm` decays `w.flip` (faster when low),
  `drawWorm` rotates by `(1-w.flip)*-6.283*w.dir` (true backward somersault).
  Keep the flip cosmetic-only (it must not alter damage/terrain).
- Help overlay (`#help`) is opened by `toggleHelp()`, which pauses the sim and
  restores the previous paused state on close. `keydown` swallows all keys while
  it is open and closes it on Esc/P/H.
- Pause must gate every action entry point (`fire`/`startCharge`/`jump`/
  `setWpn`).

### Persistence

| Key | Meaning | Default |
|---|---|---|
| `gb_diff` | AI difficulty index 0–3 | 1 (Normal) |
| `gb_per` | worms per team 2–8 | 3 |
| `gb_hp` | HP index 0–2 (100/150/200) | 0 |
| `gb_tt` | turn timer index 0–3 (20/30/45/60) | 1 (30 s) |
| `gb_guide` | aim guide `'1'`/`'0'` | off |
| `gb_mute` | mute `'1'`/`'0'` | off |
| `gb_tn0`–`gb_tn3` | team names (≤12 chars) | RED / BLUE / GREEN / GOLD |
| `gb_sky` | sky theme index, −1 = random | −1 |
| `gb_ter` | terrain theme index, −1 = random | −1 |
| `gb_wx` | weather 0 clear / 1 rain / 2 snow, −1 = random | −1 |
| `gb_low` | low graphics `'1'`/`'0'` | off |
| `gb_teams` | team count 2–4 | 2 |
| `gb_sch` | scheme index 0–3 (Normal/Greedy/Pro/Bazooka Only) | 0 |
| `gb_wnd` | wind index 0–2 (light .5 / normal 1 / storm 1.75) | 1 |
| `gb_crate` | supply crates `'1'`/`'0'` | on |
| `gb_map` | map size index 0–2 (1400/2000/2800 wide) | 0 |

All reads are wrapped in try/catch (private-mode safe).

## Conventions

- Compact vanilla JS: terse names, dense one-liners, section dividers
  `/* ---------- x ---------- */`. Match surrounding style; do not reformat.
- Logical pixels everywhere; the canvas handles scaling, not CSS.
- New weapons: append to `WEP`, add a `fire()` branch, handling in
  `updateProj()` and a visual in `drawProj()`, starting ammo in `SCH[0]`'s
  loadout in `newGame()`, the crate pool in `pickCrate()`, and README tables.
  Shelf pages and `buildWeps()` update automatically via `wepList()`.
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

- Start both modes (Local Multiplayer, vs Computer) and each difficulty once; with
  4 teams vs Computer check the 2v2 split (two human teams, two CPU).
- Fire a weapon from each shelf page; verify ammo decrements and unlimited
  weapons stay unlimited. Try each scheme once (Greedy: everything unlimited;
  Pro Mode: no airstrike; Bazooka Only: single-slot shelf, ⇄ hidden).
- Set teams to 4 and play a few turns; verify the HUD chips, team names, banner
  colors, and that the turn arrows cycle through living teams.
- Wind on Storm: meter stays within the HUD and rockets bend hard.
- Targeted flow: airstrike / teleport / homing — tap map, reticle appears, FIRE works.
- Sheep: release, detonate via FIRE; confirm enemy-touch detonation.
- Mine: drop, walk away, arming delay, proximity trigger, chain reaction.
- Kill and drown worms: HUD bars drop to 0 (no ghost HP); graves appear and
  sink.
- Retreat: move after firing, press FIRE to skip, turn ends when quiet.
- Pause mid-flight; actions while paused are ignored.
- Keyboard: walk, CapsLock on, blur the window mid-walk (no runaway).
- Hitbox: blast a worm-wide hole and drop a worm into it; a worm climbs an
  8 px ledge automatically (narrow coffin mask, like the real game).
- Solid worms: walk into a worm — blocked (or climbed when within 8 px);
  stand on a worm's head; move or teleport the bottom worm away and the top
  one falls.
- PC: open in a desktop browser — touch pads hidden, mouse aim + wheel zoom
  work, hint shows keyboard keys, and no rotate overlay ever appears.
- Rotate: on a phone/tablet rotate to portrait mid-game — reminder shows and
  the sim pauses; rotate back and it resumes.
- Ammo shelf: empty a limited weapon — its icon vanishes from the shelf;
  pressing its old key slot tips "Out of ammo".
- New weapons: homing missile — mark a spot, fire it above obstacles and it
  homes in (duds and drops after ~5 s); bunker buster carves a three-blast
  tunnel into the ground.
- Weapon shelf: ⇄ and Q cycle all three pages, and the page follows the
  active weapon at turn start.
- Backflip: double-tap jump within ~0.35 s — worm leaps backwards with a
  somersault (higher than a normal jump); a third quick tap gives the flat low
  backflip (cosmetic only).
- Customization: rename teams, cycle sky/terrain/weather, toggle low
  graphics and sound; all persist across reloads. Low graphics visibly drops
  resolution and removes weather/decor while gameplay stays identical.
- Jetpack: hold 🚀 (or J) to climb; the fuel bar above the worm drains, stops
  at 0, and every team member refills on their next turn.
- Camera: pinch / scroll to zoom; it follows the active worm, the shell in
  flight, and the airstrike reticle; edges stay clamped inside the map.
- Map size: play a turn on Wide and Epic — terrain, water, sky and scenery
  span the full width and worms spawn spread out.
- Help: open from the menu and with H; it pauses the game, Esc/H/P closes it,
  and the previous paused state is restored.
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
- The worm mask is a deliberately narrow 9×16 coffin (real Worms fidelity):
  narrower than the ~17 px drawn sprite. Don't "fix" `PTS`/`halfW` to the
  artwork, or worms stop slipping through worm-wide holes and climbing 8 px
  ledges — and projectile pads must stay small (`wormHit` pad is the
  projectile's own mask, not a hit allowance).
- Movement/terrain checks must use `hitW(w,…)` (walk, gravity, teleport):
  plain `hit()` ignores other worms and lets them phase through each other.
- Keyboard goes through `keyOf()` — without it, CapsLock breaks WASD.
- Clear `inp` on `window blur` and `aimDrag` on `pointercancel`, or inputs
  stick after interruptions.
- Weapon index math: buttons exist for all 15, visibility is paged; keyboard
  selects `wepPage*7+i` into `wepList()`. Never assume raw indexes, re-derive
  buttons after scheme changes with `buildWeps()`, and cycle `wepPage` modulo
  the page count — a `^=1` toggle can never reach page 3.
- Never decrement ammo directly (`ammo[team][id]--`): in Greedy/Bazooka schemes
  the key is absent and `undefined--` turns the weapon into `NaN` (never
  unlimited, never zero). Always use `useAmmo(id)`.
- `endTurn()` must skip teams with no living worms (`do…while` with a bounded
  counter); the naive `(turnTeam+1)%teamCount` can land on a dead team and
  `startTurn()` would spin forever with 3–4 teams.
- The camera removed `sc`/`ox`/`oy`: pointer→world is always
  `cam.x+(clientX-innerWidth/2)/S()`, and `camClamp()` must follow any direct
  `cam` change. Leaving the old letterbox math anywhere silently breaks
  aiming/zoom.
- `W`/`H` are dynamic: `newGame()` sets `W` from `MAPS[mapIdx]` and calls
  `resize()` before `genTerrain()`/`mkBg()`/`initScenery()`. Anything cached at
  boot (terrain, `mask`, `bg`, terrain points, scenery) must be rebuilt there —
  never assume 1400.
- Jetpack is gated inside `stepWorm()` (`w===cur`, aim/retreat, `!paused`):
  human turns need `inp.jet && !aiOn[turnTeam]`, AI turns use `w.aiJet>0` and
  steer with `w.aiJetDir` only. Fuel is refilled per team in `startTurn()`.
- `startTurn()` re-clamps `wpn` from `lastWpn` — schemes can remove weapons
  from `wepList()`, so the stored weapon may be invalid.
- `lastTick` must be reset to 99 in `startTurn()` or the countdown ticker
  misbehaves.
- Rockets skip their own shooter only for 0.25 s (`p.age>.25`); sheep/mines
  exclude `e!==p.shooter`. Keep shooter exclusion when adding projectiles.
- `retreat=(wpn==='sheep'||aiOn[turnTeam])?0:3` — AI and sheep get no retreat
  window.
- Don't rename DOM ids — `$()` lookups and the `el` HUD map depend on them:
  `c, banner, tip, fire, jump, jet, weps, teams, time, wf, wtxt, sd, pause,
  snd, fs, quit, menu, msg, cnt, lvl, hp, tt, ag, tms, sch, wnd, crt, map, b2, b1`,
  plus the customization ids `tn0, tn1, tn2, tn3, sky, ter, wx, gfx, rnd, smute, bhelp, hclose`
  and `help`, plus `rot` (portrait rotate overlay).
- Team names feed `#msg` via `innerHTML` on the game-over screen — always pass
  them through `esc()`. Everywhere else they go through `textContent`.
- Keep `index.html` a single file. If it grows, tighten code — don't split.
