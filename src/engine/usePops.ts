"use client";

import { useEffect, useState } from "react";
import type { Pop } from "./types";
import { loadPops, savePops, makePop, updatePop, removePop } from "./popStore";

export function usePops() {
  const [pops, setPops] = useState<Pop[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPops(loadPops());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    savePops(pops);
  }, [pops, ready]);

  return {
    pops,
    setPops,
    ready,
    place: (x: number, y: number) => setPops((cur) => [...cur, makePop(x, y)]),
    update: (id: string, patch: Partial<Pop>) =>
      setPops((cur) => updatePop(cur, id, patch)),
    remove: (id: string) => setPops((cur) => removePop(cur, id)),
  };
}
