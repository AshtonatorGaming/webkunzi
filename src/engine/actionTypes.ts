export type ActionKind =
  | "flavor"
  | "march"
  | "attack"
  | "entrench"
  | "skirmish"
  | "forceMarch"
  | "war"
  | "claim"
  | "convert"
  | "spy"
  | "build";
export type ActionStatus = "pending" | "accepted" | "denied";
export type ActionResult = "unset" | "success" | "mixed" | "fail";
export type ActionLane = 1 | 2 | 3;

export type GameAction = {
  id: string;
  kind: ActionKind;
  title: string;
  detail: string;
  status: ActionStatus;
  auto?: boolean;
  needsRoll?: boolean;
  dc?: number;
  result?: ActionResult;
  lane?: ActionLane;
  armyId?: string;
  toX?: number;
  toY?: number;
  nationId?: string;
  defenderArmyId?: string;
  warId?: string;
  marchMode?: "march" | "force" | "skirmish";
};

export function laneDefaults(kind: ActionKind): Pick<GameAction, "lane" | "auto" | "needsRoll" | "dc"> {
  if (kind === "march" || kind === "build" || kind === "entrench" || kind === "forceMarch" || kind === "skirmish") {
    return { lane: 1, auto: true };
  }
  if (kind === "convert") {
    return { lane: 2, needsRoll: true, dc: 15 };
  }
  if (kind === "spy" || kind === "flavor") {
    return { lane: 2, needsRoll: true, dc: 12 };
  }
  return { lane: 3 };
}
