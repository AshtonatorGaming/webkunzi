import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSnapshot, parseSnapshot } from "./worldIO.ts";
import { DEFAULT_SESSION } from "./sessionStore.ts";
import { STARTER_NATIONS } from "../packs/core/starterNations.ts";
import { STARTER_POPS } from "../packs/core/starterPops.ts";
import { makeAction } from "./actionStore.ts";

test("export includes actions and popValue", () => {
  const actions = [makeAction("flavor", "Court", "A feast in Vestoria")];
  const snap = buildSnapshot(
    DEFAULT_SESSION,
    STARTER_NATIONS,
    STARTER_POPS,
    [],
    [],
    actions,
    [],
    [],
  );
  const raw = JSON.stringify(snap);
  const parsed = parseSnapshot(raw);
  assert.equal(parsed.session.popValue, DEFAULT_SESSION.popValue);
  assert.equal(parsed.actions?.length, 1);
  assert.equal(parsed.actions?.[0]?.title, "Court");
});

test("old files without actions still parse", () => {
  const raw = JSON.stringify({
    version: 1,
    session: DEFAULT_SESSION,
    nations: STARTER_NATIONS,
    pops: STARTER_POPS,
    nodes: [],
    armies: [],
  });
  const parsed = parseSnapshot(raw);
  assert.deepEqual(parsed.actions, []);
  assert.deepEqual(parsed.wars, []);
});
