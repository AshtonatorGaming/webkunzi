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
    if (pole > 0.058) return 0;
    const lobe = Math.sin(cap * 17 + jag * 8);
    if (lobe < -0.55 || jag > 0.93) return 0;
    if (pole < 0.05) return 16;
    return 0;
  }
  if (relief === R_ICE) return 6;
  if (relief >= R_PEAK) return temp < 0.2 ? 6 : 5;
  if (relief >= R_RANGE) return temp < 0.16 ? 6 : 5;
  if (temp < 0.13) return relief >= R_HILL ? 6 : 15;
  const m = clamp01(moist + (jag - 0.5) * 0.06);
  const t = temp;
  if (t > 0.64 && m > 0.5) return 13;
  if (relief <= R_LOW && m > 0.5 && t > 0.34 && t < 0.64 && jag > 0.52) return 7;
  if (t > 0.56 && m < 0.3) return 8;
  if (t > 0.5 && m < 0.4) return jag > 0.58 ? 12 : 11;
  if (t < 0.34 && m > 0.4) return 14;
  if (t < 0.28) return 15;
  if (m < 0.42) return t > 0.5 ? 12 : 11;
  if (m > 0.46 && t > 0.34 && t < 0.66 && jag > 0.34) return 3;
  if (jag < 0.24 && m < 0.62) return 11;
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

type PlateSeed = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  continental: boolean;
  role: "craton" | "ocean" | "frag" | "hot";
};

const K_NONE = 0;
const K_COLLIDE = 1;
const K_SUB_C = 2;
const K_TRENCH = 3;
const K_RIFT = 4;
const K_SHEAR = 5;

function buildPlates(
  cols: number,
  rows: number,
  wrap: boolean,
  landFrac: number,
  scale: number,
  rand: () => number,
  elevN: (x: number, y: number) => number,
  warpN: (x: number, y: number) => number,
  warpN2: (x: number, y: number) => number,
  ridgeN: (x: number, y: number) => number,
  job: { layout: WorldLayout; breakup: number; gap: number; mountains: number },
): { belt: Float32Array; height: Uint8Array; land: Uint8Array } {
  const wc = CRUST_COLS;
  const wr = CRUST_ROWS;
  const wn = wc * wr;
  const layout = job.layout;
  const sizeK = 0.78 + (scale / 100) * 0.48;
  const breakK = Math.max(0.7, 1 - (job.breakup - 50) * 0.004);
  const R = (n: number) => Math.max(4, n * sizeK * breakK);
  const jx = () => (rand() - 0.5) * wc * 0.012;
  const jy = () => (rand() - 0.5) * wr * 0.016;
  const seeds: PlateSeed[] = [];
  const add = (nx: number, ny: number, vx: number, vy: number, rx: number, ry: number, continental: boolean, role: PlateSeed["role"]) => {
    const id = seeds.length;
    let x = nx * wc + (role === "ocean" ? 0 : jx());
    let y = ny * wr + (role === "ocean" ? 0 : jy());
    if (wrap) x = ((x % wc) + wc) % wc;
    else x = Math.max(8, Math.min(wc - 9, x));
    y = Math.max(6, Math.min(wr - 7, y));
    seeds.push({ id, x, y, vx, vy, rx, ry, continental, role });
  };

  if (layout === "pangaea") {
    add(0.5, 0.4, 0.04, 0.72, R(112), R(50), true, "craton");
    add(0.48, 0.6, -0.02, -0.68, R(104), R(48), true, "craton");
    add(0.08, 0.5, 0.1, 0, 0, 0, false, "ocean");
    add(0.92, 0.48, -0.08, 0, 0, 0, false, "ocean");
  } else if (layout === "archipelago") {
    const n = Math.max(8, Math.min(14, 8 + Math.round((100 - scale) / 18) + Math.round((job.breakup - 40) / 30)));
    for (let k = 0; k < n; k++) {
      const nx = 0.06 + ((k + 0.35) / n) * 0.88;
      const ny = 0.28 + (k % 3) * 0.16 + (k % 2) * 0.04;
      add(nx, ny, Math.cos(k * 1.7), Math.sin(k * 1.3), R(15), R(12), true, "craton");
    }
    add(0.5, 0.12, 0.2, 0.1, 0, 0, false, "ocean");
    add(0.5, 0.88, -0.1, -0.1, 0, 0, false, "ocean");
  } else if (layout === "islands") {
    const n = Math.max(12, Math.min(18, 12 + Math.round(job.breakup / 20)));
    for (let k = 0; k < n; k++) {
      const nx = 0.05 + ((k + 0.4) / n) * 0.9;
      const ny = 0.22 + ((k * 5) % 7) * 0.08;
      const big = k % 7 === 0;
      add(nx, ny, Math.cos(k), Math.sin(k * 0.7), R(big ? 18 : 9), R(big ? 14 : 7), true, "craton");
    }
    add(0.5, 0.1, 0.3, 0, 0, 0, false, "ocean");
  } else if (layout === "continents") {
    const n = job.breakup >= 68 ? 5 : job.breakup <= 34 ? 3 : 4;
    for (let k = 0; k < n; k++) {
      const nx = 0.1 + ((k + 0.5) / n) * 0.8;
      add(nx, 0.42 + (k % 2) * 0.12, k % 2 === 0 ? 0.4 : -0.35, 0.1, R(38), R(46), true, "craton");
    }
    add(0.5, 0.16, 0.2, 0.05, 0, 0, false, "ocean");
  } else if (layout === "theater") {
    add(0.46, 0.48, 0.2, 0.15, R(90), R(58), true, "craton");
    add(0.62, 0.42, -0.25, -0.1, R(48), R(40), true, "craton");
    add(0.12, 0.5, 0.05, 0, 0, 0, false, "ocean");
    add(0.9, 0.5, -0.05, 0, 0, 0, false, "ocean");
  } else {
    const gapPush = (job.gap - 70) * 0.0009;
    add(0.2, 0.46, 0.82, 0.12, R(30), R(64), true, "craton");
    add(0.3, 0.52, -0.78, -0.08, R(28), R(58), true, "craton");
    add(0.74 - gapPush, 0.45, -0.62, 0.34, R(34), R(60), true, "craton");
    add(0.8 - gapPush * 0.4, 0.58, -0.58, -0.42, R(24), R(42), true, "craton");
    add(0.03, 0.5, 0.12, 0.02, 0, 0, false, "ocean");
    add(0.52, 0.46, 0.58, 0.02, 0, 0, false, "ocean");
    add(0.97, 0.5, 0.16, 0, 0, 0, false, "ocean");
    add(0.5, 0.2, 0.2, 0.05, 0, 0, false, "ocean");
    add(0.5, 0.84, 0.42, 0.02, 0, 0, false, "hot");
    add(0.5, 0.34, 0.5, 0.04, R(8), R(6), true, "frag");
    add(0.55, 0.66, 0.48, -0.02, R(7), R(5), true, "frag");
  }

  const plate = new Int16Array(wn);
  for (let y = 0; y < wr; y++) {
    const ny = (y + 0.5) / wr;
    for (let x = 0; x < wc; x++) {
      const ang = (x / wc) * Math.PI * 2;
      let px = x + (cylinder(warpN, ang, ny, 2.2, 2) - 0.5) * 34;
      let py = y + (cylinder(warpN2, ang + 0.9, ny, 1.6, 2) - 0.5) * 18;
      if (wrap) px = ((px % wc) + wc) % wc;
      else px = Math.max(0, Math.min(wc - 1, px));
      py = Math.max(0, Math.min(wr - 1, py));
      let best = 1e9;
      let id = 0;
      for (let s = 0; s < seeds.length; s++) {
        const seed = seeds[s]!;
        let dx = px + 0.5 - seed.x;
        if (wrap) {
          if (dx > wc * 0.5) dx -= wc;
          else if (dx < -wc * 0.5) dx += wc;
        }
        const dy = py + 0.5 - seed.y;
        const d = Math.hypot(dx, dy);
        if (d < best) {
          best = d;
          id = seed.id;
        }
      }
      plate[y * wc + x] = id;
    }
  }

  const heightC = new Float32Array(wn);
  const beltC = new Float32Array(wn);
  for (let y = 0; y < wr; y++) {
    const ny = (y + 0.5) / wr;
    const pole = Math.min(ny, 1 - ny);
    for (let x = 0; x < wc; x++) {
      const ang = (x / wc) * Math.PI * 2;
      const i = y * wc + x;
      const seaFloor = 0.15 + cylinder(elevN, ang, ny, 0.55, 2) * 0.07;
      let sx = x + (cylinder(warpN, ang + 0.4, ny, 1.05, 3) - 0.5) * 15;
      let sy = y + (cylinder(warpN2, ang + 1.2, ny, 0.8, 2) - 0.5) * 9;
      if (wrap) sx = ((sx % wc) + wc) % wc;
      else sx = Math.max(0, Math.min(wc - 1, sx));
      sy = Math.max(0, Math.min(wr - 1, sy));
      const fret = 0.9 + cylinder(warpN2, ang, ny, 4.4, 2) * 0.2;
      let c = 0;
      for (let s = 0; s < seeds.length; s++) {
        const seed = seeds[s]!;
        if (!seed.continental || seed.rx < 1) continue;
        let dx = sx - seed.x;
        if (wrap) {
          if (dx > wc * 0.5) dx -= wc;
          else if (dx < -wc * 0.5) dx += wc;
        }
        const dy = sy - seed.y;
        const e = Math.hypot(dx / seed.rx, dy / seed.ry);
        const g = Math.exp(-e * e * 2.15) * fret;
        if (g > c) c = g;
      }
      if (pole < 0.09) c *= pole / 0.09;
      let h = seaFloor;
      if (c > 0.05) h = Math.max(h, 0.5 + ((c - 0.05) / 0.95) * 0.1);
      if (pole < 0.08) {
        const t = pole / 0.08;
        h = seaFloor + (h - seaFloor) * t * t;
      }
      heightC[i] = h;
    }
  }

  const kind = new Uint8Array(wn);
  const dist = new Uint16Array(wn).fill(65535);
  const q: number[] = [];
  const trench: { x: number; y: number; nx: number; ny: number }[] = [];
  for (let y = 0; y < wr; y++) {
    for (let x = 0; x < wc; x++) {
      const i = y * wc + x;
      const pid = plate[i]!;
      const sp = seeds[pid]!;
      let best = K_NONE;
      let rank = -1;
      let tnx = 0;
      let tny = 0;
      let sawTrench = false;
      for (const [dx, dy] of N8) {
        const yy = y + dy;
        if (yy < 0 || yy >= wr) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + wc) % wc;
        else if (xx < 0 || xx >= wc) continue;
        const qid = plate[yy * wc + xx]!;
        if (qid === pid) continue;
        const sq = seeds[qid]!;
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;
        const approach = (sp.vx - sq.vx) * nx + (sp.vy - sq.vy) * ny;
        const both = sp.continental && sq.continental && sp.role !== "frag" && sq.role !== "frag";
        const one = sp.continental !== sq.continental;
        let k = K_SHEAR;
        let r = 1;
        if (approach > 0.28 && both) {
          k = K_COLLIDE;
          r = 5;
        } else if (approach > 0.22 && one && sp.continental && sp.role !== "frag") {
          k = K_SUB_C;
          r = 4;
        } else if (approach > 0.22 && one && !sp.continental && sq.continental && sq.role !== "frag") {
          k = K_TRENCH;
          r = 3;
          sawTrench = true;
          tnx -= nx;
          tny -= ny;
        } else if (approach < -0.28) {
          k = K_RIFT;
          r = 2;
        }
        if (r > rank) {
          rank = r;
          best = k;
        }
      }
      if (!best) continue;
      kind[i] = best;
      dist[i] = 0;
      q.push(i);
      if (sawTrench && best === K_TRENCH) trench.push({ x, y, nx: tnx, ny: tny });
    }
  }
  for (let head = 0; head < q.length; head++) {
    const i = q[head]!;
    const d = dist[i]!;
    if (d >= 12) continue;
    const y = (i / wc) | 0;
    const x = i - y * wc;
    for (const [dx, dy] of N8) {
      const yy = y + dy;
      if (yy < 0 || yy >= wr) continue;
      let xx = x + dx;
      if (wrap) xx = (xx + wc) % wc;
      else if (xx < 0 || xx >= wc) continue;
      const j = yy * wc + xx;
      if (dist[j]! <= d + 1) continue;
      dist[j] = d + 1;
      kind[j] = kind[i]!;
      q.push(j);
    }
  }

  let passY = wr * 0.5;
  const collideYs: number[] = [];
  for (let y = 0; y < wr; y++) {
    for (let x = 0; x < wc * 0.46; x++) {
      const i = y * wc + x;
      if (kind[i] === K_COLLIDE && dist[i] === 0) collideYs.push(y);
    }
  }
  if (collideYs.length) {
    collideYs.sort((a, b) => a - b);
    passY = collideYs[collideYs.length >> 1]! + (rand() - 0.5) * 8;
  }

  const mScale = job.mountains < 12 ? 0 : (0.55 + ((job.mountains - 12) / 88) * 0.9) / 0.86;
  for (let y = 0; y < wr; y++) {
    const ny = (y + 0.5) / wr;
    for (let x = 0; x < wc; x++) {
      const i = y * wc + x;
      const k = kind[i]!;
      const d = dist[i]!;
      if (!k || d > 12 || mScale === 0) continue;
      const ridge = 0.82 + ridged(ridgeN, (x / wc) * 7, (y / wr) * 5) * 0.36;
      let addH = 0;
      if (k === K_COLLIDE) {
        const pass = layout === "earthlike" && x < wc * 0.46 && Math.abs(y - passY) < 6 && d <= 1;
        const spine = 0.34 * Math.exp(-(d * d) / 12) * ridge * (pass ? 0.22 : 1);
        const flank = spine < 0.12 && d <= 9 ? 0.11 * Math.exp(-((d - 4) * (d - 4)) / 16) : 0;
        addH = Math.max(spine, flank);
      } else if (k === K_SUB_C) {
        addH = 0.3 * Math.exp(-d / 3.4) * ridge;
      } else if (k === K_SHEAR && d <= 5 && seeds[plate[i]!]!.role === "craton") {
        addH = 0.11 * Math.exp(-d / 2.4);
      } else if (k === K_RIFT && d <= 3) {
        addH = 0.045 * Math.exp(-d / 2);
      } else if (k === K_TRENCH && d <= 2) {
        if (heightC[i]! < 0.4) heightC[i] = Math.min(heightC[i]!, 0.07);
        continue;
      }
      addH *= mScale;
      if (addH > 0) {
        heightC[i] = Math.min(1, heightC[i]! + addH);
        const b = Math.min(1, addH / 0.22);
        if (b > beltC[i]!) beltC[i] = b;
        if (k === K_COLLIDE && d === 0 && !(layout === "earthlike" && Math.abs(y - passY) < 6 && x < wc * 0.46)) beltC[i] = 1;
      }
    }
  }

  const sorted = Float32Array.from(heightC);
  sorted.sort();
  const sea = sorted[Math.min(wn - 1, Math.max(0, Math.floor((1 - landFrac) * wn)))]!;

  const coastN = new Float32Array(wn);
  for (let y = 0; y < wr; y++) {
    for (let x = 0; x < wc; x++) coastN[y * wc + x] = cylinder(warpN, (x / wc) * Math.PI * 2 + 2.2, y / wr, 5.5, 2);
  }
  for (let y = 1; y < wr - 1; y++) {
    for (let x = 0; x < wc; x++) {
      const i = y * wc + x;
      const land = heightC[i]! > sea;
      let waters = 0;
      let lands = 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        let xx = x + dx;
        if (wrap) xx = (xx + wc) % wc;
        else if (xx < 0 || xx >= wc) continue;
        const yy = y + dy;
        if (heightC[yy * wc + xx]! > sea) lands += 1;
        else waters += 1;
      }
      const near = Math.abs(heightC[i]! - sea) < 0.045;
      if (!near) continue;
      if (land && waters >= 2 && coastN[i]! < 0.32) heightC[i] = sea - 0.012;
      else if (!land && lands >= 2 && coastN[i]! > 0.74) heightC[i] = sea + 0.018;
    }
  }

  const allowIsles = layout === "earthlike" || layout === "archipelago" || layout === "islands";
  if (allowIsles) {
    const landNow = (x: number, y: number) => heightC[y * wc + x]! > sea;
    const far = (x: number, y: number, rad: number) => {
      const r = Math.ceil(rad + 2);
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 2 || yy >= wr - 2) return false;
        const ny = (yy + 0.5) / wr;
        if (Math.min(ny, 1 - ny) < 0.1) return false;
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > (rad + 2) * (rad + 2)) continue;
          let xx = x + dx;
          if (wrap) xx = (xx + wc) % wc;
          else if (xx < 0 || xx >= wc) return false;
          if (landNow(xx, yy)) return false;
        }
      }
      return true;
    };
    const stamp = (cx: number, cy: number, rad: number, peak: number) => {
      const x0 = Math.round(cx);
      const y0 = Math.round(cy);
      if (y0 < 3 || y0 >= wr - 3) return false;
      let xh = x0;
      if (wrap) xh = ((xh % wc) + wc) % wc;
      else if (xh < 2 || xh >= wc - 2) return false;
      if (!far(xh, y0, rad)) return false;
      const ang = (xh / wc) * Math.PI * 2;
      const squash = 0.62 + cylinder(warpN, ang, y0 / wr, 3.2, 2) * 0.7;
      const rot = cylinder(warpN2, ang + 0.4, y0 / wr, 2.1, 1) * Math.PI;
      const cs = Math.cos(rot);
      const sn = Math.sin(rot);
      for (let dy = -Math.ceil(rad); dy <= rad; dy++) {
        const yy = y0 + dy;
        if (yy < 0 || yy >= wr) continue;
        for (let dx = -Math.ceil(rad); dx <= rad; dx++) {
          const lx = dx * cs + dy * sn;
          const ly = -dx * sn + dy * cs;
          const e = Math.hypot(lx / squash, ly * squash) / rad;
          if (e > 1) continue;
          let xx = xh + dx;
          if (wrap) xx = (xx + wc) % wc;
          else if (xx < 0 || xx >= wc) continue;
          const j = yy * wc + xx;
          const jag = 0.72 + cylinder(ridgeN, ang + dx * 0.17, yy / wr, 4.2, 2) * 0.5;
          const lift = sea + 0.04 + peak * jag * (1 - e) * (1 - e);
          if (lift > heightC[j]!) heightC[j] = lift;
          const b = (1 - e) * 0.7;
          if (b > beltC[j]!) beltC[j] = b;
        }
      }
      return true;
    };

    trench.sort((a, b) => a.y - b.y || a.x - b.x);
    let lastY = -99;
    let arcs = 0;
    for (const t of trench) {
      if (arcs >= 14) break;
      const gapY = 8 + Math.floor(rand() * 8);
      if (t.y - lastY < gapY && arcs > 0) continue;
      const mag = Math.hypot(t.nx, t.ny) || 1;
      const along = (rand() - 0.5) * 7;
      let placed = false;
      const step0 = 5 + Math.floor(rand() * 6);
      for (let step = step0; step <= step0 + 4 && !placed; step++) {
        const cx = t.x + (t.nx / mag) * step + (-t.ny / mag) * along;
        const cy = t.y + (t.ny / mag) * step + (t.nx / mag) * along;
        placed = stamp(cx, cy, 1.7 + rand() * 1.8, 0.28 + rand() * 0.22);
      }
      if (placed) {
        arcs += 1;
        lastY = t.y;
      }
    }

    const hot = seeds.find((s) => s.role === "hot");
    if (hot) {
      let x = hot.x + (rand() - 0.5) * 10;
      let y = hot.y + (rand() - 0.5) * 6;
      const sx = hot.vx === 0 ? 1 : -Math.sign(hot.vx);
      const ky = (rand() - 0.5) * 0.8;
      for (let s = 0; s < 6; s++) {
        stamp(x, y, 2.2 - s * 0.22 + rand() * 0.35, 0.34 - s * 0.04);
        x += sx * (7 + rand() * 8);
        y += ky * 8 + (rand() - 0.5) * 5;
        if (wrap) x = ((x % wc) + wc) % wc;
      }
    }
  }

  const height = new Uint8Array(cols * rows);
  const land = new Uint8Array(cols * rows);
  const belt = new Float32Array(cols * rows);
  const elevByte = (h: number) => {
    if (h <= sea) {
      const t = clamp01((sea - h) / 0.4);
      return byte(76 - t * 56);
    }
    const elev = clamp01((h - sea) / 0.55);
    if (elev < 0.3) return byte(116 + (elev / 0.3) * 22);
    if (elev < 0.48) return byte(140 + ((elev - 0.3) / 0.18) * 30);
    if (elev < 0.74) return byte(173 + ((elev - 0.48) / 0.26) * 38);
    return byte(216 + Math.min(1, (elev - 0.74) / 0.26) * 26);
  };
  for (let y = 0; y < rows; y++) {
    const gy = ((y + 0.5) / rows) * wr - 0.5;
    const y0 = Math.max(0, Math.min(wr - 1, Math.floor(gy)));
    const y1 = Math.max(0, Math.min(wr - 1, y0 + 1));
    const ty = Math.max(0, Math.min(1, gy - Math.floor(gy)));
    for (let x = 0; x < cols; x++) {
      let gx = ((x + 0.5) / cols) * wc - 0.5;
      if (wrap) gx = ((gx % wc) + wc) % wc;
      else gx = Math.max(0, Math.min(wc - 1, gx));
      const x0f = Math.floor(gx);
      const tx = gx - x0f;
      let x0 = x0f;
      let x1 = x0f + 1;
      if (wrap) {
        x0 = ((x0 % wc) + wc) % wc;
        x1 = (x0 + 1) % wc;
      } else {
        x0 = Math.max(0, Math.min(wc - 1, x0));
        x1 = Math.max(0, Math.min(wc - 1, x1));
      }
      const a = heightC[y0 * wc + x0]!;
      const b = heightC[y0 * wc + x1]!;
      const c = heightC[y1 * wc + x0]!;
      const d = heightC[y1 * wc + x1]!;
      const h = a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
      const i = y * cols + x;
      const hb = elevByte(h);
      height[i] = hb;
      land[i] = h > sea ? 1 : 0;
      let bx = Math.round(((x + 0.5) / cols) * wc);
      const by = Math.max(0, Math.min(wr - 1, Math.round(((y + 0.5) / rows) * wr)));
      if (wrap) bx = ((bx % wc) + wc) % wc;
      else bx = Math.max(0, Math.min(wc - 1, bx));
      belt[i] = beltC[by * wc + bx]!;
    }
  }
  if (job.mountains < 12) {
    belt.fill(0);
    for (let i = 0; i < land.length; i++) {
      if (!land[i]) continue;
      if (height[i]! >= 168) height[i] = 132;
    }
  }
  return { belt, height, land };
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

  const crust = buildPlates(cols, rows, wrap, landFrac, scale, rand, elevN, warpN, warpN2, ridgeN, {
    layout,
    breakup,
    gap,
    mountains,
  });
  const belt = crust.belt;
  const landMask = crust.land;
  const height = crust.height;

  const jag = new Float32Array(n);
  for (let y = 0; y < rows; y++) {
    const ny = y / rows;
    for (let x = 0; x < cols; x++) {
      jag[y * cols + x] = cylinder(warpN, (x / cols) * Math.PI * 2 + 0.7, ny, 2.4, 3);
    }
  }

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
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (landMask[i]) continue;
      const near = oceanNear[i]!;
      const deep = height[i]!;
      if (near > 0) {
        const plan = shelfPlan(x, y, cols, rows, landMask, jag[i]!, layout, wrap);
        shelfLim[i] = plan.reach;
        if (plan.reach > 0 && near <= plan.reach) height[i] = 84 - Math.min(near, 7) * 5;
        else if (plan.trench && near === plan.reach + 1) height[i] = byte(Math.max(8, deep * 0.55));
      }
    }
  }
  clampLandHistogram(height, landMask, belt);

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
  flowRivers(terrain, height, relief, cols, rows, wrap, belt, moistA);
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
  const next = new Uint8Array(terrain);
  const tally = new Uint16Array(TERRAINS.length);
  const water = (id: number) => id === 0 || id === 1 || id === 16;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const id0 = terrain[i]!;
      if (!water(id0)) continue;
      tally.fill(0);
      tally[id0] += 4;
      for (const [dx, dy] of N8) {
        const ny = y + dy;
        if (ny < 0 || ny >= rows) continue;
        const nx = wrap ? (x + dx + cols) % cols : x + dx;
        if (nx < 0 || nx >= cols) continue;
        const nid = terrain[ny * cols + nx]!;
        if (!water(nid)) continue;
        tally[nid] += 1;
      }
      let best = id0;
      let bestN = -1;
      for (const t of [0, 1, 16]) {
        if (tally[t]! > bestN) {
          bestN = tally[t]!;
          best = t;
        }
      }
      const selfN = tally[id0]!;
      if (best !== id0 && bestN >= selfN + 2) next[i] = best;
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
      if (id === 16 && wedge && jag[i]! > 0.55) terrain[i] = 0;
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
  moist?: Uint8Array,
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
    if (water(terrain[i]!) || terrain[i] === 6 || relief[i]! >= R_PEAK) continue;
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
    const drop = relief[i]! >= R_HILL ? 8 : 5;
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

  if (moist) {
    for (let i = 0; i < n; i++) {
      if (terrain[i] !== 9) continue;
      moist[i] = Math.min(255, moist[i]! + 28);
      const y = (i / cols) | 0;
      const x = i - y * cols;
      for (const [dx, dy] of side) {
        const ny = y + dy;
        if (ny < 0 || ny >= rows) continue;
        let nx = x + dx;
        if (wrap) nx = (nx + cols) % cols;
        else if (nx < 0 || nx >= cols) continue;
        const j = ny * cols + nx;
        if (water(terrain[j]!) || terrain[j] === 9 || terrain[j] === 6) continue;
        if (relief[j]! >= R_PEAK) continue;
        moist[j] = Math.min(255, moist[j]! + 18);
      }
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
