import { laneDefaults, type GameAction } from "./actionTypes.ts";

const KEY = "inkunzi.actions.v1";

export function loadActions(): GameAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GameAction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveActions(actions: GameAction[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(actions));
  } catch {
    /* ignore */
  }
}

export function makeAction(
  kind: GameAction["kind"],
  title: string,
  detail: string,
  extra: Partial<GameAction> = {},
): GameAction {
  return {
    id: crypto.randomUUID(),
    kind,
    title,
    detail,
    status: "pending",
    result: "unset",
    ...laneDefaults(kind),
    ...extra,
  };
}
