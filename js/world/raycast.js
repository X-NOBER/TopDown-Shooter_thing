/**
 * Liang–Barsky clip: true when the segment overlaps an axis-aligned rectangle.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {{ x: number, y: number, w: number, h: number }} rect
 */
export function segmentHitsRect(x0, y0, x1, y1, rect) {
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
      if (check.q < 0) return false;
      continue;
    }
    const t = check.q / check.p;
    if (check.p < 0) {
      if (t > tMax) return false;
      if (t > tMin) tMin = t;
    } else {
      if (t < tMin) return false;
      if (t < tMax) tMax = t;
    }
  }

  return tMin <= tMax;
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
    if (segmentHitsRect(x0, y0, x1, y1, wall)) return false;
  }
  return true;
}
