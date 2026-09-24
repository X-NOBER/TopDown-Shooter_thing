import { PLAYER, WEAPON_VISUALS_BY_TYPE } from "../config.js";

/**
 * Appearance is separate from gameplay data so sprites can replace primitives
 * later without rewriting Player / Weapon movement.
 *
 * @typedef {object} PrimitivePlayerVisual
 * @property {"circle"} kind
 * @property {number} radius
 * @property {number[]} fill
 * @property {number[]} stroke
 *
 * @typedef {object} SpriteVisual
 * @property {"sprite"} kind
 * @property {string} url
 * @property {number} width
 * @property {number} height
 * @property {import("p5").Image | null} image
 *
 * @typedef {object} PrimitiveWeaponVisual
 * @property {"rect"} kind
 * @property {number} length
 * @property {number} width
 * @property {number[]} fill
 * @property {number} gripInset
 */

export function playerVisualFromSkin(skin) {
  if (skin?.icon_url) {
    return {
      kind: "sprite",
      url: skin.icon_url,
      width: PLAYER.radius * 2,
      height: PLAYER.radius * 2,
      image: null,
    };
  }

  return {
    kind: "circle",
    radius: PLAYER.radius,
    fill: PLAYER.fill,
    stroke: PLAYER.stroke,
  };
}

export function weaponVisualFromRecord(weapon) {
  const preset =
    WEAPON_VISUALS_BY_TYPE[weapon.weapon_type] ?? WEAPON_VISUALS_BY_TYPE.default;

  if (weapon.icon_url) {
    return {
      kind: "sprite",
      url: weapon.icon_url,
      width: preset.length,
      height: preset.width,
      image: null,
    };
  }

  return {
    kind: "rect",
    length: preset.length,
    width: preset.width,
    fill: preset.fill,
    gripInset: preset.gripInset,
  };
}

/**
 * Preload any sprite URLs onto the visual objects. Safe to call when there
 * are only primitives — it no-ops.
 *
 * @param {import("p5")} p
 * @param {Array<{ visual: SpriteVisual | object }>} entities
 */
export function preloadSprites(p, entities) {
  const jobs = [];

  for (const entity of entities) {
    const visual = entity.visual;
    if (visual?.kind !== "sprite" || !visual.url) continue;
    jobs.push(
      new Promise((resolve, reject) => {
        p.loadImage(
          visual.url,
          (img) => {
            visual.image = img;
            resolve(img);
          },
          reject
        );
      })
    );
  }

  return Promise.allSettled(jobs);
}

export function drawPlayerVisual(p, visual) {
  if (visual.kind === "sprite" && visual.image) {
    p.imageMode(p.CENTER);
    p.image(visual.image, 0, 0, visual.width, visual.height);
    return;
  }

  p.fill(visual.fill);
  p.stroke(visual.stroke);
  p.strokeWeight(2);
  p.circle(0, 0, visual.radius * 2);
}

/** Distance from the player center to the muzzle, in pixels. */
export function muzzleDistance(visual, ownerRadius) {
  if (visual.kind === "sprite") {
    return ownerRadius + visual.width / 2;
  }
  return ownerRadius - visual.gripInset + visual.length;
}

export function drawWeaponVisual(p, visual, ownerRadius) {
  if (visual.kind === "sprite" && visual.image) {
    p.imageMode(p.CENTER);
    const along = ownerRadius + visual.width / 2 - 2;
    p.image(visual.image, along, 0, visual.width, visual.height);
    return;
  }

  const startX = ownerRadius - visual.gripInset;
  p.noStroke();
  p.fill(visual.fill);
  p.rectMode(p.CORNER);
  p.rect(startX, -visual.width / 2, visual.length, visual.width, 3);
}
