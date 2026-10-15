import { PLAYER, WEAPON_VISUALS_BY_NAME, WEAPON_VISUALS_BY_TYPE } from "../config.js";

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
 * @property {string | null} [overlayUrl]
 * @property {boolean} [overlayFlipX]
 * @property {number} [overlayScale]
 * @property {number} [overlayHeight]
 * @property {number} [overlayTuck]
 * @property {import("p5").Image | null} [image]
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
    WEAPON_VISUALS_BY_NAME[weapon.name] ??
    WEAPON_VISUALS_BY_TYPE[weapon.weapon_type] ??
    WEAPON_VISUALS_BY_TYPE.default;

  const overlayUrl = weapon.icon_url || preset.overlayUrl || null;

  return {
    kind: "rect",
    length: preset.length,
    width: preset.width,
    fill: preset.fill,
    gripInset: preset.gripInset,
    overlayUrl,
    overlayFlipX: preset.overlayFlipX === true,
    overlayScale: preset.overlayScale ?? 1,
    overlayHeight: preset.overlayHeight ?? preset.width,
    overlayTuck: preset.overlayTuck ?? 4,
    image: null,
  };
}

/**
 * Preload any sprite URLs onto the visual objects. Safe to call when there
 * are only primitives — it no-ops.
 *
 * @param {import("p5")} p
 * @param {Array<{ visual: SpriteVisual | PrimitiveWeaponVisual | object }>} entities
 */
export function preloadSprites(p, entities) {
  const jobs = [];

  for (const entity of entities) {
    const visual = entity.visual;
    const url = visual?.kind === "sprite" ? visual.url : visual?.overlayUrl;
    if (!visual || !url) continue;
    jobs.push(
      new Promise((resolve, reject) => {
        p.loadImage(
          url,
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

/**
 * Overlay size that keeps the source image aspect ratio.
 * Height comes from the gun preset; width follows the photo.
 */
export function overlayDrawSize(visual) {
  const image = visual?.image;
  if (!image || !image.width || !image.height) return null;
  const aspect = image.width / image.height;
  const drawH = (visual.overlayHeight ?? visual.width ?? 14) * (visual.overlayScale ?? 1);
  return { drawW: drawH * aspect, drawH };
}

function overlayStockX(visual, ownerRadius) {
  return ownerRadius - (visual.overlayTuck ?? 4);
}

/** Distance from the player center to the muzzle, in pixels. */
export function muzzleDistance(visual, ownerRadius) {
  const overlay = overlayDrawSize(visual);
  if (overlay) return overlayStockX(visual, ownerRadius) + overlay.drawW;
  if (visual.kind === "sprite") {
    return ownerRadius + visual.width / 2;
  }
  return ownerRadius - visual.gripInset + visual.length;
}

export function drawWeaponVisual(p, visual, ownerRadius) {
  const overlay = overlayDrawSize(visual);

  if (overlay) {
    const stockX = overlayStockX(visual, ownerRadius);
    const along = stockX + overlay.drawW / 2;
    p.push();
    p.translate(along, 0);
    if (visual.overlayFlipX) p.scale(-1, 1);
    p.imageMode(p.CENTER);
    p.image(visual.image, 0, 0, overlay.drawW, overlay.drawH);
    p.pop();
    return;
  }

  if (visual.kind === "sprite" && visual.image) {
    p.imageMode(p.CENTER);
    const along = ownerRadius + visual.width / 2 - 2;
    p.image(visual.image, along, 0, visual.width, visual.height);
    return;
  }

  const startX = ownerRadius - (visual.gripInset ?? 0);
  const length = visual.length ?? visual.width;
  const thickness = visual.width ?? 12;
  p.noStroke();
  p.fill(visual.fill);
  p.rectMode(p.CORNER);
  p.rect(startX, -thickness / 2, length, thickness, 3);
}
