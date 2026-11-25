# Hearth & Ember — Woodfired Kitchen

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/bisnanjp01-spec/best-cooking-game-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/bisnanjp01-spec/best-cooking-game-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original cooking game that runs offline in a desktop browser from
static files. You are the chef of a cozy wood-fired kitchen: tickets land on
the order board, you grab ingredients from the crates, chop them on the board,
grill patties on the ember grill, simmer tomato soup in the pot, build each
dish on the plate at the Assembly Counter, and carry it to the Serving Pass
before the ticket's patience runs out. Fast service earns tips, streaks build
combos, and the last minute of the 3-minute service day is a full rush.

Six original recipes combine the same ingredients in different ways — Garden
Salad, Tomato Soup, Flame Skewer, Cheese Melt, Ember Burger and Ember Stack —
and the tickets get harder as the day goes on. All art is drawn in code on
canvas and all sounds are synthesized with WebAudio; nothing is downloaded.

## How to play

- **Move:** WASD / arrow keys, or click anywhere on the floor (click a station to walk to it)
- **Use a station:** E or Space (hold E to chop)
- **Pause:** P · **Mute:** M · **Restart:** R on the game-over screen

## How to run

Open `game/index.html` in a desktop browser, or serve the `game/` folder with
any static server, e.g. `python3 -m http.server` inside `game/`, then open
http://localhost:8000.

## Layout

- `game/index.html` — the page
- `game/css/style.css` — page chrome around the canvas
- `game/js/recipes.js` — ingredients and dishes
- `game/js/kitchen.js` — counters, stations and layout
- `game/js/chef.js` — movement and carrying
- `game/js/orders.js` — tickets, patience and scoring
- `game/js/render.js` — all canvas drawing
- `game/js/audio.js` — synthesized WebAudio sounds
- `game/js/game.js` — main loop, input and cooking rules
- `main.ts` — the make.fun hand-in program (copies `game/` + `screenshots/`, writes `dossier.json`)

<sub>Entered on [make.fun](https://make.fun/?ref=qk4dawkj&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
