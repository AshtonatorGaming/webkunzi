import type { ActionResult } from "./actionTypes";

export type Check = {
  roll: number;
  stat: number;
  total: number;
  dc: number;
  result: ActionResult;
};

export function d20(): number {
  return 1 + Math.floor(Math.random() * 20);
}

/** 1d20 + stat vs DC. Mixed if within 3 below the DC. */
export function checkStat(stat: number, dc: number, roll = d20()): Check {
  const total = roll + stat;
  let result: ActionResult = "fail";
  if (total >= dc) result = "success";
  else if (total >= dc - 3) result = "mixed";
  return { roll, stat, total, dc, result };
}
