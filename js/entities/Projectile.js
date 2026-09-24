export class Projectile {
  /**
   * @param {object} options
   * @param {number} options.x
   * @param {number} options.y
   * @param {number} options.angle
   * @param {number} options.speed
   * @param {number} options.radius
   * @param {number} options.lifeMs
   * @param {number} options.damage
   * @param {number[]} options.fill
   */
  constructor({ x, y, angle, speed, radius, lifeMs, damage, fill }) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.radius = radius;
    this.lifeMs = lifeMs;
    this.damage = damage;
    this.fill = fill;
    this.age = 0;
  }

  /** @param {import("p5")} p */
  update(p) {
    const dt = p.deltaTime / 1000;
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
