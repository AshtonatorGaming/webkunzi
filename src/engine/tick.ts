import { ageById } from "../packs/core/ages.ts";
import { RESOURCES } from "../packs/core/resources.ts";
import type { Army, Nation, Pop, ResourceNode, Session } from "./types";

export function taxFromPops(popCount: number): number {
  return popCount * 1;
}

export function buildingMult(nation: Nation): number {
  const farms = nation.districts.filter((d) => d.kind === "farm");
  return 1 + farms.reduce((sum, d) => sum + d.tier * 0.1, 0);
}

export function foodProduced(settledCount: number, session: Session, mult = 1): number {
  const age = ageById(session.ageId);
  return Math.round(settledCount * session.workRate * age.foodMult * mult);
}

export function foodEaten(popCount: number, session: Session): number {
  return Math.round(popCount * session.ration);
}

export function armyUpkeep(strength: number): number {
  return Math.max(0, Math.round(strength));
}

export function tickNation(
  nation: Nation,
  pops: Pop[],
  nodes: ResourceNode[],
  armies: Army[],
  session: Session,
): { nation: Nation; log: string[] } {
  if (nation.id === "unclaimed") return { nation, log: [] };

  const owned = pops.filter((p) => p.ownerId === nation.id);
  const settled = owned.filter((p) => p.settled).length;
  const host = armies.filter((a) => a.ownerId === nation.id);
  const resources = { ...nation.resources };
  const log: string[] = [];
  const farms = buildingMult(nation);

  const produced = foodProduced(settled, session, farms);
  const eaten = foodEaten(owned.length, session);
  resources.food = (resources.food ?? 0) + produced - eaten;

  for (const def of RESOURCES) {
    if (def.id === "food") continue;
    const ownedNodes = nodes.filter(
      (n) => n.ownerId === nation.id && n.resourceId === def.id,
    );
    const yieldSum = ownedNodes.reduce((sum, n) => sum + n.yield, 0);
    if (def.mode === "cap") {
      resources[def.id] = yieldSum;
    } else {
      resources[def.id] = (resources[def.id] ?? 0) + yieldSum;
    }
  }

  const upkeep = host.reduce((sum, a) => sum + armyUpkeep(a.strength), 0);
  const starving = (resources.food ?? 0) < 0;
  if (starving) log.push(`${nation.name} starved (−5 stability).`);

  const manpower = Math.floor(settled * session.popValue * 0.7);

  return {
    nation: {
      ...nation,
      treasury: nation.treasury + taxFromPops(owned.length) - upkeep,
      resources,
      manpower,
      stability: starving ? nation.stability - 5 : nation.stability,
    },
    log,
  };
}

export function tickAll(
  nations: Nation[],
  pops: Pop[],
  nodes: ResourceNode[],
  armies: Army[],
  session: Session,
): { nations: Nation[]; log: string[] } {
  const log: string[] = [`Saturday tick — turn ${session.mechanicalTurn}.`];
  const next = nations.map((n) => {
    const row = tickNation(n, pops, nodes, armies, session);
    log.push(...row.log);
    return row.nation;
  });
  return { nations: next, log };
}
