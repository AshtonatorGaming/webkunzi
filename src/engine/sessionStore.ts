import { ageById } from "../packs/core/ages.ts";
import type { Session } from "./types";

const KEY = "inkunzi.session.v1";

export const DEFAULT_SESSION: Session = {
  name: "Inkunzi",
  mechanicalTurn: 1,
  calendarDay: 1,
  daysPerTurn: 14,
  mapWidth: 6145,
  mapHeight: 3530,
  pixelsPerDayMarch: 80,
  popValue: 15000,
  ageId: "bronze",
  workRate: 2,
  ration: 1,
};

export function loadSession(): Session {
  if (typeof window === "undefined") return DEFAULT_SESSION;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SESSION;
    return { ...DEFAULT_SESSION, ...(JSON.parse(raw) as Session) };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function saveSession(session: Session): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* quota / private mode */
  }
}

export function advanceDay(session: Session): Session {
  return { ...session, calendarDay: session.calendarDay + 1 };
}

export function advanceTurn(session: Session): Session {
  return {
    ...session,
    mechanicalTurn: session.mechanicalTurn + 1,
    calendarDay: session.calendarDay + session.daysPerTurn,
  };
}

export function setAge(session: Session, ageId: string): Session {
  const age = ageById(ageId);
  return { ...session, ageId: age.id, popValue: age.popValue };
}
