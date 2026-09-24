import type { MapPlane } from "@/engine/mapLayers";

export const TERRAIN_COLS = 360;
export const TERRAIN_ROWS = 206;
export const TERRAIN_DRAW_SCALE = 2;
export const MAP_MIN_W = 2048;
export const MAP_MIN_H = 1176;
export const MAP_MAX_W = 48000;
export const MAP_MAX_H = 28000;
export const CELL_CAP_COLS = 800;
export const CELL_CAP_ROWS = 450;

export const MAP_PRESETS = [
  { id: "small", label: "Small", w: 3072, h: 1764 },
  { id: "table", label: "Table", w: 6145, h: 3530 },
  { id: "grand", label: "Grand", w: 9218, h: 5295 },
  { id: "vast", label: "Vast", w: 14400, h: 8100 },
] as const;

export function clampMapSize(w: number, h: number) {
  const width = Math.max(MAP_MIN_W, Math.min(MAP_MAX_W, Math.round(Number.isFinite(w) ? w : 6145)));
  const height = Math.max(MAP_MIN_H, Math.min(MAP_MAX_H, Math.round(Number.isFinite(h) ? h : 3530)));
  return { width, height };
}

/** Cells stay near 17px until the cap, then the ground stretches. */
export function gridForMap(mapW: number, mapH: number) {
  const { width, height } = clampMapSize(mapW, mapH);
  if (width === 6145 && height === 3530) return { width, height, cols: TERRAIN_COLS, rows: TERRAIN_ROWS };
  let cols = Math.max(64, Math.round(width / 17));
  let rows = Math.max(40, Math.round(height / 17));
  const scale = Math.max(1, cols / CELL_CAP_COLS, rows / CELL_CAP_ROWS);
  cols = Math.max(64, Math.min(CELL_CAP_COLS, Math.round(cols / scale)));
  rows = Math.max(40, Math.min(CELL_CAP_ROWS, Math.round(rows / scale)));
  return { width, height, cols, rows };
}

export const RELIEF_LABEL = ["Ocean", "Shelf", "Lowland", "Hills", "Range", "Peak", "Ice"] as const;

const R_OCEAN = 0;
const R_SHELF = 1;
const R_LOW = 2;
const R_HILL = 3;
const R_RANGE = 4;
const R_PEAK = 5;
const R_ICE = 6;

export type TerrainDef = {
  id: number;
  key: string;
  label: string;
  color: string;
  height: number;
};

export const TERRAINS: TerrainDef[] = [
  { id: 0, key: "ocean", label: "Ocean", color: "#0c3d66", height: 36 },
  { id: 1, key: "coast", label: "Shelf", color: "#3ec6d4", height: 86 },
  { id: 2, key: "plains", label: "Grainland", color: "#b5c44a", height: 118 },
  { id: 3, key: "forest", label: "Forest", color: "#2f8f3c", height: 128 },
  { id: 4, key: "hills", label: "Hills", color: "#a6844e", height: 158 },
  { id: 5, key: "mountain", label: "Range", color: "#c4a07a", height: 206 },
  { id: 6, key: "snow", label: "Ice", color: "#f4f7fb", height: 228 },
  { id: 7, key: "marsh", label: "Marsh", color: "#3f7048", height: 100 },
  { id: 8, key: "desert", label: "Desert", color: "#f0d59a", height: 122 },
  { id: 9, key: "river", label: "River", color: "#2f86c4", height: 96 },
  { id: 10, key: "lake", label: "Lake", color: "#1d6fa6", height: 78 },
  { id: 11, key: "steppe", label: "Steppe", color: "#d4b15a", height: 120 },
  { id: 12, key: "savanna", label: "Savanna", color: "#c48a3a", height: 122 },
  { id: 13, key: "jungle", label: "Jungle", color: "#0e5c38", height: 126 },
  { id: 14, key: "taiga", label: "Taiga", color: "#1f6a58", height: 130 },
  { id: 15, key: "tundra", label: "Tundra", color: "#c9d4c6", height: 124 },
  { id: 16, key: "seaice", label: "Sea ice", color: "#d5e7f2", height: 48 },
];

const RGB = TERRAINS.map((t) => {
  const n = Number.parseInt(t.color.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
});

export type StratumId = "surface" | "under" | "sky" | "deep" | "void";

export type HearthCell = { x: number; y: number };
export type ColumnCell = { x: number; y: number; dir: "up" | "down" };
export type WorldGate = { x: number; y: number; from: StratumId; realm: string };
export type RealmStub = { id: string; name: string; nodes: number };
export type KnownWindow = { x0: number; x1: number; y0: number; y1: number };

export type TerrainField = {
  cols: number;
  rows: number;
  seed: string;
  sea: number;
  warmth: number;
  wetness: number;
  mountains: number;
  scale: number;
  wrap: boolean;
  /** Plate recipe. Missing on older packs means Earthlike. */
  layout?: WorldLayout;
  level?: WorldLevel;
  breakup?: number;
  gap?: number;
  terrain: Uint8Array;
  height: Uint8Array;
  temp: Uint8Array;
  moist: Uint8Array;
  relief: Uint8Array;
  owner: Uint8Array;
  ownerIds: string[];
  hearths: HearthCell[];
  columns: ColumnCell[];
  gates: WorldGate[];
  realms: RealmStub[];
  known: KnownWindow;
  age: number;
  under: Uint8Array;
  sky: Uint8Array;
  /** 1 = revealed to players. Not an era rectangle. */
  seen: Uint8Array;
};

export type TerrainPack = {
  cols: number;
  rows: number;
  seed: string;
  sea: number;
  warmth?: number;
  wetness?: number;
  mountains?: number;
  scale?: number;
  wrap?: boolean;
  layout?: WorldLayout;
  level?: WorldLevel;
  breakup?: number;
  gap?: number;
  cells: string;
  height: string;
  temp?: string;
  moist?: string;
  relief?: string;
  owner: string;
  ownerIds: string[];
  hearths?: HearthCell[];
  columns?: ColumnCell[];
  gates?: WorldGate[];
  realms?: RealmStub[];
  known?: KnownWindow;
  age?: number;
  under?: string;
  sky?: string;
  seen?: string;
};

export type WorldGenInput = {
  sea?: number;
  warmth?: number;
  wetness?: number;
  mountains?: number;
  scale?: number;
  wrap?: boolean;
  layout?: WorldLayout;
  level?: WorldLevel;
  breakup?: number;
  gap?: number;
  mapWidth?: number;
  mapHeight?: number;
};

export type WorldLayout = "earthlike" | "continents" | "pangaea" | "archipelago" | "islands" | "theater";
export type WorldLevel = "compact" | "standard" | "scattered";

export const LAYOUT_RECIPES: Record<
  WorldLayout,
  {
    sea: number;
    warmth: number;
    wetness: number;
    mountains: number;
    scale: number;
    breakup: number;
    gap: number;
    wrap: boolean;
  }
> = {
  earthlike: { sea: 46, warmth: 50, wetness: 50, mountains: 42, scale: 58, breakup: 50, gap: 70, wrap: true },
  continents: { sea: 48, warmth: 50, wetness: 50, mountains: 40, scale: 48, breakup: 55, gap: 40, wrap: true },
  pangaea: { sea: 40, warmth: 50, wetness: 50, mountains: 48, scale: 78, breakup: 30, gap: 70, wrap: true },
  archipelago: { sea: 58, warmth: 50, wetness: 50, mountains: 22, scale: 30, breakup: 70, gap: 70, wrap: true },
  islands: { sea: 62, warmth: 50, wetness: 50, mountains: 12, scale: 22, breakup: 80, gap: 70, wrap: true },
  theater: { sea: 42, warmth: 50, wetness: 50, mountains: 36, scale: 70, breakup: 35, gap: 70, wrap: false },
};

export function breakupForLevel(base: number, level: WorldLevel): number {
  const d = level === "compact" ? -20 : level === "scattered" ? 20 : 0;
  return Math.max(0, Math.min(100, Math.round(base + d)));
}

export type GroundDraw = "terrain" | "climate" | "height" | "political";

const N8: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(rand: () => number) {
  const grid = new Float32Array(256 * 256);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  return function sample(x: number, y: number) {
    const x0 = Math.floor(x) & 255;
    const y0 = Math.floor(y) & 255;
    const tx = x - Math.floor(x);
    const ty = y - Math.floor(y);
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const i00 = y0 * 256 + x0;
    const i10 = y0 * 256 + ((x0 + 1) & 255);
    const i01 = ((y0 + 1) & 255) * 256 + x0;
    const i11 = ((y0 + 1) & 255) * 256 + ((x0 + 1) & 255);
    const a = grid[i00]! + (grid[i10]! - grid[i00]!) * sx;
    const b = grid[i01]! + (grid[i11]! - grid[i01]!) * sx;
    return a + (b - a) * sy;
  };
}

function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves: number) {
  let amp = 0.55;
  let sum = 0;
  let norm = 0;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return sum / norm;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function byte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function ridged(noise: (x: number, y: number) => number, x: number, y: number) {
  let amp = 1;
  let sum = 0;
  let norm = 0;
  let freq = 1;
  for (let o = 0; o < 4; o++) {
    let n = noise(x * freq, y * freq);
    n = 1 - Math.abs(n * 2 - 1);
    n *= n;
    sum += n * amp;
    norm += amp;
    amp *= 0.48;
    freq *= 2.2;
  }
  return sum / norm;
}

/** Seamless on X. `freq` is how many times the pattern turns around the cylinder. */
function cylinder(noise: (x: number, y: number) => number, ang: number, ny: number, freq: number, octaves: number) {
  const radius = 28 * Math.max(0.45, freq);
  const x = Math.cos(ang) * radius;
  const z = Math.sin(ang) * radius;
  return fbm(noise, x * 0.42 + 19, ny * freq * 5.5 + z * 0.28, octaves);
}

function coverOf(land: boolean, temp: number, moist: number, relief: number, ny: number, jag: number, cap = 0.5): number {
  if (!land) {
    const pole = Math.min(ny, 1 - ny);
    if (pole > 0.05) return 0;
    const lobe = Math.sin(cap * 17 + jag * 8) > -0.2;
    if (!lobe) return 0;
    if (pole < 0.016) return jag > 0.74 ? 0 : 16;
    if (pole < 0.046 && jag < 0.82) return 16;
    return 0;
  }
  if (relief === R_ICE) return 6;
  if (relief >= R_PEAK) return temp < 0.22 ? 6 : 5;
  if (relief >= R_RANGE) return temp < 0.18 ? 6 : 5;
  if (temp < 0.12) return relief >= R_HILL ? 6 : 15;
  if (relief === R_LOW && moist > 0.7 && temp > 0.32 && temp < 0.7) return 7;
  if (temp > 0.56 && moist < 0.32) return 8;
  if (temp > 0.48 && moist < 0.46) return 12;
  if (temp > 0.54 && moist > 0.54) return 13;
  if (temp < 0.36 && moist > 0.38) return 14;
  if (temp < 0.52 && moist < 0.42) return 11;
  if (moist > 0.46 && temp > 0.24 && temp < 0.74) return 3;
  return 2;
}

function reliefOf(land: boolean, h: number, shelf: boolean): number {
  if (!land) return shelf ? R_SHELF : R_OCEAN;
  if (h >= 214) return R_PEAK;
  if (h >= 172) return R_RANGE;
  if (h >= 140) return R_HILL;
  return R_LOW;
}

type CrustSeed = { x: number; y: number; vx: number; vy: number; polar: boolean; cap: number; stretch: number };
type PlateDrift = { x: number; y: number; vx: number; vy: number };

const CRUST_COLS = 360;
const CRUST_ROWS = 206;

function hpush(c: number[], i: number[], cost: number, index: number) {
  c.push(cost);
  i.push(index);
  let k = c.length - 1;
  while (k > 0) {
    const p = (k - 1) >> 1;
    if (c[p]! <= c[k]!) break;
    const tc = c[p]!;
    const ti = i[p]!;
    c[p] = c[k]!;
    i[p] = i[k]!;
    c[k] = tc;
    i[k] = ti;
    k = p;
  }
}

function hpop(c: number[], i: number[]): [number, number] | null {
  if (!c.length) return null;
  const cost = c[0]!;
  const index = i[0]!;
  const lc = c.pop()!;
  const li = i.pop()!;
  if (c.length) {
    c[0] = lc;
    i[0] = li;
    let k = 0;
    for (;;) {
      const l = k * 2 + 1;
      const r = l + 1;
      let m = k;
      if (l < c.length && c[l]! < c[m]!) m = l;
      if (r < c.length && c[r]! < c[m]!) m = r;
      if (m === k) break;
      const tc = c[k]!;
      const ti = i[k]!;
      c[k] = c[m]!;
      i[k] = i[m]!;
      c[m] = tc;
      i[m] = ti;
      k = m;
    }
  }
  return [cost, index];
}

function neighborVote(plate: Int16Array, x: number, y: number, wc: number, wr: number, wrap: boolean) {
  let oceanN = 0;
  let landN = 0;
  let vote = -1;
  let voteN = 0;
  const tally = new Int16Array(12);
  for (const [dx, dy] of N8) {
    const ny = y + dy;
    if (ny < 0 || ny >= wr) continue;
    let nx = x + dx;
    if (wrap) nx = (nx + wc) % wc;
    else if (nx < 0 || nx >= wc) continue;
    const p = plate[ny * wc + nx]!;
    if (p < 0) oceanN += 1;
    else {
      landN += 1;
      const id = p < tally.length ? p : 0;
      const c = tally[id]! + 1;
      tally[id] = c;
      if (c > voteN) {
        voteN = c;
        vote = p;
      }
    }
  }
  return { oceanN, landN, vote };
}

function paintNamedBelts(chewed: Int16Array, wc: number, wr: number, layout: WorldLayout = "earthlike"): Float32Array {
  const belt = new Float32Array(wc * wr);
  const pass = new Uint8Array(wc * wr);
  if (layout === "archipelago" || layout === "islands") return belt;
  const split = layout === "earthlike";
  const midLat = (y: number) => {
    if (y < 0 || y >= wr) return false;
    const ny = (y + 0.5) / wr;
    return Math.min(ny, 1 - ny) >= 0.1;
  };
  const inHemi = (x: number, hemi: "ow" | "nw") => {
    if (!split) return true;
    const nx = x / wc;
    return hemi === "ow" ? nx >= 0.02 && nx <= 0.5 : nx >= 0.58 && nx <= 0.98;
  };
  const landAt = (x: number, y: number, hemi: "ow" | "nw") =>
    midLat(y) && inHemi(x, hemi) && chewed[y * wc + x]! >= 0;

  const nearestLand = (x: number, y: number, hemi: "ow" | "nw", rad: number) => {
    const x0 = Math.round(x);
    const y0 = Math.round(y);
    if (landAt(x0, y0, hemi)) return { x: x0, y: y0 };
    let best: { x: number; y: number } | null = null;
    let bestD = 1e9;
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        const xx = x0 + dx;
        const yy = y0 + dy;
        if (xx < 0 || xx >= wc || !landAt(xx, yy, hemi)) continue;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = { x: xx, y: yy };
        }
      }
    }
    return best;
  };

  const bbox = (hemi: "ow" | "nw") => {
    let minX = wc;
    let maxX = 0;
    let minY = wr;
    let maxY = 0;
    let n = 0;
    let sx = 0;
    let sy = 0;
    for (let y = 0; y < wr; y++) {
      for (let x = 0; x < wc; x++) {
        if (!landAt(x, y, hemi)) continue;
        n += 1;
        sx += x;
        sy += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (n < 80) return null;
    return { minX, maxX, minY, maxY, n, cx: sx / n, cy: sy / n };
  };

  const stamp = (x: number, y: number, hemi: "ow" | "nw", asPass: boolean, t = 0.5) => {
    const waist = asPass ? 1 : 0.62 + Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 0.32;
    const spineR = 1.05 * waist;
    const rangeR = 3.2 * waist;
    const hillR = 5.1 * waist;
    const r = Math.ceil(asPass ? 2.4 : hillR);
    for (let dy = -r; dy <= r; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= wr || !midLat(yy)) continue;
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= wc || !inHemi(xx, hemi)) continue;
        if (chewed[yy * wc + xx]! < 0) continue;
        const d = Math.hypot(dx, dy);
        const j = yy * wc + xx;
        if (asPass) {
          if (d <= 2.4) pass[j] = 1;
          if (belt[j]! < 0.38) belt[j] = 0.38;
          continue;
        }
        let v = 0;
        if (d <= spineR) v = 1;
        else if (d <= rangeR) v = 0.65;
        else if (d <= hillR) v = 0.38;
        if (v > belt[j]!) belt[j] = v;
      }
    }
  };

  const box = bbox("ow");
  if (box) {
    const spanX = Math.max(8, box.maxX - box.minX);
    const spanY = Math.max(8, box.maxY - box.minY);
    const snap = (fx: number, fy: number) => {
      const tx = box.minX + spanX * fx;
      const ty = box.minY + spanY * fy;
      let best: { x: number; y: number } | null = null;
      let bestD = 1e9;
      for (let y = box.minY; y <= box.maxY; y++) {
        for (let x = box.minX; x <= box.maxX; x++) {
          if (!landAt(x, y, "ow")) continue;
          const d = (x - tx) * (x - tx) + (y - ty) * (y - ty);
          if (d < bestD) {
            bestD = d;
            best = { x, y };
          }
        }
      }
      return best;
    };
    const a = snap(0.18, 0.28);
    const b = snap(0.82, 0.74);
    if (a && b) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;
      const bow = box.cx + box.cy * 0.17 > wc * 0.22 ? 0.2 : -0.2;
      const cx = (a.x + b.x) / 2 + px * spanX * bow;
      const cy = (a.y + b.y) / 2 + py * spanY * bow * 0.55;
      const steps = Math.max(16, Math.ceil(len * 1.2));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const u = 1 - t;
        const x = u * u * a.x + 2 * u * t * cx + t * t * b.x;
        const y = u * u * a.y + 2 * u * t * cy + t * t * b.y;
        const wob = Math.sin(t * Math.PI * 2.6) * 2.8;
        const hit = nearestLand(x + px * wob, y + py * wob, "ow", 14);
        if (!hit) continue;
        stamp(hit.x, hit.y, "ow", t > 0.5 && t < 0.57, t);
      }
    }
  }

  const neu = split ? bbox("nw") : null;
  if (neu) {
    for (let y = neu.minY; y <= neu.maxY; y++) {
      if (!midLat(y)) continue;
      let west = -1;
      let east = -1;
      for (let x = neu.minX; x <= neu.maxX; x++) {
        if (!landAt(x, y, "nw")) continue;
        if (west < 0) west = x;
        east = x;
      }
      if (west < 0 || east - west < 8) continue;
      const wob = Math.sin(y * 0.19) * 3.1 + Math.sin(y * 0.061 + 0.7) * 4.2;
      const sx = Math.min(east - 3, Math.max(west + 2, Math.round(west + 6 + wob)));
      const hit = nearestLand(sx, y, "nw", 4);
      if (!hit) continue;
      const span = Math.max(1, neu.maxY - neu.minY);
      stamp(hit.x, hit.y, "nw", false, (y - neu.minY) / span);
    }
  }

  for (let i = 0; i < belt.length; i++) if (pass[i] && belt[i]! > 0.38) belt[i] = 0.38;
  return belt;
}

/** Solid plates at table grain, then the same mask on any play size. */
type CrustJob = {
  layout: WorldLayout;
  breakup: number;
  gap: number;
  mountains: number;
  crumbRand: () => number;
  ridgeRand: () => number;
};

function sprinkleCrumbs(chewed: Int16Array, wc: number, wr: number, rand: () => number, many: boolean) {
  const stamp = (cx: number, cy: number, r: number) => {
    for (let dy = -r; dy <= r; dy++) {
      const y = cy + dy;
      if (y < 2 || y >= wr - 2) continue;
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const x = cx + dx;
        if (x < 1 || x >= wc - 1) continue;
        const j = y * wc + x;
        if (chewed[j]! >= 0) continue;
        let touch = false;
        for (const [ox, oy] of N8) {
          const yy = y + oy;
          const xx = x + ox;
          if (yy < 0 || yy >= wr || xx < 0 || xx >= wc) continue;
          if (chewed[yy * wc + xx]! >= 0) touch = true;
        }
        if (touch) continue;
        chewed[j] = 6;
      }
    }
  };
  const disks = many ? 8 : 5;
  for (let k = 0; k < disks; k++) {
    const x = Math.floor(wc * (0.505 + rand() * 0.065));
    const y = Math.floor(wr * (0.28 + rand() * 0.44));
    stamp(x, y, rand() < 0.35 ? 2 : 1);
  }
  const y0 = Math.floor(wr * (0.38 + rand() * 0.18));
  const x0 = Math.floor(wc * (0.512 + rand() * 0.02));
  for (let s = 0; s < 6; s++) stamp(x0 + s * 2, y0 + Math.round(Math.sin(s * 0.9) * 1.4), 1);
}

function paintLesserRidge(belt: Float32Array, plate: Int16Array, cols: number, rows: number, rand: () => number) {
  let sx = -1;
  let sy = -1;
  for (let attempt = 0; attempt < 48; attempt++) {
    const x = Math.floor(rand() * cols);
    const y = Math.floor(rows * (0.18 + rand() * 0.64));
    const i = y * cols + x;
    if (plate[i]! < 0 || belt[i]! > 0.2) continue;
    sx = x;
    sy = y;
    break;
  }
  if (sx < 0) return;
  const len = 16 + Math.floor(rand() * 14);
  const dir = rand() * Math.PI * 2;
  for (let s = 0; s < len; s++) {
    const t = len <= 1 ? 0.5 : s / (len - 1);
    const waist = 0.55 + Math.sin(t * Math.PI) * 0.45;
    const x = Math.round(sx + Math.cos(dir) * s * 1.35);
    const y = Math.round(sy + Math.sin(dir) * s * 1.05);
    const rad = 1.2 + waist * 1.6;
    const v = Math.min(0.7, 0.42 + waist * 0.28);
    const r = Math.ceil(rad);
    for (let dy = -r; dy <= r; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= rows) continue;
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > rad * rad) continue;
        const xx = x + dx;
        if (xx < 0 || xx >= cols) continue;
        const j = yy * cols + xx;
        if (plate[j]! < 0) continue;
        if (v > belt[j]!) belt[j] = v;
      }
    }
  }
}

function raiseCrust(
  cols: number,
  rows: number,
  wrap: boolean,
  landFrac: number,
  scale: number,
  rand: () => number,
  elevN: (x: number, y: number) => number,
  warpN: (x: number, y: number) => number,
  warpN2: (x: number, y: number) => number,
  aspect: number,
  job?: CrustJob,
): { plate: Int16Array; drift: PlateDrift[]; belt: Float32Array } {
  void aspect;
  const wc = CRUST_COLS;
  const wr = CRUST_ROWS;
  const wn = wc * wr;
  const count = 3 + Math.round(((100 - scale) / 100) * 2);
  const stretches = [1.72, 2.45, 1.5, 2.65, 1.88];
  const seeds: CrustSeed[] = [];
  type Lobe = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    along: number;
    cross: number;
    id: number;
    polar: boolean;
  };
  const lobes: Lobe[] = [];
  const necks: { ax: number; ay: number; bx: number; by: number; id: number; rad: number }[] = [];
  const place = (lobe: Lobe) => {
    if (wrap) lobe.x = ((lobe.x % wc) + wc) % wc;
    else lobe.x = Math.max(6, Math.min(wc - 7, lobe.x));
    lobe.y = Math.max(3, Math.min(wr - 4, lobe.y));
    lobes.push(lobe);
    return lobe;
  };
  const layout = job?.layout ?? "earthlike";
  const breakupN = job?.breakup ?? 50;
  const gapN = job?.gap ?? 70;
  const sizeK = scale === 58 ? 1 : 0.55 + scale / 100;
  const placed: { x: number; y: number; id: number }[] = [];
  const mass = (nx: number, ny: number, along0: number, cross0: number, id: number, hooked: boolean) => {
    const dir = rand() * Math.PI * 2;
    const vx = Math.cos(dir);
    const vy = Math.sin(dir);
    const along = sizeK === 1 ? along0 : along0 * sizeK;
    const cross = Math.max(8, sizeK === 1 ? cross0 : cross0 * sizeK);
    seeds.push({ x: nx, y: ny, vx, vy, polar: false, cap: wn, stretch: Math.max(1.05, along / cross) });
    const primary = place({ x: nx * wc, y: ny * wr, vx, vy, along, cross, id, polar: false });
    placed.push({ x: primary.x, y: primary.y, id });
    if (!hooked) return;
    const side = rand() < 0.5 ? 1 : -1;
    const hook = 0.62 + rand() * 0.5;
    const off = along * (0.42 + rand() * 0.16);
    const hx = Math.cos(dir + side * hook);
    const hy = Math.sin(dir + side * hook);
    const cross2 = Math.max(10, cross * (0.7 + rand() * 0.2));
    const secondary = place({
      x: nx * wc + hx * off,
      y: ny * wr + hy * off,
      vx: hx,
      vy: hy,
      along: along * (0.5 + rand() * 0.16),
      cross: cross2,
      id,
      polar: false,
    });
    let rad = Math.max(8, Math.min(cross, cross2) * 0.42);
    if (breakupN !== 50) rad *= Math.max(0.4, 1 - (breakupN - 50) * 0.012);
    necks.push({ ax: primary.x, ay: primary.y, bx: secondary.x, by: secondary.y, id, rad });
  };
  if (layout === "earthlike") {
    const nOw = Math.min(3, Math.max(2, count - 1));
    const nNw = Math.max(1, count - nOw);
    let ow0 = 0.08;
    let ow1 = 0.4;
    let nw0 = 0.64;
    let nw1 = 0.9;
    if (gapN !== 70) {
      const half = 0.12 * (gapN / 70);
      const mid = 0.52;
      ow1 = Math.max(0.2, Math.min(0.46, mid - half));
      nw0 = Math.max(0.54, Math.min(0.8, mid + half));
    }
    const bands = [
      { x0: ow0, x1: ow1, n: nOw },
      { x0: nw0, x1: nw1, n: nNw },
    ];
    for (const band of bands) {
      for (let k = 0; k < band.n; k++) {
        const s = seeds.length;
        const x = band.x0 + ((k + 0.42 + (rand() - 0.5) * 0.18) / band.n) * (band.x1 - band.x0);
        const y = band.n > 1 && k === band.n - 1 ? 0.36 + rand() * 0.22 : 0.3 + rand() * 0.28;
        const dir = rand() * Math.PI * 2;
        const vx = Math.cos(dir);
        const vy = Math.sin(dir);
        const stretch = stretches[s] ?? 1.8;
        let along = 74 + rand() * 28;
        let cross = Math.max(28, along / stretch);
        if (scale !== 58) {
          along *= sizeK;
          cross = Math.max(16, cross * sizeK);
        }
        seeds.push({ x, y, vx, vy, polar: false, cap: wn, stretch });
        const primary = place({ x: x * wc, y: y * wr, vx, vy, along, cross, id: s, polar: false });
        const side = rand() < 0.5 ? 1 : -1;
        const hook = 0.62 + rand() * 0.5;
        const off = along * (0.46 + rand() * 0.12);
        const hx = Math.cos(dir + side * hook);
        const hy = Math.sin(dir + side * hook);
        const cross2 = Math.max(24, cross * (0.82 + rand() * 0.12));
        const secondary = place({
          x: x * wc + hx * off,
          y: y * wr + hy * off,
          vx: hx,
          vy: hy,
          along: along * (0.58 + rand() * 0.14),
          cross: cross2,
          id: s,
          polar: false,
        });
        let rad = Math.max(14, Math.min(cross, cross2) * 0.46);
        if (breakupN !== 50) rad *= Math.max(0.42, 1 - (breakupN - 50) * 0.012);
        necks.push({
          ax: primary.x,
          ay: primary.y,
          bx: secondary.x,
          by: secondary.y,
          id: s,
          rad,
        });
        placed.push({ x: primary.x, y: primary.y, id: s });
      }
    }
    for (let a = 0; a < placed.length; a++) {
      for (let b = a + 1; b < placed.length; b++) {
        const A = placed[a]!;
        const B = placed[b]!;
        const ax = A.x / wc;
        const bx = B.x / wc;
        const old = ax < 0.5 && bx < 0.5;
        const neu = ax > 0.55 && bx > 0.55;
        if (!old && !neu) continue;
        let dx = B.x - A.x;
        if (wrap) {
          if (dx > wc * 0.5) dx -= wc;
          else if (dx < -wc * 0.5) dx += wc;
        }
        const dy = B.y - A.y;
        if (Math.hypot(dx, dy) > wc * 0.22) continue;
        let link = 11;
        if (breakupN !== 50) link *= Math.max(0.42, 1 - (breakupN - 50) * 0.012);
        necks.push({ ax: A.x, ay: A.y, bx: B.x, by: B.y, id: A.id, rad: link });
      }
    }
  } else if (layout === "pangaea") {
    const x = 0.38 + rand() * 0.08;
    const y = 0.46 + rand() * 0.06;
    mass(x, y, 132 + rand() * 22, 72 + rand() * 10, 0, true);
  } else if (layout === "continents") {
    let n = 4;
    if (breakupN >= 68) n = 5;
    else if (breakupN <= 34) n = 3;
    if (scale >= 80) n = Math.max(3, n - 1);
    if (scale <= 28) n = Math.min(5, n + 1);
    const gutter = 0.02 + (gapN / 100) * 0.07;
    for (let k = 0; k < n; k++) {
      const x = Math.max(0.07, Math.min(0.93, 0.06 + ((k + 0.5) / n) * 0.88 + (rand() - 0.5) * gutter));
      const y = 0.3 + rand() * 0.28;
      const along = 44 + rand() * 26;
      mass(x, y, along, Math.max(20, along / 2.2), k, breakupN < 62);
    }
  } else if (layout === "archipelago") {
    const n = Math.max(8, Math.min(16, 8 + Math.round((100 - scale) / 16) + Math.round((breakupN - 40) / 22)));
    for (let k = 0; k < n; k++) {
      const along = 13 + rand() * 15;
      mass(0.06 + rand() * 0.88, 0.14 + rand() * 0.7, along, Math.max(8, along * (0.42 + rand() * 0.28)), k, rand() < 0.22);
    }
  } else if (layout === "islands") {
    const n = Math.max(10, Math.min(20, 11 + Math.round(breakupN / 14)));
    for (let k = 0; k < n; k++) {
      const big = k === 0;
      const along = big ? 32 + rand() * 14 : 6 + rand() * 8;
      mass(0.07 + rand() * 0.86, 0.12 + rand() * 0.74, along, Math.max(5, along * (big ? 0.52 : 0.62)), k, big);
    }
  } else {
    mass(0.5 + (rand() - 0.5) * 0.05, 0.47 + (rand() - 0.5) * 0.05, 148 + rand() * 18, 76 + rand() * 10, 0, true);
  }
  const polarY = rand() < 0.5 ? 0.035 : 0.965;
  const pdir = rand() * Math.PI * 2;
  const polar: CrustSeed = {
    x: rand(),
    y: polarY,
    vx: Math.cos(pdir),
    vy: Math.sin(pdir),
    polar: true,
    cap: Math.max(6, Math.round(wn * 0.008)),
    stretch: 1.12,
  };
  seeds.push(polar);
  place({
    x: polar.x * wc,
    y: polar.y * wr,
    vx: polar.vx,
    vy: polar.vy,
    along: 14 + rand() * 8,
    cross: 11,
    id: seeds.length - 1,
    polar: true,
  });

  const score = new Float32Array(wn);
  const who = new Int16Array(wn).fill(-1);
  for (let y = 0; y < wr; y++) {
    const ny = (y + 0.5) / wr;
    const pole = Math.min(ny, 1 - ny);
    const latCos = Math.max(0.28, Math.cos((ny - 0.5) * Math.PI));
    for (let x = 0; x < wc; x++) {
      const i = y * wc + x;
      const ang = (x / wc) * Math.PI * 2;
      const broad = cylinder(elevN, ang, ny, 0.55, 2);
      const edge = cylinder(warpN, ang + 1.15, ny, 6.2, 2);
      const wob = (edge - 0.5) * 0.3 + (broad - 0.5) * 0.16;
      let best = 0;
      let id = -1;
      for (let L = 0; L < lobes.length; L++) {
        const lobe = lobes[L]!;
        if (lobe.polar && pole > 0.09) continue;
        let dx = x + 0.5 - lobe.x;
        if (wrap) {
          if (dx > wc * 0.5) dx -= wc;
          else if (dx < -wc * 0.5) dx += wc;
        }
        if (!lobe.polar) dx /= latCos;
        const dy = y + 0.5 - lobe.y;
        const along = dx * lobe.vx + dy * lobe.vy;
        const cross = -dx * lobe.vy + dy * lobe.vx;
        let d = Math.hypot(along / lobe.along, cross / lobe.cross) - (lobe.polar ? wob * 0.25 : wob);
        if (!lobe.polar && pole < 0.16) d += (0.16 - pole) * 2.6;
        const inf = d >= 1.14 ? 0 : d <= 0.12 ? 1 : (1.14 - d) / 1.02;
        if (inf > best) {
          best = inf;
          id = lobe.id;
        }
      }
      score[i] = best;
      who[i] = id;
    }
  }

  const ranked: number[] = [];
  for (let i = 0; i < wn; i++) {
    const id = who[i]!;
    if (id >= 0 && !seeds[id]!.polar && score[i]! > 0.05) ranked.push(score[i]!);
  }
  ranked.sort((a, b) => b - a);
  const take = Math.max(8, Math.round(wn * landFrac));
  const cut = ranked[Math.min(ranked.length, take) - 1] ?? 0.45;
  const plate = new Int16Array(wn).fill(-1);
  const polarId = seeds.length - 1;
  const polarPick: number[] = [];
  for (let i = 0; i < wn; i++) {
    const id = who[i]!;
    if (id < 0) continue;
    if (id === polarId) {
      if (score[i]! >= 0.52) polarPick.push(i);
      continue;
    }
    if (score[i]! >= cut) plate[i] = id;
  }
  polarPick.sort((a, b) => score[b]! - score[a]!);
  const polarCap = seeds[polarId]!.cap;
  for (let k = 0; k < polarPick.length && k < polarCap; k++) plate[polarPick[k]!] = polarId;

  for (const neck of necks) {
    let dx = neck.bx - neck.ax;
    if (wrap) {
      if (dx > wc * 0.5) dx -= wc;
      else if (dx < -wc * 0.5) dx += wc;
    }
    const dy = neck.by - neck.ay;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
    const r = Math.ceil(neck.rad);
    for (let s = 0; s <= steps; s++) {
      const px = neck.ax + (dx * s) / steps;
      const py = neck.ay + (dy * s) / steps;
      for (let oy = -r; oy <= r; oy++) {
        const y = Math.round(py + oy);
        if (y < 2 || y >= wr - 2) continue;
        for (let ox = -r; ox <= r; ox++) {
          if (ox * ox + oy * oy > neck.rad * neck.rad) continue;
          let x = Math.round(px + ox);
          if (wrap) x = ((x % wc) + wc) % wc;
          else if (x < 0 || x >= wc) continue;
          const ny = (y + 0.5) / wr;
          if (Math.min(ny, 1 - ny) < 0.08) continue;
          plate[y * wc + x] = neck.id;
        }
      }
    }
  }

  const bent = new Int16Array(wn).fill(-1);
  const ampX = 10;
  const ampY = 6;
  for (let y = 0; y < wr; y++) {
    const ny = y / wr;
    for (let x = 0; x < wc; x++) {
      const ang = (x / wc) * Math.PI * 2;
      const wx = (cylinder(warpN, ang, ny, 0.62, 2) - 0.5) * 2 * ampX;
      const wy = (cylinder(warpN2, ang + 0.9, ny, 0.5, 2) - 0.5) * 2 * ampY;
      let sx = Math.round(x + wx);
      let sy = Math.round(y + wy);
      if (wrap) sx = ((sx % wc) + wc) % wc;
      else sx = Math.max(0, Math.min(wc - 1, sx));
      sy = Math.max(0, Math.min(wr - 1, sy));
      bent[y * wc + x] = plate[sy * wc + sx]!;
    }
  }

  const specks = new Int16Array(bent);
  for (let y = 0; y < wr; y++) {
    for (let x = 0; x < wc; x++) {
      const i = y * wc + x;
      const nb = neighborVote(bent, x, y, wc, wr, wrap);
      if (bent[i]! >= 0 && nb.oceanN >= 7) specks[i] = -1;
      else if (bent[i]! < 0 && nb.landN >= 7) specks[i] = nb.vote;
    }
  }

  const coast = new Float32Array(wn);
  for (let y = 0; y < wr; y++) {
    const ny = y / wr;
    for (let x = 0; x < wc; x++) {
      coast[y * wc + x] = cylinder(warpN, (x / wc) * Math.PI * 2 + 1.7, ny, 2.7, 3);
    }
  }
  const landD = new Uint8Array(wn);
  const seaD = new Uint8Array(wn);
  const qL: number[] = [];
  const qS: number[] = [];
  for (let y = 0; y < wr; y++) {
    for (let x = 0; x < wc; x++) {
      const i = y * wc + x;
      const nb = neighborVote(specks, x, y, wc, wr, wrap);
      if (specks[i]! >= 0 && nb.oceanN > 0) {
        landD[i] = 1;
        qL.push(i);
      } else if (specks[i]! < 0 && nb.landN > 0) {
        seaD[i] = 1;
        qS.push(i);
      }
    }
  }
  const growDist = (dist: Uint8Array, q: number[], limit: number, onLand: boolean) => {
    for (let k = 0; k < q.length; k++) {
      const i = q[k]!;
      const d = dist[i]!;
      if (d >= limit) continue;
      const y = (i / wc) | 0;
      const x = i - y * wc;
      for (const [dx, dy] of N8) {
        const ny = y + dy;
        if (ny < 0 || ny >= wr) continue;
        let nx = x + dx;
        if (wrap) nx = (nx + wc) % wc;
        else if (nx < 0 || nx >= wc) continue;
        const j = ny * wc + nx;
        if (dist[j]) continue;
        if (onLand ? specks[j]! < 0 : specks[j]! >= 0) continue;
        dist[j] = d + 1;
        q.push(j);
      }
    }
  };
  growDist(landD, qL, 3, true);
  growDist(seaD, qS, 2, false);
  const chewed = new Int16Array(specks);
  const chewCut = breakupN === 50 ? 0.26 : Math.max(0.16, Math.min(0.5, 0.26 + (breakupN - 50) * 0.0032));
  for (let y = 0; y < wr; y++) {
    for (let x = 0; x < wc; x++) {
      const i = y * wc + x;
      const nb = neighborVote(specks, x, y, wc, wr, wrap);
      const nse = coast[i]!;
      if (specks[i]! >= 0 && landD[i]! > 0 && landD[i]! <= 2 && nb.oceanN > 0 && nse < chewCut) chewed[i] = -1;
      else if (specks[i]! < 0 && seaD[i] === 1 && nb.landN >= 3 && nse > 0.86) chewed[i] = nb.vote;
    }
  }
  if (layout === "earthlike" && job) sprinkleCrumbs(chewed, wc, wr, job.crumbRand, breakupN >= 68);

  const beltC = paintNamedBelts(chewed, wc, wr, layout);
  const drift: PlateDrift[] = [];

  const out = new Int16Array(cols * rows).fill(-1);
  const belt = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    const sy = Math.max(0, Math.min(wr - 1, Math.floor(((y + 0.5) / rows) * wr)));
    for (let x = 0; x < cols; x++) {
      let sx = Math.floor(((x + 0.5) / cols) * wc);
      if (wrap) sx = ((sx % wc) + wc) % wc;
      else sx = Math.max(0, Math.min(wc - 1, sx));
      const si = sy * wc + sx;
      out[y * cols + x] = chewed[si]!;
      belt[y * cols + x] = beltC[si]!;
    }
  }

  if (cols > wc + 8) {
    const next = new Int16Array(out);
    for (let y = 0; y < rows; y++) {
      const ny = y / rows;
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const nb = neighborVote(out, x, y, cols, rows, wrap);
        const nse = cylinder(warpN, (x / cols) * Math.PI * 2 + 2.4, ny, 3.3, 2);
        if (out[i]! >= 0 && nb.oceanN >= 1 && nb.oceanN <= 5 && nse < 0.2) next[i] = -1;
        else if (out[i]! < 0 && nb.landN >= 4 && nse > 0.9) next[i] = nb.vote;
      }
    }
    out.set(next);
    for (let i = 0; i < out.length; i++) if (out[i]! < 0) belt[i] = 0;
  }

  const mountains = job?.mountains ?? 42;
  if (mountains < 12) belt.fill(0);
  else if (mountains > 78 && job) paintLesserRidge(belt, out, cols, rows, job.ridgeRand);

  return { plate: out, drift, belt };
}

function shelfPlan(
  x: number,
  y: number,
  cols: number,
  rows: number,
  landMask: Uint8Array,
  jag: number,
  layout: WorldLayout,
  wrap: boolean,
): { reach: number; trench: boolean } {
  let lx = x;
  let best = 1e9;
  for (let dy = -8; dy <= 8; dy++) {
    const yy = y + dy;
    if (yy < 0 || yy >= rows) continue;
    for (let dx = -8; dx <= 8; dx++) {
      let xx = x + dx;
      if (wrap) xx = (xx + cols) % cols;
      else if (xx < 0 || xx >= cols) continue;
      if (!landMask[yy * cols + xx]) continue;
      const d = dx * dx + dy * dy;
      if (d < best) {
        best = d;
        lx = xx;
      }
    }
  }
  if (best > 64) return { reach: 1, trench: false };
  const onx = x / cols;
  const lnx = lx / cols;
  const inGap = onx >= 0.47 && onx <= 0.61;
  let active = layout === "earthlike" ? (lnx < 0.52 ? x >= lx : x <= lx) : x >= lx;
  if (inGap && (layout === "earthlike" || layout === "continents")) active = true;
  if (active) return { reach: jag < 0.18 ? 0 : 1, trench: true };
  const wide = 3 + Math.floor(Math.min(0.999, jag) * 6);
  const reach = jag < 0.36 ? Math.min(wide, 3) : wide;
  return { reach, trench: false };
}

function paintRainShadow(
  moistF: Float32Array,
  tempF: Float32Array,
  belt: Float32Array,
  landMask: Uint8Array,
  cols: number,
  rows: number,
  wrap: boolean,
  wetness: number,
) {
  const wetPush = (wetness - 50) / 50;
  const look = (x: number, y: number, dir: number, limit: number) => {
    for (let d = 1; d <= limit; d++) {
      let xx = x + dir * d;
      if (wrap) xx = (xx + cols) % cols;
      else if (xx < 0 || xx >= cols) return false;
      if (belt[y * cols + xx]! >= 0.6) return true;
    }
    return false;
  };
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (!landMask[i] || belt[i]! >= 0.3) continue;
      const west = look(x, y, -1, 12);
      const east = look(x, y, 1, 12);
      if (west && !east) {
        const near = look(x, y, -1, 6);
        const hotCap = near ? 0.29 : Math.min(0.4, 0.33 + Math.max(0, wetPush) * 0.06);
        const cap = tempF[i]! > 0.56 ? Math.min(0.38, hotCap) : 0.4;
        moistF[i] = Math.min(moistF[i]!, cap);
      } else if (east && !west) {
        moistF[i] = wetness < 36 ? Math.min(moistF[i]!, 0.3) : Math.min(0.92, moistF[i]! + 0.07);
      }
    }
  }
}

export function generateTerrain(seed: string, sea = 46, extra?: WorldGenInput): TerrainField {
  const sized = gridForMap(extra?.mapWidth ?? 6145, extra?.mapHeight ?? 3530);
  const cols = sized.cols;
  const rows = sized.rows;
  const n = cols * rows;
  const aspect = sized.width / sized.height;
  const warmth = clampByte(extra?.warmth ?? 50);
  const wetness = clampByte(extra?.wetness ?? 50);
  const mountains = clampByte(extra?.mountains ?? 42);
  const scale = clampByte(extra?.scale ?? 58);
  const wrap = extra?.wrap !== false;
  const layout: WorldLayout = extra?.layout ?? "earthlike";
  const level: WorldLevel = extra?.level ?? "standard";
  const breakup = clampByte(extra?.breakup ?? 50);
  const gap = clampByte(extra?.gap ?? 70);
  const warmK = 0.78 + ((warmth - 50) / 50) * 0.28;
  const wetK = 0.84 + ((wetness - 50) / 50) * 0.4;
  const mtnK = 0.55 + (mountains / 100) * 0.9;
  let landFrac = Math.max(0.2, Math.min(0.42, 0.3 - (sea - 46) * 0.0045));
  if (layout === "pangaea") landFrac = Math.min(0.55, landFrac + 0.12);
  else if (layout === "islands") landFrac = Math.min(0.14, landFrac);
  else if (layout === "archipelago") landFrac = Math.min(0.22, landFrac);
  else if (layout === "theater") landFrac = Math.min(0.58, Math.max(0.5, landFrac + 0.2));
  else if (layout === "continents") landFrac = Math.min(0.48, landFrac + 0.04);

  const base = hashSeed(seed || "inkunzi");
  const elevN = makeNoise(mulberry32(base));
  const moistN = makeNoise(mulberry32(base ^ 0x9e3779b9));
  const warpN = makeNoise(mulberry32(base ^ 0x85ebca6b));
  const warpN2 = makeNoise(mulberry32(base ^ 0xc2b2ae35));
  const ridgeN = makeNoise(mulberry32(base ^ 0x27d4eb2f));
  const rand = mulberry32(base ^ 0x165667b1);

  const crust = raiseCrust(cols, rows, wrap, landFrac, scale, rand, elevN, warpN, warpN2, aspect, {
    layout,
    breakup,
    gap,
    mountains,
    crumbRand: mulberry32(base ^ 0x5bd1e995),
    ridgeRand: mulberry32(base ^ 0x51ed1b73),
  });
  const plateW = crust.plate;
  const belt = crust.belt;

  const jag = new Float32Array(n);
  for (let y = 0; y < rows; y++) {
    const ny = y / rows;
    for (let x = 0; x < cols; x++) {
      jag[y * cols + x] = cylinder(warpN, (x / cols) * Math.PI * 2 + 0.7, ny, 2.4, 3);
    }
  }

  const landMask = new Uint8Array(n);
  for (let i = 0; i < n; i++) landMask[i] = plateW[i]! >= 0 ? 1 : 0;


  const height = new Uint8Array(n);
  const oceanNear = new Uint8Array(n);
  const shelfLim = new Uint8Array(n);
  const q: number[] = [];
  for (let i = 0; i < n; i++) {
    if (landMask[i]) continue;
    let shore = false;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    for (const [dx, dy] of N8) {
      const ny = y + dy;
      if (ny < 0 || ny >= rows) continue;
      let nx = x + dx;
      if (wrap) nx = (nx + cols) % cols;
      else if (nx < 0 || nx >= cols) continue;
      if (landMask[ny * cols + nx]) shore = true;
    }
    if (shore) {
      oceanNear[i] = 1;
      q.push(i);
    }
  }
  for (let k = 0; k < q.length; k++) {
    const i = q[k]!;
    const d = oceanNear[i]!;
    if (d >= 8) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    for (const [dx, dy] of N8) {
      const ny = y + dy;
      if (ny < 0 || ny >= rows) continue;
      let nx = x + dx;
      if (wrap) nx = (nx + cols) % cols;
      else if (nx < 0 || nx >= cols) continue;
      const j = ny * cols + nx;
      if (landMask[j] || oceanNear[j]) continue;
      oceanNear[j] = d + 1;
      q.push(j);
    }
  }

  for (let y = 0; y < rows; y++) {
    const ny = y / rows;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const ang = (x / cols) * Math.PI * 2;
      if (!landMask[i]) {
        const near = oceanNear[i]!;
        const deep = 30 + jag[i]! * 22;
        if (near > 0) {
          const plan = shelfPlan(x, y, cols, rows, landMask, jag[i]!, layout, wrap);
          shelfLim[i] = plan.reach;
          if (plan.reach > 0 && near <= plan.reach) height[i] = 84 - Math.min(near, 7) * 5;
          else if (plan.trench && near === plan.reach + 1) height[i] = byte(Math.max(8, deep * 0.62));
          else height[i] = byte(deep);
        } else height[i] = byte(deep);
        continue;
      }
      const gx = x / cols;
      const gy = y / rows;
      const detail = cylinder(warpN2, ang, ny, 1.3, 2);
      const along = ridged(ridgeN, gx * 18, gy * 10);
      const b = belt[i]!;
      let h = 118 + (detail - 0.5) * 8;
      if (b >= 0.95) h = 216 + along * 16 * mtnK;
      else if (b >= 0.6) h = 180 + along * 20;
      else if (b >= 0.3) h = 146 + (detail - 0.45) * 14;
      const pole = Math.min(ny, 1 - ny);
      if (pole < 0.06) h += (0.06 - pole) * 30;
      height[i] = byte(Math.max(112, Math.min(244, h)));
    }
  }
  if (layout === "earthlike") {
    const trenchR = mulberry32(base ^ 0xa11ce);
    const ty = Math.floor(rows * (0.42 + trenchR() * 0.16));
    const tx = Math.floor(cols * (0.505 + trenchR() * 0.04));
    for (let s = 0; s < 8; s++) {
      const xx = Math.min(cols - 1, tx + s);
      const i = ty * cols + xx;
      if (landMask[i] || shelfLim[i]) continue;
      height[i] = Math.max(6, (height[i] ?? 30) - 16);
    }
  }
  softenHeight(height, cols, rows, wrap, belt);
  clampLandHistogram(height, landMask, belt);
  const rises = stampRises(height, landMask, belt, cols, rows, rand);

  const terrain = new Uint8Array(n);
  const relief = new Uint8Array(n);
  const tempA = new Uint8Array(n);
  const moistA = new Uint8Array(n);
  const tempF = new Float32Array(n);
  const prior = new Float32Array(n);
  for (let y = 0; y < rows; y++) {
    const ny = y / rows;
    const lat = Math.abs(ny - 0.5) * 2;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const ang = (x / cols) * Math.PI * 2;
      const here = height[i]! / 255;
      const lon = cylinder(moistN, ang, 0.3, 1.05, 3);
      const dryBelt = Math.exp(-((lat - 0.4) * (lat - 0.4)) / 0.02);
      const itcz = Math.exp(-(lat * lat) / 0.022);
      const storm = Math.exp(-((lat - 0.62) * (lat - 0.62)) / 0.034);
      let temp = Math.cos(lat * Math.PI * 0.5) * warmK + (warmth - 50) / 240;
      temp -= Math.max(0, here - 0.45) * 0.85;
      temp += (jag[i]! - 0.5) * 0.06;
      temp += (lon - 0.5) * 0.04;
      tempF[i] = clamp01(temp);
      let moist = 0.36 + itcz * 0.46 + storm * 0.24 - dryBelt * (0.32 + (1 - lon) * 0.62);
      moist += (lon - 0.46) * 0.58;
      moist += (jag[i]! - 0.5) * 0.1;
      prior[i] = moist * wetK;
    }
  }

  const moistF = new Float32Array(n);
  for (let lap = 0; lap < 2; lap++) {
    for (let y = 0; y < rows; y++) {
      let wind = lap === 0 || !wrap ? 0.5 : moistF[y * cols + cols - 1]!;
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const prevX = wrap ? (x === 0 ? cols - 1 : x - 1) : Math.max(0, x - 1);
        if (!landMask[i]) {
          if (!wrap && x === 0) wind = 0.62;
          wind = Math.max(0.5, 0.58 + (1 - Math.abs(y / rows - 0.5)) * 0.14);
          moistF[i] = clamp01(wind);
          continue;
        }
        const here = height[i]! / 255;
        const rise = here - height[y * cols + prevX]! / 255;
        if (rise > 0.004) wind = Math.max(0.02, wind - rise * 4.2);
        else wind = Math.min(0.84, wind + 0.012);
        const shadow = rise < -0.004 ? -rise * 3.6 : 0;
        const windward = rise > 0.008 ? rise * 1.8 : 0;
        moistF[i] = clamp01(prior[i]! * 0.46 + wind * 0.66 + windward - shadow);
      }
    }
  }
  paintRainShadow(moistF, tempF, belt, landMask, cols, rows, wrap, wetness);
  paintRiseMoisture(moistF, rises, landMask, cols, rows, wrap);

  for (let y = 0; y < rows; y++) {
    const ny = y / rows;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const land = landMask[i] === 1;
      const shelf = !land && shelfLim[i]! > 0 && oceanNear[i]! > 0 && oceanNear[i]! <= shelfLim[i]!;
      tempA[i] = byte(tempF[i]! * 255);
      moistA[i] = byte(moistF[i]! * 255);
      let rel = reliefOf(land, height[i]!, shelf);
      const pole = Math.min(ny, 1 - ny);
      const cap = cylinder(elevN, (x / cols) * Math.PI * 2, 0.08, 0.62, 2);
      if (land && pole < 0.04 && cap > 0.42) rel = R_ICE;
      else if (land && pole < 0.055 && cap > 0.62) rel = R_ICE;
      else if (land && tempF[i]! < 0.12 && rel >= R_RANGE && rel <= R_PEAK) rel = R_ICE;
      relief[i] = rel;
      let id = coverOf(land, tempF[i]!, moistF[i]!, rel, ny, jag[i]!, cap);
      if (shelf && id !== 16) id = 1;
      terrain[i] = id;
    }
  }

  smoothTerrain(terrain, cols, rows, wrap);
  for (let i = 0; i < n; i++) {
    const id = terrain[i]!;
    if (!landMask[i]) {
      if (id !== 16 && shelfLim[i]! > 0 && oceanNear[i]! > 0 && oceanNear[i]! <= shelfLim[i]!) {
        terrain[i] = 1;
        relief[i] = R_SHELF;
      } else if (id === 16) relief[i] = R_OCEAN;
      else {
        terrain[i] = 0;
        relief[i] = R_OCEAN;
      }
      continue;
    }
    if (id === 0 || id === 1 || id === 16) {
      const yy = (i / cols) | 0;
      const cap = cylinder(elevN, ( (i % cols) / cols) * Math.PI * 2, 0.08, 0.62, 2);
      terrain[i] = coverOf(true, tempF[i]!, moistF[i]!, relief[i]!, yy / rows, jag[i]!, cap);
    }
  }

  nibbleIce(terrain, cols, rows, jag);
  flowRivers(terrain, height, relief, cols, rows, wrap, belt);
  const strata = buildStrata(terrain, height, relief, belt, tempA, moistA, cols, rows, wrap);

  return {
    cols,
    rows,
    seed,
    sea,
    warmth,
    wetness,
    mountains,
    scale,
    wrap,
    layout,
    level,
    breakup,
    gap,
    terrain,
    height,
    temp: tempA,
    moist: moistA,
    relief,
    owner: new Uint8Array(n),
    ownerIds: [],
    ...strata,
  };
}

type RiseDisk = { x: number; y: number; kind: "desert" | "forest"; rad: number };

function clampLandHistogram(height: Uint8Array, landMask: Uint8Array, belt: Float32Array) {
  const land: number[] = [];
  for (let i = 0; i < height.length; i++) if (landMask[i]) land.push(i);
  const count = land.length;
  if (count < 30) return;
  const demote = (keep: number, pred: (h: number) => boolean, to: number) => {
    const cells = land.filter((i) => pred(height[i]!)).sort((a, b) => height[a]! - height[b]!);
    for (let k = 0; k < cells.length - keep; k++) height[cells[k]!] = to;
  };
  demote(Math.max(1, Math.floor(count * 0.04)), (h) => h >= 214, 198);
  demote(Math.max(1, Math.floor(count * 0.12)), (h) => h >= 172 && h < 214, 156);
  demote(Math.max(1, Math.floor(count * 0.2)), (h) => h >= 140 && h < 172, 126);
  let peaks = 0;
  for (const i of land) if (height[i]! >= 214) peaks += 1;
  const want = Math.max(1, Math.floor(count * 0.025));
  if (peaks >= want) return;
  const spines = land.filter((i) => belt[i]! >= 0.95 && height[i]! < 214).sort((a, b) => height[b]! - height[a]!);
  for (const i of spines) {
    height[i] = 222;
    peaks += 1;
    if (peaks >= want) break;
  }
}

function stampRises(
  height: Uint8Array,
  landMask: Uint8Array,
  belt: Float32Array,
  cols: number,
  rows: number,
  rand: () => number,
): RiseDisk[] {
  let sx = 0;
  let sy = 0;
  let sn = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < Math.floor(cols * 0.5); x++) {
      if (belt[y * cols + x]! < 0.65) continue;
      sx += x;
      sy += y;
      sn += 1;
    }
  }
  const cx = sn ? sx / sn : cols * 0.28;
  const cy = sn ? sy / sn : rows * 0.45;
  const rises: RiseDisk[] = [];
  const paint = (kind: "desert" | "forest", x0: number, x1: number, y0: number, y1: number) => {
    let best = -1;
    let bestD = 1e9;
    const xa = Math.max(0, Math.floor(x0));
    const xb = Math.min(cols - 1, Math.floor(x1));
    const ya = Math.max(0, Math.floor(y0));
    const yb = Math.min(rows - 1, Math.floor(y1));
    for (let y = ya; y <= yb; y++) {
      for (let x = xa; x <= xb; x++) {
        const i = y * cols + x;
        if (!landMask[i] || belt[i]! >= 0.3 || height[i]! >= 168) continue;
        const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    }
    if (best < 0) {
      const bag: number[] = [];
      for (let y = Math.floor(rows * 0.28); y < rows * 0.72; y++) {
        for (let x = Math.floor(cols * 0.08); x < cols * 0.46; x++) {
          const i = y * cols + x;
          if (landMask[i] && height[i]! < 140 && belt[i]! < 0.3) bag.push(i);
        }
      }
      if (!bag.length) return;
      best = bag[Math.floor(rand() * bag.length)]!;
    }
    const y = (best / cols) | 0;
    const x = best - y * cols;
    if (rises.some((r) => Math.hypot(r.x - x, r.y - y) < 16)) return;
    const rad = 5;
    rises.push({ x, y, kind, rad });
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        if (dx * dx + dy * dy > rad * rad) continue;
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        const xx = (x + dx + cols) % cols;
        const j = yy * cols + xx;
        if (!landMask[j] || height[j]! >= 172 || belt[j]! >= 0.6) continue;
        const edge = Math.hypot(dx, dy) / rad;
        const h = kind === "desert" ? 160 - edge * 12 : 154 - edge * 10;
        if (h > height[j]!) height[j] = byte(h);
      }
    }
  };
  const swell = (x0: number, x1: number, y0: number, y1: number) => {
    let best = -1;
    let bestD = 1e9;
    const xa = Math.max(0, Math.floor(Math.min(x0, x1)));
    const xb = Math.min(cols - 1, Math.floor(Math.max(x0, x1)));
    const ya = Math.max(0, Math.floor(Math.min(y0, y1)));
    const yb = Math.min(rows - 1, Math.floor(Math.max(y0, y1)));
    const mx = (xa + xb) / 2;
    const my = (ya + yb) / 2;
    for (let y = ya; y <= yb; y += 2) {
      for (let x = xa; x <= xb; x += 2) {
        const i = y * cols + x;
        if (!landMask[i] || belt[i]! >= 0.3 || height[i]! >= 140) continue;
        const d = (x - mx) * (x - mx) + (y - my) * (y - my);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    }
    if (best < 0) return;
    const y = (best / cols) | 0;
    const x = best - y * cols;
    const rad = 6;
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        if (dx * dx + dy * dy > rad * rad) continue;
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        const xx = (x + dx + cols) % cols;
        const j = yy * cols + xx;
        if (!landMask[j] || belt[j]! >= 0.3 || height[j]! >= 172) continue;
        const edge = Math.hypot(dx, dy) / rad;
        const h = 150 - edge * 8;
        if (h > height[j]!) height[j] = byte(h);
      }
    }
  };
  paint("desert", cx + 8, cols * 0.5, cy - 30, cy + 30);
  paint("forest", cols * 0.05, Math.max(cols * 0.08, cx - 6), cy - 34, cy + 22);
  swell(cols * 0.62, cols * 0.9, rows * 0.28, rows * 0.62);
  return rises;
}

function paintRiseMoisture(
  moistF: Float32Array,
  rises: RiseDisk[],
  landMask: Uint8Array,
  cols: number,
  rows: number,
  wrap: boolean,
) {
  for (const rise of rises) {
    for (let dy = -rise.rad; dy <= rise.rad; dy++) {
      for (let dx = -rise.rad; dx <= rise.rad; dx++) {
        if (dx * dx + dy * dy > rise.rad * rise.rad) continue;
        const yy = rise.y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = rise.x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        const j = yy * cols + xx;
        if (!landMask[j]) continue;
        moistF[j] = rise.kind === "desert" ? 0.14 : 0.76;
      }
    }
  }
}

const FULL_KNOWN: KnownWindow = { x0: 0, x1: 1, y0: 0, y1: 1 };

export function knownForAge(cols: number, rows: number, hearths: HearthCell[], age: number): KnownWindow {
  if (age >= 4) return { ...FULL_KNOWN };
  if (age === 3) return { x0: 0, x1: 0.74, y0: 0, y1: 1 };
  if (age === 2) return { x0: 0, x1: 0.56, y0: 0.02, y1: 0.98 };
  if (age === 1) return { x0: 0.04, x1: 0.5, y0: 0.08, y1: 0.92 };
  if (!hearths.length) return { x0: 0.08, x1: 0.42, y0: 0.22, y1: 0.72 };
  let x0 = 1;
  let x1 = 0;
  let y0 = 1;
  let y1 = 0;
  for (const h of hearths) {
    const nx = h.x / cols;
    const ny = h.y / rows;
    x0 = Math.min(x0, nx);
    x1 = Math.max(x1, nx);
    y0 = Math.min(y0, ny);
    y1 = Math.max(y1, ny);
  }
  return {
    x0: Math.max(0, x0 - 0.07),
    x1: Math.min(0.52, x1 + 0.07),
    y0: Math.max(0, y0 - 0.08),
    y1: Math.min(1, y1 + 0.08),
  };
}

export function setFieldAge(field: TerrainField, age: number): TerrainField {
  const next = Math.max(0, Math.min(4, Math.round(age)));
  return { ...field, age: next, known: knownForAge(field.cols, field.rows, field.hearths ?? [], next) };
}

function paintSightDisk(
  seen: Uint8Array,
  cols: number,
  rows: number,
  cx: number,
  cy: number,
  rad: number,
  wrap: boolean,
  value: number,
) {
  const r2 = rad * rad;
  for (let dy = -rad; dy <= rad; dy++) {
    const y = cy + dy;
    if (y < 0 || y >= rows) continue;
    for (let dx = -rad; dx <= rad; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      let x = cx + dx;
      if (wrap) x = ((x % cols) + cols) % cols;
      else if (x < 0 || x >= cols) continue;
      seen[y * cols + x] = value;
    }
  }
}

function hearthSight(cols: number, rows: number, hearths: HearthCell[], wrap: boolean): Uint8Array {
  const seen = new Uint8Array(cols * rows);
  for (const h of hearths) paintSightDisk(seen, cols, rows, h.x, h.y, 14, wrap, 1);
  return seen;
}

export function stampSight(
  field: TerrainField,
  x: number,
  y: number,
  mapW: number,
  mapH: number,
  radius: number,
  open: boolean,
) {
  const col = Math.floor((x / mapW) * field.cols);
  const row = Math.floor(((mapH - y) / mapH) * field.rows);
  if (!field.seen || field.seen.length !== field.cols * field.rows) field.seen = new Uint8Array(field.cols * field.rows);
  paintSightDisk(field.seen, field.cols, field.rows, col, row, Math.max(1, radius), field.wrap, open ? 1 : 0);
}

export function seenWindow(field: TerrainField): KnownWindow | null {
  const seen = field.seen;
  if (!seen?.length) return null;
  let x0 = field.cols;
  let x1 = -1;
  let y0 = field.rows;
  let y1 = -1;
  let n = 0;
  for (let i = 0; i < seen.length; i++) {
    if (!seen[i]) continue;
    const y = (i / field.cols) | 0;
    const x = i - y * field.cols;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    n += 1;
  }
  if (!n) return null;
  return {
    x0: x0 / field.cols,
    x1: (x1 + 1) / field.cols,
    y0: y0 / field.rows,
    y1: (y1 + 1) / field.rows,
  };
}

function buildStrata(
  terrain: Uint8Array,
  height: Uint8Array,
  relief: Uint8Array,
  belt: Float32Array,
  temp: Uint8Array,
  moist: Uint8Array,
  cols: number,
  rows: number,
  wrap: boolean,
): Pick<TerrainField, "hearths" | "columns" | "gates" | "realms" | "known" | "age" | "under" | "sky" | "seen"> {
  const n = cols * rows;
  const under = new Uint8Array(n);
  const sky = new Uint8Array(n);
  const landish = (id: number) => id !== 0 && id !== 1 && id !== 16 && id !== 10;
  const scored: { j: number; score: number }[] = [];
  const ortho: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (let y = 1; y < rows - 1; y++) {
    const ny = y / rows;
    if (ny < 0.18 || ny > 0.8) continue;
    for (let x = 0; x < cols; x++) {
      const nx = x / cols;
      if (nx < 0.06 || nx > 0.48) continue;
      const i = y * cols + x;
      if (terrain[i] !== 9) continue;
      for (const [dx, dy] of ortho) {
        const yy = y + dy;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        const j = yy * cols + xx;
        const id = terrain[j]!;
        if (!landish(id) || id === 6 || id === 9) continue;
        if (relief[j]! > R_HILL) continue;
        const m = moist[j]! / 255;
        const t = temp[j]! / 255;
        let score = m;
        if (m > 0.42 && t > 0.3 && t < 0.7) score += 2.4;
        else if (m > 0.28 && t > 0.22 && t < 0.75) score += 1;
        if (id === 2 || id === 3 || id === 7 || id === 11) score += 1.4;
        if (id === 8 || id === 12) score -= 0.7;
        scored.push({ j, score });
        break;
      }
    }
  }
  scored.sort((a, b) => b.score - a.score);
  const hearths: HearthCell[] = [];
  for (const { j } of scored) {
    const y = (j / cols) | 0;
    const x = j - y * cols;
    if (hearths.some((h) => Math.abs(h.x - x) < 14 && Math.abs(h.y - y) < 10)) continue;
    hearths.push({ x, y });
    if (hearths.length >= 5) break;
  }
  if (hearths.length < 3) {
    for (let y = Math.floor(rows * 0.3); y < rows * 0.7 && hearths.length < 3; y += 6) {
      for (let x = Math.floor(cols * 0.1); x < cols * 0.42 && hearths.length < 3; x += 8) {
        const i = y * cols + x;
        if (!landish(terrain[i]!) || relief[i]! > R_HILL || terrain[i] === 6) continue;
        hearths.push({ x, y });
      }
    }
  }
  let down = -1;
  let up = -1;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < Math.floor(cols * 0.5); x++) {
      const i = y * cols + x;
      if (!landish(terrain[i]!)) continue;
      if (belt[i]! >= 0.9 && (down < 0 || height[i]! > height[down]!)) down = i;
      if (height[i]! >= 188 && (up < 0 || height[i]! > height[up]!)) up = i;
    }
  }
  if (down < 0) down = up;
  if (up < 0) up = down;
  const columns: ColumnCell[] = [];
  if (down >= 0) {
    under[down] = 1;
    columns.push({ x: down % cols, y: (down / cols) | 0, dir: "down" });
  }
  if (up >= 0) {
    const cell = { x: up % cols, y: (up / cols) | 0, dir: "up" as const };
    if (!columns.some((c) => c.x === cell.x && c.y === cell.y && c.dir === "up")) columns.push(cell);
  }
  const cellNoise = (x: number, y: number, salt: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const seaD = new Uint16Array(n).fill(65535);
  const seaQ: number[] = [];
  for (let i = 0; i < n; i++) {
    if (landish(terrain[i]!)) continue;
    seaD[i] = 0;
    seaQ.push(i);
  }
  for (let k = 0; k < seaQ.length; k++) {
    const i = seaQ[k]!;
    const d = seaD[i]!;
    if (d >= 14) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const yy = y + dy;
      if (yy < 0 || yy >= rows) continue;
      let xx = x + dx;
      if (wrap) xx = (xx + cols) % cols;
      else if (xx < 0 || xx >= cols) continue;
      const j = yy * cols + xx;
      if (seaD[j]! <= d + 1) continue;
      seaD[j] = d + 1;
      seaQ.push(j);
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const id = terrain[i]!;
      if (!landish(id) || id === 6 || seaD[i]! < 5) continue;
      const blob = cellNoise(x >> 2, y >> 2, 3.1) * 0.72 + cellNoise(x >> 4, y >> 3, 8.4) * 0.28;
      if (blob > 0.62) under[i] = 1;
    }
  }
  const grown = new Uint8Array(under);
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (under[i] || !landish(terrain[i]!) || terrain[i] === 6 || seaD[i]! < 5) continue;
      let near = 0;
      for (const [dx, dy] of N8) {
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        if (under[yy * cols + xx]) near += 1;
      }
      if (near >= 5) grown[i] = 1;
    }
  }
  under.set(grown);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (!under[i]) continue;
      let near = 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        if (under[yy * cols + xx]) near += 1;
      }
      if (near < 2) under[i] = 0;
    }
  }
  const comp = new Int32Array(n).fill(-1);
  const rooms: { id: number; sx: number; sy: number; n: number }[] = [];
  for (let i = 0; i < n; i++) {
    if (!under[i] || comp[i]! >= 0) continue;
    const id = rooms.length;
    const stack = [i];
    comp[i] = id;
    let sx = 0;
    let sy = 0;
    let count = 0;
    while (stack.length) {
      const c = stack.pop()!;
      const y = (c / cols) | 0;
      const x = c - y * cols;
      sx += x;
      sy += y;
      count += 1;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        const j = yy * cols + xx;
        if (!under[j] || comp[j]! >= 0) continue;
        comp[j] = id;
        stack.push(j);
      }
    }
    rooms.push({ id, sx: sx / count, sy: sy / count, n: count });
  }
  const linked = new Uint8Array(rooms.length);
  const pairs: { a: number; b: number; d: number }[] = [];
  for (let a = 0; a < rooms.length; a++) {
    for (let b = a + 1; b < rooms.length; b++) {
      const dx = rooms[a]!.sx - rooms[b]!.sx;
      const dy = rooms[a]!.sy - rooms[b]!.sy;
      const d = Math.hypot(dx, dy);
      if (d < 8 || d > 26) continue;
      pairs.push({ a, b, d });
    }
  }
  pairs.sort((p, q) => p.d - q.d);
  for (const pair of pairs) {
    if (linked[pair.a] || linked[pair.b]) continue;
    if (cellNoise(pair.a + 3, pair.b + 1, 2.2) < 0.58) continue;
    linked[pair.a] = 1;
    linked[pair.b] = 1;
    let x = Math.round(rooms[pair.a]!.sx);
    let y = Math.round(rooms[pair.a]!.sy);
    const x1 = Math.round(rooms[pair.b]!.sx);
    const y1 = Math.round(rooms[pair.b]!.sy);
    const steps = Math.max(Math.abs(x1 - x), Math.abs(y1 - y));
    for (let s = 0; s <= steps; s++) {
      const px = steps ? Math.round(x + ((x1 - x) * s) / steps) : x;
      const py = steps ? Math.round(y + ((y1 - y) * s) / steps) : y;
      if (py < 0 || py >= rows) continue;
      let pxw = px;
      if (wrap) pxw = (pxw + cols) % cols;
      else if (pxw < 0 || pxw >= cols) continue;
      const j = py * cols + pxw;
      if (!landish(terrain[j]!) || terrain[j] === 6) continue;
      under[j] = under[j] === 1 ? 1 : 2;
      if (s % 2 === 0) under[j] = 2;
    }
  }
  if (down >= 0) {
    const cy = (down / cols) | 0;
    const cx = down - cy * cols;
    for (let dy = -6; dy <= 6; dy++) {
      const yy = cy + dy;
      if (yy < 0 || yy >= rows) continue;
      for (let dx = -6; dx <= 6; dx++) {
        if (dx * dx + dy * dy > 36) continue;
        let xx = cx + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        const j = yy * cols + xx;
        if (!landish(terrain[j]!)) continue;
        under[j] = 1;
      }
    }
  }
  const cloudy = (i: number) => {
    const id = terrain[i]!;
    return landish(id) && id !== 8 && id !== 6 && id !== 15 && (moist[i] ?? 0) >= 125;
  };
  const cloud = new Uint8Array(n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (!cloudy(i)) continue;
      const blob = cellNoise(x >> 3, y >> 3, 4.4) * 0.78 + cellNoise(x >> 1, y >> 1, 1.7) * 0.22;
      if (blob > 0.56) cloud[i] = 1;
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (!cloudy(i) || cloud[i]) continue;
      let near = 0;
      for (const [dx, dy] of N8) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        if (cloud[yy * cols + xx]) near += 1;
      }
      if (near >= 5) sky[i] = 1;
    }
  }
  for (let i = 0; i < n; i++) if (cloud[i] && cloudy(i)) sky[i] = 1;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (!sky[i]) continue;
      let near = 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        if (sky[yy * cols + xx]) near += 1;
      }
      if (near < 2 || !cloudy(i)) sky[i] = 0;
    }
  }
  const gates: WorldGate[] = [];
  const realms: RealmStub[] = [
    { id: "void", name: "Void", nodes: 12 },
    { id: "other", name: "Other hearth", nodes: 8 },
  ];
  if (hearths[0]) gates.push({ x: hearths[0].x, y: hearths[0].y, from: "surface", realm: "other" });
  if (up >= 0) gates.push({ x: up % cols, y: (up / cols) | 0, from: "surface", realm: "void" });
  else if (hearths[1]) gates.push({ x: hearths[1].x, y: hearths[1].y, from: "surface", realm: "void" });
  const age = 0;
  const seen = hearthSight(cols, rows, hearths, wrap);
  return {
    hearths,
    columns,
    gates,
    realms,
    known: knownForAge(cols, rows, hearths, age),
    age,
    under,
    sky,
    seen,
  };
}

function clampByte(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function smoothTerrain(terrain: Uint8Array, cols: number, rows: number, wrap: boolean) {
  const next = new Uint8Array(terrain.length);
  const tally = new Uint16Array(TERRAINS.length);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      tally.fill(0);
      const i = y * cols + x;
      tally[terrain[i]!] += 4;
      for (const [dx, dy] of N8) {
        const ny = y + dy;
        if (ny < 0 || ny >= rows) continue;
        const nx = wrap ? (x + dx + cols) % cols : x + dx;
        if (nx < 0 || nx >= cols) continue;
        tally[terrain[ny * cols + nx]!] += 1;
      }
      let best = terrain[i]!;
      let bestN = -1;
      for (let t = 0; t < tally.length; t++) {
        if (tally[t]! > bestN) {
          bestN = tally[t]!;
          best = t;
        }
      }
      const selfN = tally[terrain[i]!]!;
      next[i] = best !== terrain[i] && bestN >= selfN + 2 ? best : terrain[i]!;
    }
  }
  terrain.set(next);
}

function nibbleIce(terrain: Uint8Array, cols: number, rows: number, jag: Float32Array) {
  for (let y = 0; y < rows; y++) {
    const ny = (y + 0.5) / rows;
    const pole = Math.min(ny, 1 - ny);
    if (pole > 0.08) continue;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const id = terrain[i]!;
      if (id !== 6 && id !== 16) continue;
      const wedge = Math.sin((x / cols) * Math.PI * 7 + jag[i]! * 6) > 0.62;
      if (id === 16 && (wedge || jag[i]! > 0.78)) terrain[i] = 0;
      else if (id === 6 && wedge && jag[i]! > 0.9) terrain[i] = 15;
    }
  }
}
function softenHeight(height: Uint8Array, cols: number, rows: number, wrap: boolean, belt: Float32Array) {
  const next = new Uint8Array(height.length);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (belt[i]! >= 0.3) {
        next[i] = height[i]!;
        continue;
      }
      let sum = height[i]! * 4;
      let n = 4;
      for (const [dx, dy] of N8) {
        const ny = y + dy;
        if (ny < 0 || ny >= rows) continue;
        const nx = wrap ? (x + dx + cols) % cols : x + dx;
        if (nx < 0 || nx >= cols) continue;
        const j = ny * cols + nx;
        if (belt[j]! >= 0.3) continue;
        sum += height[j]!;
        n += 1;
      }
      next[i] = Math.round(sum / n);
    }
  }
  height.set(next);
}

function flowRivers(
  terrain: Uint8Array,
  height: Uint8Array,
  relief: Uint8Array,
  cols: number,
  rows: number,
  wrap: boolean,
  belt?: Float32Array,
) {
  const n = cols * rows;
  const water = (id: number) => id === 0 || id === 1 || id === 16;
  const down = new Int32Array(n).fill(-1);
  const filled = new Float32Array(n);
  const reach = new Int32Array(n).fill(-1);
  const seen = new Uint8Array(n);
  const heapC: number[] = [];
  const heapI: number[] = [];

  for (let i = 0; i < n; i++) {
    if (!water(terrain[i]!)) continue;
    filled[i] = height[i]!;
    reach[i] = 0;
    seen[i] = 1;
    hpush(heapC, heapI, height[i]!, i);
  }

  while (heapC.length) {
    const popped = hpop(heapC, heapI);
    if (!popped) break;
    const [, i] = popped;
    const spill = filled[i]!;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    for (const [dx, dy] of N8) {
      const ny = y + dy;
      if (ny < 0 || ny >= rows) continue;
      let nx = x + dx;
      if (wrap) nx = (nx + cols) % cols;
      else if (nx < 0 || nx >= cols) continue;
      const j = ny * cols + nx;
      if (seen[j]) continue;
      seen[j] = 1;
      down[j] = i;
      reach[j] = reach[i]! + 1;
      const nextSpill = Math.max(height[j]!, spill);
      filled[j] = nextSpill;
      hpush(heapC, heapI, nextSpill, j);
    }
  }

  const acc = new Float32Array(n);
  const order: number[] = [];
  for (let i = 0; i < n; i++) {
    if (water(terrain[i]!)) continue;
    acc[i] = 1;
    order.push(i);
  }
  order.sort((a, b) => reach[b]! - reach[a]! || height[b]! - height[a]! || a - b);
  for (const i of order) {
    const j = down[i]!;
    if (j >= 0 && !water(terrain[j]!)) acc[j] += acc[i]!;
  }

  const bestUp = new Int32Array(n).fill(-1);
  for (const i of order) {
    const j = down[i]!;
    if (j < 0 || water(terrain[j]!)) continue;
    if (bestUp[j]! < 0 || acc[i]! > acc[bestUp[j]!]!) bestUp[j] = i;
  }

  const mouthOf = new Int32Array(n).fill(-1);
  const findMouth = (start: number) => {
    let i = start;
    const guard = Math.min(n, cols + rows + 12);
    for (let hop = 0; hop < guard; hop++) {
      if (mouthOf[i]! >= 0) return mouthOf[i]!;
      const j = down[i]!;
      if (j < 0 || water(terrain[j]!)) {
        mouthOf[i] = i;
        return i;
      }
      i = j;
    }
    mouthOf[start] = start;
    return start;
  };
  for (const i of order) {
    const m = findMouth(i);
    let c = i;
    for (let hop = 0; hop < 80 && mouthOf[c] !== m; hop++) {
      const next = down[c]!;
      mouthOf[c] = m;
      if (next < 0 || water(terrain[next]!)) break;
      c = next;
    }
  }

  const threshold = Math.max(10, Math.round(n / 4200));
  const onBelt = (i: number) => (belt?.[i] ?? 0) >= 0.3;
  const mouths: number[] = [];
  for (let i = 0; i < n; i++) {
    if (water(terrain[i]!)) continue;
    const j = down[i]!;
    if (j >= 0 && water(terrain[j]!) && acc[i]! >= threshold) mouths.push(i);
  }
  mouths.sort((a, b) => acc[b]! - acc[a]!);
  const keep = new Uint8Array(n);
  for (let m = 0; m < mouths.length && m < 34; m++) keep[mouths[m]!] = 1;

  const cap = Math.max(48, Math.round(n * 0.0042));
  const paint: number[] = [];
  for (let i = 0; i < n; i++) {
    if (water(terrain[i]!) || terrain[i] === 6) continue;
    const m = mouthOf[i]!;
    if (m < 0 || !keep[m]) continue;
    if (acc[i]! < threshold) continue;
    const j = down[i]!;
    const intoSea = j >= 0 && water(terrain[j]!);
    const primary = j >= 0 && bestUp[j] === i;
    if (onBelt(i) && !intoSea) continue;
    if (!intoSea && !primary && acc[i]! < threshold * 4) continue;
    paint.push(i);
  }
  paint.sort((a, b) => acc[b]! - acc[a]!);
  let painted = 0;
  for (const i of paint) {
    if (painted >= cap) break;
    terrain[i] = 9;
    const drop = relief[i]! >= R_HILL ? 11 : 6;
    if (height[i]! > 102) height[i] = Math.max(102, height[i]! - drop);
    painted += 1;
  }

  for (const i of paint) {
    if (terrain[i] !== 9) continue;
    const j = down[i]!;
    if (j < 0 || !water(terrain[j]!)) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    const y2 = (j / cols) | 0;
    const x2 = j - y2 * cols;
    if (y === y2 || x === x2) continue;
    for (const [cx, cy] of [
      [x, y2],
      [x2, y],
    ] as const) {
      const ny = cy;
      if (ny < 0 || ny >= rows) continue;
      const nx = wrap ? (cx + cols) % cols : cx;
      if (nx < 0 || nx >= cols) continue;
      const k = ny * cols + nx;
      if (water(terrain[k]!) || terrain[k] === 6 || onBelt(k)) continue;
      terrain[k] = 9;
      break;
    }
  }

  const side: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const kisses = (x: number, y: number) => {
    for (const [dx, dy] of side) {
      const ny = y + dy;
      if (ny < 0 || ny >= rows) continue;
      let nx = x + dx;
      if (wrap) nx = (nx + cols) % cols;
      else if (nx < 0 || nx >= cols) continue;
      if (water(terrain[ny * cols + nx]!)) return true;
    }
    return false;
  };
  for (let i = 0; i < n; i++) {
    if (terrain[i] !== 9) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    if (kisses(x, y)) continue;
    for (const [dx, dy] of side) {
      const ny = y + dy;
      if (ny < 0 || ny >= rows) continue;
      let nx = x + dx;
      if (wrap) nx = (nx + cols) % cols;
      else if (nx < 0 || nx >= cols) continue;
      const j = ny * cols + nx;
      if (water(terrain[j]!) || terrain[j] === 6 || terrain[j] === 9 || onBelt(j)) continue;
      if (!kisses(nx, ny)) continue;
      terrain[j] = 9;
      break;
    }
  }

  const seenLake = new Uint8Array(n);
  let lakes = 0;
  for (let i = 0; i < n && lakes < 8; i++) {
    if (seenLake[i] || water(terrain[i]!) || terrain[i] === 9 || terrain[i] === 6) continue;
    if (filled[i]! < height[i]! + 8) continue;
    const comp: number[] = [];
    const queue = [i];
    seenLake[i] = 1;
    let tooBig = false;
    while (queue.length) {
      const c = queue.pop()!;
      comp.push(c);
      if (comp.length > 64) {
        tooBig = true;
        break;
      }
      const y = (c / cols) | 0;
      const x = c - y * cols;
      for (const [dx, dy] of N8) {
        const ny = y + dy;
        if (ny < 0 || ny >= rows) continue;
        let nx = x + dx;
        if (wrap) nx = (nx + cols) % cols;
        else if (nx < 0 || nx >= cols) continue;
        const j = ny * cols + nx;
        if (seenLake[j] || water(terrain[j]!) || terrain[j] === 9) continue;
        if (filled[j]! < height[j]! + 8) continue;
        seenLake[j] = 1;
        queue.push(j);
      }
    }
    if (tooBig || comp.length < 6) continue;
    for (const c of comp) terrain[c] = 10;
    lakes += 1;
  }
}

export function cellIndex(field: TerrainField, x: number, y: number, mapW: number, mapH: number): number {
  let nx = x / mapW;
  if (field.wrap) {
    nx = nx % 1;
    if (nx < 0) nx += 1;
  }
  const col = Math.max(0, Math.min(field.cols - 1, Math.floor(nx * field.cols)));
  const row = Math.max(0, Math.min(field.rows - 1, Math.floor(((mapH - y) / mapH) * field.rows)));
  return row * field.cols + col;
}

export function terrainAt(field: TerrainField, x: number, y: number, mapW: number, mapH: number): TerrainDef {
  return TERRAINS[field.terrain[cellIndex(field, x, y, mapW, mapH)]!] ?? TERRAINS[0]!;
}

export function climateName(temp: number, moist: number): string {
  const t = temp / 255;
  const m = moist / 255;
  const heat = t < 0.16 ? "Freezing" : t < 0.32 ? "Cold" : t < 0.52 ? "Mild" : t < 0.7 ? "Warm" : "Hot";
  const wet = m < 0.34 ? "dry" : m < 0.55 ? "fair" : "wet";
  return `${heat} ${wet}`;
}

export function heightBand(h: number): string {
  if (h < 78) return "deep";
  if (h < 118) return "low";
  if (h < 158) return "rising";
  if (h < 198) return "high";
  return "peak";
}

export function cellBrief(field: TerrainField, x: number, y: number, mapW: number, mapH: number) {
  const i = cellIndex(field, x, y, mapW, mapH);
  const biome = TERRAINS[field.terrain[i]!] ?? TERRAINS[0]!;
  const reliefId = field.relief?.[i] ?? R_LOW;
  const reliefName = RELIEF_LABEL[reliefId] ?? "Lowland";
  const water = biome.id === 0 || biome.id === 1 || biome.id === 16;
  const claim = field.owner[i] ? (field.ownerIds[field.owner[i]! - 1] ?? "") : "";
  return {
    biome: biome.label,
    relief: water ? "" : reliefName,
    climate: climateName(field.temp[i] ?? 128, field.moist[i] ?? 128),
    band: heightBand(field.height[i] ?? 0),
    claim,
  };
}

function colOf(x: number, cols: number, wrap: boolean) {
  if (wrap) return (x + cols) % cols;
  return x;
}

function reliefForCover(id: number, prev: number): number {
  if (id === 0 || id === 16) return R_OCEAN;
  if (id === 1) return R_SHELF;
  if (id === 5) return R_RANGE;
  if (id === 4) return R_HILL;
  if (id === 6) return R_ICE;
  if (id === 9 || id === 10) return prev >= R_LOW ? prev : R_LOW;
  if (prev >= R_LOW && prev <= R_ICE) return prev;
  return R_LOW;
}

export function stampTerrain(
  field: TerrainField,
  x: number,
  y: number,
  mapW: number,
  mapH: number,
  terrainId: number,
  radius: number,
) {
  const col = Math.floor((x / mapW) * field.cols);
  const row = Math.floor(((mapH - y) / mapH) * field.rows);
  const def = TERRAINS[terrainId] ?? TERRAINS[2]!;
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      const c = colOf(col + dx, field.cols, field.wrap);
      const r = row + dy;
      if (!field.wrap && (c < 0 || c >= field.cols)) continue;
      if (r < 0 || r >= field.rows) continue;
      const i = r * field.cols + c;
      const prev = field.relief[i] ?? R_LOW;
      field.terrain[i] = def.id;
      field.height[i] = def.height;
      field.relief[i] = reliefForCover(def.id, prev);
    }
  }
}

export function stampOwner(
  field: TerrainField,
  x: number,
  y: number,
  mapW: number,
  mapH: number,
  nationId: string | null,
  radius: number,
) {
  let code = 0;
  if (nationId) {
    let idx = field.ownerIds.indexOf(nationId);
    if (idx < 0) {
      if (field.ownerIds.length >= 254) return;
      field.ownerIds.push(nationId);
      idx = field.ownerIds.length - 1;
    }
    code = idx + 1;
  }
  const col = Math.floor((x / mapW) * field.cols);
  const row = Math.floor(((mapH - y) / mapH) * field.rows);
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      const c = colOf(col + dx, field.cols, field.wrap);
      const r = row + dy;
      if (!field.wrap && (c < 0 || c >= field.cols)) continue;
      if (r < 0 || r >= field.rows) continue;
      const i = r * field.cols + c;
      if (field.terrain[i] === 0 || field.terrain[i] === 16) continue;
      field.owner[i] = code;
    }
  }
}

export function traceRaster(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  sea = 46,
  cols = TERRAIN_COLS,
  rows = TERRAIN_ROWS,
  wrap = true,
): TerrainField {
  const field = blankField("traced", sea, wrap, cols, rows);
  for (let y = 0; y < field.rows; y++) {
    const temp = byte((1 - Math.abs(y / field.rows - 0.5) * 2) * 255);
    for (let x = 0; x < field.cols; x++) {
      const sx = Math.min(width - 1, Math.floor((x / field.cols) * width));
      const sy = Math.min(height - 1, Math.floor((y / field.rows) * height));
      const p = (sy * width + sx) * 4;
      const id = nearestTerrain(rgba[p]!, rgba[p + 1]!, rgba[p + 2]!);
      const i = y * field.cols + x;
      field.terrain[i] = id;
      field.height[i] = TERRAINS[id]!.height;
      field.relief[i] = reliefForCover(id, R_LOW);
      field.temp[i] = temp;
      field.moist[i] = 140;
    }
  }
  return field;
}

function blankField(seed: string, sea: number, wrap: boolean, cols = TERRAIN_COLS, rows = TERRAIN_ROWS): TerrainField {
  const n = cols * rows;
  return {
    cols,
    rows,
    seed,
    sea,
    warmth: 50,
    wetness: 50,
    mountains: 42,
    scale: 58,
    wrap,
    layout: "earthlike",
    level: "standard",
    breakup: 50,
    gap: 70,
    terrain: new Uint8Array(n),
    height: new Uint8Array(n),
    temp: new Uint8Array(n),
    moist: new Uint8Array(n),
    relief: new Uint8Array(n),
    owner: new Uint8Array(n),
    ownerIds: [],
    hearths: [],
    columns: [],
    gates: [],
    realms: [],
    known: { ...FULL_KNOWN },
    age: 4,
    under: new Uint8Array(n),
    sky: new Uint8Array(n),
    seen: new Uint8Array(n).fill(1),
  };
}

export function nearestTerrain(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  if (max > 228 && sat < 42) return 6;
  let best = 0;
  let bestD = 1e12;
  for (let i = 0; i < RGB.length; i++) {
    const [tr, tg, tb] = RGB[i]!;
    const d = (r - tr) * (r - tr) + (g - tg) * (g - tg) + (b - tb) * (b - tb);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  if (bestD < 900) return best;
  const v = max / 255;
  let hue = 0;
  if (sat > 0) {
    if (max === r) hue = ((g - b) / sat) % 6;
    else if (max === g) hue = (b - r) / sat + 2;
    else hue = (r - g) / sat + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  if (v > 0.86 && sat < 36) return 6;
  if (hue >= 165 && hue <= 255 && b > 60 && sat > 18) {
    if (v > 0.58 && g > b * 0.72) return 1;
    return 0;
  }
  if (hue >= 70 && hue <= 175 && g >= r - 5 && g >= b - 15) return sat < 28 && v < 0.4 ? 7 : 3;
  if (hue >= 8 && hue < 42 && r > g + 22 && sat > 35) return 8;
  if (sat < 32 && v > 0.28 && v < 0.78) return 5;
  if (hue >= 18 && hue < 55 && v < 0.5) return 4;
  if (hue >= 40 && hue < 100) return 2;
  return best;
}

function lerp(a: readonly number[], b: readonly number[], t: number): [number, number, number] {
  const k = clamp01(t);
  return [
    Math.round(a[0]! + (b[0]! - a[0]!) * k),
    Math.round(a[1]! + (b[1]! - a[1]!) * k),
    Math.round(a[2]! + (b[2]! - a[2]!) * k),
  ];
}

function climateRgb(t: number, m: number, water: boolean): [number, number, number] {
  if (water && t < 0.18) return [214, 228, 234];
  if (water) return lerp([6, 36, 72], [28, 110, 150], t);
  if (t < 0.16) return lerp([236, 240, 244], [176, 196, 186], m);
  const dry = t > 0.6 ? [226, 168, 86] : [206, 176, 96];
  const wet = t > 0.6 ? [16, 100, 58] : [36, 128, 64];
  const mid = t < 0.35 ? [168, 180, 150] : [176, 170, 78];
  const rgb = m < 0.45 ? lerp(dry, mid, m / 0.45) : lerp(mid, wet, (m - 0.45) / 0.55);
  if (t < 0.34) return lerp(rgb, [186, 198, 190], (0.34 - t) / 0.28);
  return rgb;
}

function heightRgb(h: number): [number, number, number] {
  if (h < 70) return lerp([4, 24, 58], [16, 78, 120], h / 70);
  if (h < 110) return lerp([46, 150, 168], [150, 176, 86], (h - 70) / 40);
  if (h < 160) return lerp([150, 176, 86], [168, 132, 78], (h - 110) / 50);
  if (h < 205) return lerp([168, 132, 78], [186, 176, 168], (h - 160) / 45);
  return lerp([186, 176, 168], [246, 248, 250], (h - 205) / 50);
}

function ecotoneOf(a: number, b: number): readonly [number, number, number] | null {
  const pair = (x: number, y: number) => (a === x && b === y) || (a === y && b === x);
  if (pair(2, 8) || pair(11, 8) || pair(2, 12)) return RGB[12] ?? null;
  if (pair(3, 5) || pair(3, 4) || pair(13, 5)) return [78, 118, 64];
  if (pair(2, 3) || pair(11, 3)) return [112, 148, 62];
  return null;
}

export function renderTerrain(
  field: TerrainField,
  out: Uint8ClampedArray,
  nationColor: (id: string) => string | undefined,
  politicalOrView: boolean | GroundDraw,
  reveal = true,
  plane: MapPlane = "surface",
  dim = false,
) {
  const view: GroundDraw =
    politicalOrView === true ? "political" : politicalOrView === false ? "terrain" : politicalOrView;
  const scale = TERRAIN_DRAW_SCALE;
  const { cols, rows, terrain, height, owner, ownerIds } = field;
  const political = view === "political";
  const upStair = new Uint8Array(cols * rows);
  const downStair = new Uint8Array(cols * rows);
  const markStair = (mask: Uint8Array, x: number, y: number) => {
    for (let dy = -2; dy <= 2; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= rows) continue;
      for (let dx = -2; dx <= 2; dx++) {
        if (dx * dx + dy * dy > 4) continue;
        let xx = x + dx;
        if (field.wrap) xx = ((xx % cols) + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        mask[yy * cols + xx] = 1;
      }
    }
  };
  for (const c of field.columns ?? []) markStair(c.dir === "up" ? upStair : downStair, c.x, c.y);
  for (let y = 0; y < rows * scale; y++) {
    for (let x = 0; x < cols * scale; x++) {
      const cx = Math.floor(x / scale);
      const cy = Math.floor(y / scale);
      const i = cy * cols + cx;
      const id = terrain[i]!;
      const rel = field.relief?.[i] ?? R_LOW;
      const leftX = cx === 0 ? (field.wrap ? cols - 1 : 0) : cx - 1;
      const rightX = cx === cols - 1 ? (field.wrap ? 0 : cols - 1) : cx + 1;
      const hL = height[cy * cols + leftX]!;
      const hR = height[cy * cols + rightX]!;
      const hU = height[Math.max(0, cy - 1) * cols + cx]!;
      const hD = height[Math.min(rows - 1, cy + 1) * cols + cx]!;
      const light = -(hR - hL) * 0.92 - (hD - hU) * 0.58;
      const slope = Math.abs(hR - hL) + Math.abs(hD - hU);
      const steep = slope >= 8 && (rel >= R_HILL || view === "height");
      const div = !steep ? 520 : rel >= R_RANGE ? 26 : 48;
      let shade = steep ? 0.97 + light / div : 1;
      if (view === "climate") shade = 1 + (shade - 1) * 0.35;
      shade = Math.max(steep ? 0.58 : 0.92, Math.min(steep ? 1.32 : 1.05, shade));
      let rgb: [number, number, number];
      if (view === "climate") rgb = climateRgb((field.temp[i] ?? 128) / 255, (field.moist[i] ?? 128) / 255, id === 0 || id === 16);
      else if (view === "height") rgb = heightRgb(height[i]!);
      else rgb = [RGB[id]?.[0] ?? 0, RGB[id]?.[1] ?? 0, RGB[id]?.[2] ?? 0];
      let r = rgb[0];
      let g = rgb[1];
      let b = rgb[2];
      if (political && owner[i] && id !== 0 && id !== 16 && id !== 10) {
        const hex = nationColor(ownerIds[owner[i]! - 1] ?? "");
        if (hex) {
          const n = Number.parseInt(hex.slice(1), 16);
          if (Number.isFinite(n)) {
            r = Math.round(r * 0.34 + ((n >> 16) & 255) * 0.66);
            g = Math.round(g * 0.34 + ((n >> 8) & 255) * 0.66);
            b = Math.round(b * 0.34 + (n & 255) * 0.66);
          }
        }
        shade = Math.max(0.72, Math.min(1.2, 0.98 + light / (steep ? 90 : 220)));
      }
      if (view === "terrain" || political) {
        if (id === 8) {
          const speck = ((x * 5 + y * 3) & 3) - 1;
          r += speck * 4;
          g += speck * 3;
          b += speck;
        } else if (id === 3 || id === 13 || id === 14) {
          const spec = (x * 17 + y * 11) & 7;
          const d = spec < 2 ? -14 : spec > 5 ? 9 : 0;
          r += d * 0.45;
          g += d;
          b += d * 0.25;
        } else if (id === 6 || id === 16) {
          if (((x * 5) ^ (y * 13)) % 19 === 0) {
            r += 16;
            g += 16;
            b += 18;
          }
        } else if (id === 2 || id === 11 || id === 12) {
          const speck = ((x * 3 + y * 5) & 3) - 1;
          r += speck * 5;
          g += speck * 4;
        }
        if (scale > 1) {
          const fx = (x % scale) / scale - 0.5;
          const fy = (y % scale) / scale - 0.5;
          const upY = Math.max(0, cy - 1);
          const dnY = Math.min(rows - 1, cy + 1);
          const nid =
            fx > 0.2 ? terrain[cy * cols + rightX]! : fx < -0.2 ? terrain[cy * cols + leftX]! : fy > 0.2 ? terrain[dnY * cols + cx]! : fy < -0.2 ? terrain[upY * cols + cx]! : id;
          if (nid !== id && view === "terrain") {
            if (id === 1 && (nid === 0 || nid === 16)) {
              r = r * 0.64 + (RGB[0]?.[0] ?? 10) * 0.36;
              g = g * 0.64 + (RGB[0]?.[1] ?? 40) * 0.36;
              b = b * 0.64 + (RGB[0]?.[2] ?? 80) * 0.36;
            } else if (id === 9) {
              r = r * 0.84 + (RGB[9]?.[0] ?? 40) * 0.16;
              g = g * 0.84 + (RGB[9]?.[1] ?? 120) * 0.16;
              b = b * 0.84 + (RGB[9]?.[2] ?? 180) * 0.16;
            } else {
              const eco = ecotoneOf(id, nid);
              if (eco) {
                r = r * 0.58 + eco[0] * 0.42;
                g = g * 0.58 + eco[1] * 0.42;
                b = b * 0.58 + eco[2] * 0.42;
              }
            }
          }
        }
      }
      const left = owner[cy * cols + leftX]!;
      if (political && owner[i] && owner[i] !== left) shade *= 0.62;
      if (plane === "sky") {
        const hole = rel === R_PEAK || upStair[i] === 1;
        r = Math.round(r * 0.72);
        g = Math.round(g * 0.74);
        b = Math.round(b * 0.8);
        if (hole) {
          r = Math.min(255, r + 42);
          g = Math.min(255, g + 38);
          b = Math.min(255, b + 30);
        } else if (field.sky?.[i] === 1) {
          let alpha = 0.5;
          const fx = (x % scale) / scale - 0.5;
          const fy = (y % scale) / scale - 0.5;
          if (Math.max(Math.abs(fx), Math.abs(fy)) > 0.22) {
            const nx = fx > 0 ? rightX : leftX;
            const ny = fy > 0 ? Math.min(rows - 1, cy + 1) : Math.max(0, cy - 1);
            const edgeI = Math.abs(fx) > Math.abs(fy) ? cy * cols + nx : ny * cols + cx;
            if (field.sky?.[edgeI] !== 1) alpha = 0.3;
          }
          r = Math.round(r * (1 - alpha) + 226 * alpha);
          g = Math.round(g * (1 - alpha) + 216 * alpha);
          b = Math.round(b * (1 - alpha) + 198 * alpha);
        }
      } else if (plane === "under") {
        const water = id === 0 || id === 16;
        const shelf = id === 1;
        const u = field.under?.[i] ?? 0;
        const seam = u === 2;
        const open = u === 1 || seam;
        let cr = 46;
        let cg = 38;
        let cb = 32;
        if (water) {
          cr = 10;
          cg = 12;
          cb = 18;
        } else if (shelf) {
          cr = 22;
          cg = 26;
          cb = 32;
        } else if (downStair[i] === 1) {
          cr = 138;
          cg = 82;
          cb = 54;
        } else if (seam) {
          cr = 150;
          cg = 64;
          cb = 40;
        } else if (open) {
          cr = 88;
          cg = 72;
          cb = 58;
        }
        const edge = [terrain[cy * cols + leftX]!, terrain[cy * cols + rightX]!, terrain[Math.max(0, cy - 1) * cols + cx]!, terrain[Math.min(rows - 1, cy + 1) * cols + cx]!];
        if (!water && edge.some((t) => t === 0 || t === 16)) {
          cr += 18;
          cg += 16;
          cb += 12;
        }
        if (open && !water && !shelf) {
          if (view === "height") {
            const t = (height[i] ?? 0) / 255;
            const k = 0.45 + (1 - t) * 0.7;
            cr = Math.round(cr * k);
            cg = Math.round(cg * k);
            cb = Math.round(cb * k);
          } else if (view === "climate") {
            const m = (field.moist[i] ?? 128) / 255;
            cr = Math.round(cr * (1 - m * 0.4) + 36 * m);
            cg = Math.round(cg * (1 - m * 0.25) + 78 * m);
            cb = Math.round(cb * (1 - m * 0.15) + 86 * m);
          }
          if (political && owner[i]) {
            const hex = nationColor(ownerIds[owner[i]! - 1] ?? "");
            if (hex) {
              const n = Number.parseInt(hex.slice(1), 16);
              if (Number.isFinite(n)) {
                cr = Math.round(cr * 0.4 + ((n >> 16) & 255) * 0.6);
                cg = Math.round(cg * 0.4 + ((n >> 8) & 255) * 0.6);
                cb = Math.round(cb * 0.4 + (n & 255) * 0.6);
              }
            }
          }
        }
        r = cr;
        g = cg;
        b = cb;
        shade = Math.max(0.78, Math.min(1.18, 0.96 + light / 90));
      }
      if (dim) {
        r = Math.round(r * 0.55 + 200 * 0.45);
        g = Math.round(g * 0.55 + 196 * 0.45);
        b = Math.round(b * 0.55 + 188 * 0.45);
      }
      if (!reveal && !field.seen?.[i]) {
        r = 24;
        g = 22;
        b = 18;
        shade = 1;
      }
      r = Math.max(0, Math.min(255, Math.round(r * shade)));
      g = Math.max(0, Math.min(255, Math.round(g * shade)));
      b = Math.max(0, Math.min(255, Math.round(b * shade)));
      const p = (y * cols * scale + x) * 4;
      out[p] = r;
      out[p + 1] = g;
      out[p + 2] = b;
      out[p + 3] = 255;
    }
  }
}

function bytesToB64(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, Math.min(bytes.length, i + chunk)));
  }
  return btoa(s);
}

function b64ToBytes(value: string, length: number): Uint8Array {
  const raw = atob(value);
  const out = new Uint8Array(length);
  const n = Math.min(length, raw.length);
  for (let i = 0; i < n; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function latitudeTemp(cols: number, rows: number) {
  const out = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    const t = byte((1 - Math.abs(y / rows - 0.5) * 2) * 220 + 20);
    for (let x = 0; x < cols; x++) out[y * cols + x] = t;
  }
  return out;
}

/**
 * Later staff-only globe preview consumes this same pack on a sphere.
 * Play stays on the unrolled rectangle. Not a camera.
 */
export function globePreviewPack(field: TerrainField): TerrainPack {
  return packTerrain(field);
}

export function packTerrain(field: TerrainField): TerrainPack {
  return {
    cols: field.cols,
    rows: field.rows,
    seed: field.seed,
    sea: field.sea,
    warmth: field.warmth,
    wetness: field.wetness,
    mountains: field.mountains,
    scale: field.scale,
    wrap: field.wrap,
    layout: field.layout,
    level: field.level,
    breakup: field.breakup,
    gap: field.gap,
    cells: bytesToB64(field.terrain),
    height: bytesToB64(field.height),
    temp: bytesToB64(field.temp),
    moist: bytesToB64(field.moist),
    relief: bytesToB64(field.relief),
    owner: bytesToB64(field.owner),
    ownerIds: field.ownerIds,
    hearths: field.hearths,
    columns: field.columns,
    gates: field.gates,
    realms: field.realms,
    known: field.known,
    age: field.age,
    under: bytesToB64(field.under),
    sky: bytesToB64(field.sky),
    seen: bytesToB64(field.seen ?? new Uint8Array(field.cols * field.rows)),
  };
}

function deriveRelief(terrain: Uint8Array, height: Uint8Array): Uint8Array {
  const relief = new Uint8Array(terrain.length);
  for (let i = 0; i < terrain.length; i++) {
    const id = terrain[i]!;
    const h = height[i]!;
    if (id === 0 || id === 16) relief[i] = R_OCEAN;
    else if (id === 1) relief[i] = R_SHELF;
    else if (id === 6) relief[i] = R_ICE;
    else if (h >= 214) relief[i] = R_PEAK;
    else if (h >= 172 || id === 5) relief[i] = R_RANGE;
    else if (h >= 140 || id === 4) relief[i] = R_HILL;
    else relief[i] = R_LOW;
  }
  return relief;
}

export function unpackTerrain(pack: TerrainPack): TerrainField | null {
  if (!pack?.cols || !pack.rows || !pack.cells || !pack.height || !pack.owner) return null;
  if (pack.cols < 16 || pack.rows < 16 || pack.cols > CELL_CAP_COLS || pack.rows > CELL_CAP_ROWS) return null;
  const n = pack.cols * pack.rows;
  const hearths = Array.isArray(pack.hearths) ? pack.hearths : [];
  const age = pack.age ?? 0;
  return {
    cols: pack.cols,
    rows: pack.rows,
    seed: pack.seed || "world",
    sea: pack.sea ?? 46,
    warmth: pack.warmth ?? 50,
    wetness: pack.wetness ?? 50,
    mountains: pack.mountains ?? 42,
    scale: pack.scale ?? 58,
    wrap: pack.wrap !== false,
    layout: pack.layout,
    level: pack.level,
    breakup: pack.breakup,
    gap: pack.gap,
    terrain: b64ToBytes(pack.cells, n),
    height: b64ToBytes(pack.height, n),
    temp: pack.temp ? b64ToBytes(pack.temp, n) : latitudeTemp(pack.cols, pack.rows),
    moist: pack.moist ? b64ToBytes(pack.moist, n) : new Uint8Array(n).fill(128),
    relief: pack.relief ? b64ToBytes(pack.relief, n) : deriveRelief(b64ToBytes(pack.cells, n), b64ToBytes(pack.height, n)),
    owner: b64ToBytes(pack.owner, n),
    ownerIds: Array.isArray(pack.ownerIds) ? pack.ownerIds.filter((id) => typeof id === "string") : [],
    hearths,
    columns: Array.isArray(pack.columns) ? pack.columns : [],
    gates: Array.isArray(pack.gates) ? pack.gates : [],
    realms: Array.isArray(pack.realms) ? pack.realms : [],
    known: pack.known ?? knownForAge(pack.cols, pack.rows, hearths, age),
    age,
    under: pack.under ? b64ToBytes(pack.under, n) : new Uint8Array(n),
    sky: pack.sky ? b64ToBytes(pack.sky, n) : new Uint8Array(n),
    seen: pack.seen ? b64ToBytes(pack.seen, n) : hearthSight(pack.cols, pack.rows, hearths, pack.wrap !== false),
  };
}

/** File load. Unpacks a pack. Does not generate a world. */
export function readTerrainPack(text: string): TerrainField | null {
  try {
    const pack = JSON.parse(text) as TerrainPack;
    if (!pack || typeof pack !== "object") return null;
    return unpackTerrain(pack);
  } catch {
    return null;
  }
}
