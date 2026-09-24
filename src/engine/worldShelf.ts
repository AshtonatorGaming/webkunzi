import {
  LAYOUT_RECIPES,
  generateTerrain,
  packTerrain,
  readTerrainPack,
  type TerrainField,
  type TerrainPack,
  type WorldLayout,
} from "@/engine/terrain";

const SHELF_KEY = "inkunzi.shelf.v1";
const SHELF_CAP = 8;

export type ShelfEntry = {
  id: string;
  name: string;
  layout: WorldLayout | "traced";
  seed: string;
  cols: number;
  rows: number;
  savedAt: number;
  bundled?: boolean;
  pack?: TerrainPack;
};

export const BUNDLED_SHELF: ShelfEntry[] = [
  {
    id: "bundled-earthlike",
    name: "Earthlike",
    layout: "earthlike",
    seed: "inkunzi",
    cols: 360,
    rows: 206,
    savedAt: 0,
    bundled: true,
  },
  {
    id: "bundled-pangaea",
    name: "Pangaea",
    layout: "pangaea",
    seed: "inkunzi-pangaea",
    cols: 360,
    rows: 206,
    savedAt: 0,
    bundled: true,
  },
  {
    id: "bundled-archipelago",
    name: "Archipelago",
    layout: "archipelago",
    seed: "inkunzi-isles",
    cols: 360,
    rows: 206,
    savedAt: 0,
    bundled: true,
  },
];

function readLocal(): ShelfEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHELF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShelfEntry[];
    return Array.isArray(parsed) ? parsed.filter((e) => e && e.pack && e.id) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: ShelfEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHELF_KEY, JSON.stringify(entries.slice(0, SHELF_CAP)));
}

export function listShelf(): ShelfEntry[] {
  return [...BUNDLED_SHELF, ...readLocal()];
}

export function saveShelf(field: TerrainField, name: string): ShelfEntry {
  const entry: ShelfEntry = {
    id: `shelf-${Date.now().toString(36)}`,
    name: name.trim() || field.seed || "World",
    layout: field.layout ?? "earthlike",
    seed: field.seed,
    cols: field.cols,
    rows: field.rows,
    savedAt: Date.now(),
    pack: packTerrain(field),
  };
  const next = [entry, ...readLocal()].slice(0, SHELF_CAP);
  writeLocal(next);
  return entry;
}

export function downloadShelfPack(field: TerrainField, name: string) {
  const blob = new Blob([JSON.stringify(packTerrain(field))], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(name.trim() || field.seed || "inkunzi").replace(/\s+/g, "-")}.inkunzi.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function fieldFromShelf(entry: ShelfEntry, mapWidth: number, mapHeight: number): TerrainField | null {
  if (entry.pack) return readTerrainPack(JSON.stringify(entry.pack));
  if (!entry.bundled) return null;
  const layout = entry.layout === "traced" ? "earthlike" : entry.layout;
  const recipe = LAYOUT_RECIPES[layout];
  return generateTerrain(entry.seed, recipe.sea, {
    ...recipe,
    layout,
    level: "standard",
    mapWidth,
    mapHeight,
  });
}

export function fieldFromPackText(text: string): TerrainField | null {
  return readTerrainPack(text);
}
