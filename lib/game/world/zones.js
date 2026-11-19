import { hasLineOfSight, segmentCircleT } from "./raycast.js";

/**
 * Vision is blocked by walls and by smoke clouds.
 */
export function hasClearVision(x0, y0, x1, y1, walls, smokes = []) {
  if (!hasLineOfSight(x0, y0, x1, y1, walls)) return false;
  for (const smoke of smokes) {
    if (segmentCircleT(x0, y0, x1, y1, smoke.x, smoke.y, smoke.radius) != null) return false;
  }
  return true;
}

/**
 * Incendiary heat: a tick every 0.5s that gets shorter and harder the longer you stay.
 * @param {{ fireHeatMs?: number, fireAccMs?: number }} actor
 * @param {number} deltaMs
 * @param {boolean} inFire
 * @param {{ tickMs: number, baseDamage: number, ramp: number }} stats
 */
export function nextFireDamage(actor, deltaMs, inFire, stats) {
  if (!inFire) {
    actor.fireHeatMs = Math.max(0, (actor.fireHeatMs ?? 0) - deltaMs * 1.4);
    actor.fireAccMs = 0;
    actor.wasInFire = false;
    return 0;
  }

  if (!actor.wasInFire) {
    actor.wasInFire = true;
    actor.fireAccMs = stats.tickMs;
  }

  actor.fireHeatMs = (actor.fireHeatMs ?? 0) + deltaMs;
  actor.fireAccMs = (actor.fireAccMs ?? 0) + deltaMs;
  const stacks = Math.max(0, Math.floor((actor.fireHeatMs - stats.tickMs) / stats.tickMs));
  const interval = Math.max(120, stats.tickMs - stacks * 70);
  if (actor.fireAccMs < interval) return 0;
  actor.fireAccMs -= interval;
  return stats.baseDamage + stacks * stats.ramp;
}

export function actorInZone(actor, zone, walls) {
  const distance = Math.hypot(actor.x - zone.x, actor.y - zone.y);
  if (distance > zone.radius + actor.radius) return false;
  if (distance <= actor.radius + 4) return true;
  return hasLineOfSight(zone.x, zone.y, actor.x, actor.y, walls);
}

export function drawZones(p, zones) {
  for (const zone of zones) {
    const fade = 1 - zone.age / zone.life;
    p.noStroke();
    if (zone.kind === "smoke") {
      p.fill(150, 164, 150, 150 * fade);
      p.circle(zone.x, zone.y, zone.radius * 2);
      p.fill(124, 138, 124, 90 * fade);
      p.circle(zone.x + 10, zone.y - 8, zone.radius * 1.35);
      p.circle(zone.x - 14, zone.y + 6, zone.radius * 1.2);
    } else if (zone.kind === "fire") {
      const flicker = 0.85 + 0.15 * Math.sin(zone.age / 70);
      p.fill(255, 90, 24, 130 * fade);
      p.circle(zone.x, zone.y, zone.radius * 2 * flicker);
      p.fill(255, 196, 48, 90 * fade);
      p.circle(zone.x, zone.y, zone.radius * 1.1 * flicker);
    }
  }
}
