import { COLYSEUS } from "../config.js";

function sdk() {
  return globalThis.Colyseus;
}

function serverUrl() {
  if (typeof location !== "undefined" && location.port === "2567") {
    return location.origin;
  }
  return COLYSEUS.url;
}

function setHud(text) {
  const el = document.getElementById("hud-colyseus");
  if (el) el.textContent = text;
}

/**
 * Join the Colyseus room without blocking the local p5 game.
 * If the server is not running, the shooter still plays offline.
 *
 * @returns {Promise<{ status: string, room: object | null, error: string | null }>}
 */
export async function connectToGameRoom() {
  const Colyseus = sdk();
  if (!Colyseus?.Client) {
    setHud("SDK missing");
    return { status: "missing-sdk", room: null, error: "Colyseus SDK not loaded" };
  }

  setHud("Connecting…");
  try {
    const client = new Colyseus.Client(serverUrl());
    const room = await client.joinOrCreate(COLYSEUS.room);
    setHud(`connected · ${room.sessionId.slice(0, 8)}`);
    room.onLeave(() => setHud("disconnected"));
    room.onError((code, message) => setHud(`error ${code}: ${message}`));
    return { status: "connected", room, error: null };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    setHud("offline (start npm run start)");
    return { status: "offline", room: null, error: message };
  }
}
