export class Projectile {
  /**
   * @param {object} options
   */
  constructor({
    x,
    y,
    angle,
    speed,
    radius,
    lifeMs,
    damage,
    fill,
    team,
    penetration = 0,
    wallDamageReduction = 0.5,
    wallSlowdown = 0.4,
    stopOnTarget = true,
    blastRadius = 0,
    thrown = false,
    landX = x,
    landY = y,
    effect = null,
  }) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.angle = angle;
    this.speed = speed;
    this.radius = radius;
    this.lifeMs = lifeMs;
    this.damage = damage;
    this.fill = fill;
    this.team = team;
    this.penetrationLeft = penetration;
    this.wallDamageReduction = wallDamageReduction;
    this.wallSlowdown = wallSlowdown;
    this.stopOnTarget = stopOnTarget;
    this.blastRadius = blastRadius;
    this.thrown = thrown;
    this.landX = landX;
    this.landY = landY;
    this.effect = effect;
    this.age = 0;
    this.alive = true;
    this.detonated = false;
  }

  /** @param {import("p5")} p */
  update(p) {
    this.prevX = this.x;
    this.prevY = this.y;
    const dt = p.deltaTime / 1000;
    if (this.thrown) {
      const dx = this.landX - this.x;
      const dy = this.landY - this.y;
      const dist = Math.hypot(dx, dy);
      const step = this.speed * dt;
      if (dist <= step || dist < 1) {
        this.x = this.landX;
        this.y = this.landY;
        this.alive = false;
        return;
      }
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      this.age += p.deltaTime;
      return;
    }
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
    this.age += p.deltaTime;
  }

  /**
   * @param {import("p5")} p
   * @param {{ width: number, height: number }} bounds
   */
  isAlive(p, bounds) {
    if (this.age >= this.lifeMs) return false;
    const margin = this.radius;
    return (
      this.x >= -margin &&
      this.y >= -margin &&
      this.x <= bounds.width + margin &&
      this.y <= bounds.height + margin
    );
  }

  /** @param {import("p5")} p */
  draw(p) {
    p.noStroke();
    p.fill(this.fill);
    p.circle(this.x, this.y, this.radius * 2);
  }
}
