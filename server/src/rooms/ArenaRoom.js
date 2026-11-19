import { Room } from "colyseus";
import {
  ARENA_BOUNDS,
  ARENA_COLORS,
  ARENA_MAX_PLAYERS,
  ARENA_MIN_PLAYERS,
  ARENA_SPAWNS,
  spawnAimAngle,
} from "./arenaConstants.js";
import { ArenaState, Fighter } from "./schema/ArenaState.js";

const RESPAWN_MS = 2200;
const MAX_DAMAGE = 80;

function clamp(value, min, max) {
  const next = Number(value);
  if (!Number.isFinite(next)) return min;
  return Math.max(min, Math.min(max, next));
}

export class ArenaRoom extends Room {
  maxClients = ARENA_MAX_PLAYERS;
  state = new ArenaState();

  messages = {
    pose: (client, message) => this.applyPose(client, message),
    hit: (client, message) => this.applyHit(client, message),
    shot: (client, message) => this.relayShot(client, message),
  };

  onCreate() {
    this.state.phase = "waiting";
    this.state.needed = ARENA_MIN_PLAYERS;
    this.state.max = ARENA_MAX_PLAYERS;
  }

  onJoin(client) {
    const spawnIndex = this.usedSpawnIndex();
    const spawn = ARENA_SPAWNS[spawnIndex];
    const color = ARENA_COLORS[spawnIndex % ARENA_COLORS.length];
    const fighter = new Fighter();
    fighter.sessionId = client.sessionId;
    fighter.spawnIndex = spawnIndex;
    fighter.x = spawn.x;
    fighter.y = spawn.y;
    fighter.aimAngle = spawnAimAngle(spawn);
    fighter.health = 100;
    fighter.maxHealth = 100;
    fighter.weaponName = "";
    fighter.fillR = color.r;
    fighter.fillG = color.g;
    fighter.fillB = color.b;
    this.state.players.set(client.sessionId, fighter);
    this.refreshPhase();
    console.log(client.sessionId, "joined arena", this.roomId, this.state.phase, `${this.state.players.size}/${ARENA_MAX_PLAYERS}`);
  }

  onLeave(client) {
    this.state.players.delete(client.sessionId);
    this.refreshPhase();
    console.log(client.sessionId, "left arena", this.roomId, this.state.phase);
  }

  onDispose() {
    console.log("arena", this.roomId, "disposing...");
  }

  usedSpawnIndex() {
    const taken = new Set();
    this.state.players.forEach((fighter) => taken.add(fighter.spawnIndex));
    for (let i = 0; i < ARENA_SPAWNS.length; i += 1) {
      if (!taken.has(i)) return i;
    }
    return 0;
  }

  refreshPhase() {
    this.state.phase = this.state.players.size >= this.state.needed ? "fighting" : "waiting";
  }

  applyPose(client, message) {
    if (this.state.phase !== "fighting") return;
    const fighter = this.state.players.get(client.sessionId);
    if (!fighter || fighter.health <= 0) return;
    fighter.x = clamp(message?.x, ARENA_BOUNDS.pad, ARENA_BOUNDS.width - ARENA_BOUNDS.pad);
    fighter.y = clamp(message?.y, ARENA_BOUNDS.pad, ARENA_BOUNDS.height - ARENA_BOUNDS.pad);
    fighter.aimAngle = Number(message?.aimAngle) || 0;
    fighter.weaponName = String(message?.weaponName || "").slice(0, 40);
  }

  applyHit(client, message) {
    if (this.state.phase !== "fighting") return;
    const attacker = this.state.players.get(client.sessionId);
    const targetId = String(message?.targetId || "");
    const target = this.state.players.get(targetId);
    if (!attacker || !target) return;
    if (attacker.health <= 0 || target.health <= 0) return;
    if (target.sessionId === client.sessionId) return;
    const damage = clamp(message?.damage, 0, MAX_DAMAGE);
    if (damage <= 0) return;
    target.health = Math.max(0, target.health - damage);
    if (target.health <= 0) this.scheduleRespawn(target);
  }

  scheduleRespawn(fighter) {
    const sessionId = fighter.sessionId;
    const spawnIndex = fighter.spawnIndex;
    this.clock.setTimeout(() => {
      const current = this.state.players.get(sessionId);
      if (!current || this.state.phase !== "fighting") return;
      const spawn = ARENA_SPAWNS[spawnIndex % ARENA_SPAWNS.length];
      current.health = current.maxHealth;
      current.x = spawn.x;
      current.y = spawn.y;
      current.aimAngle = spawnAimAngle(spawn);
    }, RESPAWN_MS);
  }

  relayShot(client, message) {
    if (this.state.phase !== "fighting") return;
    const fighter = this.state.players.get(client.sessionId);
    if (!fighter || fighter.health <= 0) return;
    this.broadcast("shot", {
      from: client.sessionId,
      x: clamp(message?.x, 0, ARENA_BOUNDS.width),
      y: clamp(message?.y, 0, ARENA_BOUNDS.height),
      angle: Number(message?.angle) || 0,
      speed: clamp(message?.speed, 0, 1400),
      radius: clamp(message?.radius, 1, 20),
      lifeMs: clamp(message?.lifeMs, 50, 5000),
      fill: Array.isArray(message?.fill) ? message.fill.slice(0, 3) : [255, 214, 102],
      thrown: Boolean(message?.thrown),
      landX: clamp(message?.landX ?? message?.x, 0, ARENA_BOUNDS.width),
      landY: clamp(message?.landY ?? message?.y, 0, ARENA_BOUNDS.height),
      blastRadius: clamp(message?.blastRadius, 0, 200),
      effect: String(message?.effect || "").slice(0, 20),
      stopOnTarget: message?.stopOnTarget !== false,
    }, { except: client });
  }
}
