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
   `#bottom` controls) plus `#banner`, `#tip`, the `#menu` start card (carries
   a temporary promotional `#soon` 2.0.0 teaser line — remove once 2.0.0
   ships), and the
   `#help` / `#custom` overlays (Help, Customize sub-card).
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
- `camManual` pauses following: `panCam(dx,dy)` pans by screen px and sets it;
  movement input, fire, jump, charge, aim-tap and `startTurn` clear it.
- `resize()` recomputes `dpr` (cap 2), canvas bitmap, `fit`, the vignette
  canvas and re-clamps the camera.
- All gameplay code speaks logical pixels only.

### Terrain & collision

- `genTerrain()` rasterizes layered sine noise + Gaussian bumps into a
  `terrain` canvas (surface heights sampled every 4 px); the ground is fully
  solid below the surface — no buried voids.
- `isl>0` switches `genTerrain()` to **floating islands**: `islands[]` of
  `{cx,hw,ty,th}` blobs (`seg=W/isl`, `hw≤seg*.38`, jitter ±.07seg so they
  can never overlap, bottoms stay above `WATER0`). `newGame()` then spreads
  worm spawn slots per island (`per[k]` slots across `cx±(hw-40)`) instead of
  the flat across-map formula.
- A `Uint8Array mask` (W×H) is rebuilt from alpha>100; `solid(x,y)` reads it.
- `crater(x,y,r)` cuts the canvas (dark rim + destination-out) and zeroes the
  mask — it is the ONLY explosion-style terrain change. `tunnel(x,y,r)` is the
  rim-less variant (destination-out + mask only, no scorch ring);
  `tunnelSeg(x0,y0,x1,y1,r)` is its capsule form (one round-cap
  destination-out stroke plus a capsule mask clear) used by the kamikaze,
  mole and blowtorch so continuous digs are smooth tubes, never chains of
  circles.
- `hit(x,y)` tests a 14-point worm hitbox (`PTS`, a coffin silhouette ~9 px wide
  × 16 px tall — the real Worms mask, narrower than the drawn sprite) against
  terrain; `normalAt()` estimates bounce normals from the mask;
  `wormHit(w,x,y,pad)` is the same coffin (half-width profile `halfW`: widest
  4.5 px at mid-body, tapering to 1 px at the feet (+8) and 2 px at the head
  (−8), center `w.y`) expanded by the projectile's own mask: rockets/missiles
  (`pad 3`), shotgun/uzi bullets (`pad 1`), mines (`pad 8` — larger than the
  mine's solid half-width 5 so the proximity trigger always wins the race
  against the solid block, both when walking into a mine and when landing on
  one), sheep (`pad 3`).
  `walk()` climbs up to 8 px (real Worms step height) and the coffin slips
  through a worm-wide hole (10 px in the integer mask grid).
  New projectile-vs-worm checks must use `wormHit`, not center distances.
  Bouncing weapons (grenade, holy, cluster, banana/bomblets, mine, dynamite,
  dragon) use `wormHit` pad 3 too, so after a 0.25 s shooter grace they collide
  with worms: they bounce off the coffin via `boxNorm(w,x,y,4.5,8)` instead of
  overlapping it (real Worms physics: grenades and mines can rest on a worm's
  head); only rockets/missiles detonate on contact.
- Worms are solid to each other and to solid props: `hitW(w,x,y)` tests the
  terrain mask plus every other living worm's coffin (`wormAt`) plus
  `propSolid()` — the 18×22 box of every live barrel and the ±5/±6 box of
  every armed mine (`proj` with `type==='mine'&&age>2`) — and it is what
  `walk()`, `stepWorm()` gravity and `doTeleport()` validation use — so worms
  block each other, can be stood on (worm stacking), stand on barrels (needs a
  jump/jet — barrels are 22 px tall, too high for the 8 px walk-up), and fall
  when their footing moves away.
- Water line `WATER` starts at `WATER0=725` and rises during sudden death.

### Core state (module-level globals)

- Entity arrays: `worms, proj, parts, texts, tracers, crates, graves, rings,
  leaves, clouds, pend, rain, snow, fireflies, bolts, barrels, barFx`.
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
  plus `teamCount, schIdx (scheme), wndIdx (wind), cratesOn, barrelsOn, mapIdx (map
  size), isl (floating islands 0–6, `ISLN` labels), wsel (Worm Select on/off),
  gravIdx (gravity `GRAVK` .6/1/1.5 → `GV=G*GRAVK[gravIdx]`), sdIdx (sudden death
  `SDT` 16/25/9999 → `sdTurn`), retIdx (retreat `RETV` Off/3s/6s), fuelIdx (jetpack
  `FUELV` 75/150/250 → `FUEL`), colIdx (team colors, `PAL`/`TC`)`
  (persisted, see
  below). `DIFF` = Baby / Easy / Normal / Hard / Brutal. `SCH` = Normal / Greedy / Pro Mode / Bazooka Only; `WND` scales wind
  (light .5 / normal 1 / storm 1.75).
- `inp` = walk/aim booleans (+`jet`). `aimDrag` = map-drag aiming. `paused` (`helpWasPaused`
  remembers it while the Help overlay is open). `jumpT` = timestamp of the last
  jump, used for the double-tap backflip. `jetSndT` throttles the thruster SFX;
  `walkSndT` throttles the footstep SFX (`walk()` plays `SFX.step` at most
  every 170 ms and only when the worm actually moved).
- `lastWpn[team]` = per-team weapon memory; `target` =
  chosen spot for targeted weapons; `wepList()` = active shelf (filtered to
  `bazooka` only in Bazooka Only scheme). `dmgBoost` = 1.5x Damage armed for
  the rest of the turn (reset in `startTurn()`).
- Jetpack: per-worm `fuel` (0–`FUEL`, `FUELV[fuelIdx]` = 75/150/250), thrust `JET_T=1000` vs `G=620` while
  held, drain `JET_DRAIN=55`/s; human turns use `inp.jet`, AI turns use
  `w.aiJet`/`w.aiJetDir` bursts set in the walk phase, only during
  aim/retreat; refilled for the whole team in `startTurn()`. Draws an exhaust
  flame (`w.jet`) and a fuel bar above the active worm.
- Flying Saucer (Hedgewars-style utility): per-worm `sau` (0–`SAU_F=240`).
  Firing the `saucer` weapon boards the craft (no turn end, bypasses the
  settle tail and returns early); FIRE again lands it; `startTurn()` zeroes
  `sau`. While `w.sau>0` the same jetting gate in `stepWorm()` applies saucer
  physics — thrust `SAU_T=1500`, rise cap −430, lateral accel 460 / cap ±260,
  drain `SAU_DRAIN=38`/s — and the drown check is skipped so the craft can fly
  underwater; running dry mid-water drowns the worm. Draws a saucer body
  (`w.sau>0`), a cyan thruster beam (`w.jet`) and a cyan fuel bar.
- Kamikaze: `w.kam` (seconds left) + `w.kdx`/`w.kdy` (unit vector from the aim
  angle — real Worms: "aim the worm in the direction you want to go") drive a
  suicidal charge inside `stepWorm()` — vx/vy `kdx/kdy*380`, a dead-straight
  gravity-free line along whatever direction you aimed, smooth rim-less
  `tunnelSeg()` trail, stops on any worm (`wormHit` pad 3), bounds (including
  off the top), `WATER-4` or timeout, then `explode(r 52 dmg 45)` and
  `killWorm()` guarantees the kamikaze worm dies.
  No retreat (`retreat` expression includes `kamikaze`).
- Explosive barrels: `barrels[]` = `{x,y,dead,vy}` (built by `buildBarrels()`,
  skipped when `barrelsOn` is off; count 5+W/700). Solid to worms
  (`propSolid`), drawn before worms (`drawBarrel`). `updateWorld()` drops
  unsupported barrels straight down (vertical only, gravity capped 700, small
  landing bounces at `vy>110`), removes dead or submerged ones, and nudges a
  worm overlapping a resting barrel out sideways so falling drums can never
  trap a worm inside their solid box. `explode()`
  marks barrels in `r+20` dead and queues `barFx`; `update()` re-explodes each
  queued barrel (r 54 dmg 60 kb 1.15), which can chain mines and other
  barrels. Projectiles collide with the barrel box: rockets (except the mole)
  detonate on contact, bouncing weapons (grenade, mine, banana, cluster,
  dragon…) bounce off it via `barrelAt()`/`boxNorm(barrel,x,y,9,11)` (the same
  box normal bounce handles worm collisions, `boxNorm` takes half-extents).
- 1.5x Damage (`xdmg`): a utility weapon — `fire()` spends ammo, sets
  `dmgBoost`, tips and returns early (no settle, no turn end). `damageWorm()`
  multiplies damage by 1.5 and `explode()` multiplies knockback `K` by 1.5
  while active; `hud()` shows `#xd` while it lasts.
- Match restart: `newGame()` ends with `captureSnap()` — a snapshot of
  `{W,H,turnTeam, terrain, mask, bg, islands, worms, barrels, clouds, leaves,
  fireflies, rain, snow}` (canvases and arrays copied). The `#rst` button runs
  `restartMatch()`: redraws the terrain canvas from the copy, `mask.set(...)`,
  restores the arrays, resets water/turn/ammo/wpn/camera and calls
  `startTurn()` — the same match replays instead of regenerating. Quitting to
  the menu nulls `matchSnap`.

### Turn flow

`startTurn()` → sudden-death check (turn ≥ `sdTurn` — Standard 16 / Late 25 /
Off 9999: sea rises 20 px/turn,
all worms take 5 wither damage/turn from turn 17, 60 % meteor chance from turn
19), wind reroll (±10 × `WND[wndIdx].k`), crate spawn (every 3rd turn if
`cratesOn`, max 3 live), restore `lastWpn`, refill jetpack fuel for the whole
team, banner. Player acts: walk (58 px/s), aim (clamp −1.2…1.45 rad),
charge (power ramps at 0.75/s), jet (hold, fuel-limited), fire. After firing,
`state='settle'`: retreat window `RETV[retIdx]` (Off 0 / 3 s / 6 s; skip with FIRE, jet allowed), then the turn ends when
everything is quiet (`quiet>1`). `endTurn()` advances to the next *living* team
and calls `gameOver()` when ≤1 team remains; if the whole team is dead it keeps
scanning (never loops forever, even with 4 teams).

### Gravity & damage

- `G=620`, scaled to `GV=G*GRAVK[gravIdx]` (Low .6 / Normal 1 / High 1.5)
  wherever gameplay gravity applies (worms, projectiles, animals, barrels,
  crates, the aim guide and the AI's `simBaz`/`planShot`; graves stay
  cosmetic). `stepWorm()` applies gravity with sub-stepping; fall damage when
  `vy>480`: `round((vy-480)/9)`.
- `damageWorm(w,d,by)` — stats tracking (`kdmg`, `kills`), flash, floating
  number. `killWorm(w,drown)` must leave `w.hp=0` (HUD reads hp of dead worms).
- Drowning: `w.y>WATER-6` or off-map (±30) → `killWorm(w,true)`.
- `explode(x,y,r,dmg,by)` — crater + radial knockback/damage
  (`f=1-d/(r+14)`), crate destruction, mine chain reactions (`chainFx`),
  rings, white flash for `r≥80`, screen shake.

### Weapons

`WEP` array drives shelf order; array index → id. 25 weapons, no pages, but
all rendering/selection goes through `wepList()` (Bazooka Only returns just the
bazooka). The shelf is a custom drop-up built by `buildWeps()`: a `#weps`
button shows the active weapon's icon/name/ammo (`∞` or `×n`) and opens a
full-width fixed panel (`.wep-pan`, grid, z-index 5, below the overlays) of
`.wcell` buttons showing every weapon's icon, short name (`WEP[].n`) and ammo;
`updateWeps()` rebuilds both, greys zero-ammo cells and reruns on fire, crate
pickup and turn start; an outside `pointerdown` closes the panel via
`closeWepPan()` (also called when the menu returns). Keyboard `1–7` maps
directly into `wepList()` indexes.
`TARGETED=['airstrike','teleport','homing','magic','lightning']` use the two-step "tap map, then FIRE"
flow (homing/magic still charge like a bazooka on hold; airstrike/teleport/lightning fire instantly).
Only `CHARGE` (`bazooka, grenade, holy, cluster, bunker, homing, magic, banana, dragon, mole`) charge on hold —
every other weapon fires instantly from `startCharge()`.
`fire()` refuses anything not in `wepList()` or with `ammoOf(...)===0` — except
landing the saucer (`wpn==='saucer'&&w.sau>0` cancels before the ammo check).
`fire()` dispatches; behavior lives in `updateProj()` / `drawProj()`. The
`saucer` branch is a movement utility: it spends ammo, boards (`w.sau=SAU_F`)
and `return`s early so it never sets `state='settle'`; `xdmg` is the same
early-return trick for the damage buff.

| id | Special handling |
|---|---|
| `bazooka` | Wind-affected rocket (`vx+=wind*4*dt`); explodes on solid/worm contact after age 0.25 s (so you can't blow yourself up instantly) |
| `grenade` | Bouncing (`bn`/`fr`), 3 s fuse, bounces off worms |
| `dynamite` | Dropped at feet, 4 s fuse, r 78 dmg 80 |
| `shotgun` | Instant hitscan, 2 shots at 0.5 s spacing, r 16 dmg 26 |
| `airstrike` | Targeted; 5 bombs delivered via `pend` |
| `teleport` | Targeted; `doTeleport` validates the spot (≥24 px below the sky, above water, in bounds) |
| `sheep` | Wanders (`dir` flips at walls), detonates on an enemy <18 px or 8 s fuse; FIRE detonates on command; ignores its shooter |
| `cow` | Herd of 3 released one at a time (0.35 s apart, each moos as it appears) marching straight at 95 px/s; explodes on any worm except the shooter (own team included), a >6 px wall, the map edge, or its 10 s fuse; splashes in water; no manual detonation |
| `xdmg` | Utility: spends ammo, sets `dmgBoost`, returns early — no settle, no turn end |
| `kamikaze` | Sets `w.kam=2.2` and the aim vector `w.kdx`/`w.kdy`; the charge, digging and explosion live in `stepWorm()` (see Core state) |
| `minigun` | Rapid hitscan volley via the shared `shots/shotT/shotCfg` machinery: 16 shots, dmg 6, spread .09, 0.07 s spacing |
| `hammer` | Melee check 42 px ahead, knockback vx 380 / vy −260, 30 dmg |
| `mine` | Solid to worms once armed (pad 8 proximity always trips before the ±5/±6 block); arms after 2 s, trigger <17 px, persists across turns, bounces off worms and barrels, explodes when caught in another blast |
| `holy` | Big blast r 85 dmg 75, choir SFX |
| `cluster` | Splits into 4 bomblets on fuse/water (`splitCluster`) |
| `uzi` | 6 hitscan shots with spread, 0.12 s apart |
| `torch` | `torchCut()` carves a ~110 px tunnel, 10 dmg per worm, insta-fire |
| `homing` | Targeted (tap to mark) and charged like a bazooka; flies straight for ~150 px, then steers ≤3 rad/s at the mark — wind/gravity never apply until it duds, and it can fly under water; detonates within 14 px of the mark, on contact, or after 5 s when it duds and drops; 45 dmg |
| `bunker` | Rocket that drills on impact: three stacked blasts (r 50/34/28) carve a vertical tunnel |
| `magic` | Superweapon (1/team): targeted + charged; accelerates 140→700 px/s, ~80 px straight launch then steers ≤4.5 rad/s at the mark with no gravity/wind and flies under water; detonates within 20 px of the mark, on contact, or after 9 s with a holy-sized blast (r 88 dmg 85, ~100 HP at center) |
| `banana` | 3 s fuse lob; `splitBanana()` fires an r 64 dmg 66 blast then 5 staggered `bomblet`s (`ban:true`, fuses .45–1.6 s) |
| `dragon` | Very bouncy (`bn .82`/`fr .94`), no retreat; `curDet` + FIRE detonates it (`detonateProj`), 6 bounce `taps` also blow it; `kb 1.6` knockback multiplier (explode's 6th arg) |
| `mole` | On its first ground contact it locks its impact direction (`p.dux`/`p.duy`) and drills in a dead-straight line at a constant 150 px/s with gravity disabled — tunneling through rock (`p.did`/`p.burrow`); the burrow block stamps smooth rim-less r 9 `tunnelSeg()` capsules — trailing ≥10 px behind the head so the mole's own `solid()` emerge check stays valid — and kicks up dirt particles; explodes the moment it finishes digging and pokes out (solid-free for 2 px); any worm contact explodes it, as does a 5 s fuse or crossing the water line (explosion r 52 dmg 62) |
| `lightning` | Targeted; `doLightning` queues 5 `pend` entries with `lit:true`; `strikeLit` scans down for a worm (`wormHit` pad 2) or solid and explodes r 30 dmg 40, drawing a `bolts` jagged bolt with thunder SFX |
| `saucer` | Movement utility, not a projectile: FIRE boards it (spends ammo, `w.sau=SAU_F`, early `return` — never sets `settle`, never ends the turn); FIRE again lands. Flight physics are in `stepWorm` (SAU_T thrust, SAU_DRAIN, rise cap −430, lateral 460/±260); the drown check is skipped while `w.sau>0` so it can fly underwater (running dry there drowns), and `startTurn()` zeroes `sau` |

Ammo: `ammo[team]` object; missing keys = unlimited (`ammoOf()` returns
`Infinity`). Always spend ammo via `useAmmo(id)` — it only decrements keys that
exist, so Greedy/Bazooka schemes stay unlimited instead of becoming `NaN`.
`SCH[schIdx].ammo()` produces the starting loadout (Normal, Greedy `{}`, Pro
Mode one-of-each minus airstrike, Bazooka Only `{}`). Crates (`pickCrate`) only
grant HP/ammo when actually useful, and ammo crates turn into HP when the loadout
has no grantable keys (Greedy).

### AI

`aiTurn(dt)` runs a per-turn state machine: `wait → think → (gun | strike |
walk | aim → charge) → done`. `DIFF[diff]` (Baby / Easy / Normal / Hard /
Brutal) tunes aim error `an`, power error `pn`, and walk threshold `thr`, and
the per-weapon choice probabilities are index-5 arrays; Baby/Easy pick targets
at random, Normal+ target the lowest-HP enemy with damage weighting
(`pickTarget`). `aiOn[team]` marks CPU teams; `humanTurn()`
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
clouds (`(cam.x-W/2)*.45` offset) → terrain → graves → crates → barrels →
worms (with jet
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
leaves, fireflies, rain, snow or vignette, coarsens the water mesh, thins
scenery/particle counts and lowers the particle cap. It must never change
gameplay, damage, or terrain.

### Loop

`frame()`: `requestAnimationFrame`, `dt=min(33 ms, elapsed)`, then
`update(dt)` + `draw()` + `hud()`. `paused` freezes the simulation but keeps
rendering.

### Input

- Buttons: `[data-k]` elements (walk/aim pad + `#jet`) use pointer capture;
  `#fire` is press-and-hold; `#jump`; `#rst` is the HUD restart button
  (`confirm()` → `restartMatch()`); the weapon shelf button + panel are
  rebuilt from `wepList()` by `buildWeps()`.
- Canvas: tap selects one of your own worms (<22 px, with Worm Select on) or aims; drag aims
  continuously; targeted weapons set `target`. Two pointers = pinch zoom
  (`cvPts` map, baseline recorded on second pointerdown) plus midpoint
  `panCam` (only past a 16 px drag, so a pure pinch keeps following);
  right/middle-button drag = `panDrag`. Wheel zooms on
  desktop; `+`/`-`/`=` keys zoom. `pointercancel` and `blur` must clear
  interactive state (including `panDrag`).
- `PC` (UA + `maxTouchPoints` check) adds `body.pc`: desktop CSS hides the
  touch pad groups (`#bottom>.grp:not(#weps)`), shows a crosshair cursor, and
  the menu hint switches to keyboard text; the weapon dropdown is clickable with the
  mouse as well as 1–7. `rotCheck()` (called from
  `resize()`) shows the `#rot` overlay when a touch device is in portrait and
  pauses/unpauses the sim (`rotWasPaused`); the `booted` flag gates the
  pause logic so the boot-time `resize()` can't touch `state` before it is
  declared. `rotCheck()` exits immediately on PC. `togglePause()` refuses to
  unpause while `rotOn` (overlay up), and `toggleHelp()` keeps the sim paused
  when closing Help in portrait.
- Keyboard: `KM` maps arrows/WASD; `keyOf()` lowercases single chars
  (CapsLock-proof); Space charge, Enter/Shift jump, J jetpack, `+`/`-` zoom,
  1–7 weapon, P/Esc pause, H help.
- Backflip: `jump()` checks `now-jumpT<350` while airborne and flips
  (`w.flip=1`, `w.lowFlip=0`, backwards `vx=-dir*120`, `vy=-330` — higher than a
  normal jump); a third tap within the window flattens it into the low backflip
  (`w.lowFlip=1`, `vy≥-200`). A jump plays `SFX.jump` (springy boing); both
  flip variants play the distinct `SFX.backflip` flourish. `stepWorm` decays
  `w.flip` (faster when low),
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
| `gb_diff` | AI difficulty index 0–4 (Baby…Brutal); legacy 0–3 saves migrate +1 via `gb_dv` | 2 (Normal) |
| `gb_per` | worms per team 2–8 | 3 |
| `gb_hp` | HP index 0–2 (100/150/200) | 0 |
| `gb_tt` | turn timer index 0–3 (20/30/45/60) | 1 (30 s) |
| `gb_guide` | aim guide `'1'`/`'0'` | off |
| `gb_mute` | mute `'1'`/`'0'` | off |
| `gb_tn0`–`gb_tn3` | team names (≤12 chars) | RED / BLUE / GREEN / GOLD |
| `gb_sky` | sky theme index, −1 = random, 4 = Real Time (device clock) | −1 |
| `gb_ter` | terrain theme index, −1 = random | −1 |
| `gb_wx` | weather 0 clear / 1 rain / 2 snow, −1 = random | −1 |
| `gb_low` | low graphics `'1'`/`'0'` | off |
| `gb_teams` | team count 2–4 | 2 |
| `gb_sch` | scheme index 0–3 (Normal/Greedy/Pro/Bazooka Only) | 0 |
| `gb_wnd` | wind index 0–2 (light .5 / normal 1 / storm 1.75) | 1 |
| `gb_crate` | supply crates `'1'`/`'0'` | on |
| `gb_map` | map size index 0–2 (1400/2000/2800 wide) | 0 |
| `gb_isl` | floating islands 0–6 (0 = off) | 0 |
| `gb_wsel` | Worm Select `'1'`/`'0'` (tap own worms to switch) | on |
| `gb_barl` | explosive barrels `'1'`/`'0'` | on |
| `gb_grav` | gravity index 0–2 (Low .6 / Normal 1 / High 1.5) | 1 |
| `gb_sdv` | sudden death index 0–2 (Standard 16 / Late 25 / Off) | 0 |
| `gb_ret` | retreat time index 0–2 (Off / 3s / 6s) | 1 |
| `gb_fuel` | jetpack fuel index 0–2 (75/150/250) | 1 |
| `gb_tc0`–`gb_tc3` | team color index 0–7 into `PAL` | 0/1/2/3 |
| `gb_dv` | migration marker: `1` once `gb_diff` is Baby-shifted | unset |

All reads are wrapped in try/catch (private-mode safe).

## Conventions

- Compact vanilla JS: terse names, dense one-liners, section dividers
  `/* ---------- x ---------- */`. Match surrounding style; do not reformat.
- Logical pixels everywhere; the canvas handles scaling, not CSS.
- New weapons: append to `WEP`, add a `fire()` branch, handling in
  `updateProj()` and a visual in `drawProj()`, starting ammo in `SCH[0]`'s
  loadout in `newGame()`, the crate pool in `pickCrate()`, and README tables.
  The shelf panel and `buildWeps()` update automatically via `wepList()`.
- New settings: `<select>` in the `#custom` sub-menu (or HUD), load inside
  the localStorage `try{}` block, handle in `selCh()` + add to the bind list
  and `syncUI()`, document in README. The card is grouped into `.csec`
  sections inside a `.cgrid` (two columns ≥620 px) with `<label class="crow">`
  rows — presentation only, all ids stay unchanged.
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
- Fire weapons from the dropdown; verify ammo decrements and unlimited
  weapons stay unlimited. Try each scheme once (Greedy: everything unlimited;
  Pro Mode: no airstrike; Bazooka Only: single-weapon dropdown).
- Set teams to 4 and play a few turns; verify the HUD chips, team names, banner
  colors, and that the turn arrows cycle through living teams.
- Wind on Storm: meter stays within the HUD and rockets bend hard.
- Targeted flow: airstrike / teleport / homing / magic — tap map, reticle appears, FIRE works.
- Sheep: release, detonate via FIRE; confirm enemy-touch detonation.
- Mad Cow: release the herd (bottom of the dropdown) — three cows appear one after another and blow up on the first worm (friend or foe!) or wall; they splash in water.
- Mine: drop, walk away, arming delay, proximity trigger, chain reaction;
  walk into an armed one and it still trips before the solid block stops you.
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
- Bouncing weapons vs worms: a grenade bounces off a worm's body instead of
  passing through; fired straight down onto a worm's head it rests there until
  the fuse blows (drop a mine the same way and it arms into a "mine hat");
  rockets still explode on contact.
- PC: open in a desktop browser — touch pads hidden, mouse aim + wheel zoom
  work, hint shows keyboard keys, and no rotate overlay ever appears.
- Rotate: on a phone/tablet rotate to portrait mid-game — reminder shows and
  the sim pauses; rotate back and it resumes.
- Ammo shelf: empty a limited weapon — its dropdown entry is disabled (and
  vanishes from Pro/Normal competition); selecting it tips "Out of ammo".
- New weapons: homing missile — the yellow aim cross shows while no mark is
  set; mark a spot, fire it above obstacles and it homes in (duds and drops
  after ~5 s); bunker buster carves a three-blast tunnel into the ground;
  magic bullet (gold reticle) spirals around obstacles to the mark and
  detonates with a Holy-Grenade-sized blast — one per team, and it fails and
  explodes in place after 9 s if it cannot reach; banana bomb erupts into
  five bananas that burst in sequence; the dragon ball bounces wildly and
  blows on FIRE (or after six bounces) with extra knockback; the mole bomb
  tunnels through rock in a dead-straight line along its firing direction,
  exploding the moment it finishes digging and pokes out of the rock, on a
  worm, after 5 s, or at the water line; lightning strikes five
  jagged bolts at the target, hitting worms above cover; minigun sprays 16
  hitscan bullets; kamikaze charges dead-straight along the direction you
  aimed (point it up to drill diagonally through a hill), detonating on the
  first worm, a map border or timeout, and always killing the kamikaze worm
  with a smooth tube behind it; 1.5x Damage arms for the
  turn without ending it (HUD shows 💪 and damages read 1.5×).
- Barrels: shoot one — it erupts and chains into mines and nearby barrels;
  jump onto one (solid platform, 22 px tall — too high to walk up) and blast
  the ground under it — it drops straight down and settles; rising water
  deletes submerged barrels.
- Restart: 🔄 in the HUD confirms, then replays the same match — terrain, worms, barrels and turn 1 are restored from the `matchSnap` taken in `newGame()` (`restartMatch()`), not regenerated.
- Weapon shelf: tapping the shelf button opens the panel listing every weapon
  with icon/name/ammo; it follows the active weapon at turn start, greys
  empty weapons, closes on outside tap, and keys 1–7 pick the first seven.
- Backflip: double-tap jump within ~0.35 s — worm leaps backwards with a
  somersault (higher than a normal jump); a third quick tap gives the flat low
  backflip (cosmetic only).
- Customization: 🎨 Customize in the start menu opens the sub-card (Done or
  Esc closes); everything is set from `<select>`s there — teams, worms, HP,
  turn time, computer level, scheme, gravity, sudden death, retreat time,
  jetpack fuel, wind, crates, barrels, map, islands, aim guide, names, team
  colors (tap a swatch to cycle the 8-color `PAL`), sky/terrain/weather,
  graphics, sound, Worm Select — handled by
  `selCh()` and all persist across reloads. The Rules selects change the match
  itself: Low gravity floats shells and softens falls, Sudden death Off never
  raises the sea, and Retreat time / Jetpack fuel are felt from the first turn.
  Low graphics visibly drops
  resolution and removes weather/decor while gameplay stays identical.
- Worm Select: with it On, tap another of your own worms to hand the turn to it
  (cyan fuel bar follows); with it Off, taps only aim. Toggle persists.
- Jetpack: hold 🚀 (or J) to climb; the fuel bar above the worm drains, stops
  at 0, and every team member refills on their next turn.
- Flying Saucer: pick 🛸 from the dropdown and FIRE to board — the craft draws under the
  worm with a cyan fuel bar; hold 🚀 / pad to fly with stronger jets, dive
  underwater (drowning is suppressed while fuel lasts), FIRE again to land;
  running dry over water drowns the worm; firing any weapon ends the turn.
- Share: menu 📣 / game-over 📣 — on a phone the native share sheet opens;
  on desktop the link is copied with a tip; Add to Home Screen installs like an app.
- Camera: pinch / scroll to zoom; two-finger drag (or right-drag) pans the
  map and pauses following, then moving or firing snaps the camera back; it
  follows the active worm, the shell in flight, and the airstrike reticle;
  edges stay clamped inside the map.
- Map size: play a turn on Wide and Epic — terrain, water, sky and scenery
  span the full width and worms spawn spread out.
- Islands: set Islands to 4 — four separate floating landmasses with water
  gaps, worms spread across them, none drowned at spawn; set back to Off and
  regenerate.
- Weapon shelf labels: the dropdown lists every weapon as icon + name + ammo
  (e.g. 🚀 Bazooka ×8, ⚙️ Minigun ×1).
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

- Digs (mole, blowtorch, kamikaze) must stamp `tunnelSeg()`/`tunnel()`, never
  `crater()`: each crater disc paints a dark scorch ring, so a chain of them
  reads as a "path of circles" through the rock instead of a clean tunnel.
  Stamp one `tunnelSeg()` capsule per frame between the old and new position —
  never per-sample discs — and keep the mole's trail ≥10 px behind the head
  (`lim=md-10`): carving up to the head itself makes the `solid()` emerge
  check fail and the mole never surfaces.
- `killWorm` must set `w.hp=0` — drowned / wither-killed worms otherwise show
  ghost HP in the team HUD bars.
- The worm mask is a deliberately narrow 9×16 coffin (real Worms fidelity):
  narrower than the ~17 px drawn sprite. Don't "fix" `PTS`/`halfW` to the
  artwork, or worms stop slipping through worm-wide holes and climbing 8 px
  ledges — and projectile pads must stay small (`wormHit` pad is the
  projectile's own mask, not a hit allowance).
- Movement/terrain checks must use `hitW(w,…)` (walk, gravity, teleport):
  plain `hit()` ignores other worms and solid props, letting everything phase
  through them.
- Solid props are part of `hitW` via `propSolid()` (barrel 18×22 box, armed
  mine ±5/±6 box). Keep the mine's `wormHit` trigger pad (8) larger than its
  solid half-width (5): if the solid box wins the race, a worm walking into a
  mine gets blocked at the trigger boundary (or lands on top of it) and the
  mine never trips. Barrel
  physics is vertical-only (real Worms): `updateWorld()` never moves `b.x`,
  and `barrelAt()`/`boxNorm(barrel,x,y,9,11)` give projectiles their box
  normal. Don't make crates solid — in Worms Armageddon they are walk-through
  pickups.
- A resting projectile wakes when its support disappears — terrain, barrel OR
  worm (`p.rest` clears only when `solid`, `barrelAt` and `wormAt` below all
  fail). Dropping the worm term makes a dragon resting on a worm's head
  re-collide every frame and burn its 6 bounce `taps` in six frames.
  Non-rocket bounces pick their normal worm → barrel → terrain
  (`boxNorm(w,x,y,4.5,8)` for the coffin) with the same 0.25 s shooter grace
  as rockets; only rockets explode on worm contact.
- Keyboard goes through `keyOf()` — without it, CapsLock breaks WASD.
- Clear `inp` on `window blur` and `aimDrag` on `pointercancel`, or inputs
  stick after interruptions.
- Weapon index math: the dropdown maps option index directly into
  `wepList()`; keys 1–7 do the same with indexes 0–6. Never assume raw `WEP`
  indexes — re-derive options after scheme changes with `buildWeps()`.
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
- `retreat=(wpn==='sheep'||wpn==='dragon'||wpn==='kamikaze'||aiOn[turnTeam])?0:3` —
  AI, sheep, the dragon ball and kamikaze get no retreat window.
- Don't rename DOM ids — `$()` lookups and the `el` HUD map depend on them:
  `c, banner, tip, fire, jump, jet, weps, teams, time, wf, wtxt, xd, sd, rst, pause,
  snd, fs, quit, menu, msg, cnt, lvl, hp, tt, ag, tms, sch, wnd, crt, barl, map, isl, b2, b1`,
  plus the customization ids `tn0, tn1, tn2, tn3, tc0, tc1, tc2, tc3, grav, sdx, ret, fuel, sky, ter, wx, gfx, smute, wsel, bhelp, hclose, bshare, shareWin`
  and `help`, plus `custom`/`bcustom`/`cclose` (Customize sub-card),
  plus `rot` (portrait rotate overlay).
- Team names feed `#msg` via `innerHTML` on the game-over screen — always pass
  them through `esc()`. Everywhere else they go through `textContent`.
- Keep `index.html` a single file. If it grows, tighten code — don't split.
