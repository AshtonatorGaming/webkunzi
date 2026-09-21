import type { ResourceNode } from "@/engine/types";

export const STARTER_NODES: ResourceNode[] = [
  { id: "n1", x: 820, y: 2180, resourceId: "food", ownerId: "vestoria", yield: 1 },
  { id: "n2", x: 780, y: 2260, resourceId: "lumber", ownerId: "vestoria", yield: 1 },
  { id: "n3", x: 860, y: 2240, resourceId: "stone", ownerId: "vestoria", yield: 1 },
  { id: "n4", x: 1220, y: 1680, resourceId: "stone", ownerId: "tunnu", yield: 1 },
  { id: "n5", x: 1160, y: 1720, resourceId: "metal", ownerId: "tunnu", yield: 1 },
  { id: "n6", x: 4900, y: 1760, resourceId: "metal", ownerId: "rekolia", yield: 1 },
  { id: "n7", x: 5000, y: 1820, resourceId: "food", ownerId: "rekolia", yield: 1 },
];
