/**
 * Client-safe game config.
 * Publishable/anon keys are expected in the browser; never add the service role.
 */
export const SUPABASE_URL = "https://npltcxtyttwggongocla.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_vfS31_24EJ0ZayEN5i3qbg_ojlc541W";

export const GAME = {
  canvasWidth: 900,
  canvasHeight: 640,
  background: [14, 22, 34],
  floor: [20, 32, 48],
};

export const PLAYER = {
  radius: 22,
  speed: 260,
  fill: [62, 207, 142],
  stroke: [232, 238, 247],
};

/**
 * Visual-only stats that are not in the `weapons` table yet.
 * Keyed by weapon_type so new DB rows pick up a default look immediately.
 * Later: move these onto table columns, or swap in sprites via icon_url / skins.
 */
export const WEAPON_VISUALS_BY_TYPE = {
  pistol: {
    length: 42,
    width: 12,
    fill: [232, 238, 247],
    gripInset: 6,
  },
  shotgun: {
    length: 58,
    width: 16,
    fill: [255, 184, 92],
    gripInset: 6,
  },
  default: {
    length: 46,
    width: 12,
    fill: [180, 196, 220],
    gripInset: 6,
  },
};
