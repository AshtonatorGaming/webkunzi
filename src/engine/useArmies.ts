"use client";

import { useEffect, useState } from "react";
import type { Army } from "./types";
import { loadArmies, saveArmies, makeArmy, updateArmy, removeArmy } from "./armyStore";

export function useArmies() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setArmies(loadArmies());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveArmies(armies);
  }, [armies, ready]);

  return {
    armies,
    setArmies,
    ready,
    place: (x: number, y: number) => setArmies((cur) => [...cur, makeArmy(x, y)]),
    update: (id: string, patch: Partial<Army>) =>
      setArmies((cur) => updateArmy(cur, id, patch)),
    remove: (id: string) => setArmies((cur) => removeArmy(cur, id)),
  };
}
