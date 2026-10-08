"use client";

import { useMemo, useState } from "react";
import P5Stage from "./P5Stage";
import { buildLoadout, MAX_UTILITIES } from "../lib/game/data/loadout.js";
import { RANGE_BOUNDS } from "../lib/game/world/range.js";

const COLUMNS = [
  ["primary", "Primary's"],
  ["secondary", "Secondary"],
  ["melee", "Melee's"],
  ["utility", "utilities"],
];

export default function LoadoutMenu({ catalog, onReady }) {
  const options = useMemo(() => buildLoadout(catalog.weapons), [catalog]);
  const [primaryId, setPrimaryId] = useState(options.primary[0]?.id ?? null);
  const [secondaryId, setSecondaryId] = useState(options.secondary[0]?.id ?? null);
  const [meleeId, setMeleeId] = useState(options.melee[0]?.id ?? null);
  const [utilityIds, setUtilityIds] = useState(options.utility.map((weapon) => weapon.id));

  const loadout = useMemo(() => {
    return {
      primary: options.primary.filter((weapon) => weapon.id === primaryId),
      secondary: options.secondary.filter((weapon) => weapon.id === secondaryId),
      melee: options.melee.filter((weapon) => weapon.id === meleeId),
      utility: options.utility.filter((weapon) => utilityIds.includes(weapon.id)),
    };
  }, [options, primaryId, secondaryId, meleeId, utilityIds]);

  const ready = loadout.primary.length > 0 && loadout.secondary.length > 0 && loadout.melee.length > 0;

  function choose(slot, id) {
    if (slot === "primary") setPrimaryId(id);
    if (slot === "secondary") setSecondaryId(id);
    if (slot === "melee") setMeleeId(id);
    if (slot === "utility") {
      setUtilityIds((current) => {
        if (current.includes(id)) return current.filter((item) => item !== id);
        if (current.length >= MAX_UTILITIES) return current;
        return [...current, id];
      });
    }
  }

  function selected(slot, id) {
    if (slot === "primary") return id === primaryId;
    if (slot === "secondary") return id === secondaryId;
    if (slot === "melee") return id === meleeId;
    return utilityIds.includes(id);
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-8">
        <div className="overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-4 border border-black">
            {COLUMNS.map(([slot, title], index) => (
              <section key={slot} className={`min-h-56 ${index < COLUMNS.length - 1 ? "border-r border-black" : ""}`}>
                <h2 className="border-b border-black px-3 py-3 text-center text-lg">{title}</h2>
                <ul className="flex flex-col gap-1 px-3 py-4">
                  {options[slot].map((weapon) => {
                    const isOn = selected(slot, weapon.id);
                    return (
                      <li key={weapon.id}>
                        <button
                          type="button"
                          onClick={() => choose(slot, weapon.id)}
                          className={`w-full px-2 py-1 text-center text-base ${isOn ? "bg-neutral-200 font-semibold" : "hover:bg-neutral-100"}`}
                        >
                          {weapon.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {slot === "utility" ? (
                  <p className="px-3 pb-3 text-center text-xs text-neutral-500">
                    {utilityIds.length}/{MAX_UTILITIES} selected
                  </p>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={!ready}
            onClick={() => onReady(loadout)}
            className="border border-black px-8 py-2 text-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ready
          </button>
        </div>

        <h2 className="my-6 text-center font-serif text-5xl tracking-tight">PlayGround</h2>
        <P5Stage
          catalog={catalog}
          mode="range"
          loadout={loadout}
          bounds={RANGE_BOUNDS}
          className="mx-auto border border-black [&_canvas]:block"
        />
        <p className="mt-3 text-center text-sm text-neutral-600">
          WASD to move, mouse to aim, click to shoot. The number above a dummy is the damage that hit dealt. The orange dummy sits behind the wall, so its number is what is left after the shot goes through.
        </p>
      </div>
    </div>
  );
}
