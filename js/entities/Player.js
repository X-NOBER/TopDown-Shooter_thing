import { PLAYER } from "../config.js";
import { drawPlayerVisual, playerVisualFromSkin } from "../visuals/appearance.js";

export class Player {
  /**
   * @param {object} options
   * @param {number} options.x
   * @param {number} options.y
   * @param {object | null} [options.skin] future `skins` row
   */
  constructor({ x, y, skin = null }) {
    this.x = x;
    this.y = y;
    this.radius = PLAYER.radius;
    this.speed = PLAYER.speed;
    this.aimAngle = 0;
    this.visual = playerVisualFromSkin(skin);
  }

  /**
   * @param {import("p5")} p
   * @param {{ width: number, height: number }} bounds
   */
  update(p, bounds) {
    const input = {
      x: (p.keyIsDown(65) || p.keyIsDown(p.LEFT_ARROW) ? -1 : 0) +
        (p.keyIsDown(68) || p.keyIsDown(p.RIGHT_ARROW) ? 1 : 0),
      y: (p.keyIsDown(87) || p.keyIsDown(p.UP_ARROW) ? -1 : 0) +
        (p.keyIsDown(83) || p.keyIsDown(p.DOWN_ARROW) ? 1 : 0),
    };

    const length = Math.hypot(input.x, input.y);
    if (length > 0) {
      const dt = p.deltaTime / 1000;
      this.x += (input.x / length) * this.speed * dt;
      this.y += (input.y / length) * this.speed * dt;
    }

    const pad = this.radius;
    this.x = p.constrain(this.x, pad, bounds.width - pad);
    this.y = p.constrain(this.y, pad, bounds.height - pad);

    this.aimAngle = Math.atan2(p.mouseY - this.y, p.mouseX - this.x);
  }

  /**
   * Swap player look later (sprite skin from `skins` / `player_skins`).
   * @param {object | null} skin
   */
  setSkin(skin) {
    this.visual = playerVisualFromSkin(skin);
  }

  /** @param {import("p5")} p */
  draw(p) {
    p.push();
    p.translate(this.x, this.y);
    p.rotate(this.aimAngle);
    drawPlayerVisual(p, this.visual);
    p.pop();
  }
}
