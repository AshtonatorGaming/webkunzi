import type { Army } from "./types";
import { STARTER_ARMIES } from "@/packs/core/starterArmies";

const KEY = "inkunzi.armies.v1";

export function loadArmies(): Army[] {
  if (typeof window === "undefined") return STARTER_ARMIES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return STARTER_ARMIES;
    const parsed = JSON.parse(raw) as Army[];
    return Array.isArray(parsed) && parsed.length ? parsed : STARTER_ARMIES;
  } catch {
    return STARTER_ARMIES;
  }
}

export function saveArmies(armies: Army[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(armies));
  } catch {
    /* ignore */
  }
}

export function makeArmy(x: number, y: number): Army {
  return {
    id: crypto.randomUUID(),
    x,
    y,
    ownerId: "unclaimed",
    strength: 10,
    composition: { shock: 2, ranged: 3, melee: 5 },
  };
}

export function updateArmy(
  armies: Army[],
  id: string,
  patch: Partial<Army>,
): Army[] {
  return armies.map((a) => (a.id === id ? { ...a, ...patch } : a));
}

export function removeArmy(armies: Army[], id: string): Army[] {
  return armies.filter((a) => a.id !== id);
}
