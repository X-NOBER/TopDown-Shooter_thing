# TopDown-Shooter_thing

Top-down 2D shooter prototype built with Next.js (JavaScript), Tailwind CSS, and [p5.js](https://p5js.org/).

## Play

```bash
npm install
npm run dev
```

Then open `http://localhost:3900`.

## Colyseus (JavaScript)

The Next.js app talks to an official [Colyseus](https://github.com/colyseus/colyseus) JavaScript ESM server (`create-colyseus-app --esm`) via [`@colyseus/sdk`](https://github.com/colyseus/colyseus/tree/master/packages/sdk).

```bash
npm run server
```

- Playground: `http://localhost:2567`
- Monitor: `http://localhost:2567/monitor`

The loadout HUD and match HUD show `connected · sessionId`. If the server is down, the shooter still runs locally.

- **WASD** or arrow keys — move
- **Mouse** — aim (weapon stays on the player and points at the cursor)
- **Click or hold** — shoot
- **1** — primary (press again to swap primaries)
- **2** — secondary
- **3** — melee
- **4–8** — up to five utilities
- **R** — reload to that gun’s `max_ammo`

Ammo is **unlimited** while `COMBAT.unlimitedAmmo` is `true` in `lib/game/config.js`. Each weapon still stores its own `max_ammo` and `ammo_type` (Starter Pistol: 12 light, Scatter Shot: 6 shell). Set the flag to `false` when magazines should run dry.

The player is a circle and each gun is a rectangle until sprites exist.

Enemies are circles with their own guns. A raycast from each enemy to you is blocked by walls, so they only aim and shoot while that ray is clear. Bullets can still travel through a wall until that gun’s `wall_penetration` budget runs out. Each exit cuts damage by `wall_damage_reduction` and speed by `wall_slowdown`. Their health bar is a black track; the fill shrinks and shifts from green to red as they take damage. Spawns live in `lib/game/data/enemySpawns.js`.

The loadout you can use in game:

- **1** cycles primaries: AK-47, M4A1, Pump Shotgun, Double Barrel
- **2** cycles sidearms: USP, then Deagle
- **3** cycles knives: Tanto (long thin rectangle), then Cleaver (short wide rectangle)
- **4–8** are the five grenades: smoke, flashbang, frag, incendiary, impact

Hold the mouse to fire the auto rifles. Each gun still uses its own Supabase damage, magazine, rarity, and wall-penetration stats.

## Layout

| Path | Role |
|------|------|
| `app/` | Next.js App Router pages (no TypeScript) |
| `components/GameScreen.js` | HUD and client-only p5 mount |
| `lib/game/sketch.js` | p5 sketch bootstrap |
| `lib/game/game.js` | loop, input, HUD updates |
| `lib/game/entities/` | player, enemies, weapons, projectiles, health bars |
| `lib/game/world/` | walls, raycast line of sight, collision |
| `lib/game/data/enemySpawns.js` | enemy placements, health, and starting gun type |
| `lib/game/visuals/appearance.js` | circle / rect **or** sprite from `icon_url` |
| `lib/game/data/weaponRepository.js` | loads `public.weapons` from Supabase, local fallback |
| `lib/game/data/localWeapons.js` | same shape as the `weapons` table |
| `lib/game/config.js` | canvas, player, per-type gun visuals, publishable Supabase keys, Colyseus URL |
| `lib/game/net/colyseusClient.js` | joins `my_room` from the Next.js client |
| `server/` | Colyseus JavaScript ESM multiplayer server |

Gameplay records match the Supabase `weapons` columns (`id`, `name`, `weapon_type`, `base_damage`, `icon_url`, …). Extra look-and-feel (barrel size, colors) lives in `WEAPON_VISUALS_BY_TYPE` until you add columns or sprites.

## Replacing primitives with sprites

Set `icon_url` on a `weapons` row (or later a `skins` row). `weaponVisualFromRecord` / `playerVisualFromSkin` already draw a sprite when that URL loads, and keep using primitives otherwise.

## Supabase

The catalog is public-read (`Weapons catalog is public`). The client uses the **publishable** key only. If the request fails, the local catalog in `lib/game/data/localWeapons.js` is used instead.
