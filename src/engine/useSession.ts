"use client";

import { useEffect, useState } from "react";
import type { Session } from "./types";
import { loadSession, saveSession } from "./sessionStore";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  useEffect(() => {
    if (!session) return;
    saveSession(session);
  }, [session]);

  return { session, setSession };
}
