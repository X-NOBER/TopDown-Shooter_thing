/**
 * Starting placements. Weapon rows still come from the catalog;
 * `weaponType` picks which gun this enemy holds.
 */
export const ENEMY_SPAWNS = [
  {
    x: 96,
    y: 210,
    maxHealth: 60,
    weaponType: "pistol",
    fill: [214, 78, 78],
  },
  {
    x: 760,
    y: 150,
    maxHealth: 100,
    weaponType: "shotgun",
    fill: [186, 64, 112],
  },
  {
    x: 730,
    y: 500,
    maxHealth: 70,
    weaponType: "pistol",
    fill: [214, 112, 58],
  },
];
