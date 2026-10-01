/**
 * One of each combat slot, and at most five utilities.
 * Named roster entries are what the player can cycle. Other catalog rows stay in the table.
 */
export const MAX_UTILITIES = 5;

const ROSTER = {
  primary: ["AK-47", "M4A1", "Pump Shotgun", "Double Barrel"],
  secondary: ["USP", "Deagle"],
  melee: ["Tanto", "Cleaver"],
  utility: ["Smoke Grenade", "Flashbang", "Frag Grenade", "Incendiary", "Impact Grenade"],
};

/**
 * @param {import("./localWeapons.js").WeaponRecord[]} weapons
 * @param {"primary" | "secondary" | "melee" | "utility"} slot
 */
function pickRoster(weapons, slot) {
  const byName = new Map(weapons.filter((weapon) => weapon.slot === slot).map((weapon) => [weapon.name, weapon]));
  const chosen = ROSTER[slot].map((name) => byName.get(name)).filter(Boolean);
  if (chosen.length > 0) return chosen.slice(0, slot === "utility" ? MAX_UTILITIES : chosen.length);
  return weapons.filter((weapon) => weapon.slot === slot).slice(0, slot === "utility" ? MAX_UTILITIES : undefined);
}

/**
 * @param {import("./localWeapons.js").WeaponRecord[]} weapons
 */
export function buildLoadout(weapons) {
  return {
    primary: pickRoster(weapons, "primary"),
    secondary: pickRoster(weapons, "secondary"),
    melee: pickRoster(weapons, "melee"),
    utility: pickRoster(weapons, "utility"),
  };
}
