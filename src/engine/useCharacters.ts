"use client";

import { useEffect, useState } from "react";
import type { Character } from "./types";
import {
  loadCharacters,
  saveCharacters,
  makeCharacter,
  updateCharacter,
} from "./characterStore";

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCharacters(loadCharacters());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveCharacters(characters);
  }, [characters, ready]);

  return {
    characters,
    setCharacters,
    ready,
    add: (name: string, nationId: string) =>
      setCharacters((cur) => [...cur, makeCharacter(name, nationId)]),
    update: (id: string, patch: Partial<Character>) =>
      setCharacters((cur) => updateCharacter(cur, id, patch)),
  };
}
