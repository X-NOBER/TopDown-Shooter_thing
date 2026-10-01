/** True when a point sits inside any solid wall. */
export function pointInWalls(x, y, walls) {
  for (const wall of walls) {
    if (x >= wall.x && x < wall.x + wall.w && y >= wall.y && y < wall.y + wall.h) {
      return true;
    }
  }
  return false;
}

/**
 * Walk a shot from (x0, y0) to (x1, y1).
 * Solid distance spends `penetrationLeft`. Exiting a wall cuts damage and speed.
 * A shot with no budget left sticks inside the wall.
 *
 * @param {object} shot
 * @param {Array<{ x: number, y: number, w: number, h: number }>} walls
 * @param {Array<{ x: number, y: number, radius: number }>} targets
 */
export function simulateShot(shot, walls, targets) {
  const dx = shot.x1 - shot.x0;
  const dy = shot.y1 - shot.y0;
  const length = Math.hypot(dx, dy);
  const step = 2;
  let x = shot.x0;
  let y = shot.y0;
  let damage = shot.damage;
  let speed = shot.speed;
  let penetrationLeft = shot.penetrationLeft;
  let alive = true;
  let stuck = false;
  let wasInside = pointInWalls(x, y, walls);
  const hits = [];
  const hitSet = new Set();

  const touchTarget = () => {
    if (!shot.stopOnTarget) return false;
    for (let index = 0; index < targets.length; index += 1) {
      if (hitSet.has(index)) continue;
      const target = targets[index];
      const reach = target.radius + shot.radius;
      const ox = x - target.x;
      const oy = y - target.y;
      if (ox * ox + oy * oy > reach * reach) continue;
      hitSet.add(index);
      hits.push({ index, damage });
      return true;
    }
    return false;
  };

  if (length < 0.001) {
    if (touchTarget()) alive = false;
    return { x, y, damage, speed, penetrationLeft, alive, stuck, hits };
  }

  const ux = dx / length;
  const uy = dy / length;
  let traveled = 0;

  while (traveled < length && alive) {
    const next = Math.min(step, length - traveled);
    x += ux * next;
    y += uy * next;
    traveled += next;

    const inside = pointInWalls(x, y, walls);
    if (inside) {
      penetrationLeft -= next;
      if (penetrationLeft <= 0) {
        alive = false;
        stuck = true;
        x -= ux * next;
        y -= uy * next;
        break;
      }
    } else if (wasInside) {
      damage *= 1 - shot.wallDamageReduction;
      speed *= 1 - shot.wallSlowdown;
      if (damage < 1 || speed < 30) {
        alive = false;
        stuck = true;
        break;
      }
    }
    wasInside = inside;

    if (touchTarget()) {
      alive = false;
      break;
    }
  }

  return { x, y, damage, speed, penetrationLeft, alive, stuck, hits };
}
