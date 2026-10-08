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

/** Grenade throw distance. Cursor inside this range is a precise land point. */
export const THROW = {
  range: {
    grenade: 300,
    flash: 280,
    smoke: 260,
    incendiary: 250,
    impact: 340,
    default: 280,
  },
  speed: {
    grenade: 420,
    flash: 440,
    smoke: 380,
    incendiary: 400,
    impact: 520,
    default: 400,
  },
};

export const UTILITY = {
  smoke: { lifeMs: 6500, radius: 92 },
  flash: { durationMs: 2200, radius: 110 },
  fire: { lifeMs: 5500, radius: 70, tickMs: 500, baseDamage: 8, ramp: 4 },
  frag: { radius: 86 },
  impact: { radius: 48 },
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
    speed: 420,
    pellets: 1,
    spread: 0,
    radius: 7,
    lifeMs: 4000,
    fill: [255, 120, 80],
    stopOnTarget: false,
    blastRadius: 86,
    thrown: true,
    effect: "frag",
  },
  flash: {
    cooldownMs: 700,
    speed: 440,
    pellets: 1,
    spread: 0,
    radius: 6,
    lifeMs: 4000,
    fill: [255, 244, 180],
    stopOnTarget: false,
    blastRadius: 110,
    thrown: true,
    effect: "flash",
  },
  smoke: {
    cooldownMs: 700,
    speed: 380,
    pellets: 1,
    spread: 0,
    radius: 6,
    lifeMs: 4000,
    fill: [170, 186, 170],
    stopOnTarget: false,
    blastRadius: 92,
    thrown: true,
    effect: "smoke",
  },
  incendiary: {
    cooldownMs: 700,
    speed: 400,
    pellets: 1,
    spread: 0,
    radius: 6,
    lifeMs: 4000,
    fill: [255, 90, 40],
    stopOnTarget: false,
    blastRadius: 70,
    thrown: true,
    effect: "incendiary",
  },
  impact: {
    cooldownMs: 650,
    speed: 520,
    pellets: 1,
    spread: 0,
    radius: 6,
    lifeMs: 4000,
    fill: [255, 70, 110],
    stopOnTarget: true,
    blastRadius: 48,
    thrown: true,
    effect: "impact",
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

/** Per-gun feel layered on top of the type preset. */
export const FIRE_BY_NAME = {
  "AK-47": { cooldownMs: 140, speed: 860, radius: 4, fill: [196, 122, 58] },
  "M4A1": { cooldownMs: 85, speed: 980, radius: 3, fill: [186, 198, 208] },
  "Pump Shotgun": { cooldownMs: 720, speed: 600, pellets: 6, spread: 0.26, lifeMs: 380 },
  "Double Barrel": { cooldownMs: 980, speed: 540, pellets: 8, spread: 0.55, lifeMs: 260 },
  "USP": { cooldownMs: 160, speed: 800, radius: 3.5 },
  "Deagle": { cooldownMs: 420, speed: 1040, radius: 5.5, fill: [255, 196, 64] },
  "Tanto": { cooldownMs: 280 },
  "Cleaver": { cooldownMs: 520 },
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

/** Rectangle stand-ins. Knives use different proportions on purpose. */
export const WEAPON_VISUALS_BY_NAME = {
  "AK-47": { length: 72, width: 11, fill: [176, 104, 52], gripInset: 10 },
  "M4A1": { length: 64, width: 8, fill: [176, 188, 198], gripInset: 8 },
  "Pump Shotgun": { length: 68, width: 13, fill: [140, 86, 46], gripInset: 8 },
  "Double Barrel": { length: 46, width: 18, fill: [112, 72, 44], gripInset: 4 },
  "USP": { length: 38, width: 9, fill: [214, 218, 224], gripInset: 5 },
  "Deagle": { length: 50, width: 16, fill: [212, 168, 52], gripInset: 6 },
  "Tanto": { length: 40, width: 5, fill: [214, 222, 230], gripInset: 0 },
  "Cleaver": { length: 20, width: 16, fill: [168, 176, 186], gripInset: 0 },
};
