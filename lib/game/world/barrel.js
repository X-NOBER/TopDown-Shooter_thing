import { muzzleDistance } from "../visuals/appearance.js";
import { pointInWalls } from "./penetration.js";

function shortestDelta(from, to) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

/**
 * True when any sample along the gun rectangle sits in a wall.
 * @param {number} x
 * @param {number} y
 * @param {number} angle
 * @param {{ kind?: string, length?: number, width?: number, gripInset?: number, width?: number }} visual
 * @param {number} ownerRadius
 * @param {Array<{ x: number, y: number, w: number, h: number }>} walls
 */
export function barrelHitsWall(x, y, angle, visual, ownerRadius, walls) {
  const muzzle = muzzleDistance(visual, ownerRadius);
  const half = ((visual.width ?? 10) / 2) + 1;
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;
  const start = ownerRadius - 1;
  for (let t = start; t <= muzzle; t += 3) {
    const cx = x + ux * t;
    const cy = y + uy * t;
    if (pointInWalls(cx, cy, walls)) return true;
    if (pointInWalls(cx + px * half, cy + py * half, walls)) return true;
    if (pointInWalls(cx - px * half, cy - py * half, walls)) return true;
  }
  return false;
}

/**
 * Swing the gun the shortest way that keeps the barrel out of solid cover.
 * Near a wall at ~90°, a left/right bias (aim or movement) picks which way it folds.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} desired
 * @param {object} visual
 * @param {number} ownerRadius
 * @param {Array<{ x: number, y: number, w: number, h: number }>} walls
 * @param {number} previous
 * @param {number} moveX
 * @param {number} moveY
 */
export function findClearGunAngle(x, y, desired, visual, ownerRadius, walls, previous, moveX = 0, moveY = 0) {
  if (!barrelHitsWall(x, y, desired, visual, ownerRadius, walls)) return desired;

  const prevDelta = shortestDelta(desired, previous);
  let bias = Math.sign(prevDelta) || 1;
  if (Math.abs(moveX) + Math.abs(moveY) > 0.01) {
    const moveAngle = Math.atan2(moveY, moveX);
    const rightGap = Math.abs(shortestDelta(moveAngle, desired + Math.PI / 2));
    const leftGap = Math.abs(shortestDelta(moveAngle, desired - Math.PI / 2));
    if (rightGap < leftGap - 0.04) bias = 1;
    else if (leftGap < rightGap - 0.04) bias = -1;
  }

  const step = 0.03;
  const max = Math.PI * 0.98;
  for (let d = step; d <= max; d += step) {
    const angled = desired + bias * d;
    if (!barrelHitsWall(x, y, angled, visual, ownerRadius, walls)) return angled;
  }
  for (let d = step; d <= max; d += step) {
    const angled = desired - bias * d;
    if (!barrelHitsWall(x, y, angled, visual, ownerRadius, walls)) return angled;
  }
  return previous;
}

/**
 * Rotate `actor.aimAngle` toward a wall-clear gun pose.
 * @param {{ x: number, y: number, radius: number, aimAngle: number }} actor
 * @param {number} desired
 * @param {object} visual
 * @param {Array<{ x: number, y: number, w: number, h: number }>} walls
 * @param {number} deltaMs
 * @param {number} moveX
 * @param {number} moveY
 */
export function aimGun(actor, desired, visual, walls, deltaMs, moveX = 0, moveY = 0) {
  const resolved = findClearGunAngle(
    actor.x,
    actor.y,
    desired,
    visual,
    actor.radius,
    walls,
    actor.aimAngle,
    moveX,
    moveY
  );
  const delta = shortestDelta(actor.aimAngle, resolved);
  const step = Math.min(Math.PI, 18 * (Math.min(deltaMs, 48) / 1000));
  if (Math.abs(delta) <= step) actor.aimAngle = resolved;
  else actor.aimAngle += Math.sign(delta) * step;
  return actor.aimAngle;
}
