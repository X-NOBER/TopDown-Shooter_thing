import { Enemy } from "../entities/Enemy.js";

export const RANGE_BOUNDS = { width: 900, height: 460 };

/** Full-height cover so the far dummy is only reachable through the wall. */
export const RANGE_WALLS = [{ x: 560, y: 0, w: 28, h: 460 }];

/**
 * @param {import("../data/localWeapons.js").WeaponRecord} weaponRecord
 */
export function createRangeDummies(weaponRecord) {
  const specs = [
    { x: 280, y: 130, label: "Dummy", fill: [72, 148, 210] },
    { x: 280, y: 330, label: "Dummy", fill: [72, 148, 210] },
    { x: 740, y: 230, label: "Behind wall", fill: [214, 112, 72] },
  ];

  return specs.map(
    (spec) =>
      new Enemy({
        x: spec.x,
        y: spec.y,
        maxHealth: 100,
        weaponRecord,
        fill: spec.fill,
        dummy: true,
        label: spec.label,
      })
  );
}
