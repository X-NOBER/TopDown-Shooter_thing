import assert from "assert";
import { boot } from "@colyseus/testing";

import appConfig from "../src/app.config.js";

describe("arena matchmaking", () => {
  let colyseus;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => {
    await colyseus.cleanup();
  });

  it("waits with one player, then starts the same fight when the second joins", async () => {
    const room = await colyseus.createRoom("arena", {});
    const client1 = await colyseus.connectTo(room);

    assert.strictEqual(client1.state.phase, "waiting");
    assert.strictEqual(client1.state.needed, 2);
    assert.strictEqual(client1.state.max, 6);
    assert.strictEqual(Object.keys(client1.state.players.toJSON()).length, 1);

    const client2 = await colyseus.connectTo(room);
    await client1.waitForNextPatch();

    assert.strictEqual(client1.state.phase, "fighting");
    assert.strictEqual(client2.state.phase, "fighting");
    assert.strictEqual(Object.keys(client1.state.players.toJSON()).length, 2);
    assert.strictEqual(client1.sessionId, room.clients[0].sessionId);
  });
});
