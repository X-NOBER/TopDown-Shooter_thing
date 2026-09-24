import { GAME } from "./config.js";
import { Player } from "./entities/Player.js";
import { Projectile } from "./entities/Projectile.js";
import { Weapon } from "./entities/Weapon.js";
import { preloadSprites } from "./visuals/appearance.js";

export class Game {
  /**
   * @param {import("p5")} p
   * @param {import("./data/localWeapons.js").WeaponRecord[]} weapons
   * @param {"supabase" | "local"} source
   */
  constructor(p, weapons, source) {
    this.p = p;
    this.weapons = weapons;
    this.source = source;
    this.equippedIndex = 0;

    this.player = new Player({
      x: GAME.canvasWidth / 2,
      y: GAME.canvasHeight / 2,
    });
    this.weapon = new Weapon(weapons[0]);
    /** @type {Projectile[]} */
    this.projectiles = [];

    this.hud = {
      name: document.getElementById("hud-weapon"),
      type: document.getElementById("hud-type"),
      damage: document.getElementById("hud-damage"),
      ammo: document.getElementById("hud-ammo"),
      ammoType: document.getElementById("hud-ammo-type"),
      source: document.getElementById("hud-source"),
    };

    this.syncHud();
  }

  async loadVisuals() {
    await preloadSprites(this.p, [this.player, this.weapon]);
  }

  syncHud() {
    const current = this.weapon.record;
    if (this.hud.name) this.hud.name.textContent = current.name;
    if (this.hud.type) this.hud.type.textContent = current.weapon_type;
    if (this.hud.damage) this.hud.damage.textContent = String(current.base_damage);
    if (this.hud.ammo) this.hud.ammo.textContent = this.weapon.ammoLabel;
    if (this.hud.ammoType) {
      this.hud.ammoType.textContent = `${current.ammo_type} · mag ${current.max_ammo}`;
    }
    if (this.hud.source) this.hud.source.textContent = this.source;
  }

  /** @param {number} index */
  async equipByIndex(index) {
    if (index < 0 || index >= this.weapons.length) return;
    this.equippedIndex = index;
    this.weapon.equip(this.weapons[index]);
    await preloadSprites(this.p, [this.weapon]);
    this.syncHud();
  }

  keyPressed() {
    if (this.p.key === "1") this.equipByIndex(0);
    if (this.p.key === "2") this.equipByIndex(1);
    if (this.p.key === "r" || this.p.key === "R") {
      this.weapon.reload();
      this.syncHud();
    }
  }

  pointerInsideCanvas() {
    const p = this.p;
    return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
  }

  tryShoot() {
    if (!this.pointerInsideCanvas()) return;
    const shots = this.weapon.tryFire(this.p.millis());
    if (!shots) return;

    for (const shot of shots) {
      const angle = this.player.aimAngle + shot.angleOffset;
      const origin = this.weapon.muzzlePoint(this.player, angle);
      this.projectiles.push(
        new Projectile({
          x: origin.x,
          y: origin.y,
          angle,
          speed: shot.speed,
          radius: shot.radius,
          lifeMs: shot.lifeMs,
          damage: shot.damage,
          fill: shot.fill,
        })
      );
    }
    this.syncHud();
  }

  update() {
    const bounds = {
      width: GAME.canvasWidth,
      height: GAME.canvasHeight,
    };
    this.player.update(this.p, bounds);

    if (this.p.mouseIsPressed) {
      this.tryShoot();
    }

    for (const projectile of this.projectiles) {
      projectile.update(this.p);
    }
    this.projectiles = this.projectiles.filter((projectile) =>
      projectile.isAlive(this.p, bounds)
    );
  }

  draw() {
    const p = this.p;
    p.background(GAME.background);
    p.noStroke();
    p.fill(GAME.floor);
    p.rect(24, 24, GAME.canvasWidth - 48, GAME.canvasHeight - 48, 16);

    for (const projectile of this.projectiles) {
      projectile.draw(p);
    }
    this.weapon.draw(p, this.player);
    this.player.draw(p);
  }
}
