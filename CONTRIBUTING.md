# Contributing to Grub Blasters

Thanks for your interest in contributing! Grub Blasters is a single-file, dependency-free HTML game — the entire game lives in `index.html`.

## Hard rules

1. **One file.** The entire game lives in `index.html` (style, DOM, script). Never split it, never add a `<script src>`, CDN, font, image, or audio file. Zero dependencies, no build step, no npm.
2. **Exactly one `<script>` block.** `make check` extracts it with the regex `/<script>([\s\S]*)<\/script>/` and runs `node --check`. A second `<script>` tag silently changes what gets checked.
3. **Keep the README size line in sync.** README ends with "About N KB" (round(bytes/1024)); `make check` fails when it drifts. Run `make sync-size` to fix it.
4. **Preserve code style.** Compact vanilla JS: terse names, dense one-liners, section dividers `/* ---------- x ---------- */`. Match surrounding style; do not reformat.
5. **Logical pixels everywhere.** The canvas handles scaling, not CSS.

## Getting started

1. Fork and clone the repository.
2. Open `index.html` in a browser, or run `make serve` for a local preview server.
3. Make your changes.
4. Run `make check` — it must pass (`SYNTAX OK` + `SIZE SYNC OK`).
5. Test manually in a browser (see the smoke test checklist in `AGENTS.md`).

## Making changes

- **New weapons**: append to `WEP`, add a `fire()` branch, handling in `updateProj()` and a visual in `drawProj()`, starting ammo in `SCH[0]`'s loadout, the crate pool in `pickCrate()`, and README tables. The shelf panel updates automatically via `wepList()`.
- **New settings**: `<select>` or `<input type="range">` in the `#custom` or `#settings` sub-menu, load inside the localStorage `try{}` block, handle in `selCh()` + bind list + `syncUI()`, document in README.
- **No comments** beyond section dividers unless genuinely needed.
- **Commit messages**: one imperative summary line, details after a colon (see `git log`).

## Pull requests

1. Create a feature branch from `main`.
2. Make focused, atomic commits.
3. Run `make check` before submitting.
4. Open a PR with a clear description of what changed and why.
5. Ensure the live game still works — test in a browser.

## Dev environment (Termux on Android)

If developing on Termux, follow the rules in `AGENTS.md`:
- Every shell command must run with `TMPDIR=/data/data/com.termux/files/usr/tmp`.
- No `sudo`, `systemctl`, or FHS paths.
- Required tools: `node`, `python3`, `make`, `git`.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.