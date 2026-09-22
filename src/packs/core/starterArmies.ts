import type { Army } from "../../engine/types.ts";

export const STARTER_ARMIES: Army[] = [
  {
    id: "a-vestoria",
    x: 830,
    y: 2220,
    ownerId: "vestoria",
    strength: 40,
    composition: { shock: 8, ranged: 12, melee: 20 },
    units: [
      { id: "u-ves-horse", typeId: "cavalry", name: "Imperial Horse", fielded: 8 },
      { id: "u-ves-bows", typeId: "archers", name: "Levy Bows", fielded: 12 },
      { id: "u-ves-foot", typeId: "infantry", name: "Vestorial Foot", fielded: 20 },
    ],
    posture: "plain",
  },
  {
    id: "a-tunnu",
    x: 1200,
    y: 1760,
    ownerId: "tunnu",
    strength: 28,
    composition: { shock: 10, ranged: 4, melee: 14 },
    units: [
      { id: "u-tun-riders", typeId: "cavalry", name: "Speaker's Riders", fielded: 10 },
      { id: "u-tun-bows", typeId: "archers", name: "Hill Bows", fielded: 4 },
      { id: "u-tun-spears", typeId: "infantry", name: "Tunnu Spears", fielded: 14 },
    ],
    posture: "plain",
  },
  {
    id: "a-rekolia",
    x: 4960,
    y: 1800,
    ownerId: "rekolia",
    strength: 16,
    composition: { shock: 2, ranged: 6, melee: 8 },
    units: [
      { id: "u-rek-out", typeId: "cavalry", name: "Outriders", fielded: 2 },
      { id: "u-rek-bows", typeId: "archers", name: "Rekolian Bows", fielded: 6 },
      { id: "u-rek-guard", typeId: "infantry", name: "Seat Guard", fielded: 8 },
    ],
    posture: "plain",
  },
];
