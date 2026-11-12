# Grub Blasters

[![Play: live demo](https://img.shields.io/badge/play-live_demo-ffcb3d?style=flat-square&logo=githubpages&logoColor=black)](https://mark44928.github.io/GrubBlastersHTML/)
[![GitHub stars](https://img.shields.io/github/stars/Mark44928/GrubBlastersHTML?style=flat-square)](https://github.com/Mark44928/GrubBlastersHTML/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/Mark44928/GrubBlastersHTML?style=flat-square)](https://github.com/Mark44928/GrubBlastersHTML/commits/main)
[![Single file HTML](https://img.shields.io/badge/single_file-HTML-5fd0ff?style=flat-square)](https://github.com/Mark44928/GrubBlastersHTML)
[![Dependencies: 0](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](https://github.com/Mark44928/GrubBlastersHTML)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![CI](https://github.com/Mark44928/GrubBlastersHTML/actions/workflows/ci.yml/badge.svg)](https://github.com/Mark44928/GrubBlastersHTML/actions/workflows/ci.yml)

Grub Blasters is a turn-based artillery game in the spirit of *Worms*, built entirely as a single, dependency-free HTML file. Two to four teams of worms hurl explosives across procedurally generated, fully destructible terrain while the wind shifts every turn. Last team standing wins.

**Play it now:** https://mark44928.github.io/GrubBlastersHTML/

**Play the originals:** [v0.2](https://mark44928.github.io/GrubBlastersHTML/legacy/grub-blasters.html) · [v0.1 prototype](https://mark44928.github.io/GrubBlastersHTML/legacy/4b843022-grub-blasters.html)

## Contents

- [Features](#features)
- [How to play](#how-to-play)
- [Keyboard](#keyboard)
- [Weapons](#weapons)
- [Running locally](#running-locally)
- [Tech](#tech)
- [History](#history)
- [License](#license)

## Features

- Local hot-seat play for 2–4 teams, or fight the computer (Baby / Easy / Normal / Hard / Brutal) — your teams always face an equal number of CPU teams (4 teams = 2 vs 2)
- Installable as an Android app: open the site in Chrome and tap "Add to Home screen" — it runs fullscreen and landscape like a native app
- 2–8 worms per team with a starting-HP slider (50–500); health crates and the vampire can heal a worm above its starting HP, like Worms Armageddon
- Weapon schemes: Normal, Greedy (every weapon unlimited), Pro Mode (scarce specials, no airstrike), and Bazooka Only — or build your own loadout with the 🔨 scheme editor, saved on the device and exportable / importable as JSON
- Three map sizes — Standard, Wide, and Epic — so big armies never clutter
- Floating islands mode: split the map into 1–6 sky islands that worms battle across
- Zoomable camera that follows the active worm and any shell in flight (pinch or scroll)
- Jetpack with a fuel tank — hold 🚀 to fly, fuel refills every turn, and CPU teams fly too
- One-tap sharing after every win (native share sheet on phones) and Add to Home Screen support for app-like play
- Tap any of your worms to take control of it — move anyone, anywhere
- Double-tap jump for a backflip — a backwards somersault that gains height, plus a flat "low backflip" variant
- Solid worms — they block each other, can be climbed and stood upon (worm stacking), and fall when their footing drops away
- Big customization: team count, computer level, scheme, worm count, HP and turn timer sliders, wind strength (0–2.5× slider — calm days to full storms), gravity (low / normal / high), sudden death timing, retreat time, jetpack fuel, supply crates on/off, barrels on/off/oil-only, map size and islands — plus 🎨 Customize for team names and colors, sky, terrain, weather and the aim guide, and ⚙️ Settings for interface theme, sound, menu song, vibration, auto replay, Worm Select, crate radar, graphics and fullscreen
- Cinematic explosions — layered boom audio, shockwave rings, fireballs, smoke, sparks, rim embers and dirt debris, with screen shake (and phone vibration) that scales with the blast
- Combo kill banners: blow up two or more worms in one blast for DOUBLE KILL / TRIPLE KILL / chain callouts — with a slow-motion flourish when a shot ends the match
- Turn replay: press R (or the 🎬 button) right after a shot to watch the last turn play out again — FIRE cycles play / 3× speed / pause, slow-mo with S, Esc closes; Auto Replay in ⚙️ Settings plays every turn back for you
- Eight interface themes: the default Modern look (glassy panels, gradients, tap feedback), the original Classic look, and six more palettes — Gruvbox (warm retro, #fabd2f accents), Tokyo Night (cool neon, #7aa2f7 accents), Dark (high-contrast night mode), Nord (cool slate, #88c0d0 accents), OLED Dark (pure black, #00ff88 accents) and Everforest (warm green, #a7c080 accents) — switch anytime in ⚙️ Settings → Interface.
- A synthesized menu theme song loops on the start screen — turn it off in ⚙️ Settings
- High-graphics mode (default) — detailed worms with animated tails and glossy highlights, textured terrain with grass fringes, rock strata and pebbles, a layered sunlit sky and volumetric clouds, rippling water with shimmer, glow trails and gloss on every projectile, richer explosions, fires, gas and barrels, plus a filmic vignette
- Medium-graphics mode — a performance middle ground: keeps the detailed terrain texture, cloud sprites, fire/gas effects and the vignette but trims particle counts, glow halos, tracer glow and rain/snow density for 60 FPS on mid-range phones
- Low-graphics mode — drops to 1× resolution and strips all effects, scenery and weather — for smoother play on older phones
- Barrels: On (a mix of drums and oil drums), Oil only (every barrel is an oil drum that ignites the ground when it blows), Barrel only (only plain drums, no oil), or Off
- Built-in Help & Controls screen (menu button or the H key)
- Fully destructible terrain — craters stay, worms fall
- Shifting wind that bends rockets mid-flight
- Seventy weapons in one tap-to-open shelf menu: bazooka, grenade, dynamite, shotgun, fire punch, mine, sheep, airstrike, teleport, holy grenade, cluster bomb, uzi, blowtorch, homing missile, bunker buster, magic bullet, banana bomb, dragon ball, mole bomb, lightning, flying saucer, mad cows, minigun, kamikaze, 1.5x damage, invulnerable, napalm strike, dynamite bundle, carpet bombing, nuke, homing pigeon, skunk, parachute, prod, suicide bomber, skip, shield, earthquake, vampire, sticky bomb, rubber grenade, girder, concrete donkey, crate vacuum, splitter, mortar, frost bomb, drone strike, grapple hook, freeze ray, meteor swarm, portal gun, black hole, laser cannon, seismic charge, phoenix, tesla coil, acid spray, time bomb, magnet mine, old woman, battle axe, sniper rifle, ballgun, flamethrower, cake, piano strike, watermelon, molotov, scales of justice
- The shelf panel shows each weapon's icon, name and remaining ammo
- Explosive barrels scattered across the map are solid — stand on them, or shoot one to erupt it, chaining into mines and other barrels. Some are oil drums that ignite the ground when they blow. Blow the ground out from under one and it drops (toggle in 🎨 Customize)
- Napalm and oil drums set the ground on fire — flames keep damaging anything standing in them while they burn; the skunk's gas cloud poisons worms, and a health crate cures them
- A crate radar rings the screen edge with gold arrows pointing to off-screen supply crates (toggle in ⚙️ Settings)
- Bouncing weapons (Grenade, Holy, Cluster, Banana, Mine, Dragon) ricochet off worms' bodies and barrels instead of passing through them — drop one straight onto a worm's head and it sits there until it blows, real-Worms style
- A 🔄 restart button in the top-right HUD restarts the current match from the beginning — same terrain, worms and barrels — after a quick confirmation
- Weapons you run out of ammo for stay on the shelf but grey out with ×0 — they light up again when you have ammo
- Touch-first controls with keyboard support; desktop computers hide the touch pads and play with mouse + keyboard — fullscreen and safe-area insets included
- Portrait phones and tablets get a friendly "rotate your device" reminder (desktops are exempt)
- Proximity mines that arm after 2 s, persist across turns, chain-react when shot, and are solid objects worms bump into
- Parachuted supply crates: +HP or bonus ammo
- Weather: rain, snow, and drifting fireflies on clear nights
- Worms have opinions — they taunt during battle
- Sudden death — Standard raises the sea from turn 16, Late from turn 25 (Off disables it), worms wither, and meteors start falling
- Session scoreboard: wins shown live in the HUD, kills and damage in the game-over summary
- Optional aim guide dotting the predicted path of every ballistic weapon you charge — bazooka, bunker buster, grenade, holy, cluster, banana, dragon, mole, napalm, bundle, magic and homing missiles, sticky and rubber bombs, splitter, mortar, drone, laser. Wind bends the two rockets like in the game itself, and the magic bullet and homing missile draw their actual curved homing path to your marked spot (no arc until a spot is marked — they can't be fired without one)
- Configurable turn timer (10–60 s slider)
- Red worm names when health runs low; victory confetti on the winner
- Four sky themes (day, sunset, night, dawn) — Auto rolls one per match, Real Time follows your device clock — and four terrain themes (grass, desert, snow, rock)
- Native system fonts and parallax clouds for a clean, pretty look
- Procedural sound effects synthesized with Web Audio — no audio files
- Pause button plus ⚙️ Settings — interface theme (Modern / Classic / Gruvbox / Tokyo Night / Dark / Nord / OLED Dark / Everforest), sound, menu song, vibration (haptic feedback on phones), auto replay, Worm Select, crate radar, graphics and fullscreen; settings persist in localStorage

## How to play

- Tap or drag the map to aim.
- Hold FIRE to charge rockets and lobs, release to shoot — other weapons fire on tap.
- Walk with the arrow buttons; climb with the up/down aim buttons; jump with the jump button.
- Worms are solid — you can't walk through one; stand on a teammate's head to stack up, and anyone standing on a worm falls when it moves away.
- Double-tap the jump button (or Enter/Shift) to backflip — a backwards somersault that gains height; tap jump once more mid-flip for a flat "low backflip".
- Hold 🚀 to fire the jetpack and fly; the fuel bar over your worm drains as you go and refills at the start of your next turn.
- Pinch the map (or scroll) to zoom — the camera follows your worm, the shell in flight, and your marked target. Two-finger drag (or right-drag on desktop) pans the map; moving or firing snaps the camera back.
- Tap one of your other alive worms to switch to it — you can move any worm on your turn, not just the next in line.
- After firing you get a short retreat window; press FIRE during it to skip it and end your turn early.
- Airstrike, teleport, the homing missile, the magic bullet, lightning, the carpet bombers, the nuke and the concrete donkey arm a map target first — tap the map, then press FIRE.
- Release the sheep and it wanders on its own, blowing up on the first worm it touches (or after 8 s); press FIRE again to detonate it on command. The dragon ball bounces on the same FIRE-to-detonate rule (it also blows after six bounces).
- The banana bomb bursts into five bananas that go off one after another; the mole bomb tunnels through rock in a dead-straight line in the direction you fired it and detonates the moment it finishes digging and pokes out of the rock. It also blows on a worm, after 5 seconds, or at the water line.
- The napalm strike sets the ground alight where it lands — flames bite anyone standing in them every couple of seconds, and oil drums spread the fire when they blow. The skunk sprays tall poisoned gas (wind carries it): anything in the cloud gets poisoned for the rest of the match — 5 HP a turn, never fatal — until a health crate cures it. The homing pigeon is fearless, flying straight through terrain to reach your marked spot.
- The fire punch is an uppercut that knocks a nearby enemy straight up into the air (and carves through terrain) — useful for launching worms into mines or water. Based on Ryu's Shoryuken.
- Invulnerable shields the active worm in a bubble for the rest of the turn — immune to damage, fall damage and poison, but NOT drowning or knockback.
- Drop a mine and walk away: it arms after 2 seconds, waits for any worm to come close, and survives between turns. Shoot one to set off a chain reaction. Armed mines are solid — but walking close or landing on one still trips the trigger first.
- The weapon shelf opens as a panel listing every weapon with icon, name and ammo; it follows your selection, and keyboard 1–7 maps to the first seven entries.
- Weapons you're out of ammo for stay on the shelf but grey out with ×0 — they light up again when you have ammo, and keyboard selection just says "Out of ammo".
- On a computer the touch pads hide themselves — aim with the mouse, click the weapon shelf (or press 1–7), hold Space to charge, Enter/Shift to jump, and use the shortcuts below.
- Phones and tablets: play in landscape — portrait shows a rotate reminder and pauses the game.
- Watch the wind meter in the HUD: it pushes rockets and slanting rain.
- Open Help & Controls from the menu button, or press H.
- Tap one of your own worms to take control of it mid-turn — turn **Worm Select** off in ⚙️ Settings to disable.
- After your shot lands you can watch it again: the 🎬 button appears (or press R). FIRE cycles play / 3× / pause, S slows it down, Esc closes it, and Auto Replay in ⚙️ Settings plays every turn back automatically.
- 🎨 Customize in the menu sets the match itself (teams, worms, HP, turn time, computer level, scheme, gravity, sudden death, retreat time, jetpack fuel, wind, crates, barrels, map, islands, names, colors, sky, terrain, weather, aim guide) while ⚙️ Settings holds the interface theme (Modern / Classic / Gruvbox / Tokyo Night / Dark / Nord / OLED Dark / Everforest), sound, menu song, vibration, auto replay, Worm Select, crate radar, graphics and fullscreen — Done (or Esc) closes either card and everything persists.
- Tap 🔨 beside **Weapon Scheme** in 🎨 Customize to build custom loadouts: press ＋ for a new scheme, name up to 24 of them, set every weapon to ∞ or 0–10 ammo, download them as JSON and import them on another device; deleting the last one leaves the editor empty until you press ＋ again.
- The parachute turns a fall into a glide — steer with ◀ ▶ and slow or speed the descent with ▲ ▼, then keep your turn and fire after landing; the prod shoves a worm without hurting it (straight into the sea, if you like); the suicide bomber trades your worm for a lingering poison cloud; and Skip hands the turn straight to the enemy.
- Don't like how the match is going? The 🔄 button (top-right of the HUD) restarts it from turn 1 — the exact same map, worms and barrels — after a quick confirmation.
- Shoot an explosive barrel and run: the blast sets off mines and other barrels nearby in a chain reaction. Barrels are solid — jump on top for a perch — and drop straight down when the ground beneath is destroyed.

### Keyboard

| Key | Action |
| --- | --- |
| Arrow keys / WASD | Walk and adjust aim |
| Space (hold) | Charge and release fire (also detonates the sheep / dragon ball and skips retreat) |
| Enter / Shift | Jump |
| J | Jetpack (hold) |
| + / − | Zoom in / out |
| 1–7 | Select a weapon from the shelf |
| R | Replay the last turn (FIRE cycles play / 3× / pause, S slow-mo, Esc/Enter closes) |
| H | Open Help & Controls |
| P / Esc | Pause |

## Weapons

Ammo below is for the Normal scheme. **Greedy** makes every weapon unlimited, **Pro Mode** keeps only one of each special (and no airstrike at all), and **Bazooka Only** strips the shelf down to the trusty bazooka. Custom schemes built in the 🔨 editor set their own per-weapon ammo (∞ or a fixed count).

| Weapon | Ammo | Notes |
| --- | --- | --- |
| Bazooka | Unlimited | Wind-affected rocket; explodes on impact |
| Grenade | Unlimited | 3 s fuse; bounces off slopes, worms and barrels |
| Dynamite | 2 per team | Dropped at your feet; 4 s fuse; biggest blast |
| Shotgun | Unlimited | Two instant hitscan shots |
| Airstrike | 1 per team | Pick a target; five bombs rain from the sky |
| Teleport | 2 per team | Warp your worm to a chosen spot |
| Sheep | 1 per team | Walks by itself until it finds a worm or is detonated |
| Mad Cows | 1 per team | Releases three charging cows one after another — each explodes on the first worm (friend or foe) or wall it meets, with Dynamite-strength force (75) |
| Fire Punch | Unlimited | Melee punch with heavy knockback that carves through terrain |
| Invulnerable | 2 per team | Shields the active worm in a bubble for the rest of the turn — immune to damage, fall damage and poison, but NOT drowning or knockback |
| Mine | 1 per team | Solid object; arms after 2 s; proximity trigger; chain-reacts |
| Holy Grenade | 1 per team | 3 s fuse; colossal blast with a white flash and choir tone |
| Cluster Bomb | 1 per team | Splits mid-air into five scattering bomblets (weak 10 HP core + 30 HP shrapnel each, matching Worms Armageddon) |
| Uzi | 2 per team | Six-shot burst with spread; instant hitscan |
| Blowtorch | 1 per team | Instantly cuts a short tunnel through terrain (and anyone in it) |
| Homing Missile | 1 per team | Tap the map to mark a spot, then charge it like a bazooka and fire — it locks on and homes in, crashing into anything in the way |
| Bunker Buster | 1 per team | Drills into the ground with three stacked blasts — great against dug-in worms |
| Magic Bullet | 1 per team | Mark a target, then charge it like a bazooka — the bullet spirals a path to the mark and erupts with a 100 HP blast |
| Banana Bomb | 1 per team | 3 s fuse; erupts into five bananas that burst in sequence (10 HP core + 30 HP minis each) |
| Dragon Ball | 1 per team | Bounces wildly with huge knockback; press FIRE to detonate it (or after six bounces) |
| Mole Bomb | 2 per team | Tunnels in a dead-straight line along its firing direction; explodes the moment it finishes digging and pokes out of the rock, on a worm, after 5 s, or at the water line |
| Lightning | 2 per team | Pick a target; five bolts crash down and strike anything in their path |
| Flying Saucer | 1 per team | Board it with FIRE for the turn — fuel-limited flight with stronger jets that even works underwater (🚀 to lift, walk pad to steer); FIRE again to land — you glide down and take no fall damage (Hedgewars-style) |
| Minigun | 1 per team | A rapid 16-shot spray of instant hitscan bullets with spread |
| Kamikaze | 2 per team | Your worm launches a suicidal charge — aim the direction first and it drills a dead-straight tunnel that way (point it up to dig diagonally); it detonates on the first worm it meets, at a map border, at the water, or after ~2 s — the kamikaze worm never survives |
| 1.5x Damage | 2 per team | Multiplies all damage you deal (and your explosion knockback) by 1.5 for the rest of the turn — stacks with nothing else, doesn't end your turn (Hedgewars-style) |
| Napalm Strike | 1 per team | Charged lob that bursts into burning ground — the fire keeps damaging anything standing in it |
| Dynamite Bundle | 1 per team | One bundle, three sticks: it pops open and the dynamite blows one after another |
| Carpet Bombing | 1 per team | Pick a target; five bouncing bombs cascade across the area, each blowing several times |
| Nuke | 1 per team | The big one — a shaped triple blast that leaves a smoking mushroom cloud |
| Homing Pigeon | 1 per team | Pick a target and release it — the bird flies straight through terrain and detonates on arrival (water stops it) |
| Skunk | 1 per team | Release it, then press FIRE to spray tall poisoned gas (wind carries it) — worms in the cloud are poisoned; FIRE again to detonate. It happily picks up crates on the way |
| Parachute | 2 per team | Leap and drift down under a canopy — steer left/right, slow the fall with ▲ or dive with ▼, and land without fall damage; the turn continues, so pick a weapon and fire after landing |
| Prod | 3 per team | Harmless poke that shoves a worm sideways and slightly up — perfect for nudging one into water or a mine |
| Suicide Bomber | 2 per team | Sacrifices your worm with a 30 HP blast and a lingering poison cloud, like Worms Armageddon's Suicide Bomber; no retreat |
| Skip | Unlimited | Ends your turn immediately — the enemy calls you a coward |
| Shield | 2 per team | Raises a bubble that absorbs the next hit you take (damage, fall damage, poison) — shatters on impact |
| Earthquake | 1 per team | Shakes the ground — damages every enemy worm standing on solid ground (no crater) |
| Vampire | 2 per team | Melee strike that drains 35 HP from a nearby enemy and heals you by the same amount |
| Sticky Bomb | 2 per team | Lobbed bomb that sticks on first contact and detonates after 3.5 s |
| Rubber Grenade | 2 per team | Bouncy grenade with near-perfect restitution — ricochets wildly before blowing (4 s fuse, countdown shown) |
| Girder | 2 per team | Places a solid 80×8 wooden platform where you are aiming, lifted clear of the ground — worms standing in the way are never trapped inside it |
| Concrete Donkey | 1 per team | Tap the map to drop a concrete donkey from the sky — it smashes down to the waterline, carving one clean straight shaft, hammering every worm in the column, shaking nearby worms loose and setting off crates and barrels on the way (your own team is spared) |
| Crate Vacuum | 2 per team | Pulls every live supply crate toward your worm — great for denying the enemy |
| Splitter | 2 per team | Grenade that bursts in mid-air into two scattering bomblets |
| Mortar | 2 per team | High-arcing shell with a 55 HP blast and heavy bounce |
| Frost Bomb | 2 per team | Freezes every worm in the blast on impact |
| Drone Strike | 1 per team | Mark a spot, then launch a drone that flies there and detonates |
| Grapple Hook | 2 per team | Hook a surface up to 300 px away and swing your worm onto it |
| Freeze Ray | 2 per team | Fast beam projectile that chills whatever it touches |
| Meteor Swarm | 1 per team | Mark the sky — five meteors rain down in sequence |
| Portal Gun | 2 per team | Mark a landing spot to blink your worm across the map |
| Black Hole | 1 per team | Mark a spot — it drags projectiles and crates in before collapsing |
| Laser Cannon | 2 per team | Instant hitscan beam that tunnels terrain and hits every worm along the line |
| Seismic Charge | 1 per team | Mark the ground — the charge drills straight down, cratering all the way to the waterline |
| Phoenix | 1 per team | Firebird that rebirths twice from its own blast, each arc flying lower |
| Tesla Coil | 2 per team | Deployed coil that stands still for 6 s and arcs lightning at nearby foes |
| Acid Spray | 2 per team | Melee spray that poisons worms it touches (+2 poison) |
| Time Bomb | 2 per team | Placed at your feet with a long 10 s fuse and an 80 HP blast |
| Magnet Mine | 2 per team | Mark a spot — the floating mine attracts projectile toward it |
| Old Woman | 1 per team | Walks with her umbrella and detonates near the enemy (75) — or press FIRE to blow her up early |
| Battle Axe | 2 per team | Melee swing that halves the victim's remaining HP, Worms Armageddon style |
| Sniper Rifle | 1 per team | Tap a spot — an instant precise shot (60) punches a hole in terrain or worm |
| Ballgun | 1 per team | Sprays a stream of bouncing paint balls (8 each) for ~2 s |
| Flamethrower | 1 per team | A 2 s cone of fire that scorches anything in front of you and leaves burning ground |
| Cake | 1 per team | Hedgewars birthday cake — a fast walker (75) you detonate by pressing FIRE again |
| Piano Strike | 1 per team | A grand piano falls from the sky and bounces up to 3 times, 80 per smash |
| Watermelon | 1 per team | Throw it; on detonation five juicy slices (35 each) spray the area |
| Molotov | 2 per team | Shatters on impact for 25 and leaves a pool of burning ground |
| Scales of Justice | 1 per team | Evens out every living worm's HP across all teams |

Crates can refill **any weapon that has limited ammo in the active scheme** (the scheme editor decides which weapons that is), or grant 35 HP / cure poison.

## Running locally

No build step. Open `index.html` in any modern browser, or serve the folder:

```sh
python -m http.server 8080
# open http://localhost:8080
```

Developer checks (Termux-first, no dependencies):

```sh
make check    # JS syntax + README size sync
make serve    # local preview on :8080
```

`make check` extracts the inline game script and runs `node --check` on it, then
verifies the "About N KB" line in this README matches `index.html`.

## Tech

Single file, zero dependencies, vanilla JavaScript and Canvas 2D. Terrain is generated from layered sine noise and rasterized into a pixel mask that powers collision, walking, and cratering. A pannable, zoomable, clamped camera follows the action across maps up to 2800×800, including the optional floating-islands mode. Sound effects are synthesized at runtime with Web Audio. Weather, particles, confetti, taunts, and meteors are all procedural, and the UI uses native system fonts — no downloads. About 263 KB in total.

## History

Grub Blasters was created by Mark44928 and launched in October 2026 as a single-file, dependency-free HTML5 take on the Worms artillery formula. The entire game is one `index.html` with zero dependencies, runs in any modern browser, and is published to GitHub Pages at https://mark44928.github.io/GrubBlastersHTML/ under the MIT License.

The project grew through a series of tagged releases:
- **v0.1–v0.2** - originally generated in the Claude app; v1.0 committed Oct 17. From legacy/ folder on source code.
- **v1.0.0** — Initial release: local hot-seat, wind-blown destructible terrain, 13 weapons (including the Mad Cow herd), an aim guide, sudden death, and procedural Web-Audio SFX.
- **v1.0.1** — Solid hitboxes on throwable weapons, optional Gemini AI (API key), left/right weapon navigation.
- **v1.0.2** — Full customization suite (gravity, sudden-death timing, retreat time, jetpack fuel, team colors), straight kamikaze/mole digging.
- **v1.0.3** — Aimable kamikaze, mole exit explosions, jump/backflip + footstep SFX, "Real Time" sky theme.
- **v2.0.0 — The Exploding Feature Update** — Smooth concrete-donkey shafts, uncapped Worms-style HP, installable PWA (inline manifest) and native Add-to-Home-Screen/share.
- **v2.0.1** — Aim guide for every charged ballistic weapon, per-weapon launch speeds.
- **v2.0.2 — Fidelity Update** — Worms Armageddon damage sweep (grenade 50, holy 100, cluster 20×5, banana 75…) and unified lob-throw physics.
- **v2.0.3** — Bug sweep: mine double-detonation, barrel kill credit, saucer landing safety, charge ownership, AI aim solver, girder placement, AI stall on empty ammo, legacy turn-time migration.
- **v2.5.0 — The Evergreen Update** — A new Medium graphics tier between High and Low, and the Everforest interface theme.
- **v2.6.0 — The Armageddon Update** — Ten new weapons straight from *Worms Armageddon* and *Hedgewars* (Old Woman, Battle Axe, Sniper Rifle, Ballgun, Flamethrower, Cake, Piano Strike, Watermelon, Molotov, Scales of Justice) with authentic behaviors, and team hats in the spirit of Hedgewars.
- **v2.6.1 — The Armageddon Update (fixes)** — Fixed a frame error ("p is not defined") where the new-weapon projectile art was accidentally placed inside the crate renderer, crashing every frame a non-health crate was drawn; the new projectile art now lives in `drawProj` and renders properly. New-weapon glow pass (high/medium graphics), richer W:A/Hedgewars-styled vector art for all ten new weapons, battle-axe slash burst and Scales of Justice flash, sniper muzzle flash, and Hedgewars Melon slices.
- **v2.6.2 — Tip fix** — The bottom hint bar no longer shows a stale timed toast over weapon setup; weapon selection clears the toast, manual-detonate prompts (dragon ball, sheep, skunk) take precedence, and Dragon Ball shows its own hold-FIRE/detonate hint while armed.
- **v2.6.3 — Tip fix (correct)** — The manual-detonate hint now names the actual weapon: Old Woman and Cake no longer say "🐉 detonate the dragon ball!" — every manual-detonate weapon shows its own prompt (Skunk / Old Woman / Cake / Dragon Ball).

## License

MIT — free to use, modify, and share. See [LICENSE](LICENSE).

If Grub Blasters brightened your day, a star on GitHub helps more players find it.
