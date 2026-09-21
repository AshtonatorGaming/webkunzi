import type { Character } from "@/engine/types";

export const STARTER_CHARACTERS: Character[] = [
  {
    id: "c-vestoria",
    name: "The Vestorian Emperor",
    nationId: "vestoria",
    prestige: 20,
    armyId: "a-vestoria",
    stats: { rulership: 4, charisma: 2, landTactics: 2, seaTactics: 0, intrigue: 1, business: 1 },
  },
  {
    id: "c-tunnu",
    name: "Speaker of Tunnu",
    nationId: "tunnu",
    prestige: 14,
    armyId: "a-tunnu",
    stats: { rulership: 3, charisma: 1, landTactics: 3, seaTactics: 0, intrigue: 2, business: 1 },
  },
  {
    id: "c-rekolia",
    name: "Rekolian Seat",
    nationId: "rekolia",
    prestige: 8,
    stats: { rulership: 3, charisma: 3, landTactics: 1, seaTactics: 1, intrigue: 1, business: 1 },
  },
];
