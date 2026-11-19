import { COLYSEUS } from "../config.js";

function loadoutNames(loadout) {
  return {
    primary: loadout?.primary?.[0]?.name ?? "",
    secondary: loadout?.secondary?.[0]?.name ?? "",
    melee: loadout?.melee?.[0]?.name ?? "",
  };
}

/**
 * Cheap lobby ping so the loadout HUD can show online/offline without joining a fight.
 */
export async function pingColyseus() {
  try {
    const response = await fetch(`${COLYSEUS.url}/hi`);
    if (!response.ok) throw new Error(`status ${response.status}`);
    return { status: "connected", label: "online · lobby", error: null };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return { status: "offline", label: "offline (npm run server)", error: message };
  }
}

/**
 * Join (or create) a 2-player arena. First player waits; second player starts the fight.
 */
export async function joinArena(loadout) {
  try {
    const { Client } = await import("@colyseus/sdk");
    const client = new Client(COLYSEUS.url);
    const room = await client.joinOrCreate(COLYSEUS.room, {
      open: true,
      loadout: loadoutNames(loadout),
    });
    return {
      status: "connected",
      room,
      label: `queue · ${room.roomId}`,
      error: null,
    };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return {
      status: "offline",
      room: null,
      label: "offline (npm run server)",
      error: message,
    };
  }
}

export function attachArenaNet(room) {
  const shotHandlers = new Set();
  room.onMessage("shot", (payload) => {
    for (const handler of shotHandlers) handler(payload);
  });

  let lastPoseAt = 0;

  return {
    sessionId: room.sessionId,
    roomId: room.roomId,
    fighters() {
      const list = [];
      room.state?.players?.forEach((fighter, id) => {
        list.push({
          sessionId: id,
          x: fighter.x,
          y: fighter.y,
          aimAngle: fighter.aimAngle,
          health: fighter.health,
          maxHealth: fighter.maxHealth,
          weaponName: fighter.weaponName,
          fillR: fighter.fillR,
          fillG: fighter.fillG,
          fillB: fighter.fillB,
          spawnIndex: fighter.spawnIndex,
        });
      });
      return list;
    },
    self() {
      return room.state?.players?.get(room.sessionId) ?? null;
    },
    sendPose(pose) {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastPoseAt < 40) return;
      lastPoseAt = now;
      room.send("pose", pose);
    },
    sendHit(targetId, damage) {
      room.send("hit", { targetId, damage });
    },
    sendShot(shot) {
      room.send("shot", shot);
    },
    onShot(handler) {
      shotHandlers.add(handler);
      return () => shotHandlers.delete(handler);
    },
  };
}
