import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from "../config.js";
import { LOCAL_WEAPONS } from "./localWeapons.js";

const WEAPON_COLUMNS =
  "id, name, description, weapon_type, base_damage, icon_url, unlock_cost, ammo_type, max_ammo";

function normalizeWeapon(row) {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description ?? null,
    weapon_type: row.weapon_type,
    base_damage: Number(row.base_damage),
    icon_url: row.icon_url ?? null,
    unlock_cost: row.unlock_cost == null ? 0 : Number(row.unlock_cost),
    ammo_type: row.ammo_type ?? "generic",
    max_ammo: row.max_ammo == null ? 0 : Number(row.max_ammo),
  };
}

/**
 * Try the live `weapons` table first; fall back to the local catalog so the
 * game still runs without network / if RLS or keys change.
 *
 * @returns {Promise<{ weapons: import("./localWeapons.js").WeaponRecord[], source: "supabase" | "local", error: string | null }>}
 */
export async function loadWeaponCatalog() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await supabase
      .from("weapons")
      .select(WEAPON_COLUMNS)
      .order("unlock_cost", { ascending: true });

    if (error) {
      throw error;
    }

    const weapons = (data ?? []).map(normalizeWeapon);
    if (weapons.length === 0) {
      return {
        weapons: LOCAL_WEAPONS.map(normalizeWeapon),
        source: "local",
        error: "Supabase returned no weapons; using local catalog.",
      };
    }

    return { weapons, source: "supabase", error: null };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return {
      weapons: LOCAL_WEAPONS.map(normalizeWeapon),
      source: "local",
      error: message,
    };
  }
}
