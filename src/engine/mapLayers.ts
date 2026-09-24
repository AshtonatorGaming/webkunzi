export type MapPlane = "surface" | "under" | "sky";

export type MapLayer =
  | "terrain"
  | "climate"
  | "height"
  | "all"
  | "political"
  | "culture"
  | "religion"
  | "resources"
  | "military";

export const MAP_PLANES: { id: MapPlane; label: string }[] = [
  { id: "surface", label: "Surface" },
  { id: "under", label: "Under" },
  { id: "sky", label: "Sky" },
];

export const MAP_LAYERS: { id: MapLayer; label: string; short: string }[] = [
  { id: "terrain", label: "Terrain", short: "GEO" },
  { id: "climate", label: "Climate", short: "CLM" },
  { id: "height", label: "Height", short: "HGT" },
  { id: "all", label: "All", short: "ALL" },
  { id: "political", label: "Political", short: "POL" },
  { id: "culture", label: "Culture", short: "CUL" },
  { id: "religion", label: "Religion", short: "REL" },
  { id: "resources", label: "Resources", short: "RES" },
  { id: "military", label: "Military", short: "MIL" },
];

export const MAP_INK = {
  unset: "#c8c4bc",
  range: "#d9d1c3",
  zoc: "#8f4d45",
  stroke: "#1a1814",
  selected: "#ece7dc",
};

const UNSET = new Set(["", "unknown", "unclaimed", "none", "unset"]);

const PALETTE = [
  "#66bb44",
  "#4488aa",
  "#c88444",
  "#aa4488",
  "#44aaaa",
  "#888844",
  "#8866cc",
  "#cc6666",
];

export function colorFromKey(key: string): string {
  const normalized = key.trim().toLowerCase();
  if (UNSET.has(normalized)) return MAP_INK.unset;
  let h = 0;
  for (let i = 0; i < normalized.length; i++) {
    h = (h * 31 + normalized.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length];
}
