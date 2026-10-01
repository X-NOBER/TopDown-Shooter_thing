/**
 * Mirrors `public.weapons` so the game can load from Supabase or a local fallback
 * without changing entity / render code.
 *
 * @typedef {object} WeaponRecord
 * @property {string} id
 * @property {string} name
 * @property {string|null} description
 * @property {string} weapon_type
 * @property {number} base_damage
 * @property {string|null} icon_url
 * @property {number|null} unlock_cost
 * @property {string} ammo_type
 * @property {number} max_ammo
 */

/** @type {WeaponRecord[]} */
export const LOCAL_WEAPONS = [
  {
    id: "47da3778-e836-4a47-9e4f-616e231c7077",
    name: "Starter Pistol",
    description: "Reliable sidearm for new recruits. Fast draw, modest punch.",
    weapon_type: "pistol",
    base_damage: 12,
    icon_url: null,
    unlock_cost: 0,
    ammo_type: "light",
    max_ammo: 12,
  },
  {
    id: "bf958d01-a538-4f89-94e5-727a099455b0",
    name: "Scatter Shot",
    description: "Short-range shotgun that clears tight corridors in a hurry.",
    weapon_type: "shotgun",
    base_damage: 28,
    icon_url: null,
    unlock_cost: 500,
    ammo_type: "shell",
    max_ammo: 6,
  },
];
