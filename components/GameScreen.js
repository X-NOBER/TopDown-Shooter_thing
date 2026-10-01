"use client";

import { useEffect, useRef } from "react";

const STATS = [
  ["Weapon", "hud-weapon", "Loading…"],
  ["Slot", "hud-slot", "—"],
  ["Rarity", "hud-rarity", "—"],
  ["Type", "hud-type", "—"],
  ["Damage", "hud-damage", "—"],
  ["Ammo", "hud-ammo", "—"],
  ["Ammo type", "hud-ammo-type", "—"],
  ["Through walls", "hud-wall", "—"],
  ["Catalog", "hud-source", "—"],
];

export default function GameScreen() {
  const holderRef = useRef(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return undefined;

    let cancelled = false;
    let instance = null;

    (async () => {
      const p5Module = await import("p5");
      const p5 = p5Module.default;
      const { loadWeaponCatalog } = await import("../lib/game/data/weaponRepository.js");
      const { createSketch } = await import("../lib/game/sketch.js");
      const catalog = await loadWeaponCatalog();
      if (cancelled || !holder.isConnected) return;
      instance = new p5(createSketch(catalog), holder);
    })();

    return () => {
      cancelled = true;
      if (instance) instance.remove();
    };
  }, []);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[minmax(220px,280px)_1fr]">
      <aside
        id="hud"
        aria-live="polite"
        className="border-b border-[#243044] bg-[#121821] p-5 md:border-r md:border-b-0"
      >
        <h1 className="mb-2 text-lg font-semibold">Top-Down Shooter</h1>
        <p className="mb-5 text-sm leading-snug text-[#93a0b5]">
          WASD to move · mouse to aim · click to use · 1 primary · 2 sidearm · 3 knife · 4–8 utilities · R reload. Press 1 again to swap primaries. Shots can stick inside a wall.
        </p>
        <dl className="grid gap-3">
          {STATS.map(([label, id, fallback]) => (
            <div key={id} className="border-t border-[#243044] pt-3">
              <dt className="text-[0.72rem] tracking-wide text-[#93a0b5] uppercase">{label}</dt>
              <dd id={id} className="mt-1 text-base text-[#3ecf8e]">
                {fallback}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
      <div
        id="canvas-holder"
        ref={holderRef}
        className="flex min-h-[70vh] items-center justify-center bg-[radial-gradient(circle_at_50%_45%,#152033_0%,#0b0f14_70%)] p-3 md:min-h-screen md:p-0 [&_canvas]:block [&_canvas]:rounded-lg [&_canvas]:border [&_canvas]:border-[#243044]"
      />
    </div>
  );
}
