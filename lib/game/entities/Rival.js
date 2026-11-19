import { PLAYER } from "../config.js";
import { drawHealthBar } from "./HealthBar.js";
import { Player } from "./Player.js";
import { Weapon } from "./Weapon.js";

/**
 * The other fighter in a Colyseus arena. Pose comes from the server;
 * damage reports go back to the server so both clients share one health pool.
 */
export class Rival {
  /**
   * @param {object} net
   * @param {string} sessionId
   * @param {import("../data/localWeapons.js").WeaponRecord[]} weapons
   */
  constructor(net, sessionId, weapons) {
    this.net = net;
    this.sessionId = sessionId;
    this.weapons = weapons;
    this.x = 0;
    this.y = 0;
    this.aimAngle = 0;
    this.radius = PLAYER.radius;
    this.health = 100;
    this.maxHealth = 100;
    this.weaponName = "";
    this.dummy = false;
    this.blindMs = 0;
    this.fireHeatMs = 0;
    this.fireAccMs = 0;
    this.player = new Player({ x: 0, y: 0, fill: [232, 96, 88] });
    this.weapon = null;
  }

  get alive() {
    return this.health > 0;
  }

  /** @param {number} amount */
  takeDamage(amount) {
    this.net.sendHit(this.sessionId, amount);
  }

  /**
   * @param {object} data
   */
  sync(data) {
    this.x = data.x;
    this.y = data.y;
    this.aimAngle = data.aimAngle;
    this.health = data.health;
    this.maxHealth = data.maxHealth;
    this.player.x = data.x;
    this.player.y = data.y;
    this.player.aimAngle = data.aimAngle;
    this.player.lookAngle = data.aimAngle;
    this.player.health = data.health;
    this.player.maxHealth = data.maxHealth;
    this.player.visual.fill = [data.fillR, data.fillG, data.fillB];
    if (data.weaponName && data.weaponName !== this.weaponName) {
      const record = this.weapons.find((weapon) => weapon.name === data.weaponName);
      this.weapon = record ? new Weapon(record) : null;
    }
    this.weaponName = data.weaponName;
  }

  /** @param {import("p5")} p */
  draw(p) {
    if (this.health <= 0) return;
    this.player.draw(p);
    if (this.weapon) this.weapon.draw(p, this.player);
    drawHealthBar(
      p,
      this.x,
      this.y + this.radius + 10,
      this.health,
      this.maxHealth
    );
  }
}
