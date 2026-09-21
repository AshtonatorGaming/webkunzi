import type { Character } from "./types";
import { STARTER_CHARACTERS } from "@/packs/core/starterCharacters";

const KEY = "inkunzi.characters.v1";

export function loadCharacters(): Character[] {
  if (typeof window === "undefined") return STARTER_CHARACTERS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return STARTER_CHARACTERS;
    const parsed = JSON.parse(raw) as Character[];
    return Array.isArray(parsed) && parsed.length ? parsed : STARTER_CHARACTERS;
  } catch {
    return STARTER_CHARACTERS;
  }
}

export function saveCharacters(characters: Character[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(characters));
  } catch {
    /* ignore */
  }
}

export function makeCharacter(name: string, nationId: string): Character {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || "New Character",
    nationId,
    prestige: 0,
    stats: {
      rulership: 2,
      charisma: 2,
      landTactics: 2,
      seaTactics: 0,
      intrigue: 2,
      business: 2,
    },
  };
}

export function updateCharacter(
  list: Character[],
  id: string,
  patch: Partial<Character>,
): Character[] {
  return list.map((c) => (c.id === id ? { ...c, ...patch } : c));
}
