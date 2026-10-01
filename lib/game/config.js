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
 * Flip to false when magazines should actually empty.
 * `max_ammo` on each weapon row is still loaded and shown either way.
 */
export const COMBAT = {
  unlimitedAmmo: true,
};

/**
 * Feel of a shot, keyed by weapon_type. Magazine size and ammo family
 * come from the weapons table (`max_ammo`, `ammo_type`), not from here.
 */
export const FIRE_BY_TYPE = {
  pistol: {
    cooldownMs: 180,
    speed: 760,
    pellets: 1,
    spread: 0,
    radius: 4,
    lifeMs: 900,
    fill: [244, 248, 255],
  },
  shotgun: {
    cooldownMs: 560,
    speed: 620,
    pellets: 5,
    spread: 0.32,
    radius: 3.5,
    lifeMs: 420,
    fill: [255, 184, 92],
  },
  rifle: {
    cooldownMs: 110,
    speed: 920,
    pellets: 1,
    spread: 0,
    radius: 3.5,
    lifeMs: 1000,
    fill: [255, 214, 102],
  },
  knife: {
    cooldownMs: 320,
    speed: 0,
    pellets: 1,
    spread: 0,
    radius: 0,
    lifeMs: 0,
    fill: [220, 230, 240],
  },
  grenade: {
    cooldownMs: 700,
    speed: 340,
    pellets: 1,
    spread: 0,
    radius: 6,
    lifeMs: 750,
    fill: [255, 120, 80],
    stopOnTarget: false,
    blastRadius: 78,
  },
  flash: {
    cooldownMs: 700,
    speed: 340,
    pellets: 1,
    spread: 0,
    radius: 5,
    lifeMs: 680,
    fill: [255, 244, 180],
    stopOnTarget: false,
    blastRadius: 96,
  },
  smoke: {
    cooldownMs: 700,
    speed: 300,
    pellets: 1,
    spread: 0,
    radius: 5,
    lifeMs: 720,
    fill: [170, 186, 170],
    stopOnTarget: false,
    blastRadius: 88,
  },
  incendiary: {
    cooldownMs: 700,
    speed: 320,
    pellets: 1,
    spread: 0,
    radius: 5,
    lifeMs: 700,
    fill: [255, 90, 40],
    stopOnTarget: false,
    blastRadius: 64,
  },
  impact: {
    cooldownMs: 650,
    speed: 480,
    pellets: 1,
    spread: 0,
    radius: 5,
    lifeMs: 900,
    fill: [255, 70, 110],
    stopOnTarget: true,
    blastRadius: 42,
  },
  default: {
    cooldownMs: 220,
    speed: 680,
    pellets: 1,
    spread: 0,
    radius: 4,
    lifeMs: 800,
    fill: [180, 196, 220],
  },
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
  rifle: {
    length: 64,
    width: 10,
    fill: [255, 214, 102],
    gripInset: 8,
  },
  knife: {
    length: 28,
    width: 8,
    fill: [220, 230, 240],
    gripInset: 2,
  },
  grenade: {
    length: 16,
    width: 16,
    fill: [255, 120, 80],
    gripInset: 4,
  },
  flash: {
    length: 16,
    width: 16,
    fill: [255, 244, 180],
    gripInset: 4,
  },
  smoke: {
    length: 16,
    width: 16,
    fill: [170, 186, 170],
    gripInset: 4,
  },
  incendiary: {
    length: 16,
    width: 16,
    fill: [255, 90, 40],
    gripInset: 4,
  },
  impact: {
    length: 16,
    width: 16,
    fill: [255, 70, 110],
    gripInset: 4,
  },
  default: {
    length: 46,
    width: 12,
    fill: [180, 196, 220],
    gripInset: 6,
  },
};
