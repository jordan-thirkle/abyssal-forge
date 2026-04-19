# ⚔️ Abyssal Forge

> *Descend. Forge. Dominate.*

**Abyssal Forge** is a 3D dark-fantasy browser RPG with deep progression, PvP/PvE combat, and a player-driven crafting economy. Built for the **Cursor Vibe Jam 2026**.

[![Vibe Jam 2026](https://img.shields.io/badge/Cursor%20Vibe%20Jam-2026-purple)](https://vibej.am/2026)
[![Built with Babylon.js](https://img.shields.io/badge/Babylon.js-7.x-orange)](https://www.babylonjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## 🎮 Play Now

> Coming soon — [abyssal-forge.vercel.app](https://abyssal-forge.vercel.app)

## ✨ Features

- **Instant play** — no login, no loading screen, drop straight into the dungeon
- **Procedural dungeons** — every run is unique across 5 tiers of darkness
- **4 classes** — Wraithblade, Ironbound, Voidcaller, Ashen Sage
- **Live economy** — Auction House, wager duels, two-tier currency (Dust + Shards)
- **PvP Arena** — ranked 1v1, 3v3, and 8-player Death Match
- **Vibe Jam Portal** — teleport between jam entries in the webring

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 3D Engine | Babylon.js 7 + Havok Physics |
| UI | React 18 + Zustand + Framer Motion |
| Styling | Tailwind CSS 3 |
| Build | Vite 5 + TypeScript 5 (strict) |
| Multiplayer | Colyseus 0.15 |
| Database | Supabase (Postgres + Auth + Realtime) |
| Hosting | Vercel (client) + Railway (server) |

## 🚀 Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Run dev servers
npm run dev:client   # http://localhost:5173
npm run dev:server   # ws://localhost:2567

# Type check
npm run typecheck
```

## 📋 Phases

- **Phase 1** ✅ — The Feel: single-player dungeon, combat, loot, XP
- **Phase 2** 🔄 — The Loop: all 4 classes, crafting, economy, Supabase
- **Phase 3** ⏳ — The Arena: live PvP, matchmaking, wager duels
- **Phase 4** ⏳ — The World: guilds, social hub, seasonal ladder

## 🏆 Vibe Jam 2026

- **Entry by:** @jordantthirkle
- **Deadline:** May 1, 2026 @ 13:37 UTC
- **100% AI-coded** with Antigravity
