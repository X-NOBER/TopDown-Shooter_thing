/**
 * One primary, one secondary, one melee, and at most five utilities.
 * Extra primaries stay in the catalog and can be cycled with the same key.
 */
export const MAX_UTILITIES = 5;

/**
 * @param {import("./localWeapons.js").WeaponRecord[]} weapons
 */
export function buildLoadout(weapons) {
  const grouped = {
    primary: [],
    secondary: [],
    melee: [],
    utility: [],
  };

  for (const weapon of weapons) {
    if (grouped[weapon.slot]) grouped[weapon.slot].push(weapon);
  }

  grouped.primary.sort((a, b) => b.wall_penetration - a.wall_penetration);
  grouped.utility = grouped.utility.slice(0, MAX_UTILITIES);
  return grouped;
}
