import { GAME } from "./config.js";
import { loadWeaponCatalog } from "./data/weaponRepository.js";
import { Game } from "./game.js";

const catalog = await loadWeaponCatalog();

new p5((p) => {
  /** @type {Game} */
  let game;

  p.setup = async () => {
    const canvas = p.createCanvas(GAME.canvasWidth, GAME.canvasHeight);
    canvas.parent("canvas-holder");
    p.angleMode(p.RADIANS);
    p.cursor("crosshair");

    game = new Game(p, catalog.weapons, catalog.source);
    await game.loadVisuals();
  };

  p.draw = () => {
    if (!game) return;
    game.update();
    game.draw();
  };

  p.keyPressed = () => {
    if (!game) return;
    game.keyPressed();
  };
});
