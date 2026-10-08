import { pointInWalls } from "./penetration.js";

function circleHitsWall(x, y, radius, walls) {
  for (const wall of walls) {
    const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
    const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
    const dx = x - closestX;
    const dy = y - closestY;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

/**
 * Walk a throw from origin to a target and stop before solid cover.
 * @returns {{ x: number, y: number, travel: number }}
 */
export function clipThrowPath(x0, y0, x1, y1, walls, radius = 6) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const length = Math.hypot(dx, dy);
  if (length < 0.001) return { x: x0, y: y0, travel: 0 };

  const ux = dx / length;
  const uy = dy / length;
  const step = 2;
  let x = x0;
  let y = y0;
  let lastX = x0;
  let lastY = y0;
  let traveled = 0;

  while (traveled < length) {
    const next = Math.min(step, length - traveled);
    x += ux * next;
    y += uy * next;
    traveled += next;
    if (pointInWalls(x, y, walls) || circleHitsWall(x, y, radius, walls)) {
      return { x: lastX, y: lastY, travel: traveled - next };
    }
    lastX = x;
    lastY = y;
  }

  return { x: x1, y: y1, travel: length };
}

/**
 * Land at the cursor when it is in range. If it is farther than `range`,
 * stop at max range along that line. Walls cut the path short either way.
 */
export function throwLanding(ox, oy, mx, my, range, walls, radius = 6) {
  const dx = mx - ox;
  const dy = my - oy;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.001) return { x: ox, y: oy, travel: 0 };

  const travel = Math.min(dist, range);
  const ux = dx / dist;
  const uy = dy / dist;
  return clipThrowPath(ox, oy, ox + ux * travel, oy + uy * travel, walls, radius);
}
