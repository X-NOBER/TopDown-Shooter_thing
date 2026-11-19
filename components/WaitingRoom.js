"use client";

import ColyseusStatus from "./ColyseusStatus";

export default function WaitingRoom({
  colyseusLabel = "—",
  players = 1,
  minPlayers = 2,
  maxPlayers = 6,
  roomId = "",
  onCancel,
}) {
  const slotsLeft = Math.max(0, maxPlayers - players);
  let statusLine = `Need at least ${minPlayers} players to start…`;
  if (players >= minPlayers && slotsLeft > 0) {
    statusLine = `Match can start — up to ${slotsLeft} more can join the same arena`;
  }
  if (players >= maxPlayers) {
    statusLine = "Room full — entering arena";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-black">
      <p className="text-sm tracking-[0.3em] text-neutral-500 uppercase">Lobby</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight">Waiting room</h1>
      <p className="mt-6 max-w-md text-center text-lg text-neutral-700">
        {minPlayers}–{maxPlayers} players per match. Ready queues you into one shared arena; the fight begins once at least {minPlayers} are in.
      </p>
      <p className="mt-8 text-3xl font-semibold">
        {players} / {maxPlayers}
      </p>
      <p className="mt-2 text-sm text-neutral-500">{statusLine}</p>
      {roomId ? (
        <p className="mt-4 text-xs tracking-wide text-neutral-400">room {roomId}</p>
      ) : null}
      <div className="mt-10 flex flex-col items-center gap-4">
        <ColyseusStatus label={colyseusLabel} variant="light" />
        <button
          type="button"
          onClick={onCancel}
          className="border border-black px-8 py-2 text-lg hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
