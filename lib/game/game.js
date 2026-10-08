import { GAME } from "./config.js";
import { buildLoadout } from "./data/loadout.js";
import { ENEMY_SPAWNS } from "./data/enemySpawns.js";
import { Enemy } from "./entities/Enemy.js";
import { Player } from "./entities/Player.js";
import { Projectile } from "./entities/Projectile.js";
import { Weapon } from "./entities/Weapon.js";
import { preloadSprites } from "./visuals/appearance.js";
import { resolveCircle } from "./world/collision.js";
import { simulateShot } from "./world/penetration.js";
import { createRangeDummies, RANGE_WALLS } from "./world/range.js";
import { hasLineOfSight } from "./world/raycast.js";
import { WALLS, drawWalls } from "./world/walls.js";

export class Game {
  /**
   * @param {import("p5")} p
   * @param {import("./data/localWeapons.js").WeaponRecord[]} weapons
   * @param {"supabase" | "local"} source
   * @param {{ mode?: "match" | "range", loadout?: ReturnType<typeof buildLoadout>, walls?: typeof WALLS, bounds?: { width: number, height: number } }} [options]
   */
  constructor(p, weapons, source, options = {}) {
    this.p = p;
    this.weapons = weapons;
    this.source = source;
    this.mode = options.mode ?? "match";
    this.bounds = options.bounds ?? {
      width: GAME.canvasWidth,
      height: GAME.canvasHeight,
    };
    this.walls = options.walls ?? (this.mode === "range" ? RANGE_WALLS : WALLS);
    this.loadout = options.loadout ?? buildLoadout(weapons);
    this.slotIndex = { primary: 0, secondary: 0, melee: 0, utility: 0 };
    this.activeSlot = "primary";

    this.player = new Player({
      x: this.mode === "range" ? 120 : this.bounds.width / 2,
      y: this.bounds.height / 2,
    });
    const starting = this.weaponInSlot("primary") ?? weapons[0];
    this.weapon = new Weapon(starting);
    /** @type {Enemy[]} */
    this.enemies = this.mode === "range"
      ? createRangeDummies(weapons[0])
      : ENEMY_SPAWNS.map((spawn) => {
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
    /** @type {Array<{ x: number, y: number, radius: number, age: number, life: number, fill: number[] }>} */
    this.effects = [];

    this.hud = {
      name: document.getElementById("hud-weapon"),
      type: document.getElementById("hud-type"),
      slot: document.getElementById("hud-slot"),
      rarity: document.getElementById("hud-rarity"),
      damage: document.getElementById("hud-damage"),
      ammo: document.getElementById("hud-ammo"),
      ammoType: document.getElementById("hud-ammo-type"),
      wall: document.getElementById("hud-wall"),
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
    if (this.hud.slot) this.hud.slot.textContent = current.slot;
    if (this.hud.rarity) this.hud.rarity.textContent = current.rarity;
    if (this.hud.damage) this.hud.damage.textContent = String(current.base_damage);
    if (this.hud.ammo) this.hud.ammo.textContent = this.weapon.ammoLabel;
    if (this.hud.ammoType) {
      this.hud.ammoType.textContent = `${current.ammo_type} · mag ${current.max_ammo}`;
    }
    if (this.hud.wall) {
      const keptDamage = Math.round((1 - current.wall_damage_reduction) * 100);
      const keptSpeed = Math.round((1 - current.wall_slowdown) * 100);
      this.hud.wall.textContent = `${current.wall_penetration}px · ${keptDamage}% dmg · ${keptSpeed}% speed`;
    }
    if (this.hud.source) this.hud.source.textContent = this.source;
  }

  /** @param {ReturnType<typeof buildLoadout>} loadout */
  setLoadout(loadout) {
    this.loadout = {
      primary: loadout.primary ?? [],
      secondary: loadout.secondary ?? [],
      melee: loadout.melee ?? [],
      utility: (loadout.utility ?? []).slice(0, 5),
    };
    const pool = [
      ...this.loadout.primary,
      ...this.loadout.secondary,
      ...this.loadout.melee,
      ...this.loadout.utility,
    ];
    const current = this.weapon?.record;
    const stillHeld = current && pool.some((weapon) => weapon.id === current.id);
    const next = stillHeld ? current : this.loadout.primary[0] ?? pool[0];
    if (!next) return;
    const slot = next.slot;
    this.activeSlot = slot;
    this.slotIndex[slot] = Math.max(0, this.loadout[slot].findIndex((weapon) => weapon.id === next.id));
    if (!stillHeld) this.weapon.equip(next);
    this.syncHud();
  }

  /** @param {"primary" | "secondary" | "melee" | "utility"} slot */
  weaponInSlot(slot) {
    const list = this.loadout[slot];
    if (!list || list.length === 0) return null;
    const index = this.slotIndex[slot] % list.length;
    return list[index];
  }

  /**
   * @param {"primary" | "secondary" | "melee" | "utility"} slot
   * @param {number | null} [utilityIndex]
   */
  async equipSlot(slot, utilityIndex = null) {
    const list = this.loadout[slot];
    if (!list || list.length === 0) return;
    if (slot === "utility" && utilityIndex != null) {
      if (utilityIndex < 0 || utilityIndex >= list.length) return;
      this.slotIndex.utility = utilityIndex;
    } else if (this.activeSlot === slot) {
      this.slotIndex[slot] = (this.slotIndex[slot] + 1) % list.length;
    }
    this.activeSlot = slot;
    const next = this.weaponInSlot(slot);
    if (!next) return;
    this.weapon.equip(next);
    await preloadSprites(this.p, [this.weapon]);
    this.syncHud();
  }

  keyPressed() {
    if (this.p.key === "1") this.equipSlot("primary");
    if (this.p.key === "2") this.equipSlot("secondary");
    if (this.p.key === "3") this.equipSlot("melee");
    if (this.p.key >= "4" && this.p.key <= "8") {
      this.equipSlot("utility", Number(this.p.key) - 4);
    }
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
          penetration: shot.penetration,
          wallDamageReduction: shot.wallDamageReduction,
          wallSlowdown: shot.wallSlowdown,
          stopOnTarget: shot.stopOnTarget,
          blastRadius: shot.blastRadius,
          team,
        })
      );
    }
  }

  swingMelee() {
    const reach = 62;
    const aim = this.player.aimAngle;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const distance = Math.hypot(dx, dy);
      if (distance > reach + enemy.radius) continue;
      let diff = Math.abs(Math.atan2(dy, dx) - aim);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff > 0.9) continue;
      if (!hasLineOfSight(this.player.x, this.player.y, enemy.x, enemy.y, this.walls)) continue;
      enemy.takeDamage(this.weapon.record.base_damage);
    }
    this.effects.push({
      x: this.player.x + Math.cos(aim) * 36,
      y: this.player.y + Math.sin(aim) * 36,
      radius: 28,
      age: 0,
      life: 90,
      fill: [230, 236, 245],
    });
  }

  tryShoot() {
    if (!this.pointerInsideCanvas()) return;
    const shots = this.weapon.tryFire(this.p.millis());
    if (!shots) return;
    if (this.weapon.record.slot === "melee") this.swingMelee();
    else this.spawnShots(this.player, this.weapon, shots, "player");
    this.syncHud();
  }

  update() {
    const bounds = this.bounds;
    this.player.update(this.p, bounds);
    const playerResolved = resolveCircle(
      this.player.x,
      this.player.y,
      this.player.radius,
      this.walls
    );
    this.player.x = playerResolved.x;
    this.player.y = playerResolved.y;

    if (this.p.mouseIsPressed || this.p._shotHeld || this.p._shotQueued) {
      this.p._shotQueued = false;
      this.tryShoot();
    }

    const now = this.p.millis();
    for (const enemy of this.enemies) {
      if (enemy.dummy) {
        enemy.tick(this.p);
        continue;
      }
      enemy.update(this.p, this.player, this.walls);
      const moved = resolveCircle(enemy.x, enemy.y, enemy.radius, this.walls);
      enemy.x = moved.x;
      enemy.y = moved.y;
      const shots = enemy.tryShoot(now);
      if (shots) this.spawnShots(enemy, enemy.weapon, shots, "enemy");
    }

    for (const projectile of this.projectiles) {
      projectile.update(this.p);
      this.advanceProjectile(projectile);
    }

    for (const effect of this.effects) {
      effect.age += this.p.deltaTime;
    }
    this.effects = this.effects.filter((effect) => effect.age < effect.life);

    for (const projectile of this.projectiles) {
      if (!projectile.isAlive(this.p, bounds)) projectile.alive = false;
      if (!projectile.alive) this.detonate(projectile);
    }

    this.projectiles = this.projectiles.filter((projectile) => projectile.alive);
    this.enemies = this.enemies.filter((enemy) => enemy.dummy || enemy.alive);
  }

  /** @param {Projectile} projectile */
  advanceProjectile(projectile) {
    const targets = projectile.team === "player"
      ? this.enemies.filter((enemy) => enemy.alive)
      : [this.player];
    const result = simulateShot(
      {
        x0: projectile.prevX,
        y0: projectile.prevY,
        x1: projectile.x,
        y1: projectile.y,
        damage: projectile.damage,
        speed: projectile.speed,
        radius: projectile.radius,
        penetrationLeft: projectile.penetrationLeft,
        wallDamageReduction: projectile.wallDamageReduction,
        wallSlowdown: projectile.wallSlowdown,
        stopOnTarget: projectile.stopOnTarget,
      },
      this.walls,
      targets
    );

    projectile.x = result.x;
    projectile.y = result.y;
    projectile.damage = result.damage;
    projectile.speed = result.speed;
    projectile.penetrationLeft = result.penetrationLeft;
    if (!result.alive) projectile.alive = false;

    if (projectile.blastRadius > 0) return;
    for (const hit of result.hits) {
      const target = targets[hit.index];
      if (target && target.takeDamage) target.takeDamage(hit.damage);
    }
  }

  /** @param {Projectile} projectile */
  detonate(projectile) {
    if (projectile.detonated || projectile.blastRadius <= 0) return;
    projectile.detonated = true;
    this.effects.push({
      x: projectile.x,
      y: projectile.y,
      radius: projectile.blastRadius,
      age: 0,
      life: 220,
      fill: projectile.fill,
    });
    if (projectile.team !== "player") return;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const distance = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);
      if (distance > projectile.blastRadius + enemy.radius) continue;
      if (!hasLineOfSight(projectile.x, projectile.y, enemy.x, enemy.y, this.walls)) continue;
      enemy.takeDamage(projectile.damage);
    }
  }

  draw() {
    const p = this.p;
    p.background(this.mode === "range" ? [12, 18, 28] : GAME.background);
    p.noStroke();
    p.fill(GAME.floor);
    p.rect(16, 16, this.bounds.width - 32, this.bounds.height - 32, 12);
    drawWalls(p, this.walls);
    if (this.mode === "range") {
      const wall = this.walls[0];
      p.noStroke();
      p.fill(186, 198, 214);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.textSize(12);
      if (wall) p.text("wall", wall.x + wall.w / 2, wall.y + 22);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(13);
      p.text(
        `${this.weapon.record.name} · ${this.weapon.record.base_damage} dmg · WASD move · click shoot`,
        24,
        18
      );
    }

    for (const effect of this.effects) {
      const fade = 1 - effect.age / effect.life;
      p.noStroke();
      p.fill(effect.fill[0], effect.fill[1], effect.fill[2], 80 * fade);
      p.circle(effect.x, effect.y, effect.radius * 2 * (0.7 + 0.3 * fade));
    }

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
