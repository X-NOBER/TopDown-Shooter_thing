# TopDown-Shooter_thing

Simple top-down 2D shooter prototype built with HTML, CSS, JavaScript, and [p5.js](https://p5js.org/).

## Play

Serve the folder (needed for ES modules and the Supabase catalog fetch):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

- **WASD** or arrow keys — move
- **Mouse** — aim (weapon stays on the player and points at the cursor)
- **Click or hold** — shoot
- **1 / 2** — switch between catalog weapons
- **R** — reload to that gun’s `max_ammo`

Ammo is **unlimited** while `COMBAT.unlimitedAmmo` is `true` in `js/config.js`. Each weapon still stores its own `max_ammo` and `ammo_type` (Starter Pistol: 12 light, Scatter Shot: 6 shell). Set the flag to `false` when magazines should run dry.

The player is a circle and each gun is a rectangle until sprites exist.

Enemies are circles with their own guns. A raycast from each enemy to you is blocked by walls, so they only aim and shoot while that ray is clear. Their health bar is a black track; the fill shrinks and shifts from green to red as they take damage. Spawns live in `js/data/enemySpawns.js`.

## Layout

| Path | Role |
|------|------|
| `js/main.js` | p5 sketch bootstrap |
| `js/game.js` | loop, input, HUD |
| `js/entities/` | player, enemies, weapons, projectiles, health bars |
| `js/world/` | walls, raycast line of sight, collision |
| `js/data/enemySpawns.js` | enemy placements, health, and starting gun type |
| `js/visuals/appearance.js` | circle / rect **or** sprite from `icon_url` |
| `js/data/weaponRepository.js` | loads `public.weapons` from Supabase, local fallback |
| `js/data/localWeapons.js` | same shape as the `weapons` table |
| `js/config.js` | canvas, player, per-type gun visuals, publishable Supabase keys |

Gameplay records match the Supabase `weapons` columns (`id`, `name`, `weapon_type`, `base_damage`, `icon_url`, …). Extra look-and-feel (barrel size, colors) lives in `WEAPON_VISUALS_BY_TYPE` until you add columns or sprites.

## Replacing primitives with sprites

Set `icon_url` on a `weapons` row (or later a `skins` row). `weaponVisualFromRecord` / `playerVisualFromSkin` already draw a sprite when that URL loads, and keep using primitives otherwise.

## Supabase

The catalog is public-read (`Weapons catalog is public`). The client uses the **publishable** key only. If the request fails, the local catalog in `js/data/localWeapons.js` is used instead.
