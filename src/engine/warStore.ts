import type { Army, TerrainId, War } from "./types";

const KEY = "inkunzi.wars.v1";

export function loadWars(): War[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as War[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWars(wars: War[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(wars));
  } catch {
    /* ignore */
  }
}

export function makeWar(
  attacker: Army,
  defender: Army,
  terrain: TerrainId = "open",
  names?: { attacker: string; defender: string },
): War {
  const atk = names?.attacker ?? attacker.ownerId;
  const def = names?.defender ?? defender.ownerId;
  return {
    id: crypto.randomUUID(),
    attackerArmyId: attacker.id,
    defenderArmyId: defender.id,
    attackerNationId: attacker.ownerId,
    defenderNationId: defender.ownerId,
    title: `${atk} marches on ${def}`,
    terrain,
    status: "declared",
  };
}

export function findOpenWar(wars: War[], a: string, b: string): War | undefined {
  return wars.find(
    (w) =>
      w.status === "declared" &&
      ((w.attackerArmyId === a && w.defenderArmyId === b) ||
        (w.attackerArmyId === b && w.defenderArmyId === a)),
  );
}

export function updateWar(wars: War[], id: string, patch: Partial<War>): War[] {
  return wars.map((w) => (w.id === id ? { ...w, ...patch } : w));
}
