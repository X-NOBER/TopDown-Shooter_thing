import { COLYSEUS } from "../config.js";

/**
 * Join the Colyseus room from the Next.js client.
 * Call only in the browser (useEffect). The local game still runs if this fails.
 *
 * @returns {Promise<{ status: "connected" | "offline", room: object | null, label: string, error: string | null }>}
 */
export async function connectToGameRoom() {
  try {
    const { Client } = await import("@colyseus/sdk");
    const client = new Client(COLYSEUS.url);
    const room = await client.joinOrCreate(COLYSEUS.room);
    return {
      status: "connected",
      room,
      label: `connected · ${room.sessionId.slice(0, 8)}`,
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
