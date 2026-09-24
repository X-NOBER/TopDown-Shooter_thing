import { COMBAT, FIRE_BY_TYPE } from "../config.js";
import {
  drawWeaponVisual,
  muzzleDistance,
  weaponVisualFromRecord,
} from "../visuals/appearance.js";

export class Weapon {
  /**
   * @param {import("../data/localWeapons.js").WeaponRecord} record
   */
  constructor(record) {
    /** Remaining rounds per weapon id. Unused while unlimited ammo is on. */
    this.magazines = new Map();
    this.lastFiredAt = Number.NEGATIVE_INFINITY;
    this.equip(record);
  }

  /** @param {import("../data/localWeapons.js").WeaponRecord} record */
  equip(record) {
    this.record = record;
    this.visual = weaponVisualFromRecord(record);
    this.fire = FIRE_BY_TYPE[record.weapon_type] ?? FIRE_BY_TYPE.default;
    if (!this.magazines.has(record.id)) {
      this.magazines.set(record.id, record.max_ammo);
    }
  }

  get ammo() {
    return this.magazines.get(this.record.id) ?? 0;
  }

  get ammoLabel() {
    if (COMBAT.unlimitedAmmo) return "unlimited";
    return `${this.ammo} / ${this.record.max_ammo}`;
  }

  reload() {
    this.magazines.set(this.record.id, this.record.max_ammo);
  }

  /**
   * One trigger pull. Returns pellet descriptors, or null if the gun cannot fire.
   * @param {number} now
   */
  tryFire(now) {
    if (now - this.lastFiredAt < this.fire.cooldownMs) return null;
    if (!COMBAT.unlimitedAmmo && this.ammo <= 0) return null;

    this.lastFiredAt = now;
    if (!COMBAT.unlimitedAmmo) {
      this.magazines.set(this.record.id, this.ammo - 1);
    }

    const pellets = this.fire.pellets;
    const shots = [];
    for (let i = 0; i < pellets; i += 1) {
      const spreadT = pellets === 1 ? 0 : i / (pellets - 1) - 0.5;
      shots.push({
        angleOffset: spreadT * this.fire.spread,
        speed: this.fire.speed,
        radius: this.fire.radius,
        lifeMs: this.fire.lifeMs,
        damage: this.record.base_damage,
        fill: this.fire.fill,
      });
    }
    return shots;
  }

  /**
   * World position of the muzzle for the current aim.
   * @param {import("./Player.js").Player} player
   * @param {number} angle
   */
  muzzlePoint(player, angle) {
    const distance = muzzleDistance(this.visual, player.radius);
    return {
      x: player.x + Math.cos(angle) * distance,
      y: player.y + Math.sin(angle) * distance,
    };
  }

  /**
   * Stays glued to the player and rotates toward the current aim angle.
   * @param {import("p5")} p
   * @param {import("./Player.js").Player} player
   */
  draw(p, player) {
    p.push();
    p.translate(player.x, player.y);
    p.rotate(player.aimAngle);
    drawWeaponVisual(p, this.visual, player.radius);
    p.pop();
  }
}
