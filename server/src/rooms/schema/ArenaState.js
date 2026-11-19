import { schema, t } from "@colyseus/schema";

export const Fighter = schema({
  sessionId: t.string(),
  x: t.number(),
  y: t.number(),
  aimAngle: t.number().default(0),
  health: t.number().default(100),
  maxHealth: t.number().default(100),
  spawnIndex: t.number().default(0),
  weaponName: t.string().default(""),
  fillR: t.number().default(62),
  fillG: t.number().default(207),
  fillB: t.number().default(142),
}, "Fighter");

export const ArenaState = schema({
  phase: t.string().default("waiting"),
  needed: t.number().default(2),
  max: t.number().default(6),
  players: t.map(Fighter),
}, "ArenaState");
