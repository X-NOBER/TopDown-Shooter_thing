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
   * @param {boolean} [options.dummy]
   * @param {string} [options.label]
   */
  constructor({ x, y, maxHealth, weaponRecord, fill, dummy = false, label = "" }) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.speed = 78;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.aimAngle = Math.atan2(GAME.canvasHeight / 2 - y, GAME.canvasWidth / 2 - x);
    this.canSeeTarget = false;
    this.standoff = 170;
    this.dummy = dummy;
    this.label = label;
    this.burst = 0;
    this.lastDamage = null;
    this.lastDamageAge = 9999;
    this.blindMs = 0;
    this.fireHeatMs = 0;
    this.fireAccMs = 0;
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
    const dealt = Number(amount) || 0;
    if (this.dummy) {
      // Pellets from one shotgun blast land in the same frame. A later shot starts a new total.
      if (this.lastDamageAge > 90) this.burst = 0;
      this.burst += dealt;
      this.lastDamage = Math.round(this.burst * 10) / 10;
      this.lastDamageAge = 0;
      return;
    }
    this.health = Math.max(0, this.health - dealt);
  }

  /** @param {import("p5")} p */
  tick(p) {
    if (this.blindMs > 0) this.blindMs = Math.max(0, this.blindMs - p.deltaTime);
    if (!this.dummy) return;
    this.lastDamageAge += p.deltaTime;
  }

  /**
   * Aim and step toward the player only while a raycast reaches them.
   * @param {import("p5")} p
   * @param {{ x: number, y: number }} target
   * @param {Array<{ x: number, y: number, w: number, h: number }>} walls
   * @param {{ smokes?: object[], aimGun?: Function }} [extras]
   */
  update(p, target, walls, extras = {}) {
    if (this.blindMs > 0) {
      this.blindMs = Math.max(0, this.blindMs - p.deltaTime);
      this.canSeeTarget = false;
      return;
    }
    const smokes = extras.smokes ?? [];
    const vision = extras.hasClearVision ?? hasLineOfSight;
    this.canSeeTarget = vision(this.x, this.y, target.x, target.y, walls, smokes);
    if (!this.canSeeTarget) return;

    const desired = Math.atan2(target.y - this.y, target.x - this.x);
    if (extras.aimGun) extras.aimGun(this, desired, this.weapon.visual, walls, p.deltaTime);
    else this.aimAngle = desired;
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
    if (this.dummy || !this.canSeeTarget || this.blindMs > 0) return null;
    return this.weapon.tryFire(now);
  }

  /** @param {import("p5")} p */
  draw(p) {
    if (!this.dummy) this.weapon.draw(p, this);
    p.push();
    p.translate(this.x, this.y);
    drawPlayerVisual(p, this.visual);
    p.pop();
    if (!this.dummy) {
      drawHealthBar(p, this.x, this.y - this.radius - 16, this.health, this.maxHealth);
      return;
    }

    p.noStroke();
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(11);
    p.fill(210, 220, 230);
    p.text(this.label, this.x, this.y + this.radius + 16);
    if (this.lastDamage != null && this.lastDamageAge < 2400) {
      const shown = Number.isInteger(this.lastDamage) ? String(this.lastDamage) : this.lastDamage.toFixed(1);
      const label = `${shown} dmg`;
      p.textSize(20);
      p.textAlign(p.CENTER, p.BOTTOM);
      const plateW = p.textWidth(label) + 16;
      const plateTop = this.y - this.radius - 34;
      p.noStroke();
      p.fill(12, 16, 24, 210);
      p.rect(this.x - plateW / 2, plateTop, plateW, 24, 4);
      p.fill(255, 214, 102);
      p.text(label, this.x, this.y - this.radius - 12);
    }
  }
}
