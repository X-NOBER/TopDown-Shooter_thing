import { GAME } from "./config.js";
import { Game } from "./game.js";

/**
 * p5 instance-mode sketch. The React canvas host owns where the canvas mounts.
 * @param {{ weapons: import("./data/localWeapons.js").WeaponRecord[], source: "supabase" | "local" }} catalog
 */
export function createSketch(catalog) {
  return (p) => {
    /** @type {Game | undefined} */
    let game;

    p.setup = async () => {
      p.createCanvas(GAME.canvasWidth, GAME.canvasHeight);
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
  };
}
