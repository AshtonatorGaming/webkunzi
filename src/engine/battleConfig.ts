import type { UnitRole } from "../packs/core/units.ts";
import type { PhaseId } from "./types.ts";

/** Shock → Early → Late. Staff may edit the three numbers per type later. */
export const BATTLE_PHASES: PhaseId[] = ["shock", "early", "late"];

/**
 * Every named line fights every phase. Weight by Units type only.
 * Mounted / Ranged / Melee × Shock / Early / Late.
 */
export const PHASE_WEIGHTS: Record<PhaseId, Record<UnitRole, number>> = {
  shock: { shock: 1.4, ranged: 0.7, melee: 0.9 },
  early: { shock: 0.8, ranged: 1.3, melee: 1.0 },
  late: { shock: 0.7, ranged: 0.8, melee: 1.3 },
};

export const PHASE_LABEL: Record<PhaseId, string> = {
  shock: "Shock",
  early: "Early",
  late: "Late",
};
