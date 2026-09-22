import assert from "node:assert/strict";
import { test } from "node:test";
import {
  coverOf,
  isRetreatNode,
  nearestTown,
  retreatTowardTown,
  stopForZoc,
} from "./movement.ts";
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

test("ZOC blocks the path through a disk, not the stack", () => {
  const blocker: Army = { id: "b", x: 50, y: 0, ownerId: "tunnu", strength: 10 };
  const stopped = stopForZoc(0, 0, 100, 0, [blocker], 20);
  assert.equal(stopped.blockerId, "b");
  assert.ok(stopped.x < 50);
  assert.ok(stopped.x > 0);
});

test("approach TO a flag inside the disk is legal", () => {
  const blocker: Army = { id: "b", x: 50, y: 0, ownerId: "tunnu", strength: 10 };
  const approach = stopForZoc(0, 0, 50, 0, [blocker], 20);
  assert.equal(approach.blockerId, null);
  assert.equal(approach.x, 50);
  assert.equal(approach.y, 0);
});

test("leaving a disk is a Move, not a trap", () => {
  const blocker: Army = { id: "b", x: 0, y: 0, ownerId: "tunnu", strength: 10 };
  const leave = stopForZoc(5, 0, 80, 0, [blocker], 20);
  assert.equal(leave.blockerId, null);
  assert.equal(leave.x, 80);
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

test("garrison is inside the town, covering is the disk", () => {
  const city: Pop = {
    id: "t",
    x: 0,
    y: 0,
    ownerId: "tunnu",
    culture: "Tunnu",
    religion: "Sky",
    settled: true,
    kind: "city",
  };
  const inside: Army = { id: "g", x: 4, y: 0, ownerId: "tunnu", strength: 10 };
  const covering: Army = { id: "c", x: 40, y: 0, ownerId: "tunnu", strength: 10 };
  const field: Army = { id: "f", x: 400, y: 0, ownerId: "tunnu", strength: 10 };
  assert.equal(coverOf(inside, [city]), "garrison");
  assert.equal(coverOf(covering, [city]), "covering");
  assert.equal(coverOf(field, [city]), "field");
});
