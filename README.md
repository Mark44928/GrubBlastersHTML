# Grub Blasters

[![Play: live demo](https://img.shields.io/badge/play-live_demo-ffcb3d?style=flat-square&logo=githubpages&logoColor=black)](https://mark44928.github.io/GrubBlastersHTML/)
[![GitHub stars](https://img.shields.io/github/stars/Mark44928/GrubBlastersHTML?style=flat-square)](https://github.com/Mark44928/GrubBlastersHTML/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/Mark44928/GrubBlastersHTML?style=flat-square)](https://github.com/Mark44928/GrubBlastersHTML/commits/main)
[![Single file HTML](https://img.shields.io/badge/single_file-HTML-5fd0ff?style=flat-square)](https://github.com/Mark44928/GrubBlastersHTML)
[![Dependencies: 0](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](https://github.com/Mark44928/GrubBlastersHTML)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

Grub Blasters is a turn-based artillery game in the spirit of *Worms*, built entirely as a single, dependency-free HTML file. Two to four teams of worms hurl explosives across procedurally generated, fully destructible terrain while the wind shifts every turn. Last team standing wins.

**Play it now:** https://mark44928.github.io/GrubBlastersHTML/

## Features

- Local hot-seat play for 2–4 teams, or fight the computer (Easy / Normal / Hard / Brutal) — your teams always face an equal number of CPU teams (4 teams = 2 vs 2)
- 2–8 worms per team with configurable starting HP (100 / 150 / 200)
- Weapon schemes: Normal, Greedy (every weapon unlimited), Pro Mode (scarce specials, no airstrike), and Bazooka Only
- Three map sizes — Standard, Wide, and Epic — so big armies never clutter
- Floating islands mode: split the map into 1–6 sky islands that worms battle across
- Zoomable camera that follows the active worm and any shell in flight (pinch or scroll)
- Jetpack with a fuel tank — hold 🚀 to fly, fuel refills every turn, and CPU teams fly too
- One-tap sharing after every win (native share sheet on phones) and Add to Home Screen support for app-like play
- Tap any of your worms to take control of it — move anyone, anywhere
- Double-tap jump for a backflip — a backwards somersault that gains height, plus a flat "low backflip" variant
- Solid worms — they block each other, can be climbed and stood upon (worm stacking), and fall when their footing drops away
- Big customization: team count, AI level, worm count, HP, turn timer, wind strength (light / normal / storm), supply crates on/off, and map size — plus a 🎨 Customize screen for team names, sky, terrain, weather, graphics, sound and Worm Select on/off
- Low-graphics mode — drops to 1× resolution and strips all effects, scenery and weather — for smoother play on older phones
- Built-in Help & Controls screen (menu button or the H key)
- Fully destructible terrain — craters stay, worms fall
- Shifting wind that bends rockets mid-flight
- Twenty-two weapons on four shelf pages (cycle with ⇄): bazooka, grenade, dynamite, shotgun, hammer, mine, sheep, airstrike, teleport, holy grenade, cluster bomb, uzi, blowtorch, homing missile, bunker buster, magic bullet, banana bomb, dragon ball, mole bomb, lightning, flying saucer, mad cow
- Every shelf button shows its icon plus the weapon name, with the ammo count in the corner
- Weapons you run out of ammo for vanish from the shelf and come back when you have ammo again
- Touch-first controls with keyboard support; desktop computers hide the touch pads and play with mouse + keyboard — fullscreen and safe-area insets included
- Portrait phones and tablets get a friendly "rotate your device" reminder (desktops are exempt)
- Proximity mines that arm after 2 s, persist across turns, and chain-react when shot
- Parachuted supply crates: +HP or bonus ammo
- Weather: rain, snow, and drifting fireflies on clear nights
- Worms have opinions — they taunt during battle
- Sudden death — after turn 16 the sea rises, worms wither, and meteors start falling
- Session scoreboard: wins shown live in the HUD, kills and damage in the game-over summary
- Optional aim guide dotting the predicted path of your bazooka while you charge
- Configurable turn timer (20 / 30 / 45 / 60 s)
- Red worm names when health runs low; victory confetti on the winner
- Four random sky themes (day, sunset, night, dawn) and four terrain themes (grass, desert, snow, rock)
- Native system fonts and parallax clouds for a clean, pretty look
- Procedural sound effects synthesized with Web Audio — no audio files
- Pause, mute (persisted), and fullscreen buttons; settings persist in localStorage

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
- Airstrike, teleport, the homing missile, the magic bullet, and lightning arm a map target first — tap the map, then press FIRE.
- Release the sheep and it wanders on its own, blowing up on the first worm it touches (or after 8 s); press FIRE again to detonate it on command. The dragon ball bounces on the same FIRE-to-detonate rule (it also blows after six bounces).
- The banana bomb bursts into five bananas that go off one after another; the mole bomb tunnels through rock in the direction you fired it and detonates when it comes back out. It also blows after 5 seconds or at the water line.
- The hammer smacks a nearby enemy hard and sends them flying — knockback can drown a worm.
- Drop a mine and walk away: it arms after 2 seconds, waits for any worm to come close, and survives between turns. Shoot one to set off a chain reaction.
- The ⇄ button cycles the weapon shelf pages; the page follows your selection when you pick a weapon.
- Weapons you're out of ammo for disappear from the shelf until you have ammo again — keyboard selection just says "Out of ammo".
- On a computer the touch pads hide themselves — aim with the mouse, click the weapon shelf (or press 1–7), hold Space to charge, Enter/Shift to jump, and use the shortcuts below.
- Phones and tablets: play in landscape — portrait shows a rotate reminder and pauses the game.
- Watch the wind meter in the HUD: it pushes rockets and slanting rain.
- Open Help & Controls from the menu button, or press H.
- Tap one of your own worms to take control of it mid-turn — turn **Worm Select** off in 🎨 Customize to disable.
- 🎨 Customize in the menu renames teams and picks sky, terrain, weather, graphics, sound and Worm Select — Done (or Esc) closes it and everything persists.

### Keyboard

| Key | Action |
| --- | --- |
| Arrow keys / WASD | Walk and adjust aim |
| Space (hold) | Charge and release fire (also detonates the sheep / dragon ball and skips retreat) |
| Enter / Shift | Jump |
| J | Jetpack (hold) |
| + / − | Zoom in / out |
| 1–7 | Select weapon on the current shelf page |
| Q | Cycle the weapon shelf pages |
| H | Open Help & Controls |
| P / Esc | Pause |

## Weapons

Ammo below is for the Normal scheme. **Greedy** makes every weapon unlimited, **Pro Mode** keeps only one of each special (and no airstrike at all), and **Bazooka Only** strips the shelf down to the trusty bazooka.

| Weapon | Ammo | Notes |
| --- | --- | --- |
| Bazooka | Unlimited | Wind-affected rocket; explodes on impact |
| Grenade | Unlimited | 3 s fuse; bounces down slopes |
| Dynamite | 2 per team | Dropped at your feet; 4 s fuse; biggest blast |
| Shotgun | Unlimited | Two instant hitscan shots |
| Airstrike | 1 per team | Pick a target; five bombs rain from the sky |
| Teleport | 2 per team | Warp your worm to a chosen spot |
| Sheep | 1 per team | Walks by itself until it finds a worm or is detonated |
| Mad Cow | 1 per team | Releases three charging cows one after another — each explodes on the first worm (friend or foe) or wall it meets, with Dynamite-strength force (75) |
| Hammer | Unlimited | Melee whack with heavy knockback |
| Mine | 1 per team | Arms after 2 s; proximity trigger; chain-reacts |
| Holy Grenade | 1 per team | 3 s fuse; colossal blast with a white flash and choir tone |
| Cluster Bomb | 1 per team | Splits mid-air into four scattering bomblets |
| Uzi | 2 per team | Six-shot burst with spread; instant hitscan |
| Blowtorch | 1 per team | Instantly cuts a short tunnel through terrain (and anyone in it) |
| Homing Missile | 1 per team | Tap the map to mark a spot, then charge it like a bazooka and fire — it locks on and homes in, crashing into anything in the way |
| Bunker Buster | 1 per team | Drills into the ground with three stacked blasts — great against dug-in worms |
| Magic Bullet | 1 per team | Mark a target, then charge it like a bazooka — the bullet spirals a path to the mark and erupts with a Holy-Grenade-sized blast (~100 HP at center) |
| Banana Bomb | 1 per team | 3 s fuse; erupts into five bananas that burst in sequence |
| Dragon Ball | 1 per team | Bounces wildly with huge knockback; press FIRE to detonate it (or after six bounces) |
| Mole Bomb | 2 per team | Tunnels through rock along its firing direction; explodes when it emerges, on a worm, after 5 s, or at the water line |
| Lightning | 2 per team | Pick a target; five bolts crash down and strike anything in their path |
| Flying Saucer | 1 per team | Board it with FIRE for the turn — fuel-limited flight with stronger jets that even works underwater (🚀 to lift, walk pad to steer); FIRE again to land (Hedgewars-style) |

Crates can refill dynamite, airstrike, teleport, homing missile, bunker buster, or magic bullet, or grant an extra sheep, mine, holy grenade, cluster bomb, uzi, or blowtorch.

## Running locally

No build step. Open `index.html` in any modern browser, or serve the folder:

```sh
python -m http.server
```

## Tech

Single file, zero dependencies, vanilla JavaScript and Canvas 2D. Terrain is generated from layered sine noise and rasterized into a pixel mask that powers collision, walking, and cratering. A pannable, zoomable, clamped camera follows the action across maps up to 2800×800, including the optional floating-islands mode. Sound effects are synthesized at runtime with Web Audio. Weather, particles, confetti, taunts, and meteors are all procedural, and the UI uses native system fonts — no downloads. About 98 KB in total.

## License

MIT — free to use, modify, and share. See [LICENSE](LICENSE).

If Grub Blasters brightened your day, a star on GitHub helps more players find it.
