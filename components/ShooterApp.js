"use client";

import { useEffect, useState } from "react";
import GameScreen from "./GameScreen";
import LoadoutMenu from "./LoadoutMenu";
import WaitingRoom from "./WaitingRoom";
import { attachArenaNet } from "../lib/game/net/colyseusClient.js";
import { MATCH } from "../lib/game/config.js";

export default function ShooterApp() {
  const [catalog, setCatalog] = useState(null);
  const [phase, setPhase] = useState("menu");
  const [loadout, setLoadout] = useState(null);
  const [error, setError] = useState("");
  const [colyseusLabel, setColyseusLabel] = useState("Connecting…");
  const [arena, setArena] = useState(null);

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
    (async () => {
      const { pingColyseus } = await import("../lib/game/net/colyseusClient.js");
      const next = await pingColyseus();
      if (!cancelled) setColyseusLabel(next.label);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const room = arena?.room;
    if (!room) return undefined;

    const applyState = (state) => {
      let players = 0;
      if (typeof state?.players?.size === "number") players = state.players.size;
      else state?.players?.forEach?.(() => { players += 1; });
      setArena((current) => {
        if (!current || current.room !== room) return current;
        return {
          ...current,
          phase: state.phase,
          players,
          needed: state.needed ?? MATCH.minPlayers,
          max: state.max ?? MATCH.maxPlayers,
          roomId: room.roomId,
        };
      });
      setColyseusLabel(
        state.phase === "fighting"
          ? `fight · ${players}/${state.max ?? MATCH.maxPlayers}`
          : `waiting · ${players}/${state.max ?? MATCH.maxPlayers}`
      );
      setPhase(state.phase === "fighting" ? "game" : "waiting");
    };

    applyState(room.state);
    room.onStateChange(applyState);
    room.onLeave(() => {
      setColyseusLabel("disconnected");
    });

    return () => {
      room.onStateChange(() => {});
    };
  }, [arena?.room]);

  async function handleReady(chosen) {
    setColyseusLabel("joining queue…");
    const { joinArena } = await import("../lib/game/net/colyseusClient.js");
    const next = await joinArena(chosen);
    if (next.status !== "connected" || !next.room) {
      setColyseusLabel(next.label);
      setError(next.error ? `Could not join the waiting room: ${next.error}` : "Could not join the waiting room.");
      return;
    }
    setError("");
    setLoadout(chosen);
    let players = 0;
    if (typeof next.room.state?.players?.size === "number") players = next.room.state.players.size;
    else next.room.state?.players?.forEach?.(() => { players += 1; });
    if (!players) players = 1;
    const matchPhase = next.room.state?.phase === "fighting" ? "game" : "waiting";
    setArena({
      room: next.room,
      net: attachArenaNet(next.room),
      phase: next.room.state?.phase ?? "waiting",
      players,
      needed: next.room.state?.needed ?? MATCH.minPlayers,
      max: next.room.state?.max ?? MATCH.maxPlayers,
      roomId: next.room.roomId,
    });
    setColyseusLabel(next.label);
    setPhase(matchPhase);
  }

  function handleCancelQueue() {
    arena?.room?.leave?.();
    setArena(null);
    setLoadout(null);
    setPhase("menu");
    setColyseusLabel("online · lobby");
  }

  if (error && !catalog) {
    return <p className="p-8 text-red-300">{error}</p>;
  }

  if (error && phase === "menu") {
    return (
      <div className="p-8">
        <p className="text-red-300">{error}</p>
        <button
          type="button"
          className="mt-4 border border-[#93a0b5] px-4 py-2 text-[#e8eef7]"
          onClick={() => setError("")}
        >
          Back
        </button>
      </div>
    );
  }

  if (!catalog) {
    return <p className="p-8 text-[#93a0b5]">Loading weapons…</p>;
  }

  if (phase === "waiting" && arena) {
    return (
      <WaitingRoom
        colyseusLabel={colyseusLabel}
        players={arena.players}
        minPlayers={arena.needed ?? MATCH.minPlayers}
        maxPlayers={arena.max ?? MATCH.maxPlayers}
        roomId={arena.roomId}
        onCancel={handleCancelQueue}
      />
    );
  }

  if (phase === "game" && loadout && arena) {
    return (
      <GameScreen
        catalog={catalog}
        loadout={loadout}
        colyseusLabel={colyseusLabel}
        net={arena.net}
        mode="pvp"
      />
    );
  }

  return (
    <LoadoutMenu
      catalog={catalog}
      colyseusLabel={colyseusLabel}
      onReady={handleReady}
    />
  );
}
