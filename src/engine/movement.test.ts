import assert from "node:assert/strict";
import { test } from "node:test";
import { isRetreatNode, nearestTown, retreatTowardTown, stopForZoc } from "./movement.ts";
import type { Army, Pop } from "./types.ts";

test("camp is not a retreat city", () => {
  const camp: Pop = {
    id: "c",
    x: 10,
    y: 10,
    ownerId: "tunnu",
    culture: "Tunnu",
    religion: "Sky",
    settled: false,
    kind: "camp",
  };
  const city: Pop = {
    id: "t",
    x: 400,
    y: 100,
    ownerId: "tunnu",
    culture: "Tunnu",
    religion: "Sky",
    settled: true,
    kind: "city",
  };
  assert.equal(isRetreatNode(camp), false);
  assert.equal(isRetreatNode(city), true);
  const found = nearestTown([camp, city], "tunnu", 100, 100);
  assert.equal(found?.id, "t");
});

test("ZOC blocks the path instead of deleting the stack", () => {
  const blocker: Army = { id: "b", x: 50, y: 0, ownerId: "tunnu", strength: 10 };
  const stopped = stopForZoc(0, 0, 100, 0, [blocker], 20);
  assert.equal(stopped.blockerId, "b");
  assert.ok(stopped.x < 50);
  assert.ok(stopped.x > 0);
});

test("loser steps halfway toward a friendly city", () => {
  const loser: Army = { id: "l", x: 0, y: 0, ownerId: "tunnu", strength: 8 };
  const winner: Army = { id: "w", x: 10, y: 0, ownerId: "vestoria", strength: 40 };
  const city: Pop = {
    id: "t",
    x: 100,
    y: 0,
    ownerId: "tunnu",
    culture: "Tunnu",
    religion: "Sky",
    settled: true,
    kind: "city",
  };
  const next = retreatTowardTown(loser, winner, [city]);
  assert.equal(next.x, 50);
});
