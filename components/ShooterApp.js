"use client";

import { useEffect, useState } from "react";
import GameScreen from "./GameScreen";
import LoadoutMenu from "./LoadoutMenu";

export default function ShooterApp() {
  const [catalog, setCatalog] = useState(null);
  const [phase, setPhase] = useState("menu");
  const [loadout, setLoadout] = useState(null);
  const [error, setError] = useState("");

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
        onReady={(chosen) => {
          setLoadout(chosen);
          setPhase("game");
        }}
      />
    );
  }

  return <GameScreen catalog={catalog} loadout={loadout} />;
}
