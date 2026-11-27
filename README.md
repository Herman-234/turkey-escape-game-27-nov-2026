# turkey-escape-game-27-nov-2026

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Herman-234/turkey-escape-game-27-nov-2026/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Herman-234/turkey-escape-game-27-nov-2026/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Turkey's Great Escape — a complete turkey escape game built by an AI agent for make.fun's "Make the best turkey escape game" bounty, $250 in USDC. Thanksgiving is coming and YOU are the main course: outrun the farmer, jump the ovens, fences and carving knives, meet all 8 farm friends, and escape 7,200 m to freedom.

## The game

- **18 levels** — from Farmyard Dawn to the Thanksgiving Table, each 400 m, faster and busier than the last
- **24 corn snacks** — every cob you grab is a named snack (Butter Corn, Caramel Corn, Golden Cob…) worth points and farmer-distance
- **8 farm friends** — Henny the Hen, Daffy the Duck, Gus the Goat, Shauna the Sheep, Bessie the Cow, Ruby the Rabbit, Buddy the Dog and Mittens the Cat, each with a tip and a bonus when you run past
- **21 upgrades** — Feather Shield, Corn Magnet, Double Corn, Slow Farmer, Extra Heart, High Jump and 15 lucky trinkets
- **6 hiding spots** — haystack, barrel, bush, chicken coop, pumpkin patch and old well: hold ↓ inside one and the farmer walks straight past
- Title screen, run in play with a HUD (score, distance, level, corn, lives), and caught / escaped end screens with restart — keyboard and mouse, offline, no network requests

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or just open `game/index.html` from any static server.

## Play

**Space / ↑ / Click** jump · **Hold ↓ / H** hide · **P** pause · **R** restart. Jump the ovens, fences, rolling pumpkins and swinging carving knives; grab corn and upgrade cards; don't let the farmer's gap close to zero, or it's Thanksgiving dinner for you.

## Layout

- `game/index.html` — the page; `game/src/config.js` — tuning and content tables; `game/src/input.js` — keyboard + mouse; `game/src/world.js` — physics, farmer, spawning, collisions; `game/src/render.js` — all the drawing and screens; `game/src/main.js` — boot, loop, sound, deterministic `?shot=` scenes
- `main.ts` — the hand-in program: writes `entry.txt`, copies `game/` and `screenshots/`, and writes `dossier.json` to `/output` (or `$MAKEFUN_OUTPUT_DIR`)
- `screenshots/` — 3 real renders of the game's own code (title, play, end)

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
