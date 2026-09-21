import type { Pop, PopKind } from "./types";
import { STARTER_POPS } from "@/packs/core/starterPops";

const KEY = "inkunzi.pops.v3";
const LEGACY_KEYS = ["inkunzi.pops.v2", "inkunzi.pops.v1"];

const NAME_TO_ID: Record<string, string> = {
  Vestoria: "vestoria",
  Tunnu: "tunnu",
  Rekolia: "rekolia",
  Unclaimed: "unclaimed",
  Horde: "unclaimed",
};

const KINDS: PopKind[] = ["pop", "town", "city", "fort", "camp"];

type LegacyPop = Pop & { owner?: string };

function resolveOwnerId(p: LegacyPop): string {
  const fromName = p.owner ? NAME_TO_ID[p.owner] : undefined;
  if (fromName && fromName !== "unclaimed") return fromName;
  if (p.ownerId && p.ownerId !== "unclaimed") return p.ownerId;
  return fromName || p.ownerId || "unclaimed";
}

function resolveKind(p: LegacyPop): PopKind {
  if (p.kind && KINDS.includes(p.kind)) return p.kind;
  if (!p.settled) return "camp";
  return "pop";
}

function migrate(raw: unknown[]): Pop[] {
  return raw.map((row) => {
    const p = row as LegacyPop;
    return {
      id: p.id,
      x: p.x,
      y: p.y,
      ownerId: resolveOwnerId(p),
      culture: p.culture,
      religion: p.religion,
      settled: p.settled,
      kind: resolveKind(p),
    };
  });
}

export function loadPops(): Pop[] {
  if (typeof window === "undefined") return STARTER_POPS;
  try {
    for (const key of [KEY, ...LEGACY_KEYS]) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as unknown[];
      if (Array.isArray(parsed) && parsed.length) return migrate(parsed);
    }
    return STARTER_POPS;
  } catch {
    return STARTER_POPS;
  }
}

export function savePops(pops: Pop[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(pops));
  } catch {
    /* ignore */
  }
}

export function makePop(x: number, y: number): Pop {
  return {
    id: crypto.randomUUID(),
    x,
    y,
    ownerId: "unclaimed",
    culture: "Unknown",
    religion: "Unknown",
    settled: true,
    kind: "pop",
  };
}

export function updatePop(pops: Pop[], id: string, patch: Partial<Pop>): Pop[] {
  return pops.map((pop) => (pop.id === id ? { ...pop, ...patch } : pop));
}

export function removePop(pops: Pop[], id: string): Pop[] {
  return pops.filter((pop) => pop.id !== id);
}
