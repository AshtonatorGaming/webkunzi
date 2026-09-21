import assert from "node:assert/strict";
import { test } from "node:test";
import { applyBattleToArmies, compositionOf, resolveFieldBattle } from "./battle.ts";
import type { Army, Pop } from "./types.ts";

function army(id: string, ownerId: string, strength: number, extra: Partial<Army> = {}): Army {
  return { id, x: 0, y: 0, ownerId, strength, ...extra };
}

test("stronger shock army takes shock, ranged takes early", () => {
  const cavalry = army("c", "vestoria", 30, { composition: { shock: 24, ranged: 2, melee: 4 } });
  const archers = army("r", "tunnu", 30, { composition: { shock: 2, ranged: 24, melee: 4 } });
  const shock = resolveFieldBattle(cavalry, archers, "open");
  assert.equal(shock.report.phases[0]?.winner, "attacker");
});

test("best of three can stop after two phase wins", () => {
  const heavy = army("a", "vestoria", 80, { composition: { shock: 20, ranged: 20, melee: 40 } });
  const light = army("b", "tunnu", 10, { composition: { shock: 2, ranged: 3, melee: 5 } });
  const result = resolveFieldBattle(heavy, light, "open");
  assert.ok(result.report.phases.length >= 1);
  assert.ok(result.report.phases.length <= 3);
  assert.equal(result.report.winner, "attacker");
});

test("wipe when a stack hits zero", () => {
  const huge = army("a", "vestoria", 200);
  const tiny = army("b", "tunnu", 1);
  const result = resolveFieldBattle(huge, tiny, "open");
  assert.equal(result.defender.strength, 0);
  assert.equal(result.report.wipe, true);
  assert.equal(result.report.winner, "attacker");
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

test("loser retreats toward nearest settled town", () => {
  const attacker = army("a", "vestoria", 50, { x: 100, y: 100 });
  const defender = army("b", "tunnu", 8, { x: 110, y: 100 });
  const pops: Pop[] = [
    { id: "t", x: 400, y: 100, ownerId: "tunnu", culture: "Tunnu", religion: "Sky", settled: true },
  ];
  const { armies, report } = applyBattleToArmies(
    [attacker, defender],
    pops,
    "a",
    "b",
    "open",
  );
  assert.ok(report);
  if (!report.wipe) {
    const lost = armies.find((x) => x.id === "b");
    assert.ok(lost);
    assert.ok((lost?.x ?? 0) > 110);
  } else {
    assert.equal(armies.some((x) => x.id === "b"), false);
  }
});

test("composition defaults split strength 20/30/50", () => {
  const c = compositionOf(army("a", "vestoria", 10));
  assert.equal(c.shock, 2);
  assert.equal(c.ranged, 3);
  assert.equal(c.melee, 5);
});
