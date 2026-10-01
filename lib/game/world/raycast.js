/**
 * Earliest t in [0, 1] where the segment touches the rectangle, or null.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {{ x: number, y: number, w: number, h: number }} rect
 */
export function segmentRectT(x0, y0, x1, y1, rect) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  let tMin = 0;
  let tMax = 1;

  const checks = [
    { p: -dx, q: x0 - rect.x },
    { p: dx, q: rect.x + rect.w - x0 },
    { p: -dy, q: y0 - rect.y },
    { p: dy, q: rect.y + rect.h - y0 },
  ];

  for (const check of checks) {
    if (Math.abs(check.p) < 1e-8) {
      if (check.q < 0) return null;
      continue;
    }
    const t = check.q / check.p;
    if (check.p < 0) {
      if (t > tMax) return null;
      if (t > tMin) tMin = t;
    } else {
      if (t < tMin) return null;
      if (t < tMax) tMax = t;
    }
  }

  if (tMin > tMax || tMax < 0 || tMin > 1) return null;
  return Math.max(tMin, 0);
}

/**
 * Earliest t in [0, 1] where the segment touches the circle, or null.
 */
export function segmentCircleT(x0, y0, x1, y1, cx, cy, radius) {
  const fx = x0 - cx;
  const fy = y0 - cy;
  if (fx * fx + fy * fy <= radius * radius) return 0;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const a = dx * dx + dy * dy;
  if (a < 1e-8) return null;

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;

  const t = (-b - Math.sqrt(disc)) / (2 * a);
  if (t >= 0 && t <= 1) return t;
  return null;
}

/**
 * True when no wall sits between the two points.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {Array<{ x: number, y: number, w: number, h: number }>} walls
 */
export function hasLineOfSight(x0, y0, x1, y1, walls) {
  for (const wall of walls) {
    if (segmentRectT(x0, y0, x1, y1, wall) != null) return false;
  }
  return true;
}
