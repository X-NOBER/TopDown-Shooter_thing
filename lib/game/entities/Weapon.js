import { COMBAT, FIRE_BY_NAME, FIRE_BY_TYPE, THROW } from "../config.js";
import {
  drawWeaponVisual,
  muzzleDistance,
  weaponVisualFromRecord,
} from "../visuals/appearance.js";
import { pointInWalls } from "../world/penetration.js";

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
    const byType = FIRE_BY_TYPE[record.weapon_type] ?? FIRE_BY_TYPE.default;
    this.fire = { ...byType, ...(FIRE_BY_NAME[record.name] ?? {}) };
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
    if (this.record.slot !== "melee" && !COMBAT.unlimitedAmmo && this.ammo <= 0) return null;

    this.lastFiredAt = now;
    if (this.record.slot !== "melee" && !COMBAT.unlimitedAmmo) {
      this.magazines.set(this.record.id, this.ammo - 1);
    }

    if (this.record.slot === "melee") return [];

    const pellets = this.fire.pellets;
    const shots = [];
    const thrown = this.fire.thrown === true || this.record.slot === "utility";
    const type = this.record.weapon_type;
    for (let i = 0; i < pellets; i += 1) {
      const spreadT = pellets === 1 ? 0 : i / (pellets - 1) - 0.5;
      shots.push({
        angleOffset: spreadT * this.fire.spread,
        speed: thrown ? (THROW.speed[type] ?? THROW.speed.default) : this.fire.speed,
        radius: this.fire.radius,
        lifeMs: this.fire.lifeMs,
        damage: this.record.base_damage,
        fill: this.fire.fill,
        penetration: this.record.wall_penetration,
        wallDamageReduction: this.record.wall_damage_reduction,
        wallSlowdown: this.record.wall_slowdown,
        stopOnTarget: this.fire.stopOnTarget !== false,
        blastRadius: this.fire.blastRadius ?? 0,
        thrown,
        effect: this.fire.effect ?? (thrown ? type : null),
        throwRange: THROW.range[type] ?? THROW.range.default,
      });
    }
    return shots;
  }

  /**
   * World position of the muzzle for the current aim.
   * Pulled back if that point would spawn inside a wall.
   * @param {{ x: number, y: number, radius: number }} player
   * @param {number} angle
   * @param {Array<{ x: number, y: number, w: number, h: number }>} [walls]
   */
  muzzlePoint(player, angle, walls = []) {
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    let distance = muzzleDistance(this.visual, player.radius);
    while (distance > player.radius) {
      const x = player.x + ux * distance;
      const y = player.y + uy * distance;
      if (!pointInWalls(x, y, walls)) return { x, y };
      distance -= 2;
    }
    return {
      x: player.x + ux * player.radius,
      y: player.y + uy * player.radius,
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
