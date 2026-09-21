import assert from "node:assert/strict";
import { test } from "node:test";
import { checkStat } from "./roll.ts";

test("1d20 + stat vs DC: success, mixed, fail", () => {
  const hit = checkStat(4, 15, 12);
  assert.equal(hit.total, 16);
  assert.equal(hit.result, "success");
  const mix = checkStat(2, 15, 11);
  assert.equal(mix.total, 13);
  assert.equal(mix.result, "mixed");
  const miss = checkStat(1, 15, 8);
  assert.equal(miss.result, "fail");
});
