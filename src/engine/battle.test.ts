import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyBattleToArmies,
  applyStaffRemain,
  armyStrength,
  closeReel,
  compositionOf,
  continueReel,
  eligibleJoiners,
  firstContact,
  gradeBattle,
  isGhost,
  playOutReel,
  reportHeadline,
  resolveBattle,
  resolveFieldBattle,
  startReel,
  strikeGhost,
  unitsOf,
} from "./battle.ts";
import { BATTLE_PHASES, PHASE_WEIGHTS } from "./battleConfig.ts";
import { stopForZoc } from "./movement.ts";
import type { Army, Pop } from "./types.ts";

function army(id: string, ownerId: string, strength: number, extra: Partial<Army> = {}): Army {
  return { id, x: 0, y: 0, ownerId, strength, ...extra };
}

test("phase weights are Mounted/Ranged/Melee by Shock/Early/Late", () => {
  assert.deepEqual(BATTLE_PHASES, ["shock", "early", "late"]);
  assert.equal(PHASE_WEIGHTS.shock.shock, 1.4);
  assert.equal(PHASE_WEIGHTS.shock.ranged, 0.7);
  assert.equal(PHASE_WEIGHTS.shock.melee, 0.9);
  assert.equal(PHASE_WEIGHTS.early.shock, 0.8);
  assert.equal(PHASE_WEIGHTS.early.ranged, 1.3);
  assert.equal(PHASE_WEIGHTS.early.melee, 1.0);
  assert.equal(PHASE_WEIGHTS.late.shock, 0.7);
  assert.equal(PHASE_WEIGHTS.late.ranged, 0.8);
  assert.equal(PHASE_WEIGHTS.late.melee, 1.3);
});

test("playOut runs the rest of the reel without rewriting lines", () => {
  const heavy = army("a", "vestoria", 36, { composition: { shock: 12, ranged: 12, melee: 12 } });
  const light = army("b", "tunnu", 33, { composition: { shock: 11, ranged: 11, melee: 11 } });
  const reel = startReel({ attackers: [heavy], defenders: [light] });
  const done = playOutReel(reel);
  const full = resolveFieldBattle(heavy, light, "open");
  assert.equal(done.done, true);
  assert.equal(done.phases.length, full.report.phases.length);
  assert.deepEqual(
    done.phases.map((p) => p.id),
    full.report.phases.map((p) => p.id),
  );
  assert.equal(Math.round(armyStrength(done.attackers[0]!)), Math.round(full.attacker.strength));
});

test("stronger shock army takes shock, ranged takes early", () => {
  const cavalry = army("c", "vestoria", 30, { composition: { shock: 24, ranged: 2, melee: 4 } });
  const archers = army("r", "tunnu", 30, { composition: { shock: 2, ranged: 24, melee: 4 } });
  const shock = resolveFieldBattle(cavalry, archers, "open");
  assert.equal(shock.report.phases[0]?.winner, "attacker");
});

test("all three phases play unless a wipe; no best-of-three stop", () => {
  const heavy = army("a", "vestoria", 36, { composition: { shock: 12, ranged: 12, melee: 12 } });
  const light = army("b", "tunnu", 33, { composition: { shock: 11, ranged: 11, melee: 11 } });
  const result = resolveFieldBattle(heavy, light, "open");
  assert.equal(result.report.phases.length, 3);
  assert.deepEqual(
    result.report.phases.map((p) => p.id),
    ["shock", "early", "late"],
  );
  assert.ok(result.attacker.strength > 0);
  assert.ok(result.defender.strength > 0);
});

test("late still plays after a lost shock and early", () => {
  const bows = army("a", "tunnu", 30, { composition: { shock: 2, ranged: 24, melee: 4 } });
  const horse = army("b", "vestoria", 30, { composition: { shock: 24, ranged: 2, melee: 4 } });
  const result = resolveFieldBattle(bows, horse, "open");
  assert.equal(result.report.phases[0]?.winner, "defender");
  assert.ok(result.report.phases.length === 3 || result.report.wipe);
  if (!result.report.wipe) {
    assert.equal(result.report.phases[2]?.id, "late");
  }
});

test("wipe when a stack hits zero; ghost kept on the pin", () => {
  const huge = army("a", "vestoria", 200, { x: 10, y: 20 });
  const tiny = army("b", "tunnu", 1, { x: 40, y: 50 });
  const result = resolveFieldBattle(huge, tiny, "open");
  assert.equal(result.defender.strength, 0);
  assert.equal(result.report.wipe, true);
  assert.equal(result.report.winner, "attacker");
  assert.ok(result.report.phases.length >= 1);
  assert.ok(result.report.phases.length < 3);
  const settled = applyBattleToArmies([huge, tiny], [], "a", "b", "open");
  const ghost = settled.armies.find((x) => x.id === "b");
  const winner = settled.armies.find((x) => x.id === "a");
  assert.ok(ghost);
  assert.equal(isGhost(ghost!), true);
  assert.equal(winner?.x, 40);
  assert.equal(winner?.y, 50);
});

test("fort terrain boosts defender", () => {
  const even = { shock: 10, ranged: 10, melee: 10 };
  const a = army("a", "vestoria", 30, { composition: even });
  const d = army("b", "tunnu", 30, { composition: even });
  const open = resolveFieldBattle(a, d, "open");
  const fort = resolveFieldBattle(a, d, "fort");
  const openDef = open.report.phases[0]?.defenderPower ?? 0;
  const fortDef = fort.report.phases[0]?.defenderPower ?? 0;
  assert.ok(fortDef > openDef);
});

test("loser retreats toward nearest settled town when not wiped", () => {
  const attacker = army("a", "vestoria", 50, { x: 100, y: 100, composition: { shock: 16, ranged: 16, melee: 18 } });
  const defender = army("b", "tunnu", 40, { x: 110, y: 100, composition: { shock: 12, ranged: 12, melee: 16 } });
  const pops: Pop[] = [
    { id: "t", x: 400, y: 100, ownerId: "tunnu", culture: "Tunnu", religion: "Sky", settled: true },
  ];
  const { armies, report } = applyBattleToArmies([attacker, defender], pops, "a", "b", "open");
  assert.ok(report);
  assert.equal(armies.length, 2);
  if (!report!.wipe && report!.winner === "attacker") {
    const lost = armies.find((x) => x.id === "b");
    const won = armies.find((x) => x.id === "a");
    assert.ok(lost);
    assert.ok((lost?.x ?? 0) > 110);
    assert.equal(won?.x, 110);
    assert.equal(won?.y, 100);
  }
});

test("composition defaults split strength 20/30/50", () => {
  const c = compositionOf(army("a", "vestoria", 10));
  assert.equal(c.shock, 2);
  assert.equal(c.ranged, 3);
  assert.equal(c.melee, 5);
});

test("named unit lines stay per faction, not one blob", () => {
  const ves = army("a", "vestoria", 20, {
    units: [
      { id: "horse", typeId: "cavalry", name: "Imperial Horse", fielded: 8 },
      { id: "foot", typeId: "infantry", name: "Vestorial Foot", fielded: 12 },
    ],
  });
  const ally = army("a2", "vestoria", 10, {
    x: 4,
    units: [{ id: "levy", typeId: "levy", name: "Allied Levy", fielded: 10 }],
  });
  const foe = army("b", "tunnu", 12, {
    units: [{ id: "spears", typeId: "infantry", name: "Tunnu Spears", fielded: 12 }],
  });
  const result = resolveBattle({ attackers: [ves, ally], defenders: [foe], terrain: "open" });
  const names = result.report.units.map((u) => u.name);
  assert.ok(names.includes("Imperial Horse"));
  assert.ok(names.includes("Allied Levy"));
  assert.ok(names.includes("Tunnu Spears"));
  const vesLine = result.report.units.find((u) => u.name === "Imperial Horse");
  const allyLine = result.report.units.find((u) => u.name === "Allied Levy");
  assert.equal(vesLine?.nationId, "vestoria");
  assert.equal(allyLine?.armyId, "a2");
  assert.notEqual(vesLine?.armyId, allyLine?.armyId);
});

test("grade: crushing wipe vs pyrrhic win", () => {
  const crush = gradeBattle({
    winner: "attacker",
    wipe: true,
    atkFielded: 40,
    defFielded: 22,
    atkLoss: 6,
    defLoss: 22,
    atkWins: 2,
    defWins: 0,
  });
  assert.equal(crush, "crushing");
  const pyrrhic = gradeBattle({
    winner: "attacker",
    wipe: false,
    atkFielded: 40,
    defFielded: 38,
    atkLoss: 18,
    defLoss: 16,
    atkWins: 2,
    defWins: 1,
  });
  assert.equal(pyrrhic, "pyrrhic");
  const even = gradeBattle({
    winner: "inconclusive",
    wipe: false,
    atkFielded: 20,
    defFielded: 20,
    atkLoss: 4,
    defLoss: 4,
    atkWins: 1,
    defWins: 1,
  });
  assert.equal(even, "inconclusive");
});

test("ZOC neighbors are eligible to join; contact does not fight", () => {
  const lead = army("a", "vestoria", 20, { x: 0, y: 0 });
  const neighbor = army("a2", "vestoria", 10, { x: 10, y: 0 });
  const foe = army("b", "tunnu", 12, { x: 20, y: 0 });
  const far = army("a3", "vestoria", 10, { x: 400, y: 0 });
  const join = eligibleJoiners(lead, [foe], [lead, neighbor, foe, far]);
  assert.equal(join.some((a) => a.id === "a2"), true);
  assert.equal(join.some((a) => a.id === "a3"), false);
  const moved = { ...lead, x: 20, y: 0 };
  assert.equal(firstContact(moved, [foe])?.id, "b");
});

test("march into a disk does not resolve a battle", () => {
  const foe: Army = { id: "b", x: 50, y: 0, ownerId: "tunnu", strength: 10 };
  const stopped = stopForZoc(0, 0, 50, 0, [foe], 20);
  assert.equal(stopped.x, 50);
  const before = foe.strength;
  assert.equal(before, 10);
});

test("unitsOf preserves proper names", () => {
  const a = army("a", "vestoria", 8, {
    units: [{ id: "h", typeId: "cavalry", name: "Imperial Horse", fielded: 8 }],
  });
  assert.equal(unitsOf(a)[0]?.name, "Imperial Horse");
});

test("report headline is grade + side + phase + victory", () => {
  assert.equal(
    reportHeadline("hard fought", "defender", "shock"),
    "HARD FOUGHT DEFENDER SHOCK VICTORY",
  );
  assert.equal(reportHeadline("inconclusive", "inconclusive", null), "INCONCLUSIVE");
  assert.equal(reportHeadline("crushing", "attacker", "late"), "CRUSHING ATTACKER LATE VICTORY");
});

test("report records the field coordinates", () => {
  const a = army("a", "vestoria", 40, {
    x: 100,
    y: 200,
    units: [{ id: "h", typeId: "cavalry", name: "Horse", fielded: 40 }],
  });
  const b = army("b", "tunnu", 20, {
    x: 140,
    y: 200,
    units: [{ id: "s", typeId: "infantry", name: "Spears", fielded: 20 }],
  });
  const result = resolveFieldBattle(a, b);
  assert.equal(result.report.x, 120);
  assert.equal(result.report.y, 200);
});

test("reel is three CONTINUEs: shock, early, late, then occupy", () => {
  const a = army("a", "vestoria", 40, {
    x: 0,
    y: 0,
    composition: { shock: 12, ranged: 12, melee: 16 },
    moveUsed: false,
  });
  const b = army("b", "tunnu", 28, {
    x: 200,
    y: 80,
    composition: { shock: 8, ranged: 8, melee: 12 },
  });
  const field = [a, b];
  let live = startReel({ attackers: [a], defenders: [b] });
  assert.equal(live.report.phases.length, 1);
  assert.equal(live.report.phases[0]?.id, "shock");
  assert.equal(live.index, 0);

  const c1 = continueReel(live, field, []);
  assert.ok(c1.reel);
  assert.equal(c1.occupied, false);
  assert.equal(c1.reel!.report.phases.length, 2);
  assert.equal(c1.reel!.report.phases[1]?.id, "early");

  const c2 = continueReel(c1.reel!, c1.armies, []);
  assert.ok(c2.reel);
  assert.equal(c2.reel!.report.phases[2]?.id, "late");
  assert.equal(c2.reel!.done, true);

  const c3 = continueReel(c2.reel!, c2.armies, []);
  assert.equal(c3.reel, null);
  assert.equal(c3.occupied, true);
  const winner = c3.armies.find((x) => x.id === (c3.report.winner === "defender" ? "b" : "a"));
  if (c3.report.winner === "attacker") {
    assert.equal(winner?.x, 200);
    assert.equal(winner?.y, 80);
    assert.equal(winner?.moveUsed, false);
    assert.equal(winner?.actionUsed, true);
  }
  assert.ok(c3.armies.some((x) => x.id === "b"));
});

test("staff freeze remain commits before CONTINUE", () => {
  const ves = army("a", "vestoria", 20, {
    units: [{ id: "horse", typeId: "cavalry", name: "Imperial Horse", fielded: 20 }],
  });
  const foe = army("b", "tunnu", 12, {
    units: [{ id: "spears", typeId: "infantry", name: "Tunnu Spears", fielded: 12 }],
  });
  const reel = startReel({ attackers: [ves], defenders: [foe] });
  const frozen = applyStaffRemain(reel, [{ unitId: "horse", remain: 3 }]);
  const horse = unitsOf(frozen.attackers[0]!).find((u) => u.id === "horse");
  assert.equal(horse?.fielded, 3);
  const line = frozen.report.units.find((u) => u.unitId === "horse");
  assert.equal(line?.remain, 3);
});

test("leftover move is denied if the stack already marched", () => {
  const a = army("a", "vestoria", 80, {
    x: 0,
    y: 0,
    moveUsed: true,
    actionUsed: true,
    composition: { shock: 20, ranged: 20, melee: 40 },
  });
  const b = army("b", "tunnu", 8, { x: 30, y: 10, composition: { shock: 2, ranged: 2, melee: 4 } });
  const reel = startReel({ attackers: [a], defenders: [b] });
  const closed = closeReel(reel, [a, b], []);
  const winner = closed.armies.find((x) => x.id === "a");
  assert.equal(winner?.moveUsed, true);
  assert.equal(winner?.x, 30);
  assert.equal(winner?.y, 10);
});

test("explicit Attack deletes a ghost that has not reinforced", () => {
  const living = army("a", "vestoria", 12, { x: 0, y: 0 });
  const ghost = army("b", "tunnu", 0, {
    x: 4,
    y: 0,
    units: [{ id: "g", typeId: "infantry", name: "Dead Spears", fielded: 0 }],
  });
  assert.equal(isGhost(ghost), true);
  const next = strikeGhost([living, ghost], "a", "b");
  assert.equal(next.some((x) => x.id === "b"), false);
  assert.equal(next.find((x) => x.id === "a")?.actionUsed, true);
  const spent = strikeGhost([{ ...living, actionUsed: true }, ghost], "a", "b");
  assert.equal(spent.some((x) => x.id === "b"), false);
  const live = army("c", "tunnu", 8);
  const no = strikeGhost([living, live], "a", "c");
  assert.equal(no.length, 2);
});

test("ghosts do not join; armyStrength of a 0-line pin is 0", () => {
  const lead = army("a", "vestoria", 20, { x: 0, y: 0 });
  const ghost = army("a2", "vestoria", 0, {
    x: 8,
    y: 0,
    units: [{ id: "z", typeId: "levy", name: "Gone", fielded: 0 }],
  });
  const foe = army("b", "tunnu", 12, { x: 16, y: 0 });
  const join = eligibleJoiners(lead, [foe], [lead, ghost, foe]);
  assert.equal(join.some((a) => a.id === "a2"), false);
  assert.equal(armyStrength(ghost), 0);
});
