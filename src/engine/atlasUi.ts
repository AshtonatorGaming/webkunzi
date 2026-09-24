"use client";

import { useEffect, useState } from "react";

export type AtlasTool = "none" | "pop" | "node" | "army" | "ground" | "border" | "reveal" | "shroud";

export type AtlasUi = {
  tool: AtlasTool;
  brush: number;
  groundId: number;
  borderId: string;
};

let state: AtlasUi = { tool: "none", brush: 3, groundId: 2, borderId: "" };
const listeners = new Set<() => void>();

export function getAtlasUi(): AtlasUi {
  return state;
}

export function setAtlasUi(patch: Partial<AtlasUi>) {
  state = { ...state, ...patch };
  for (const fn of listeners) fn();
}

export function useAtlasUi(): AtlasUi {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return state;
}
