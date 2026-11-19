/** Shared arena player limits (keep in sync with lib/game/config.js MATCH). */
export const ARENA_MIN_PLAYERS = 2;
export const ARENA_MAX_PLAYERS = 6;

export const ARENA_BOUNDS = { width: 900, height: 640, pad: 22 };

/** Spawn slots — one per max player, spread around the map. */
export const ARENA_SPAWNS = [
  { x: 120, y: 320 },
  { x: 780, y: 320 },
  { x: 120, y: 120 },
  { x: 780, y: 120 },
  { x: 120, y: 520 },
  { x: 780, y: 520 },
];

export const ARENA_COLORS = [
  { r: 62, g: 207, b: 142 },
  { r: 232, g: 96, b: 88 },
  { r: 96, g: 160, b: 255 },
  { r: 255, g: 214, b: 102 },
  { r: 180, g: 120, b: 255 },
  { r: 64, g: 220, b: 220 },
];

export function spawnAimAngle(spawn) {
  const cx = ARENA_BOUNDS.width / 2;
  const cy = ARENA_BOUNDS.height / 2;
  return Math.atan2(cy - spawn.y, cx - spawn.x);
}
