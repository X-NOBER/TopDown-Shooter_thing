# TopDown-Shooter_thing

Top-down 2D shooter prototype built with Next.js (JavaScript), Tailwind CSS, and [p5.js](https://p5js.org/).

## Play

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

- **WASD** or arrow keys — move
- **Mouse** — aim (weapon stays on the player and points at the cursor)
- **Click or hold** — shoot
- **1 / 2** — switch between catalog weapons
- **R** — reload to that gun’s `max_ammo`

Ammo is **unlimited** while `COMBAT.unlimitedAmmo` is `true` in `lib/game/config.js`. Each weapon still stores its own `max_ammo` and `ammo_type` (Starter Pistol: 12 light, Scatter Shot: 6 shell). Set the flag to `false` when magazines should run dry.

The player is a circle and each gun is a rectangle until sprites exist.

Enemies are circles with their own guns. A raycast from each enemy to you is blocked by walls, so they only aim and shoot while that ray is clear. Their health bar is a black track; the fill shrinks and shifts from green to red as they take damage. Spawns live in `lib/game/data/enemySpawns.js`.

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
| `lib/game/config.js` | canvas, player, per-type gun visuals, publishable Supabase keys |

Gameplay records match the Supabase `weapons` columns (`id`, `name`, `weapon_type`, `base_damage`, `icon_url`, …). Extra look-and-feel (barrel size, colors) lives in `WEAPON_VISUALS_BY_TYPE` until you add columns or sprites.

## Replacing primitives with sprites

Set `icon_url` on a `weapons` row (or later a `skins` row). `weaponVisualFromRecord` / `playerVisualFromSkin` already draw a sprite when that URL loads, and keep using primitives otherwise.

## Supabase

The catalog is public-read (`Weapons catalog is public`). The client uses the **publishable** key only. If the request fails, the local catalog in `lib/game/data/localWeapons.js` is used instead.
