"use client";

import { useEffect, useState } from "react";
import GameScreen from "./GameScreen";
import LoadoutMenu from "./LoadoutMenu";

export default function ShooterApp() {
  const [catalog, setCatalog] = useState(null);
  const [phase, setPhase] = useState("menu");
  const [loadout, setLoadout] = useState(null);
  const [error, setError] = useState("");
  const [colyseusLabel, setColyseusLabel] = useState("Connecting…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { loadWeaponCatalog } = await import("../lib/game/data/weaponRepository.js");
      const next = await loadWeaponCatalog();
      if (!cancelled) setCatalog(next);
    })().catch((err) => {
      if (!cancelled) setError(err?.message || "Could not load weapons.");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    /** @type {{ leave?: Function } | null} */
    let room = null;
    (async () => {
      const { connectToGameRoom } = await import("../lib/game/net/colyseusClient.js");
      const next = await connectToGameRoom();
      if (cancelled) {
        next.room?.leave();
        return;
      }
      room = next.room;
      setColyseusLabel(next.label);
      next.room?.onLeave?.(() => {
        if (!cancelled) setColyseusLabel("disconnected");
      });
    })();
    return () => {
      cancelled = true;
      room?.leave?.();
    };
  }, []);

  if (error) {
    return <p className="p-8 text-red-300">{error}</p>;
  }

  if (!catalog) {
    return <p className="p-8 text-[#93a0b5]">Loading weapons…</p>;
  }

  if (phase === "menu" || !loadout) {
    return (
      <LoadoutMenu
        catalog={catalog}
        colyseusLabel={colyseusLabel}
        onReady={(chosen) => {
          setLoadout(chosen);
          setPhase("game");
        }}
      />
    );
  }

  return <GameScreen catalog={catalog} loadout={loadout} colyseusLabel={colyseusLabel} />;
}
