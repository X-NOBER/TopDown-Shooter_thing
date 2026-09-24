import { GAME } from "./config.js";
import { ENEMY_SPAWNS } from "./data/enemySpawns.js";
import { Enemy } from "./entities/Enemy.js";
import { Player } from "./entities/Player.js";
import { Projectile } from "./entities/Projectile.js";
import { Weapon } from "./entities/Weapon.js";
import { preloadSprites } from "./visuals/appearance.js";
import { resolveCircle } from "./world/collision.js";
import { segmentCircleT, segmentRectT } from "./world/raycast.js";
import { WALLS, drawWalls } from "./world/walls.js";

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
    /** @type {Enemy[]} */
    this.enemies = ENEMY_SPAWNS.map((spawn) => {
      const weaponRecord =
        weapons.find((weapon) => weapon.weapon_type === spawn.weaponType) ?? weapons[0];
      return new Enemy({
        x: spawn.x,
        y: spawn.y,
        maxHealth: spawn.maxHealth,
        weaponRecord,
        fill: spawn.fill,
      });
    });
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
    const visuals = [this.player, this.weapon];
    for (const enemy of this.enemies) {
      visuals.push(enemy, enemy.weapon);
    }
    await preloadSprites(this.p, visuals);
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

  /**
   * @param {{ x: number, y: number, aimAngle: number, radius: number }} actor
   * @param {Weapon} weapon
   * @param {Array<{ angleOffset: number, speed: number, radius: number, lifeMs: number, damage: number, fill: number[] }>} shots
   * @param {"player" | "enemy"} team
   */
  spawnShots(actor, weapon, shots, team) {
    for (const shot of shots) {
      const angle = actor.aimAngle + shot.angleOffset;
      const origin = weapon.muzzlePoint(actor, angle);
      this.projectiles.push(
        new Projectile({
          x: origin.x,
          y: origin.y,
          angle,
          speed: shot.speed,
          radius: shot.radius,
          lifeMs: shot.lifeMs,
          damage: shot.damage,
          fill: team === "enemy" ? [255, 96, 96] : shot.fill,
          team,
        })
      );
    }
  }

  tryShoot() {
    if (!this.pointerInsideCanvas()) return;
    const shots = this.weapon.tryFire(this.p.millis());
    if (!shots) return;
    this.spawnShots(this.player, this.weapon, shots, "player");
    this.syncHud();
  }

  update() {
    const bounds = {
      width: GAME.canvasWidth,
      height: GAME.canvasHeight,
    };
    this.player.update(this.p, bounds);
    const playerResolved = resolveCircle(
      this.player.x,
      this.player.y,
      this.player.radius,
      WALLS
    );
    this.player.x = playerResolved.x;
    this.player.y = playerResolved.y;

    if (this.p.mouseIsPressed) {
      this.tryShoot();
    }

    const now = this.p.millis();
    for (const enemy of this.enemies) {
      enemy.update(this.p, this.player, WALLS);
      const moved = resolveCircle(enemy.x, enemy.y, enemy.radius, WALLS);
      enemy.x = moved.x;
      enemy.y = moved.y;
      const shots = enemy.tryShoot(now);
      if (shots) this.spawnShots(enemy, enemy.weapon, shots, "enemy");
    }

    for (const projectile of this.projectiles) {
      projectile.update(this.p);
    }

    this.resolveHits();
    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.alive && projectile.isAlive(this.p, bounds)
    );
    this.enemies = this.enemies.filter((enemy) => enemy.alive);
  }

  resolveHits() {
    for (const projectile of this.projectiles) {
      if (!projectile.alive) continue;

      let bestT = Infinity;
      let hitWall = false;
      /** @type {Enemy | null} */
      let hitEnemy = null;
      let hitPlayer = false;

      for (const wall of WALLS) {
        const t = segmentRectT(
          projectile.prevX,
          projectile.prevY,
          projectile.x,
          projectile.y,
          wall
        );
        if (t != null && t < bestT) {
          bestT = t;
          hitWall = true;
          hitEnemy = null;
          hitPlayer = false;
        }
      }

      if (projectile.team === "player") {
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const t = segmentCircleT(
            projectile.prevX,
            projectile.prevY,
            projectile.x,
            projectile.y,
            enemy.x,
            enemy.y,
            enemy.radius + projectile.radius
          );
          if (t != null && t < bestT) {
            bestT = t;
            hitEnemy = enemy;
            hitWall = false;
            hitPlayer = false;
          }
        }
      } else {
        const t = segmentCircleT(
          projectile.prevX,
          projectile.prevY,
          projectile.x,
          projectile.y,
          this.player.x,
          this.player.y,
          this.player.radius + projectile.radius
        );
        if (t != null && t < bestT) {
          bestT = t;
          hitPlayer = true;
          hitWall = false;
          hitEnemy = null;
        }
      }

      if (hitEnemy) {
        hitEnemy.takeDamage(projectile.damage);
        projectile.alive = false;
      } else if (hitWall || hitPlayer) {
        projectile.alive = false;
      }
    }
  }

  draw() {
    const p = this.p;
    p.background(GAME.background);
    p.noStroke();
    p.fill(GAME.floor);
    p.rect(24, 24, GAME.canvasWidth - 48, GAME.canvasHeight - 48, 16);
    drawWalls(p);

    for (const projectile of this.projectiles) {
      projectile.draw(p);
    }
    for (const enemy of this.enemies) {
      enemy.draw(p);
    }
    this.weapon.draw(p, this.player);
    this.player.draw(p);
  }
}
