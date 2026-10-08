import { GAME } from "./config.js";
import { Game } from "./game.js";

/**
 * p5 instance-mode sketch. The React canvas host owns where the canvas mounts.
 * @param {{ weapons: import("./data/localWeapons.js").WeaponRecord[], source: "supabase" | "local" }} catalog
 * @param {object} [options]
 */
export function createSketch(catalog, options = {}) {
  const { mode = "match", loadout, walls, bounds, api } = options;

  return (p) => {
    /** @type {Game | undefined} */
    let game;

    p.setup = async () => {
      const width = bounds?.width ?? GAME.canvasWidth;
      const height = bounds?.height ?? GAME.canvasHeight;
      p.createCanvas(width, height);
      p.angleMode(p.RADIANS);
      p.cursor("crosshair");
      const canvas = p.canvas;
      const onPointerDown = () => {
        p._shotHeld = true;
        p._shotQueued = true;
      };
      const onPointerUp = () => {
        p._shotHeld = false;
      };
      canvas.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      const removeSketch = p.remove.bind(p);
      p.remove = () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        removeSketch();
      };

      game = new Game(p, catalog.weapons, catalog.source, {
        mode,
        loadout,
        walls,
        bounds: { width, height },
      });
      if (api) {
        api.game = game;
        if (api.latestLoadout) game.setLoadout(api.latestLoadout);
      }
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
