import type { ResourceDef, ResourceLedger } from "@/engine/types";

export const RESOURCES: ResourceDef[] = [
  { id: "food", label: "Rations", kind: "food", mode: "ledger" },
  { id: "lumber", label: "Lumber", kind: "material", mode: "ledger" },
  { id: "stone", label: "Stone", kind: "material", mode: "ledger" },
  { id: "metal", label: "Metal", kind: "military", mode: "ledger" },
];

export function emptyLedger(): ResourceLedger {
  return Object.fromEntries(RESOURCES.map((r) => [r.id, 0]));
}

export function resourceById(id: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.id === id);
}
