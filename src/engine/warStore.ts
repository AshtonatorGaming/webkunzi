import type { Army, BattleGrade, TerrainId, War } from "./types";

const KEY = "inkunzi.wars.v2";
const LEGACY = "inkunzi.wars.v1";

type LegacyWar = Partial<War> & {
  attackerArmyId: string;
  defenderArmyId: string;
  attackerNationId: string;
  defenderNationId: string;
  title: string;
  terrain: TerrainId;
  status: War["status"];
};

function migrate(row: LegacyWar): War {
  const attackerArmyIds = row.attackerArmyIds?.length
    ? row.attackerArmyIds
    : [row.attackerArmyId];
  const defenderArmyIds = row.defenderArmyIds?.length
    ? row.defenderArmyIds
    : [row.defenderArmyId];
  return {
    id: row.id ?? crypto.randomUUID(),
    attackerArmyId: attackerArmyIds[0] ?? row.attackerArmyId,
    defenderArmyId: defenderArmyIds[0] ?? row.defenderArmyId,
    attackerArmyIds,
    defenderArmyIds,
    attackerNationId: row.attackerNationId,
    defenderNationId: row.defenderNationId,
    title: row.title,
    terrain: row.terrain,
    status: row.status,
    warTurns: row.warTurns ?? 4,
    warTurn: row.warTurn ?? 1,
    pendingAttack: row.pendingAttack ?? row.status === "declared",
    report: row.report,
    reel: row.reel,
  };
}

export function loadWars(): War[] {
  if (typeof window === "undefined") return [];
  try {
    for (const key of [KEY, LEGACY]) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as LegacyWar[];
      if (Array.isArray(parsed)) return parsed.map(migrate);
    }
    return [];
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
  extra?: { attackerIds?: string[]; defenderIds?: string[] },
): War {
  const atk = names?.attacker ?? attacker.ownerId;
  const def = names?.defender ?? defender.ownerId;
  const attackerArmyIds = extra?.attackerIds?.length ? extra.attackerIds : [attacker.id];
  const defenderArmyIds = extra?.defenderIds?.length ? extra.defenderIds : [defender.id];
  return {
    id: crypto.randomUUID(),
    attackerArmyId: attackerArmyIds[0] ?? attacker.id,
    defenderArmyId: defenderArmyIds[0] ?? defender.id,
    attackerArmyIds,
    defenderArmyIds,
    attackerNationId: attacker.ownerId,
    defenderNationId: defender.ownerId,
    title: `${atk} marches on ${def}`,
    terrain,
    status: "declared",
    warTurns: 4,
    warTurn: 1,
    pendingAttack: true,
  };
}

export function findOpenWar(wars: War[], a: string, b: string): War | undefined {
  return wars.find(
    (w) =>
      w.status === "declared" &&
      (w.attackerArmyIds.includes(a) ||
        w.defenderArmyIds.includes(a) ||
        w.attackerArmyId === a ||
        w.defenderArmyId === a) &&
      (w.attackerArmyIds.includes(b) ||
        w.defenderArmyIds.includes(b) ||
        w.attackerArmyId === b ||
        w.defenderArmyId === b),
  );
}

export function warHasArmy(war: War, armyId: string): boolean {
  return (
    war.attackerArmyIds.includes(armyId) ||
    war.defenderArmyIds.includes(armyId) ||
    war.attackerArmyId === armyId ||
    war.defenderArmyId === armyId
  );
}

export function updateWar(wars: War[], id: string, patch: Partial<War>): War[] {
  return wars.map((w) => (w.id === id ? { ...w, ...patch } : w));
}

export function overrideGrade(war: War, grade: BattleGrade): War {
  if (!war.report) return war;
  return {
    ...war,
    report: {
      ...war.report,
      staffGrade: grade,
      summary: war.report.summary.replace(/^[^.]*/, `${grade[0]!.toUpperCase()}${grade.slice(1)} (staff)`),
    },
  };
}
