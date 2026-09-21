import type {
  Army,
  BattleReport,
  Composition,
  PhaseId,
  PhaseResult,
  Pop,
  TerrainId,
} from "./types";
import { distance, retreatTowardTown, ZOC_PX } from "./movement.ts";

export const CONTACT_PX = ZOC_PX;

const PHASES: PhaseId[] = ["shock", "early", "late"];

const WEIGHTS: Record<PhaseId, Composition> = {
  shock: { shock: 1.5, ranged: 0.25, melee: 0.6 },
  early: { shock: 0.4, ranged: 1.35, melee: 0.85 },
  late: { shock: 0.55, ranged: 0.35, melee: 1.25 },
};

export function armiesInContact(a: Army, b: Army): boolean {
  if (a.id === b.id) return false;
  if (a.ownerId === b.ownerId) return false;
  if (a.ownerId === "unclaimed" || b.ownerId === "unclaimed") return false;
  return distance(a.x, a.y, b.x, b.y) <= CONTACT_PX;
}

export function firstContact(moved: Army, armies: Army[]): Army | null {
  return armies.find((a) => armiesInContact(moved, a)) ?? null;
}

export function compositionOf(army: Army): Composition {
  const c = army.composition;
  const total = c ? c.shock + c.ranged + c.melee : 0;
  if (c && total > 0) return c;
  return {
    shock: army.strength * 0.2,
    ranged: army.strength * 0.3,
    melee: army.strength * 0.5,
  };
}

function terrainMods(terrain: TerrainId, side: "attacker" | "defender") {
  const role = { shock: 1, ranged: 1, melee: 1 };
  let sideMod = 1;
  if (terrain === "fort" && side === "defender") sideMod *= 1.25;
  if (terrain === "marsh") {
    role.shock *= 0.65;
    role.ranged *= 0.85;
    role.melee *= 0.85;
  }
  if (terrain === "hills") {
    if (side === "defender") sideMod *= 1.1;
    role.shock *= 0.85;
  }
  if (terrain === "forest") {
    role.ranged *= 0.75;
    role.shock *= 0.85;
  }
  if (terrain === "river" && side === "attacker") sideMod *= 0.85;
  if (terrain === "rain") role.ranged *= 0.8;
  return { role, sideMod };
}

function power(army: Army, phase: PhaseId, terrain: TerrainId, side: "attacker" | "defender") {
  const comp = compositionOf(army);
  const w = WEIGHTS[phase];
  const mods = terrainMods(terrain, side);
  const raw =
    comp.shock * w.shock * mods.role.shock +
    comp.ranged * w.ranged * mods.role.ranged +
    comp.melee * w.melee * mods.role.melee;
  return raw * mods.sideMod;
}

function applyLoss(army: Army, loss: number): Army {
  const next = Math.max(0, army.strength - loss);
  const scale = army.strength > 0 ? next / army.strength : 0;
  const c = compositionOf(army);
  return {
    ...army,
    strength: next,
    composition: {
      shock: c.shock * scale,
      ranged: c.ranged * scale,
      melee: c.melee * scale,
    },
  };
}

export function resolveFieldBattle(
  attacker: Army,
  defender: Army,
  terrain: TerrainId = "open",
): { attacker: Army; defender: Army; report: BattleReport } {
  let atk = attacker;
  let def = defender;
  const phases: PhaseResult[] = [];
  let atkWins = 0;
  let defWins = 0;
  let wipe = false;

  for (const id of PHASES) {
    if (atk.strength <= 0 || def.strength <= 0) {
      wipe = true;
      break;
    }
    if (atkWins === 2 || defWins === 2) break;

    const attackerPower = power(atk, id, terrain, "attacker");
    const defenderPower = power(def, id, terrain, "defender");
    const winner: "attacker" | "defender" =
      attackerPower > defenderPower ? "attacker" : "defender";
    const winnerPower = winner === "attacker" ? attackerPower : defenderPower;
    const loserPower = winner === "attacker" ? defenderPower : attackerPower;
    let attackerLoss = Math.max(1, Math.floor((winner === "defender" ? winnerPower : loserPower) * 0.12));
    let defenderLoss = Math.max(1, Math.floor((winner === "attacker" ? winnerPower : loserPower) * 0.12));
    if (winner === "attacker") {
      defenderLoss = Math.max(1, Math.floor(winnerPower * 0.18));
      attackerLoss = Math.max(1, Math.floor(loserPower * 0.08));
    } else {
      attackerLoss = Math.max(1, Math.floor(winnerPower * 0.18));
      defenderLoss = Math.max(1, Math.floor(loserPower * 0.08));
    }
    if (id === "late") {
      if (winner === "attacker") defenderLoss = Math.floor(defenderLoss * 1.1);
      else attackerLoss = Math.floor(attackerLoss * 1.1);
    }

    atk = applyLoss(atk, attackerLoss);
    def = applyLoss(def, defenderLoss);
    if (winner === "attacker") atkWins += 1;
    else defWins += 1;
    if (atk.strength <= 0 || def.strength <= 0) wipe = true;

    phases.push({
      id,
      attackerPower: Math.round(attackerPower * 10) / 10,
      defenderPower: Math.round(defenderPower * 10) / 10,
      winner,
      attackerLoss,
      defenderLoss,
    });
  }

  const winner: "attacker" | "defender" = wipe
    ? atk.strength > 0
      ? "attacker"
      : "defender"
    : atkWins >= defWins
      ? "attacker"
      : "defender";

  const summary = wipe
    ? `${winner === "attacker" ? "Attacker" : "Defender"} wiped the field.`
    : `${winner === "attacker" ? "Attacker" : "Defender"} takes the field ${atkWins}–${defWins}.`;

  return {
    attacker: atk,
    defender: def,
    report: {
      attackerId: attacker.id,
      defenderId: defender.id,
      terrain,
      phases,
      winner,
      wipe,
      summary,
    },
  };
}

export function applyBattleToArmies(
  armies: Army[],
  pops: Pop[],
  attackerId: string,
  defenderId: string,
  terrain: TerrainId,
): { armies: Army[]; report: BattleReport | null } {
  const attacker = armies.find((a) => a.id === attackerId);
  const defender = armies.find((a) => a.id === defenderId);
  if (!attacker || !defender) return { armies, report: null };

  const result = resolveFieldBattle(attacker, defender, terrain);
  let nextAtk = result.attacker;
  let nextDef = result.defender;
  if (!result.report.wipe) {
    if (result.report.winner === "attacker" && nextDef.strength > 0) {
      nextDef = retreatTowardTown(nextDef, nextAtk, pops);
    } else if (result.report.winner === "defender" && nextAtk.strength > 0) {
      nextAtk = retreatTowardTown(nextAtk, nextDef, pops);
    }
  }

  const next = armies
    .map((a) => {
      if (a.id === nextAtk.id) return nextAtk;
      if (a.id === nextDef.id) return nextDef;
      return a;
    })
    .filter((a) => a.strength > 0);

  return { armies: next, report: result.report };
}
