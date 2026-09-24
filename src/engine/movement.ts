import type { Army, ArmyCover, Pop, PopKind, Session } from "./types";

export const ZOC_PX = 64;
export const GARRISON_PX = 18;
export const STACK_PX = 18;

const RETREAT_KINDS = new Set<PopKind>(["town", "city", "fort"]);

export function turnMarchRange(session: Session): number {
  return session.pixelsPerDayMarch * session.daysPerTurn;
}

let wrapSpan = 0;

export function setMapWrap(width: number) {
  wrapSpan = width > 0 ? width : 0;
}

export function wrapCoord(x: number): number {
  if (wrapSpan <= 0) return x;
  let v = x % wrapSpan;
  if (v < 0) v += wrapSpan;
  return v;
}

function shortestX(fromX: number, toX: number): number {
  if (wrapSpan <= 0) return toX;
  let x = toX;
  const dx = x - fromX;
  if (dx > wrapSpan / 2) x -= wrapSpan;
  else if (dx < -wrapSpan / 2) x += wrapSpan;
  return x;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  let dx = x2 - x1;
  if (wrapSpan > 0) {
    if (dx > wrapSpan / 2) dx -= wrapSpan;
    else if (dx < -wrapSpan / 2) dx += wrapSpan;
  }
  return Math.hypot(dx, y2 - y1);
}

function firstCircleHit(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number; t: number } | null {
  const dx = bx - ax;
  const dy = by - ay;
  const fx = ax - cx;
  const fy = ay - cy;
  const a = dx * dx + dy * dy;
  if (a === 0) return null;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const root = Math.sqrt(disc);
  const t1 = (-b - root) / (2 * a);
  const t2 = (-b + root) / (2 * a);
  const t = [t1, t2]
    .filter((n) => n >= 0 && n <= 1)
    .sort((l, r) => l - r)[0];
  if (t == null) return null;
  return { x: ax + dx * t, y: ay + dy * t, t };
}

export function enemyBlockers(army: Army, armies: Army[]): Army[] {
  return armies.filter(
    (a) =>
      a.id !== army.id &&
      a.ownerId !== army.ownerId &&
      a.ownerId !== "unclaimed" &&
      army.ownerId !== "unclaimed",
  );
}

export function inZocOf(army: Army, other: Army, radius = ZOC_PX): boolean {
  if (army.id === other.id) return false;
  return distance(army.x, army.y, other.x, other.y) <= radius;
}

/**
 * ZOC blocks pathing THROUGH a disk. Approach TO a flag/town inside the disk
 * is legal. Leaving the disk is a Move. Starting already inside is not a trap.
 */
export function stopForZoc(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  blockers: Army[],
  radius = ZOC_PX,
): { x: number; y: number; blockerId: string | null } {
  const destX = shortestX(fromX, toX);
  let best: { x: number; y: number; blockerId: string | null; t: number } = {
    x: destX,
    y: toY,
    blockerId: null,
    t: 2,
  };

  for (const b of blockers) {
    const xs = wrapSpan > 0 ? [b.x - wrapSpan, b.x, b.x + wrapSpan] : [b.x];
    for (const bx of xs) {
      const startInside = distance(fromX, fromY, bx, b.y) <= radius;
      const endInside = distance(destX, toY, bx, b.y) <= radius;
      if (startInside || endInside) continue;
      const hit = firstCircleHit(fromX, fromY, destX, toY, bx, b.y, radius);
      if (!hit || hit.t >= best.t) continue;
      best = { x: hit.x, y: hit.y, blockerId: b.id, t: hit.t };
    }
  }

  return { x: wrapCoord(best.x), y: best.y, blockerId: best.blockerId };
}

export function isRetreatNode(pop: Pop): boolean {
  if (pop.kind === "camp") return false;
  if (pop.kind && RETREAT_KINDS.has(pop.kind)) return true;
  return pop.settled && pop.kind !== "pop";
}

export function coverOf(army: Army, pops: Pop[]): ArmyCover {
  const holds = pops.filter((p) => p.ownerId === army.ownerId && isRetreatNode(p));
  let covering = false;
  for (const pop of holds) {
    const d = distance(army.x, army.y, pop.x, pop.y);
    if (d <= GARRISON_PX) return "garrison";
    if (d <= ZOC_PX) covering = true;
  }
  return covering ? "covering" : "field";
}

export function nearestTown(
  pops: Pop[],
  ownerId: string,
  fromX: number,
  fromY: number,
): Pop | null {
  const towns = pops.filter((p) => p.ownerId === ownerId && isRetreatNode(p));
  const fallback = towns.length
    ? towns
    : pops.filter((p) => p.ownerId === ownerId && p.settled && p.kind !== "camp");
  if (!fallback.length) return null;
  return fallback.reduce((best, pop) =>
    distance(pop.x, pop.y, fromX, fromY) < distance(best.x, best.y, fromX, fromY)
      ? pop
      : best,
  );
}

/** Half a move toward the nearest friendly city / town / fort. Camp is not a retreat. */
export function retreatTowardTown(
  army: Army,
  winner: Army,
  pops: Pop[],
): Army {
  const town = nearestTown(pops, army.ownerId, army.x, army.y);
  if (town && distance(army.x, army.y, town.x, town.y) > 16) {
    return {
      ...army,
      x: army.x + (town.x - army.x) * 0.5,
      y: army.y + (town.y - army.y) * 0.5,
    };
  }
  const dx = army.x - winner.x;
  const dy = army.y - winner.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    ...army,
    x: army.x + (dx / len) * 80,
    y: army.y + (dy / len) * 80,
  };
}

export function stackKey(army: Army, gap = STACK_PX): string {
  return `${Math.round(army.x / gap)}_${Math.round(army.y / gap)}`;
}

export function stackOffsets(
  armies: Army[],
  gap = STACK_PX,
): Map<string, { dx: number; dy: number }> {
  const groups = new Map<string, Army[]>();
  for (const army of armies) {
    const key = stackKey(army, gap);
    const group = groups.get(key) ?? [];
    group.push(army);
    groups.set(key, group);
  }
  const out = new Map<string, { dx: number; dy: number }>();
  for (const group of groups.values()) {
    if (group.length === 1) {
      out.set(group[0]!.id, { dx: 0, dy: 0 });
      continue;
    }
    group.forEach((army, i) => {
      const ang = (i / group.length) * Math.PI * 2 - Math.PI / 2;
      out.set(army.id, { dx: Math.cos(ang) * 16, dy: Math.sin(ang) * 16 });
    });
  }
  return out;
}

export function stackedWith(army: Army, armies: Army[], gap = STACK_PX): Army[] {
  const key = stackKey(army, gap);
  return armies.filter((a) => stackKey(a, gap) === key);
}
