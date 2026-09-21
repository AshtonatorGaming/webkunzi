import type { Army } from "@/engine/types";

export const STARTER_ARMIES: Army[] = [
  {
    id: "a-vestoria",
    x: 830,
    y: 2220,
    ownerId: "vestoria",
    strength: 40,
    composition: { shock: 8, ranged: 12, melee: 20 },
  },
  {
    id: "a-tunnu",
    x: 1200,
    y: 1760,
    ownerId: "tunnu",
    strength: 28,
    composition: { shock: 10, ranged: 4, melee: 14 },
  },
  {
    id: "a-rekolia",
    x: 4960,
    y: 1800,
    ownerId: "rekolia",
    strength: 16,
    composition: { shock: 2, ranged: 6, melee: 8 },
  },
];
