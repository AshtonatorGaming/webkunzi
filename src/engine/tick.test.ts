import assert from "node:assert/strict";
import { test } from "node:test";
import { foodEaten, foodProduced, tickNation } from "./tick.ts";
import { DEFAULT_SESSION } from "./sessionStore.ts";
import { STARTER_NATIONS } from "../packs/core/starterNations.ts";
import type { Army, Nation, Pop, ResourceNode } from "./types.ts";

const vestoria = STARTER_NATIONS.find((n) => n.id === "vestoria") as Nation;
const session = { ...DEFAULT_SESSION, workRate: 2, ration: 1, popValue: 15000, ageId: "bronze" };

test("unclaimed is frozen on tick", () => {
  const unclaimed = STARTER_NATIONS[0];
  const result = tickNation(unclaimed, [], [], [], session);
  assert.deepEqual(result.nation, unclaimed);
});

test("food uses settled labor times workRate times age", () => {
  assert.equal(foodProduced(4, session), Math.round(4 * 2 * 1.1));
  assert.equal(foodEaten(4, session), 4);
});

test("ledger nodes add yield, cap nodes replace", () => {
  const pops: Pop[] = [
    { id: "p", x: 0, y: 0, ownerId: "vestoria", culture: "Eldari", religion: "Solar", settled: true },
  ];
  const nodes: ResourceNode[] = [
    { id: "n", x: 0, y: 0, resourceId: "lumber", ownerId: "vestoria", yield: 1 },
  ];
  const armies: Army[] = [];
  const before = vestoria.resources.lumber ?? 0;
  const { nation } = tickNation(vestoria, pops, nodes, armies, session);
  assert.equal(nation.resources.lumber, before + 1);
});

test("starvation drops stability by 5", () => {
  const hungry: Nation = {
    ...vestoria,
    resources: { ...vestoria.resources, food: 0 },
  };
  const pops: Pop[] = [
    { id: "p1", x: 0, y: 0, ownerId: "vestoria", culture: "Eldari", religion: "Solar", settled: false },
    { id: "p2", x: 1, y: 0, ownerId: "vestoria", culture: "Eldari", religion: "Solar", settled: false },
    { id: "p3", x: 2, y: 0, ownerId: "vestoria", culture: "Eldari", religion: "Solar", settled: false },
  ];
  const { nation, log } = tickNation(hungry, pops, [], [], session);
  assert.equal(nation.stability, hungry.stability - 5);
  assert.ok(log.some((line) => line.includes("starved")));
});
