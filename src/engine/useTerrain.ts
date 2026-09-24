"use client";

import { useEffect, useState } from "react";
import {
  generateTerrain,
  packTerrain,
  stampOwner,
  stampSight,
  stampTerrain,
  traceRaster,
  unpackTerrain,
  type TerrainField,
  type TerrainPack,
  type WorldGenInput,
} from "./terrain";

const KEY = "inkunzi.terrain.v13";

let current: TerrainField | null = null;
let previewUrl = "";
const listeners = new Set<() => void>();
let saveTimer = 0;

function emit() {
  for (const fn of listeners) fn();
}

function saveNow() {
  if (typeof window === "undefined" || !current) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(packTerrain(current)));
  } catch {
    /* quota */
  }
}

function scheduleSave() {
  if (typeof window === "undefined") return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveNow, 280);
}

export function loadTerrain(): TerrainField | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return unpackTerrain(JSON.parse(raw) as TerrainPack);
  } catch {
    return null;
  }
}

export function getTerrain(): TerrainField | null {
  return current;
}

export function getTerrainPreview(): string {
  return previewUrl;
}

export function setTerrainPreview(url: string) {
  previewUrl = url;
}

export function ensureTerrain(): TerrainField {
  if (!current) {
    current = loadTerrain() ?? generateTerrain("inkunzi", 46);
    saveNow();
  }
  return current;
}

export function replaceTerrain(next: TerrainField) {
  current = next;
  saveNow();
  emit();
}

export function paintGround(x: number, y: number, mapW: number, mapH: number, terrainId: number, radius: number) {
  const field = ensureTerrain();
  stampTerrain(field, x, y, mapW, mapH, terrainId, radius);
  scheduleSave();
  emit();
}

export function paintSight(x: number, y: number, mapW: number, mapH: number, radius: number, open: boolean) {
  const field = ensureTerrain();
  stampSight(field, x, y, mapW, mapH, radius, open);
  scheduleSave();
  emit();
}

export function revealAlong(x0: number, y0: number, x1: number, y1: number, mapW: number, mapH: number) {
  const field = ensureTerrain();
  let dx = x1 - x0;
  if (field.wrap && mapW > 0) {
    if (dx > mapW / 2) dx -= mapW;
    else if (dx < -mapW / 2) dx += mapW;
  }
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    stampSight(field, x0 + dx * t, y0 + (y1 - y0) * t, mapW, mapH, 5, true);
  }
  scheduleSave();
  emit();
}

export function paintBorder(
  x: number,
  y: number,
  mapW: number,
  mapH: number,
  nationId: string | null,
  radius: number,
) {
  const field = ensureTerrain();
  stampOwner(field, x, y, mapW, mapH, nationId, radius);
  scheduleSave();
  emit();
}

export function setWorldWrap(wrap: boolean) {
  const field = ensureTerrain();
  if (field.wrap === wrap) return;
  field.wrap = wrap;
  scheduleSave();
  emit();
}

export function newWorld(seed: string, sea: number, extra?: WorldGenInput) {
  replaceTerrain(generateTerrain(seed.trim() || "inkunzi", sea, extra));
}

/** Replace the open world from a pack. Does not generate. */
export function loadPack(pack: TerrainPack): boolean {
  const field = unpackTerrain(pack);
  if (!field) return false;
  replaceTerrain(field);
  return true;
}

export function traceImage(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  cols?: number,
  rows?: number,
  wrap = true,
) {
  const field = current;
  replaceTerrain(
    traceRaster(
      rgba,
      width,
      height,
      field?.sea ?? 46,
      cols ?? field?.cols ?? 360,
      rows ?? field?.rows ?? 206,
      wrap,
    ),
  );
}

export function useTerrainField(): { field: TerrainField | null; rev: number } {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const stop = subscribe(() => setTick((t) => t + 1));
    ensureTerrain();
    setTick((t) => t + 1);
    return () => {
      stop();
    };
  }, []);
  return { field: current, rev: tick };
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
