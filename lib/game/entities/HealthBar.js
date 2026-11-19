/**
 * Black track with a fill that shrinks and shifts from green to red.
 * @param {import("p5")} p
 * @param {number} centerX
 * @param {number} topY
 * @param {number} health
 * @param {number} maxHealth
 * @param {number} [width]
 * @param {number} [height]
 */
export function drawHealthBar(p, centerX, topY, health, maxHealth, width = 40, height = 6) {
  const ratio = maxHealth <= 0 ? 0 : Math.max(0, Math.min(1, health / maxHealth));
  const red = 214 * (1 - ratio) + 46 * ratio;
  const green = 52 * (1 - ratio) + 196 * ratio;
  const blue = 58 * (1 - ratio) + 78 * ratio;
  const x = centerX - width / 2;

  p.noStroke();
  p.fill(0, 0, 0);
  p.rect(x, topY, width, height);
  if (ratio > 0) {
    p.fill(red, green, blue);
    p.rect(x, topY, width * ratio, height);
  }
}
