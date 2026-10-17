# Grub Blasters

Grub Blasters is a turn-based artillery game in the spirit of *Worms*, built entirely as a single, dependency-free HTML file. Two teams of worms hurl explosives across procedurally generated, fully destructible terrain while the wind shifts every turn. Last team standing wins.

**Play it now:** https://mark44928.github.io/GrubBlastersHTML/

## Features

- Local 2-player hot-seat or vs. computer (Easy / Normal / Hard / Brutal)
- Tap any of your worms to take control of it — move anyone, anywhere
- 2–4 worms per team with configurable starting HP (100 / 150 / 200)
- Fully destructible terrain — craters stay, worms fall
- Shifting wind that bends rockets mid-flight
- Nine weapons: bazooka, grenade, dynamite, shotgun, airstrike, teleport, sheep, hammer, mine
- Proximity mines that arm after 2 s, persist across turns, and chain-react when shot
- Parachuted supply crates: +HP or bonus ammo
- Weather: rain, snow, and drifting fireflies on clear nights
- Worms have opinions — they taunt during battle
- Sudden death — after turn 16 the sea rises, worms wither, and meteors start falling
- Session scoreboard: wins shown live in the HUD, kills and damage in the game-over summary
- Optional aim guide dotting the predicted path of your bazooka while you charge
- Configurable turn timer (20 / 30 / 45 / 60 s)
- Red worm names when health runs low; victory confetti on the winner
- Three random sky themes (day, sunset, night) and three terrain themes (grass, desert, snow)
- Procedural sound effects synthesized with Web Audio — no audio files
- Touch-first controls with keyboard support, fullscreen, and safe-area insets for phones
- Pause, mute (persisted), and fullscreen buttons; settings persist in localStorage

## How to play

- Tap or drag the map to aim.
- Hold FIRE to charge power, release to shoot.
- Walk with the arrow buttons; climb with the up/down aim buttons; jump with the jump button.
- Tap one of your other alive worms to switch to it — you can move any worm on your turn, not just the next in line.
- After firing you get a short retreat window; press FIRE during it to skip it and end your turn early.
- Airstrike and teleport arm a map target first — tap the map, then press FIRE.
- Release the sheep and it wanders on its own, blowing up on the first worm it touches (or after 8 s); press FIRE again to detonate it on command.
- The hammer smacks a nearby enemy hard and sends them flying — knockback can drown a worm.
- Drop a mine and walk away: it arms after 2 seconds, waits for any worm to come close, and survives between turns. Shoot one to set off a chain reaction.
- Watch the wind meter in the HUD: it pushes rockets and slanting rain.

### Keyboard

| Key | Action |
| --- | --- |
| Arrow keys / WASD | Walk and adjust aim |
| Space (hold) | Charge and release fire (also detonates the sheep / skips retreat) |
| Enter / Shift | Jump |
| 1–9 | Select weapon |
| P / Esc | Pause |

## Weapons

| Weapon | Ammo | Notes |
| --- | --- | --- |
| Bazooka | Unlimited | Wind-affected rocket; explodes on impact |
| Grenade | Unlimited | 3 s fuse; bounces down slopes |
| Dynamite | 2 per team | Dropped at your feet; 4 s fuse; biggest blast |
| Shotgun | Unlimited | Two instant hitscan shots |
| Airstrike | 1 per team | Pick a target; five bombs rain from the sky |
| Teleport | 2 per team | Warp your worm to a chosen spot |
| Sheep | 1 per team | Walks by itself until it finds a worm or is detonated |
| Hammer | Unlimited | Melee whack with heavy knockback |
| Mine | 1 per team | Arms after 2 s; proximity trigger; chain-reacts |

Crates can refill dynamite, airstrike, teleport, or grant an extra sheep or mine.

## Running locally

No build step. Open `index.html` in any modern browser, or serve the folder:

```sh
python -m http.server
```

## Tech

Single file, zero dependencies, vanilla JavaScript and Canvas 2D. Terrain is generated from layered sine noise and rasterized into a pixel mask that powers collision, walking, and cratering. Sound effects are synthesized at runtime with Web Audio. Weather, particles, confetti, taunts, and meteors are all procedural. About 54 KB in total.
