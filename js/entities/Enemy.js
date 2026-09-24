import { GAME } from "../config.js";
import { drawPlayerVisual } from "../visuals/appearance.js";
import { hasLineOfSight } from "../world/raycast.js";
import { Weapon } from "./Weapon.js";
import { drawHealthBar } from "./HealthBar.js";

export class Enemy {
  /**
   * @param {object} options
   * @param {number} options.x
   * @param {number} options.y
   * @param {number} options.maxHealth
   * @param {import("../data/localWeapons.js").WeaponRecord} options.weaponRecord
   * @param {number[]} options.fill
   */
  constructor({ x, y, maxHealth, weaponRecord, fill }) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.speed = 78;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.aimAngle = Math.atan2(GAME.canvasHeight / 2 - y, GAME.canvasWidth / 2 - x);
    this.canSeeTarget = false;
    this.standoff = 170;
    this.weapon = new Weapon(weaponRecord);
    this.weapon.fire = {
      ...this.weapon.fire,
      cooldownMs: this.weapon.fire.cooldownMs * 2.4,
    };
    this.visual = {
      kind: "circle",
      radius: this.radius,
      fill,
      stroke: [16, 18, 24],
    };
  }

  get alive() {
    return this.health > 0;
  }

  /** @param {number} amount */
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  /**
   * Aim and step toward the player only while a raycast reaches them.
   * @param {import("p5")} p
   * @param {{ x: number, y: number }} target
   * @param {Array<{ x: number, y: number, w: number, h: number }>} walls
   */
  update(p, target, walls) {
    this.canSeeTarget = hasLineOfSight(this.x, this.y, target.x, target.y, walls);
    if (!this.canSeeTarget) return;

    this.aimAngle = Math.atan2(target.y - this.y, target.x - this.x);
    const distance = Math.hypot(target.x - this.x, target.y - this.y);
    if (distance <= this.standoff) return;

    const dt = p.deltaTime / 1000;
    this.x += Math.cos(this.aimAngle) * this.speed * dt;
    this.y += Math.sin(this.aimAngle) * this.speed * dt;
  }

  /**
   * Fire only with a clear ray to the target.
   * @param {number} now
   */
  tryShoot(now) {
    if (!this.canSeeTarget) return null;
    return this.weapon.tryFire(now);
  }

  /** @param {import("p5")} p */
  draw(p) {
    this.weapon.draw(p, this);
    p.push();
    p.translate(this.x, this.y);
    drawPlayerVisual(p, this.visual);
    p.pop();
    drawHealthBar(p, this.x, this.y - this.radius - 16, this.health, this.maxHealth);
  }
}
