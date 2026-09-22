import type { Army, ArmyUnit } from "./types";
import { STARTER_ARMIES } from "../packs/core/starterArmies.ts";
import { unitsOf } from "./battle.ts";

const KEY = "inkunzi.armies.v2";
const LEGACY = ["inkunzi.armies.v1"];

function migrateArmy(row: Army): Army {
  const units: ArmyUnit[] = row.units?.length ? row.units : unitsOf(row);
  const strength = units.reduce((n, u) => n + u.fielded, 0) || row.strength;
  return {
    ...row,
    units,
    strength,
    posture: row.posture ?? "plain",
    moveUsed: row.moveUsed ?? false,
    actionUsed: row.actionUsed ?? false,
  };
}

export function loadArmies(): Army[] {
  if (typeof window === "undefined") return STARTER_ARMIES;
  try {
    for (const key of [KEY, ...LEGACY]) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Army[];
      if (Array.isArray(parsed) && parsed.length) return parsed.map(migrateArmy);
    }
    return STARTER_ARMIES;
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
  const units: ArmyUnit[] = [
    { id: crypto.randomUUID(), typeId: "cavalry", name: "Cavalry", fielded: 2 },
    { id: crypto.randomUUID(), typeId: "archers", name: "Archers", fielded: 3 },
    { id: crypto.randomUUID(), typeId: "infantry", name: "Infantry", fielded: 5 },
  ];
  return {
    id: crypto.randomUUID(),
    x,
    y,
    ownerId: "unclaimed",
    strength: 10,
    composition: { shock: 2, ranged: 3, melee: 5 },
    units,
    posture: "plain",
    moveUsed: false,
    actionUsed: false,
  };
}

export function updateArmy(
  armies: Army[],
  id: string,
  patch: Partial<Army>,
): Army[] {
  return armies.map((a) => {
    if (a.id !== id) return a;
    const next = { ...a, ...patch };
    if (patch.units) {
      next.strength = patch.units.reduce((n, u) => n + u.fielded, 0);
    }
    return next;
  });
}

export function removeArmy(armies: Army[], id: string): Army[] {
  return armies.filter((a) => a.id !== id);
}

export function resetWarTurnFlags(armies: Army[], fightingIds: Set<string>): Army[] {
  return armies.map((a) => {
    const nextPosture =
      fightingIds.has(a.id) && a.posture === "entrenched" ? "entrenched" : "plain";
    return { ...a, moveUsed: false, actionUsed: false, posture: nextPosture };
  });
}
