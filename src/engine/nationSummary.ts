import type { Pop } from "./types";

export type NationCounts = {
  ownerId: string;
  pops: number;
  settled: number;
  nomad: number;
};

export function countPopsByOwner(pops: Pop[]): Map<string, NationCounts> {
  const byId = new Map<string, NationCounts>();
  for (const pop of pops) {
    const row = byId.get(pop.ownerId) ?? {
      ownerId: pop.ownerId,
      pops: 0,
      settled: 0,
      nomad: 0,
    };
    row.pops += 1;
    if (pop.settled) row.settled += 1;
    else row.nomad += 1;
    byId.set(pop.ownerId, row);
  }
  return byId;
}

export function formatPeople(pops: number, popValue: number): string {
  const n = pops * popValue;
  return n.toLocaleString("en-US");
}

export function districtCap(baseSlots: number, settled: number): number {
  return Math.max(baseSlots, 3) + Math.floor(Math.max(0, settled - 3) / 4);
}
