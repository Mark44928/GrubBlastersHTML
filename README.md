# Grub Blasters

Grub Blasters is a turn-based artillery game in the spirit of *Worms*, built entirely as a single, dependency-free HTML file. Two teams of worms hurl explosives across procedurally generated, fully destructible terrain while the wind shifts every turn. Last team standing wins.

**Play it now:** https://mark44928.github.io/GrubBlastersHTML/

## Features

- Local 2-player hot-seat or vs. computer (Easy / Normal / Hard)
- 2–4 worms per team, 100 HP each, with fall damage
- Fully destructible terrain — craters stay, worms fall
- Shifting wind that bends rockets mid-flight
- Six weapons: bazooka, grenade, dynamite, shotgun, airstrike, teleport
- Parachuted supply crates: +35 HP or bonus ammo
- Sudden death — after turn 16 the sea rises turn by turn
- Three random sky themes (day, sunset, night) and three terrain themes (grass, desert, snow)
- Procedural sound effects synthesized with Web Audio — no audio files
- Touch-first controls with keyboard support, fullscreen, and safe-area insets for phones
- 30-second turn timer, pause and mute buttons; settings persist in localStorage

## How to play

- Tap or drag the map to aim.
- Hold FIRE to charge power, release to shoot.
- Walk with the arrow buttons; jump with the jump button.
- Airstrike and teleport arm a map target first — tap the map, then press FIRE.
- The wind pushes rockets, so watch the wind meter in the HUD before every shot.

### Keyboard

| Key | Action |
| --- | --- |
| Arrow keys / WASD | Walk and adjust aim |
| Space (hold) | Charge and release fire |
| Enter / Shift | Jump |
| 1–6 | Select weapon |
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

## Running locally

No build step. Open `index.html` in any modern browser, or serve the folder:

```sh
python -m http.server
```

## Tech

Single file, zero dependencies, vanilla JavaScript and Canvas 2D. Terrain is generated from layered sine noise and rasterized into a pixel mask that powers collision, walking, and cratering. Sound effects are synthesized at runtime with Web Audio. About 45 KB in total.
