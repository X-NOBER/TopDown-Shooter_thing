/**
 * Axis-aligned walls. Raycasts and movement both use this list,
 * so enemies cannot see or shoot through them.
 *
 * @typedef {object} Wall
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 */

/** @type {Wall[]} */
export const WALLS = [
  { x: 168, y: 120, w: 28, h: 250 },
  { x: 460, y: 280, w: 250, h: 28 },
  { x: 640, y: 96, w: 28, h: 170 },
  // Thin cover so a low-penetration sidearm can exit it, while the same shot sticks in the 28px walls.
  { x: 390, y: 470, w: 150, h: 12 },
];

export const WALL_FILL = [58, 72, 96];

/** @param {import("p5")} p @param {Array<{ x: number, y: number, w: number, h: number }>} [walls] */
export function drawWalls(p, walls = WALLS) {
  p.noStroke();
  p.fill(WALL_FILL);
  for (const wall of walls) {
    p.rect(wall.x, wall.y, wall.w, wall.h);
  }
}
