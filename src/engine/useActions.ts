"use client";

import { useEffect, useState } from "react";
import type { ActionResult, GameAction } from "./actionTypes";
import { loadActions, saveActions } from "./actionStore";

export function useActions() {
  const [actions, setActions] = useState<GameAction[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setActions(loadActions());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveActions(actions);
  }, [actions, ready]);

  return {
    actions,
    setActions,
    ready,
    add: (action: GameAction) => setActions((cur) => [action, ...cur]),
    setStatus: (id: string, status: GameAction["status"]) =>
      setActions((cur) => cur.map((a) => (a.id === id ? { ...a, status } : a))),
    setResult: (id: string, result: ActionResult) =>
      setActions((cur) =>
        cur.map((a) => (a.id === id ? { ...a, result, status: "accepted" } : a)),
      ),
  };
}
