# Forever Character Planner

A browser planner for a World of Warcraft: Forever roster. Use it to decide which characters to create and how to cover professions, bank alts, and auction alts. There is no server: the list stays in this browser.

The level cap is 60. Each character can learn two primary professions and every secondary profession. Races and classes follow Forever. The interface is in Russian and English.

## Features

- One main per faction: one for the Alliance and one for the Horde.
- Race, class, and professions are picked from icons.
- Roles: main, alt, raid, dungeons, PvP, professions, farm, bank, auction, leveling.
- Server: PvE, PvP, RP, Hardcore.
- Profession coverage. When the roster has both factions, each icon is split: Alliance on the left, Horde on the right. With only one faction, a covered profession is shown in color and a missing one in gray.
- Search, plus filters for faction and role.
- Export and import the roster as `fcp-roster.json`.
- The background changes once a day. Images live in `public/wallpapers`.

## Run

Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the address Vite prints. It is usually http://127.0.0.1:5173/.

## Build

```bash
npm run build
npm run preview
```

The built files are written to `dist`.

## Wallpapers

Drop a jpg, png, or webp into `public/wallpapers` and refresh. In development, a new file is picked up on its own. A production build freezes the list at the moment you run `npm run build`.

## Data

The roster is stored in `localStorage` under `fcp-roster-v1`. Clearing site data in the browser deletes the list. Export keeps a copy in a file.
