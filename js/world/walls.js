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
];

export const WALL_FILL = [58, 72, 96];

/** @param {import("p5")} p */
export function drawWalls(p) {
  p.noStroke();
  p.fill(WALL_FILL);
  for (const wall of WALLS) {
    p.rect(wall.x, wall.y, wall.w, wall.h);
  }
}
