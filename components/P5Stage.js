"use client";

import { useEffect, useRef } from "react";

/**
 * Mounts one p5 sketch. Loadout changes update the running game instead of remounting.
 */
export default function P5Stage({ catalog, mode = "match", loadout, bounds, className }) {
  const holderRef = useRef(null);
  const apiRef = useRef({ game: null, latestLoadout: loadout });
  apiRef.current.latestLoadout = loadout;

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !catalog) return undefined;

    let cancelled = false;
    let instance = null;
    const api = apiRef.current;

    (async () => {
      const p5 = (await import("p5")).default;
      const { createSketch } = await import("../lib/game/sketch.js");
      if (cancelled || !holder.isConnected) return;
      instance = new p5(
        createSketch(catalog, {
          mode,
          loadout: api.latestLoadout,
          bounds,
          api,
        }),
        holder
      );
    })();

    return () => {
      cancelled = true;
      api.game = null;
      if (instance) instance.remove();
    };
  }, [catalog, mode, bounds]);

  useEffect(() => {
    apiRef.current.game?.setLoadout(loadout);
  }, [loadout]);

  return <div ref={holderRef} className={className} />;
}
