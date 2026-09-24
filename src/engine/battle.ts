import type {
  Army,
  ArmyUnit,
  BattleGrade,
  BattleReel,
  BattleReport,
  BattleSide,
  Composition,
  PhaseId,
  PhaseResult,
  Pop,
  StaffRemain,
  TerrainId,
  UnitLine,
} from "./types";
import { BATTLE_PHASES, PHASE_WEIGHTS } from "./battleConfig.ts";
import { roleOf, unitTypeById } from "../packs/core/units.ts";
import { coverOf, distance, inZocOf, retreatTowardTown, ZOC_PX } from "./movement.ts";

export const CONTACT_PX = ZOC_PX;

export function armiesInContact(a: Army, b: Army): boolean {
  if (a.id === b.id) return false;
  if (a.ownerId === b.ownerId) return false;
  if (a.ownerId === "unclaimed" || b.ownerId === "unclaimed") return false;
  return distance(a.x, a.y, b.x, b.y) <= CONTACT_PX;
}

export function firstContact(moved: Army, armies: Army[]): Army | null {
  return armies.find((a) => armiesInContact(moved, a)) ?? null;
}

export function engagedEnemies(army: Army, armies: Army[]): Army[] {
  return armies.filter((a) => armiesInContact(army, a));
}

export function unitsOf(army: Army): ArmyUnit[] {
  if (army.units && army.units.length) {
    return army.units.map((u) => ({ ...u, fielded: Math.max(0, u.fielded) }));
  }
  const c = army.composition;
  const total = c ? c.shock + c.ranged + c.melee : 0;
  if (c && total > 0) {
    const fromComp: ArmyUnit[] = [
      { id: `${army.id}-cav`, typeId: "cavalry", name: "Cavalry", fielded: c.shock },
      { id: `${army.id}-bow`, typeId: "archers", name: "Archers", fielded: c.ranged },
      { id: `${army.id}-ft`, typeId: "infantry", name: "Infantry", fielded: c.melee },
    ];
    return fromComp.filter((u) => u.fielded > 0);
  }
  const s = army.strength;
  return [
    { id: `${army.id}-cav`, typeId: "cavalry", name: "Cavalry", fielded: s * 0.2 },
    { id: `${army.id}-bow`, typeId: "archers", name: "Archers", fielded: s * 0.3 },
    { id: `${army.id}-ft`, typeId: "infantry", name: "Infantry", fielded: s * 0.5 },
  ];
}

export function armyStrength(army: Army): number {
  const units = unitsOf(army);
  const sum = units.reduce((n, u) => n + u.fielded, 0);
  if (army.units && army.units.length) return sum;
  return sum > 0 ? sum : army.strength;
}

export function isGhost(army: Army): boolean {
  return armyStrength(army) <= 0;
}

export function sideWiped(armies: Army[]): boolean {
  return armies.length === 0 || armies.every(isGhost);
}

export function compositionOf(army: Army): Composition {
  const units = army.units;
  if (units && units.length) {
    const next = { shock: 0, ranged: 0, melee: 0 };
    for (const u of units) next[roleOf(u.typeId)] += u.fielded;
    return next;
  }
  const c = army.composition;
  const total = c ? c.shock + c.ranged + c.melee : 0;
  if (c && total > 0) return c;
  return {
    shock: army.strength * 0.2,
    ranged: army.strength * 0.3,
    melee: army.strength * 0.5,
  };
}

export function eligibleJoiners(lead: Army, enemies: Army[], armies: Army[]): Army[] {
  return armies.filter((a) => {
    if (a.id === lead.id) return false;
    if (a.ownerId !== lead.ownerId) return false;
    if (isGhost(a)) return false;
    return enemies.some((e) => inZocOf(a, e));
  });
}

export function suggestTerrain(defender: Army, pops: Pop[]): TerrainId {
  return coverOf(defender, pops) === "garrison" ? "fort" : "open";
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

function postureMod(army: Army, side: "attacker" | "defender"): number {
  let m = 1;
  if (army.posture === "skirmish") m *= 0.7;
  if (army.posture === "entrenched" && side === "defender") m *= 1.2;
  if (army.posture === "forceMarched" && side === "defender") m *= 0.85;
  return m;
}

function power(army: Army, phase: PhaseId, terrain: TerrainId, side: "attacker" | "defender") {
  const mods = terrainMods(terrain, side);
  const posture = postureMod(army, side);
  const w = PHASE_WEIGHTS[phase];
  let raw = 0;
  for (const u of unitsOf(army)) {
    const role = roleOf(u.typeId);
    raw += u.fielded * w[role] * mods.role[role];
  }
  return raw * mods.sideMod * posture;
}

function sidePower(armies: Army[], phase: PhaseId, terrain: TerrainId, side: "attacker" | "defender") {
  return armies.reduce((n, a) => n + power(a, phase, terrain, side), 0);
}

function applyUnitLoss(units: ArmyUnit[], loss: number): ArmyUnit[] {
  const live = units.map((u) => ({ ...u }));
  let remain = loss;
  const total = live.reduce((n, u) => n + u.fielded, 0);
  if (total <= 0) return live;
  for (const u of live) {
    const share = (u.fielded / total) * loss;
    const take = Math.min(u.fielded, share);
    u.fielded = Math.max(0, u.fielded - take);
    remain -= take;
  }
  if (remain > 0.01) {
    for (const u of live) {
      if (remain <= 0) break;
      const take = Math.min(u.fielded, remain);
      u.fielded -= take;
      remain -= take;
    }
  }
  return live;
}

function withUnits(army: Army, units: ArmyUnit[]): Army {
  const strength = units.reduce((n, u) => n + u.fielded, 0);
  const comp = { shock: 0, ranged: 0, melee: 0 };
  for (const u of units) comp[roleOf(u.typeId)] += u.fielded;
  return { ...army, units, strength, composition: comp };
}

function distributeLoss(armies: Army[], loss: number): Army[] {
  const weights = armies.map((a) => Math.max(0.0001, armyStrength(a)));
  const sum = weights.reduce((n, w) => n + w, 0);
  return armies.map((army, i) => {
    const share = Math.max(0, (loss * weights[i]!) / sum);
    return withUnits(army, applyUnitLoss(unitsOf(army), share));
  });
}

function tagsOf(armies: Army[], pops: Pop[]): string[] {
  const tags = new Set<string>();
  for (const a of armies) {
    if (a.posture === "entrenched") tags.add("entrenched");
    if (a.posture === "forceMarched") tags.add("force-marched");
    if (a.posture === "skirmish") tags.add("skirmish");
    const cover = coverOf(a, pops);
    if (cover === "garrison") tags.add("garrison");
    if (cover === "covering") tags.add("covering");
  }
  return [...tags];
}

function snapshotLines(armies: Army[]): UnitLine[] {
  return armies.flatMap((army) =>
    unitsOf(army).map((u) => ({
      armyId: army.id,
      nationId: army.ownerId,
      unitId: u.id,
      typeId: u.typeId,
      name: u.name || unitTypeById(u.typeId).label,
      fielded: u.fielded,
      remain: u.fielded,
      dead: 0,
    })),
  );
}

function closeLines(before: UnitLine[], after: Army[]): UnitLine[] {
  return before.map((line) => {
    const army = after.find((a) => a.id === line.armyId);
    const unit = army ? unitsOf(army).find((u) => u.id === line.unitId) : undefined;
    const remain = unit?.fielded ?? 0;
    return { ...line, remain, dead: Math.max(0, line.fielded - remain) };
  });
}

export function gradeBattle(opts: {
  winner: BattleSide;
  wipe: boolean;
  atkFielded: number;
  defFielded: number;
  atkLoss: number;
  defLoss: number;
  atkWins: number;
  defWins: number;
}): BattleGrade {
  if (opts.winner === "inconclusive" || opts.atkWins === opts.defWins) return "inconclusive";
  const winLoss = opts.winner === "attacker" ? opts.atkLoss : opts.defLoss;
  const loseLoss = opts.winner === "attacker" ? opts.defLoss : opts.atkLoss;
  const winField = opts.winner === "attacker" ? opts.atkFielded : opts.defFielded;
  const loseField = opts.winner === "attacker" ? opts.defFielded : opts.atkFielded;
  const odds = winField / Math.max(1, loseField);
  const lossRatio = loseLoss / Math.max(1, loseField);
  const winHurt = winLoss / Math.max(1, winField);
  if (winHurt >= 0.35 && winHurt >= lossRatio * 0.9 && !opts.wipe) return "pyrrhic";
  if (odds >= 2.2 && lossRatio >= 0.45 && winHurt < 0.15) return "legendary";
  if (opts.wipe && odds >= 1.4) return "crushing";
  if (odds >= 1.6 && lossRatio >= 0.35) return "crushing";
  if (winHurt >= 0.28 && lossRatio >= 0.25) return "hard fought";
  if (Math.abs(opts.atkWins - opts.defWins) === 1) return "narrow";
  if (lossRatio < 0.2 && !opts.wipe) return "narrow";
  return "hard fought";
}

export const GRADE_LABEL: Record<BattleGrade, string> = {
  legendary: "Legendary",
  crushing: "Crushing",
  "hard fought": "Hard fought",
  pyrrhic: "Pyrrhic",
  narrow: "Narrow",
  inconclusive: "Inconclusive",
};

export function reportHeadline(
  grade: BattleGrade,
  winner: BattleSide,
  phase: PhaseId | null,
): string {
  if (winner === "inconclusive" || grade === "inconclusive") return "INCONCLUSIVE";
  const side = winner === "attacker" ? "ATTACKER" : "DEFENDER";
  const phaseBit = phase ? ` ${phase.toUpperCase()}` : "";
  return `${GRADE_LABEL[grade].toUpperCase()} ${side}${phaseBit} VICTORY`;
}

function summaryLine(
  grade: BattleGrade,
  winner: BattleSide,
  decisive: PhaseId | null,
): string {
  if (winner === "inconclusive" || grade === "inconclusive") {
    return decisive
      ? `Inconclusive — last phase ${decisive}.`
      : "Inconclusive. Neither side takes the field.";
  }
  const side = winner === "attacker" ? "attacker" : "defender";
  const phase = decisive ? ` on ${decisive}` : "";
  return `${GRADE_LABEL[grade]} ${side} victory${phase}.`;
}

function fieldCenter(attackers: Army[], defenders: Army[]): { x: number; y: number } {
  const field = [...attackers, ...defenders];
  return {
    x: field.reduce((s, a) => s + a.x, 0) / Math.max(1, field.length),
    y: field.reduce((s, a) => s + a.y, 0) / Math.max(1, field.length),
  };
}

function casualtiesOf(units: UnitLine[]): { nationId: string; dead: number }[] {
  const byNation = new Map<string, number>();
  for (const line of units) {
    byNation.set(line.nationId, (byNation.get(line.nationId) ?? 0) + line.dead);
  }
  return [...byNation.entries()].map(([nationId, dead]) => ({ nationId, dead }));
}

function runPhase(
  id: PhaseId,
  atk: Army[],
  def: Army[],
  terrain: TerrainId,
): { atk: Army[]; def: Army[]; result: PhaseResult; wipe: boolean } {
  const attackerPower = sidePower(atk, id, terrain, "attacker");
  const defenderPower = sidePower(def, id, terrain, "defender");
  const winner: PhaseResult["winner"] =
    Math.abs(attackerPower - defenderPower) < 0.0001
      ? "draw"
      : attackerPower > defenderPower
        ? "attacker"
        : "defender";
  const winnerPower = winner === "defender" ? defenderPower : attackerPower;
  const loserPower = winner === "defender" ? attackerPower : defenderPower;
  let aLoss = Math.max(1, Math.floor(loserPower * 0.08));
  let dLoss = Math.max(1, Math.floor(loserPower * 0.08));
  if (winner === "attacker") {
    dLoss = Math.max(1, Math.floor(winnerPower * 0.18));
    aLoss = Math.max(1, Math.floor(loserPower * 0.08));
  } else if (winner === "defender") {
    aLoss = Math.max(1, Math.floor(winnerPower * 0.18));
    dLoss = Math.max(1, Math.floor(loserPower * 0.08));
  } else {
    aLoss = Math.max(1, Math.floor(attackerPower * 0.1));
    dLoss = Math.max(1, Math.floor(defenderPower * 0.1));
  }
  if (id === "late" && winner !== "draw") {
    if (winner === "attacker") dLoss = Math.floor(dLoss * 1.1);
    else aLoss = Math.floor(aLoss * 1.1);
  }

  const nextAtk = distributeLoss(atk, aLoss);
  const nextDef = distributeLoss(def, dLoss);
  return {
    atk: nextAtk,
    def: nextDef,
    wipe: sideWiped(nextAtk) || sideWiped(nextDef),
    result: {
      id,
      attackerPower: Math.round(attackerPower * 10) / 10,
      defenderPower: Math.round(defenderPower * 10) / 10,
      winner,
      attackerLoss: aLoss,
      defenderLoss: dLoss,
    },
  };
}

function fieldedTotals(fielded: UnitLine[], armyIds: string[]) {
  return fielded.filter((l) => armyIds.includes(l.armyId)).reduce((n, l) => n + l.fielded, 0);
}

function phaseView(opts: {
  atk: Army[];
  def: Army[];
  fielded: UnitLine[];
  phases: PhaseResult[];
  terrain: TerrainId;
  attackerTags: string[];
  defenderTags: string[];
  live: boolean;
}): BattleReport {
  const last = opts.phases[opts.phases.length - 1];
  const wipe = sideWiped(opts.atk) || sideWiped(opts.def);
  const atkLive = !sideWiped(opts.atk);
  const defLive = !sideWiped(opts.def);
  const atkWins = opts.phases.filter((p) => p.winner === "attacker").length;
  const defWins = opts.phases.filter((p) => p.winner === "defender").length;
  const atkFielded = fieldedTotals(opts.fielded, opts.atk.map((a) => a.id));
  const defFielded = fieldedTotals(opts.fielded, opts.def.map((a) => a.id));
  const atkLoss = opts.phases.reduce((n, p) => n + p.attackerLoss, 0);
  const defLoss = opts.phases.reduce((n, p) => n + p.defenderLoss, 0);

  let winner: BattleSide;
  if (wipe) winner = atkLive ? "attacker" : defLive ? "defender" : "inconclusive";
  else if (opts.live) {
    winner = !last || last.winner === "draw" ? "inconclusive" : last.winner;
  } else if (atkWins === defWins) winner = "inconclusive";
  else winner = atkWins > defWins ? "attacker" : "defender";

  const gradeWinsAtk = opts.live ? (last?.winner === "attacker" ? 1 : 0) : atkWins;
  const gradeWinsDef = opts.live ? (last?.winner === "defender" ? 1 : 0) : defWins;
  const gradeLossAtk = opts.live ? (last?.attackerLoss ?? atkLoss) : atkLoss;
  const gradeLossDef = opts.live ? (last?.defenderLoss ?? defLoss) : defLoss;

  const grade = gradeBattle({
    winner,
    wipe,
    atkFielded,
    defFielded,
    atkLoss: gradeLossAtk,
    defLoss: gradeLossDef,
    atkWins: gradeWinsAtk,
    defWins: gradeWinsDef,
  });

  const decisive = opts.live
    ? (last?.id ?? null)
    : winner === "inconclusive"
      ? null
      : [...opts.phases].reverse().find((p) => p.winner === winner)?.id ?? last?.id ?? null;

  const units = closeLines(opts.fielded, [...opts.atk, ...opts.def]);
  const { x, y } = fieldCenter(opts.atk, opts.def);

  return {
    attackerIds: opts.atk.map((a) => a.id),
    defenderIds: opts.def.map((a) => a.id),
    terrain: opts.terrain,
    phases: opts.phases,
    winner,
    wipe,
    grade,
    decisivePhase: winner === "inconclusive" ? (opts.live ? last?.id ?? null : null) : decisive,
    attackerTags: opts.attackerTags,
    defenderTags: opts.defenderTags,
    units,
    casualtiesByNation: casualtiesOf(units),
    attackerLoss: atkLoss,
    defenderLoss: defLoss,
    summary: summaryLine(grade, winner, winner === "inconclusive" ? null : decisive),
    x,
    y,
  };
}

export function resolveBattle(opts: {
  attackers: Army[];
  defenders: Army[];
  terrain?: TerrainId;
  pops?: Pop[];
}): { attackers: Army[]; defenders: Army[]; report: BattleReport } {
  const terrain = opts.terrain ?? "open";
  const pops = opts.pops ?? [];
  let atk = opts.attackers.map((a) => withUnits(a, unitsOf(a)));
  let def = opts.defenders.map((a) => withUnits(a, unitsOf(a)));
  const fielded = [...snapshotLines(atk), ...snapshotLines(def)];
  const phases: PhaseResult[] = [];

  for (const id of BATTLE_PHASES) {
    if (sideWiped(atk) || sideWiped(def)) break;
    const step = runPhase(id, atk, def, terrain);
    atk = step.atk;
    def = step.def;
    phases.push(step.result);
    if (step.wipe) break;
  }

  return {
    attackers: atk,
    defenders: def,
    report: phaseView({
      atk,
      def,
      fielded,
      phases,
      terrain,
      attackerTags: tagsOf(opts.attackers, pops),
      defenderTags: tagsOf(opts.defenders, pops),
      live: false,
    }),
  };
}

export function resolveFieldBattle(
  attacker: Army,
  defender: Army,
  terrain: TerrainId = "open",
  pops: Pop[] = [],
): { attacker: Army; defender: Army; report: BattleReport } {
  const result = resolveBattle({ attackers: [attacker], defenders: [defender], terrain, pops });
  return {
    attacker: result.attackers[0] ?? { ...attacker, strength: 0, units: [] },
    defender: result.defenders[0] ?? { ...defender, strength: 0, units: [] },
    report: result.report,
  };
}

function settleField(opts: {
  armies: Army[];
  pops: Pop[];
  attackers: Army[];
  defenders: Army[];
  winner: BattleSide;
  wipe: boolean;
  leftoverAtk: boolean;
  leftoverDef: boolean;
  occupyX: number;
  occupyY: number;
}): Army[] {
  let atk = opts.attackers.map((a, i) => (i === 0 ? { ...a, actionUsed: true } : { ...a }));
  let def = opts.defenders.map((a) => ({ ...a }));

  if (opts.winner === "attacker" && atk[0]) {
    atk = atk.map((a, i) =>
      i === 0
        ? {
            ...a,
            x: opts.occupyX,
            y: opts.occupyY,
            actionUsed: true,
            moveUsed: opts.leftoverAtk ? false : true,
          }
        : a,
    );
    if (!opts.wipe) {
      def = def.map((a) => (isGhost(a) ? a : retreatTowardTown(a, atk[0]!, opts.pops)));
    }
  } else if (opts.winner === "defender" && def[0]) {
    def = def.map((a, i) =>
      i === 0 ? { ...a, moveUsed: opts.leftoverDef ? false : a.moveUsed } : a,
    );
    if (!opts.wipe) {
      atk = atk.map((a) => (isGhost(a) ? a : retreatTowardTown(a, def[0]!, opts.pops)));
    }
  }

  const updated = new Map([...atk, ...def].map((a) => [a.id, a]));
  return opts.armies.map((a) => updated.get(a.id) ?? a);
}

export function mergeReelArmies(armies: Army[], reel: BattleReel): Army[] {
  const updated = new Map([...reel.attackers, ...reel.defenders].map((a) => [a.id, a]));
  return armies.map((a) => updated.get(a.id) ?? a);
}

export function applyBattleToArmies(
  armies: Army[],
  pops: Pop[],
  attackerId: string,
  defenderId: string,
  terrain: TerrainId,
  extra?: { attackerIds?: string[]; defenderIds?: string[] },
): { armies: Army[]; report: BattleReport | null } {
  const attackerIds = extra?.attackerIds?.length ? extra.attackerIds : [attackerId];
  const defenderIds = extra?.defenderIds?.length ? extra.defenderIds : [defenderId];
  const attackers = attackerIds
    .map((id) => armies.find((a) => a.id === id))
    .filter((a): a is Army => Boolean(a));
  const defenders = defenderIds
    .map((id) => armies.find((a) => a.id === id))
    .filter((a): a is Army => Boolean(a));
  if (!attackers.length || !defenders.length) return { armies, report: null };

  const leftoverAtk = !attackers[0]!.moveUsed;
  const leftoverDef = !defenders[0]!.moveUsed;
  const occupyX = defenders[0]!.x;
  const occupyY = defenders[0]!.y;
  const result = resolveBattle({ attackers, defenders, terrain, pops });
  const next = settleField({
    armies,
    pops,
    attackers: result.attackers,
    defenders: result.defenders,
    winner: result.report.winner,
    wipe: result.report.wipe,
    leftoverAtk,
    leftoverDef,
    occupyX,
    occupyY,
  });
  return { armies: next, report: result.report };
}

function packReel(opts: {
  index: number;
  leftoverAtk: boolean;
  leftoverDef: boolean;
  occupyX: number;
  occupyY: number;
  atk: Army[];
  def: Army[];
  fielded: UnitLine[];
  terrain: TerrainId;
  attackerTags: string[];
  defenderTags: string[];
  phases: PhaseResult[];
  done: boolean;
}): BattleReel {
  const report = phaseView({
    atk: opts.atk,
    def: opts.def,
    fielded: opts.fielded,
    phases: opts.phases,
    terrain: opts.terrain,
    attackerTags: opts.attackerTags,
    defenderTags: opts.defenderTags,
    live: true,
  });
  return {
    index: opts.index,
    frozen: false,
    leftoverAtk: opts.leftoverAtk,
    leftoverDef: opts.leftoverDef,
    occupyX: opts.occupyX,
    occupyY: opts.occupyY,
    attackers: opts.atk,
    defenders: opts.def,
    fielded: opts.fielded,
    terrain: opts.terrain,
    attackerTags: opts.attackerTags,
    defenderTags: opts.defenderTags,
    phases: opts.phases,
    report,
    done: opts.done || report.wipe,
  };
}

export function startReel(opts: {
  attackers: Army[];
  defenders: Army[];
  terrain?: TerrainId;
  pops?: Pop[];
}): BattleReel {
  const terrain = opts.terrain ?? "open";
  const pops = opts.pops ?? [];
  const atk0 = opts.attackers.map((a) => withUnits(a, unitsOf(a)));
  const def0 = opts.defenders.map((a) => withUnits(a, unitsOf(a)));
  const occupy = def0[0] ?? atk0[0];
  const step = runPhase("shock", atk0, def0, terrain);
  return packReel({
    index: 0,
    leftoverAtk: !opts.attackers[0]?.moveUsed,
    leftoverDef: !opts.defenders[0]?.moveUsed,
    occupyX: occupy?.x ?? 0,
    occupyY: occupy?.y ?? 0,
    atk: step.atk,
    def: step.def,
    fielded: [...snapshotLines(atk0), ...snapshotLines(def0)],
    terrain,
    attackerTags: tagsOf(opts.attackers, pops),
    defenderTags: tagsOf(opts.defenders, pops),
    phases: [step.result],
    done: step.wipe,
  });
}

export function applyStaffRemain(reel: BattleReel, remains: StaffRemain[]): BattleReel {
  const map = new Map(remains.map((r) => [r.unitId, Math.max(0, r.remain)]));
  const patch = (army: Army): Army =>
    withUnits(
      army,
      unitsOf(army).map((u) => (map.has(u.id) ? { ...u, fielded: map.get(u.id)! } : u)),
    );
  const atk = reel.attackers.map(patch);
  const def = reel.defenders.map(patch);
  const wipe = sideWiped(atk) || sideWiped(def);
  return packReel({
    index: reel.index,
    leftoverAtk: reel.leftoverAtk,
    leftoverDef: reel.leftoverDef,
    occupyX: reel.occupyX,
    occupyY: reel.occupyY,
    atk,
    def,
    fielded: reel.fielded,
    terrain: reel.terrain,
    attackerTags: reel.attackerTags,
    defenderTags: reel.defenderTags,
    phases: reel.phases,
    done: reel.done || wipe,
  });
}

export function overallReport(reel: BattleReel): BattleReport {
  return phaseView({
    atk: reel.attackers,
    def: reel.defenders,
    fielded: reel.fielded,
    phases: reel.phases,
    terrain: reel.terrain,
    attackerTags: reel.attackerTags,
    defenderTags: reel.defenderTags,
    live: false,
  });
}

export function closeReel(
  reel: BattleReel,
  armies: Army[],
  pops: Pop[],
): { armies: Army[]; report: BattleReport } {
  const report = overallReport(reel);
  const next = settleField({
    armies,
    pops,
    attackers: reel.attackers,
    defenders: reel.defenders,
    winner: report.winner,
    wipe: report.wipe,
    leftoverAtk: reel.leftoverAtk,
    leftoverDef: reel.leftoverDef,
    occupyX: reel.occupyX,
    occupyY: reel.occupyY,
  });
  return { armies: next, report };
}

export function playOutReel(reel: BattleReel): BattleReel {
  let current: BattleReel = { ...reel, frozen: false };
  while (!current.done) {
    const nextId = BATTLE_PHASES[current.index + 1];
    if (!nextId) return { ...current, done: true };
    const step = runPhase(nextId, current.attackers, current.defenders, current.terrain);
    current = packReel({
      index: current.index + 1,
      leftoverAtk: current.leftoverAtk,
      leftoverDef: current.leftoverDef,
      occupyX: current.occupyX,
      occupyY: current.occupyY,
      atk: step.atk,
      def: step.def,
      fielded: current.fielded,
      terrain: current.terrain,
      attackerTags: current.attackerTags,
      defenderTags: current.defenderTags,
      phases: [...current.phases, step.result],
      done: step.wipe || nextId === "late",
    });
  }
  return current;
}

export function continueReel(
  reel: BattleReel,
  armies: Army[],
  pops: Pop[] = [],
  staff?: StaffRemain[],
): {
  reel: BattleReel | null;
  armies: Army[];
  report: BattleReport;
  occupied: boolean;
} {
  let current = staff?.length ? applyStaffRemain(reel, staff) : { ...reel, frozen: false };

  if (reel.done) {
    const closed = closeReel(current, armies, pops);
    return { reel: null, armies: closed.armies, report: closed.report, occupied: true };
  }

  if (current.done) {
    return {
      reel: current,
      armies: mergeReelArmies(armies, current),
      report: current.report,
      occupied: false,
    };
  }

  const nextId = BATTLE_PHASES[current.index + 1];
  if (!nextId) {
    const closed = closeReel(current, armies, pops);
    return { reel: null, armies: closed.armies, report: closed.report, occupied: true };
  }

  const step = runPhase(nextId, current.attackers, current.defenders, current.terrain);
  const next = packReel({
    index: current.index + 1,
    leftoverAtk: current.leftoverAtk,
    leftoverDef: current.leftoverDef,
    occupyX: current.occupyX,
    occupyY: current.occupyY,
    atk: step.atk,
    def: step.def,
    fielded: current.fielded,
    terrain: current.terrain,
    attackerTags: current.attackerTags,
    defenderTags: current.defenderTags,
    phases: [...current.phases, step.result],
    done: step.wipe || nextId === "late",
  });
  return {
    reel: next,
    armies: mergeReelArmies(armies, next),
    report: next.report,
    occupied: false,
  };
}

export function strikeGhost(armies: Army[], attackerId: string, ghostId: string): Army[] {
  const ghost = armies.find((a) => a.id === ghostId);
  const atk = armies.find((a) => a.id === attackerId);
  if (!ghost || !atk || !isGhost(ghost) || isGhost(atk)) return armies;
  return armies
    .filter((a) => a.id !== ghostId)
    .map((a) => (a.id === attackerId ? { ...a, actionUsed: true } : a));
}
