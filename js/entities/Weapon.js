import { drawWeaponVisual, weaponVisualFromRecord } from "../visuals/appearance.js";

export class Weapon {
  /**
   * @param {import("../data/localWeapons.js").WeaponRecord} record
   */
  constructor(record) {
    this.record = record;
    this.visual = weaponVisualFromRecord(record);
  }

  /** @param {import("../data/localWeapons.js").WeaponRecord} record */
  equip(record) {
    this.record = record;
    this.visual = weaponVisualFromRecord(record);
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
