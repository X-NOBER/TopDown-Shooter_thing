import { drawGroundWeaponVisual } from "../visuals/appearance.js";

/**
 * A gun on the floor. Keeps its sprite, remaining ammo, and a facing until
 * someone picks it up or this game session ends.
 */
export class DroppedWeapon {
  /**
   * @param {object} options
   * @param {import("../data/localWeapons.js").WeaponRecord} options.record
   * @param {object} options.visual
   * @param {number} options.ammo
   * @param {number} options.storedAmmo
   * @param {number} options.x
   * @param {number} options.y
   * @param {number} options.angle
   */
  constructor({ record, visual, ammo, storedAmmo, x, y, angle }) {
    this.record = record;
    this.visual = visual;
    this.ammo = ammo;
    this.storedAmmo = storedAmmo;
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  promptText() {
    return `Press E to pick up: ${this.record.name} | ${this.ammo}/${this.storedAmmo}`;
  }

  /**
   * @param {import("p5")} p
   */
  draw(p) {
    p.push();
    p.translate(this.x, this.y);
    p.rotate(this.angle);
    drawGroundWeaponVisual(p, this.visual);
    p.pop();
  }
}
