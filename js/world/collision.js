/**
 * Push a circle out of any wall it overlaps.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {Array<{ x: number, y: number, w: number, h: number }>} walls
 */
export function resolveCircle(x, y, radius, walls) {
  let nextX = x;
  let nextY = y;

  for (let pass = 0; pass < 2; pass += 1) {
    for (const wall of walls) {
      const closestX = Math.max(wall.x, Math.min(nextX, wall.x + wall.w));
      const closestY = Math.max(wall.y, Math.min(nextY, wall.y + wall.h));
      const dx = nextX - closestX;
      const dy = nextY - closestY;
      const distSq = dx * dx + dy * dy;

      if (distSq >= radius * radius) continue;

      if (distSq === 0) {
        const left = nextX - wall.x;
        const right = wall.x + wall.w - nextX;
        const top = nextY - wall.y;
        const bottom = wall.y + wall.h - nextY;
        const min = Math.min(left, right, top, bottom);
        if (min === left) nextX = wall.x - radius;
        else if (min === right) nextX = wall.x + wall.w + radius;
        else if (min === top) nextY = wall.y - radius;
        else nextY = wall.y + wall.h + radius;
        continue;
      }

      const dist = Math.sqrt(distSq);
      const push = (radius - dist) / dist;
      nextX += dx * push;
      nextY += dy * push;
    }
  }

  return { x: nextX, y: nextY };
}

export function circlesOverlap(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const reach = a.radius + b.radius;
  return dx * dx + dy * dy <= reach * reach;
}
