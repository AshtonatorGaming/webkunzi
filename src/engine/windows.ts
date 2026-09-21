export type WindowKind =
  | "nation"
  | "army"
  | "pop"
  | "ledger"
  | "war"
  | "character"
  | "session"
  | "queue";

export type GameWindow = {
  id: string;
  kind: WindowKind;
  title: string;
  x: number;
  y: number;
  payload: string;
};

export function makeWindow(
  kind: WindowKind,
  title: string,
  payload: string,
  x = 80,
  y = 80,
): GameWindow {
  return { id: crypto.randomUUID(), kind, title, x, y, payload };
}
