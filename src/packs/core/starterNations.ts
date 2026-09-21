import type { Nation } from "@/engine/types";
import { emptyLedger } from "./resources.ts";

function nation(
  partial: Pick<Nation, "id" | "name" | "color"> & Partial<Nation>,
): Nation {
  return {
    treasury: 0,
    stability: 50,
    warSupport: 50,
    infamy: 0,
    manpower: 0,
    technology: 0,
    legitimacy: 50,
    centralisation: 50,
    districtSlots: 3,
    districts: [],
    resources: emptyLedger(),
    ...partial,
  };
}

export const STARTER_NATIONS: Nation[] = [
  nation({
    id: "unclaimed",
    name: "Unclaimed",
    color: "#c8c4bc",
    stability: 50,
    warSupport: 0,
    legitimacy: 0,
  }),
  nation({
    id: "vestoria",
    name: "Vestoria",
    color: "#4d8a3a",
    treasury: 100,
    stability: 52,
    warSupport: 55,
    legitimacy: 60,
    districts: [{ id: "d-vestoria-farm", kind: "farm", tier: 1 }],
    resources: { ...emptyLedger(), food: 8, lumber: 2, stone: 2, metal: 3 },
  }),
  nation({
    id: "tunnu",
    name: "Tunnu",
    color: "#3d6f8a",
    treasury: 80,
    stability: 50,
    warSupport: 60,
    legitimacy: 48,
    districts: [{ id: "d-tunnu-fort", kind: "fort", tier: 1 }],
    resources: { ...emptyLedger(), food: 8, lumber: 2, stone: 2, metal: 3 },
  }),
  nation({
    id: "rekolia",
    name: "Rekolia",
    color: "#a56a32",
    treasury: 40,
    stability: 45,
    warSupport: 40,
    legitimacy: 42,
    resources: { ...emptyLedger(), food: 6, lumber: 2, stone: 2, metal: 1 },
  }),
];
