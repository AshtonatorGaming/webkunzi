"use client";

import { useEffect, useState } from "react";
import type { War } from "./types";
import { loadWars, saveWars, updateWar } from "./warStore";

export function useWars() {
  const [wars, setWars] = useState<War[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWars(loadWars());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveWars(wars);
  }, [wars, ready]);

  return {
    wars,
    setWars,
    ready,
    add: (war: War) => setWars((cur) => [war, ...cur]),
    update: (id: string, patch: Partial<War>) =>
      setWars((cur) => updateWar(cur, id, patch)),
  };
}
