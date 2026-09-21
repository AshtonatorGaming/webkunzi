"use client";

import { useEffect, useState } from "react";
import type { Nation } from "./types";
import { loadNations, saveNations, updateNation, addNation } from "./nationStore";

export function useNations() {
  const [nations, setNations] = useState<Nation[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNations(loadNations());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveNations(nations);
  }, [nations, ready]);

  return {
    nations,
    ready,
    update: (id: string, patch: Partial<Nation>) =>
      setNations((cur) => updateNation(cur, id, patch)),
    add: (name: string, color?: string) =>
      setNations((cur) => addNation(cur, name, color)),
    setNations,
  };
}
