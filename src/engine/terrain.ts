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
  /** Derived legend id. Not the rules. */
  height: Uint8Array;
  temp: Uint8Array;
  moist: Uint8Array;
  relief: Uint8Array;
  /** 0 none, 1 channel, 2 floodplain, 3 lake, 4 coast. Independent of cover. */
  water: Uint8Array;
  /** Climate cover. Rivers do not erase this. */
  cover: Uint8Array;
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
  water?: string;
  cover?: string;
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

const CRUST_COLS = 360;
const CRUST_ROWS = 206;

const W_NONE = 0;
const W_CHANNEL = 1;
const W_FLOOD = 2;
const W_LAKE = 3;
const W_COAST = 4;

export type CellStack = {
  relief: number;
  cover: number;
  water: number;
  temp: number;
  moist: number;
  height: number;
};

export type CellEffects = {
  move: number;
  forage: number;
  defense: number;
  conceal: number;
  disease: number;
  supply: number;
  tags: string[];
};

function landFracFor(layout: WorldLayout, sea: number): number {
  let f = 0.34 - (sea - 46) * 0.0042;
  if (layout === "pangaea") f = Math.max(f, 0.5);
  else if (layout === "archipelago") f = Math.min(f, 0.18);
  else if (layout === "islands") f = Math.min(f, 0.12);
  else if (layout === "theater") f = Math.max(0.4, Math.min(0.55, f + 0.1));
  else if (layout === "continents" || layout === "earthlike") f = Math.min(0.4, Math.max(0.28, f));
  return Math.max(0.08, Math.min(0.62, f));
}

function freqFor(layout: WorldLayout, scale: number, breakup: number): number {
  const base = 0.34 + ((100 - scale) / 100) * 0.7;
  const br = breakup / 100;
  if (layout === "pangaea") return Math.max(0.22, base * 0.48);
  if (layout === "islands") return base * (1.35 + br * 0.8);
  if (layout === "archipelago") return base * (1.15 + br * 0.55);
  if (layout === "theater") return base * 0.8;
  return base * (0.9 + br * 0.35);
}

function cylSample(noise: (x: number, y: number) => number, ang: number, ny: number, freq: number, octaves: number) {
  return cylinder(noise, ang, ny, Math.max(0.2, freq), octaves);
}

function cylRidge(noise: (x: number, y: number) => number, ang: number, ny: number, turns: number) {
  const radius = 16 + turns * 4;
  const x = Math.cos(ang) * radius;
  const z = Math.sin(ang) * radius;
  return ridged(noise, x * 0.31 + 11, ny * (5.5 + turns) + z * 0.2);
}

type FieldNoise = {
  elev: (x: number, y: number) => number;
  warp: (x: number, y: number) => number;
  ridge: (x: number, y: number) => number;
  drain: (x: number, y: number) => number;
  moist: (x: number, y: number) => number;
};

function noisesFor(seed: string, age: number): FieldNoise {
  const base = hashSeed(seed || "inkunzi") ^ Math.imul((age + 1) >>> 0, 0x9e3779b9);
  return {
    elev: makeNoise(mulberry32(base)),
    warp: makeNoise(mulberry32(base ^ 0x85ebca6b)),
    ridge: makeNoise(mulberry32(base ^ 0x27d4eb2f)),
    drain: makeNoise(mulberry32(base ^ 0xc2b2ae35)),
    moist: makeNoise(mulberry32(base ^ 0x165667b1)),
  };
}

function sampleCyl(
  noise: (x: number, y: number) => number,
  ang: number,
  ny: number,
  radius: number,
  ySpan: number,
  octaves: number,
) {
  const x = Math.cos(ang) * radius;
  const z = Math.sin(ang) * radius;
  return fbm(noise, x * 0.5 + 17.2, ny * ySpan + z * 0.32, octaves);
}

function sampleColumn(
  noise: FieldNoise,
  x: number,
  y: number,
  cols: number,
  rows: number,
  wrap: boolean,
  freq: number,
  phase: number,
  breakup: number,
  layout: WorldLayout,
): { elev: number; crest: number; drainage: number } {
  const ang = wrap ? (x / cols) * Math.PI * 2 + phase : phase + (x / cols) * Math.PI * 1.4;
  const ny = rows <= 1 ? 0 : y / (rows - 1);
  const br = breakup / 100;
  const f = Math.max(0.75, Math.min(1.45, 0.85 + freq * 0.25));
  let broadR = 1.62 * f;
  let midR = 3.15 * f;
  let detailR = (7.5 + br * 5) * Math.max(0.8, freq);
  let yB = 1.85;
  let yM = 2.7;
  let wB = 0.56;
  let wM = 0.32;
  let wD = 0.1 + br * 0.05;
  if (layout === "pangaea") {
    broadR = 1.02;
    midR = 1.7;
    detailR = 4.2;
    yB = 1.35;
    yM = 1.8;
    wB = 0.84;
    wM = 0.12;
    wD = 0.05;
  } else if (layout === "archipelago") {
    broadR = 2.5 * f;
    midR = 4.6 * f;
    detailR = 10 + br * 4;
    yB = 3.1;
    yM = 4.2;
    wB = 0.18;
    wM = 0.36;
    wD = 0.42;
  } else if (layout === "islands") {
    broadR = 3.1 * f;
    midR = 6.4 * f;
    detailR = 13 + br * 4;
    yB = 3.8;
    yM = 5.2;
    wB = 0.1;
    wM = 0.28;
    wD = 0.58;
  } else if (layout === "theater") {
    broadR = 1.35;
    midR = 2.5;
    detailR = 6;
    wB = 0.62;
    wM = 0.26;
    wD = 0.1;
  } else if (layout === "continents") {
    broadR = 1.85 * f;
    midR = 3.5 * f;
    wB = 0.5;
    wM = 0.36;
    wD = 0.12 + br * 0.04;
  }
  const wx = sampleCyl(noise.warp, ang, ny, broadR * 1.2, yB, 3);
  const wy = sampleCyl(noise.warp, ang + 1.7, ny + 0.2, broadR, yB + 0.4, 3);
  const ang2 = ang + (wx - 0.5) * (layout === "pangaea" ? 0.28 : 0.62);
  const ny2 = clamp01(ny + (wy - 0.5) * 0.16);
  let broad: number;
  let mid: number;
  let detail: number;
  if (wrap) {
    broad = sampleCyl(noise.elev, ang2, ny2, broadR, yB, 4);
    mid = sampleCyl(noise.elev, ang2 + 2.1, ny2, midR, yM, 3);
    detail = sampleCyl(noise.elev, ang2 + 4.2, ny2, detailR, yM + 1.4, 3);
  } else {
    const nx = x / cols + phase * 0.2;
    broad = fbm(noise.elev, nx * 2.1 + (wx - 0.5) * 0.4, ny * 1.7 + (wy - 0.5) * 0.3, 4);
    mid = fbm(noise.elev, nx * 4.2 + 2, ny * 3.1, 3);
    detail = fbm(noise.elev, nx * (7 + br * 4) + 5, ny * 5.5, 3);
  }
  const crestR = layout === "pangaea" ? 7.4 : layout === "islands" ? 9.5 : layout === "archipelago" ? 8.2 : 6.6;
  const rgNoise = noise.ridge;
  let crestRaw: number;
  if (wrap) {
    const rx = Math.cos(ang2 * 1.65) * crestR;
    const rz = Math.sin(ang2 * 1.65) * crestR;
    crestRaw = ridged(rgNoise, rx * 0.4 + 8.2, ny2 * 4.4 + rz * 0.34);
  } else {
    crestRaw = ridged(rgNoise, (x / cols) * 5.5 + phase, ny * 4.2);
  }
  const crest = Math.pow(clamp01((crestRaw - 0.52) / 0.48), 1.55);
  const drainage = wrap
    ? sampleCyl(noise.drain, ang + 0.6, ny, 3.3, 2.8, 3)
    : fbm(noise.drain, (x / cols) * 3 + 1, ny * 2.5, 3);
  let elev = broad * wB + mid * wM + detail * wD + crest * (layout === "islands" ? 0.02 : 0.05);
  const pole = Math.min(ny, 1 - ny);
  if (pole < 0.13) {
    const t = pole / 0.13;
    elev *= 0.12 + 0.88 * t * t;
  }
  return { elev, crest, drainage };
}

function blurField(src: Float32Array, cols: number, rows: number, wrap: boolean, self: number) {
  const out = new Float32Array(src.length);
  const edge = (1 - self) / 4;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let s = src[y * cols + x]! * self;
      let w = self;
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
        s += src[yy * cols + xx]! * edge;
        w += edge;
      }
      out[y * cols + x] = s / w;
    }
  }
  return out;
}

function buildScalarFields(
  cols: number,
  rows: number,
  wrap: boolean,
  noise: FieldNoise,
  freq: number,
  phase: number,
  breakup: number,
  layout: WorldLayout,
): { elev: Float32Array; crest: Float32Array; drainage: Float32Array } {
  const n = cols * rows;
  const elev = new Float32Array(n);
  const crest = new Float32Array(n);
  const drainage = new Float32Array(n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const s = sampleColumn(noise, x, y, cols, rows, wrap, freq, phase, breakup, layout);
      const i = y * cols + x;
      elev[i] = s.elev;
      crest[i] = s.crest;
      drainage[i] = s.drainage;
    }
  }
  const smooth = layout === "islands" || layout === "archipelago" ? 0.84 : layout === "pangaea" ? 0.55 : 0.7;
  const blurred = blurField(elev, cols, rows, wrap, smooth);
  const crestBlur = blurField(crest, cols, rows, wrap, 0.78);
  return { elev: blurred, crest: crestBlur, drainage };
}

function thresholdAt(elev: Float32Array, landFrac: number): number {
  const copy = Array.from(elev);
  copy.sort((a, b) => a - b);
  const i = Math.max(0, Math.min(copy.length - 1, Math.floor((1 - landFrac) * (copy.length - 1))));
  return copy[i]!;
}

function labelLand(mask: Uint8Array, cols: number, rows: number, wrap: boolean): { n: number; y: number; id: number }[] {
  const n = cols * rows;
  const seen = new Uint8Array(n);
  const bodies: { n: number; y: number; id: number }[] = [];
  const stack: number[] = [];
  for (let i = 0; i < n; i++) {
    if (seen[i] || !mask[i]) continue;
    let count = 0;
    let sy = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const k = stack.pop()!;
      count += 1;
      const y = (k / cols) | 0;
      sy += y;
      const x = k - y * cols;
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
        if (seen[j] || !mask[j]) continue;
        seen[j] = 1;
        stack.push(j);
      }
    }
    const cy = sy / count / rows;
    if (cy > 0.08 && cy < 0.92) bodies.push({ n: count, y: cy, id: bodies.length });
  }
  return bodies;
}

function maskFrom(elev: Float32Array, sea: number): Uint8Array {
  const mask = new Uint8Array(elev.length);
  for (let i = 0; i < elev.length; i++) if (elev[i]! > sea) mask[i] = 1;
  return mask;
}

function layoutOk(layout: WorldLayout, bodies: { n: number }[], landCells: number): boolean {
  const big = (min: number) => bodies.filter((b) => b.n >= min);
  if (layout === "pangaea") {
    const b = big(80);
    if (b.length !== 1) return false;
    const sum = b.reduce((s, x) => s + x.n, 0);
    return b[0]!.n / Math.max(1, sum) > 0.8;
  }
  if (layout === "archipelago") return big(12).length >= 6;
  if (layout === "islands") {
    const b = big(8);
    if (b.length < 8) return false;
    const sum = bodies.reduce((s, x) => s + x.n, 0) || landCells;
    const largest = b.reduce((m, x) => Math.max(m, x.n), 0);
    return largest / Math.max(1, sum) <= 0.35;
  }
  const large = bodies.filter((b) => b.n >= Math.max(80, landCells * 0.02));
  if (large.length < 2 || large.length > 6) return false;
  const sum = bodies.reduce((s, x) => s + x.n, 0) || 1;
  const largest = large.reduce((m, x) => Math.max(m, x.n), 0);
  return largest / sum < 0.7 && bodies.filter((b) => b.n >= 3).length >= 5;
}

function bridgeLargest(elev: Float32Array, sea: number, cols: number, rows: number, wrap: boolean) {
  const mask = maskFrom(elev, sea);
  const comp = new Int32Array(elev.length).fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];
  for (let i = 0; i < elev.length; i++) {
    if (comp[i]! >= 0 || !mask[i]) continue;
    const id = sizes.length;
    let count = 0;
    stack.push(i);
    comp[i] = id;
    while (stack.length) {
      const k = stack.pop()!;
      count += 1;
      const y = (k / cols) | 0;
      const x = k - y * cols;
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
        if (comp[j]! >= 0 || !mask[j]) continue;
        comp[j] = id;
        stack.push(j);
      }
    }
    sizes.push(count);
  }
  if (sizes.length < 2) return;
  let a = 0;
  let b = 1;
  for (let i = 1; i < sizes.length; i++) if (sizes[i]! > sizes[a]!) a = i;
  for (let i = 0; i < sizes.length; i++) if (i !== a && sizes[i]! > sizes[b]!) b = i;
  let start = -1;
  for (let i = 0; i < elev.length; i++) if (comp[i] === a) { start = i; break; }
  if (start < 0) return;
  const dist = new Float32Array(elev.length).fill(1e9);
  const prev = new Int32Array(elev.length).fill(-1);
  const heapC: number[] = [];
  const heapI: number[] = [];
  dist[start] = 0;
  hpush(heapC, heapI, 0, start);
  let hit = -1;
  while (heapC.length) {
    const popped = hpop(heapC, heapI);
    if (!popped) break;
    const [cost, i] = popped;
    if (cost > dist[i]! + 1e-4) continue;
    if (comp[i] === b) { hit = i; break; }
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
      const step = Math.max(0, elev[j]! - (sea + 0.012));
      const next = cost + step + 0.0001;
      if (next < dist[j]!) {
        dist[j] = next;
        prev[j] = i;
        hpush(heapC, heapI, next, j);
      }
    }
  }
  if (hit < 0) return;
  let c = hit;
  let guard = cols + rows;
  while (c >= 0 && guard-- > 0) {
    if (elev[c]! <= sea) elev[c] = sea + 0.02;
    c = prev[c]!;
  }
}

function layoutScore(layout: WorldLayout, bodies: { n: number }[], landN: number, frac: number, target: number): number {
  const sizes = bodies.map((b) => b.n).sort((a, b) => b - a);
  let score = -Math.abs(frac - target) * 6;
  if (layout === "pangaea") {
    const big = sizes.filter((n) => n >= 80);
    score += big.length === 1 ? 8 : -Math.abs(big.length - 1) * 3;
    const top = sizes[0] ?? 0;
    if (landN > 0 && top / landN > 0.8) score += 4;
  } else if (layout === "archipelago") {
    score += Math.min(10, sizes.filter((n) => n >= 12).length) * 1.4;
  } else if (layout === "islands") {
    const b = sizes.filter((n) => n >= 8);
    score += Math.min(12, b.length);
    const sum = sizes.reduce((s, n) => s + n, 0) || 1;
    const largest = sizes[0] ?? 0;
    score += largest / sum <= 0.35 ? 4 : -3;
  } else {
    const cut = Math.max(80, landN * 0.02);
    const large = sizes.filter((n) => n >= cut);
    if (large.length >= 2 && large.length <= 6) score += 5;
    else score -= Math.abs(Math.min(large.length, 8) - 3) * 1.6;
    const sum = sizes.reduce((s, n) => s + n, 0) || 1;
    if ((sizes[0] ?? 0) / sum < 0.7) score += 3;
    else score -= 2;
    if (sizes.filter((n) => n >= 3).length >= 5) score += 2;
    if ((sizes[0] ?? 0) >= 80 && sizes.filter((n) => n >= 12).length >= 2) score += 1.5;
  }
  return score;
}

function scrubSpecks(elev: Float32Array, sea: number, cols: number, rows: number, wrap: boolean) {
  const n = elev.length;
  const land = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (elev[i]! > sea) land[i] = 1;
  const next = new Float32Array(elev);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let friends = 0;
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
        if (land[yy * cols + xx]) friends += 1;
      }
      if (land[i] && friends === 0) next[i] = sea - 0.004;
      else if (!land[i] && friends === 4) next[i] = sea + 0.012;
    }
  }
  elev.set(next);
}

function fitSea(
  elev: Float32Array,
  cols: number,
  rows: number,
  wrap: boolean,
  layout: WorldLayout,
  landFrac: number,
): number {
  let sea = thresholdAt(elev, landFrac);
  let bestSea = sea;
  let bestScore = -1e9;
  for (let step = 0; step < 8; step++) {
    const mask = maskFrom(elev, sea);
    let landN = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i]) landN += 1;
    const frac = landN / elev.length;
    const bodies = labelLand(mask, cols, rows, wrap);
    const score = layoutScore(layout, bodies, landN, frac, landFrac);
    if (score > bestScore) {
      bestScore = score;
      bestSea = sea;
    }
    if (layoutOk(layout, bodies, landN) && Math.abs(frac - landFrac) < 0.06) {
      scrubSpecks(elev, sea, cols, rows, wrap);
      return sea;
    }
    const sizes = bodies.map((b) => b.n).sort((a, b) => b - a);
    const largeCut = Math.max(80, landN * 0.02);
    const large = sizes.filter((n) => n >= largeCut);
    let dir = 0;
    if (frac + 0.03 < landFrac) dir = -1;
    else if (frac - 0.03 > landFrac) dir = 1;
    if (layout === "pangaea") {
      if (sizes.filter((n) => n >= 80).length > 1) dir = -1;
    } else if (layout === "archipelago" || layout === "islands") {
      const need = layout === "islands" ? 8 : 6;
      const got = sizes.filter((n) => n >= (layout === "islands" ? 8 : 12)).length;
      if (got < need) dir = 1;
      const sum = sizes.reduce((s, n) => s + n, 0) || 1;
      if ((sizes[0] ?? 0) / sum > 0.35) dir = 1;
    } else if (large.length < 2) dir = -1;
    else if (large.length > 6) dir = 1;
    else if (landN > 0 && (sizes[0] ?? 0) / Math.max(1, sizes.reduce((s, n) => s + n, 0)) > 0.7) dir = 1;
    sea += dir === 0 ? (frac > landFrac ? 0.006 : -0.006) : dir * 0.008;
  }
  if (layout === "pangaea") {
    for (let k = 0; k < 6; k++) {
      const mask = maskFrom(elev, bestSea);
      let landN = 0;
      for (let i = 0; i < mask.length; i++) if (mask[i]) landN += 1;
      const bodies = labelLand(mask, cols, rows, wrap);
      if (bodies.filter((b) => b.n >= 80).length <= 1) break;
      bridgeLargest(elev, bestSea, cols, rows, wrap);
    }
  }
  scrubSpecks(elev, bestSea, cols, rows, wrap);
  return bestSea;
}

function shelfReach(jag: number, layout: WorldLayout): number {
  if (layout === "islands" || layout === "archipelago") return 1;
  return jag < 0.16 ? 2 : 1;
}

function coverLookup(land: boolean, shelf: boolean, temp: number, moist: number, drainage: number, h: number, ny: number, iceN: number): number {
  if (!land) {
    if (shelf) return 1;
    const pole = Math.min(ny, 1 - ny);
    if (pole < 0.1 && temp < 0.32 && iceN > 0.4 && iceN < 0.9) return 16;
    return 0;
  }
  if (temp < 0.14) return 6;
  if (temp < 0.2 && h >= 200) return 6;
  if (h < 148 && moist > 0.58 && drainage < 0.38 && temp > 0.28 && temp < 0.62) return 7;
  if (temp > 0.62 && moist > 0.52) return 13;
  if (temp > 0.5 && moist < 0.3) return 8;
  if (temp > 0.5 && moist < 0.48) return 12;
  if (temp < 0.36 && moist > 0.36) return 14;
  if (temp < 0.26) return 15;
  if (moist < 0.4 && temp < 0.58) return 11;
  if (moist > 0.46 && temp > 0.3 && temp < 0.66) return 3;
  if (moist < 0.34) return 8;
  return 2;
}

function rebalanceCover(cover: Uint8Array, land: Uint8Array, moist: Float32Array, temp: Float32Array, drainage: Float32Array, height: Uint8Array) {
  const cells: number[] = [];
  for (let i = 0; i < cover.length; i++) if (land[i]) cells.push(i);
  const landN = cells.length;
  if (landN < 30) return;
  const cap = Math.floor(landN * 0.38);
  const counts = new Map<number, number>();
  for (const i of cells) counts.set(cover[i]!, (counts.get(cover[i]!) ?? 0) + 1);
  const spill = (id: number, next: number, score: (i: number) => number) => {
    let n = counts.get(id) ?? 0;
    if (n <= cap) return;
    const list = cells.filter((i) => cover[i] === id).sort((a, b) => score(a) - score(b));
    for (const i of list) {
      if (n <= cap) break;
      cover[i] = next;
      n -= 1;
      counts.set(id, n);
      counts.set(next, (counts.get(next) ?? 0) + 1);
    }
  };
  spill(3, 2, (i) => moist[i]!);
  spill(14, 15, (i) => temp[i]!);
  spill(13, 3, (i) => -temp[i]!);
  spill(2, 11, (i) => -moist[i]!);
  spill(8, 12, (i) => moist[i]!);
  spill(12, 2, (i) => -moist[i]!);
  spill(11, 2, (i) => moist[i]!);
  spill(7, 3, (i) => -moist[i]!);
  const relax: { id: number; ok: (i: number) => boolean }[] = [
    { id: 8, ok: (i) => temp[i]! > 0.46 && moist[i]! < 0.38 && height[i]! < 190 },
    { id: 13, ok: (i) => temp[i]! > 0.58 && moist[i]! > 0.48 },
    { id: 3, ok: (i) => temp[i]! > 0.32 && temp[i]! < 0.66 && moist[i]! > 0.44 },
    { id: 7, ok: (i) => height[i]! < 150 && moist[i]! > 0.5 && drainage[i]! < 0.5 && temp[i]! > 0.26 && temp[i]! < 0.66 },
    { id: 11, ok: (i) => moist[i]! < 0.46 && temp[i]! > 0.3 && temp[i]! < 0.56 },
    { id: 12, ok: (i) => temp[i]! > 0.48 && moist[i]! > 0.26 && moist[i]! < 0.55 },
    { id: 2, ok: (i) => temp[i]! > 0.32 && temp[i]! < 0.62 && moist[i]! > 0.34 && moist[i]! < 0.62 },
  ];
  for (const { id, ok } of relax) {
    if ((counts.get(id) ?? 0) >= 40) continue;
    const list = cells.filter((i) => cover[i] !== id && ok(i));
    list.sort((a, b) => Math.abs(moist[a]! - 0.4) - Math.abs(moist[b]! - 0.4));
    for (const i of list) {
      if ((counts.get(id) ?? 0) >= 48) break;
      const prev = cover[i]!;
      if ((counts.get(prev) ?? 0) < 50 && prev !== 14 && prev !== 15 && prev !== 6) continue;
      cover[i] = id;
      counts.set(prev, (counts.get(prev) ?? 1) - 1);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
}

function ortho(
  x: number,
  y: number,
  cols: number,
  rows: number,
  wrap: boolean,
): number[] {
  const out: number[] = [];
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
    out.push(yy * cols + xx);
  }
  return out;
}

function carveWater(
  height: Uint8Array,
  land: Uint8Array,
  drainage: Float32Array,
  cols: number,
  rows: number,
  wrap: boolean,
): Uint8Array {
  const n = cols * rows;
  const water = new Uint8Array(n);
  const down = new Int32Array(n).fill(-1);
  const cost = new Float32Array(n);
  cost.fill(1e12);
  const hc: number[] = [];
  const hi: number[] = [];
  const n4 = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (!land[i]) continue;
      let sea = false;
      for (const [dx, dy] of n4) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        if (!land[yy * cols + xx]) sea = true;
      }
      if (sea) {
        cost[i] = 0;
        hpush(hc, hi, 0, i);
      }
    }
  }
  while (hc.length) {
    const popped = hpop(hc, hi);
    if (!popped) break;
    const [c, i] = popped;
    if (c > cost[i]! + 1e-4) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    for (const [dx, dy] of N8) {
      const yy = y + dy;
      if (yy < 0 || yy >= rows) continue;
      let xx = x + dx;
      if (wrap) xx = (xx + cols) % cols;
      else if (xx < 0 || xx >= cols) continue;
      const j = yy * cols + xx;
      if (!land[j]) continue;
      const climb = height[j]! - height[i]!;
      const step = 0.65 + Math.max(0, climb) * 2.4 + Math.max(0, -climb) * 0.05;
      const next = c + step;
      if (next < cost[j]!) {
        cost[j] = next;
        down[j] = i;
        hpush(hc, hi, next, j);
      }
    }
  }
  const acc = new Float32Array(n);
  const order: number[] = [];
  for (let i = 0; i < n; i++) {
    if (!land[i]) continue;
    acc[i] = 1;
    order.push(i);
  }
  order.sort((a, b) => cost[b]! - cost[a]!);
  for (const i of order) {
    const j = down[i]!;
    if (j >= 0 && land[j]) acc[j] += acc[i]!;
  }
  const landN = order.length || 1;
  let threshold = Math.max(10, Math.round(landN / 700));
  const mark = (cut: number) => {
    water.fill(0);
    for (const i of order) {
      if (height[i]! >= 176) continue;
      if (acc[i]! < cut) continue;
      water[i] = W_CHANNEL;
    }
  };
  mark(threshold);
  let channels = 0;
  for (let i = 0; i < n; i++) if (water[i] === W_CHANNEL) channels += 1;
  if (channels < 80) {
    threshold = Math.max(8, Math.round(threshold * 0.45));
    mark(threshold);
  }
  for (let i = 0; i < n; i++) {
    if (water[i] !== W_CHANNEL) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    let sum = 0;
    let c = 0;
    for (const [dx, dy] of N8) {
      const yy = y + dy;
      if (yy < 0 || yy >= rows) continue;
      let xx = x + dx;
      if (wrap) xx = (xx + cols) % cols;
      else if (xx < 0 || xx >= cols) continue;
      const j = yy * cols + xx;
      if (!land[j] || water[j] === W_CHANNEL) continue;
      sum += height[j]!;
      c += 1;
    }
    if (!c) height[i] = Math.min(height[i]!, 118);
    else height[i] = Math.max(102, Math.min(height[i]!, Math.round(sum / c) - 6));
  }
  const seaTouch = (idx: number) => {
    const y = (idx / cols) | 0;
    const x = idx - y * cols;
    for (const [dx, dy] of n4) {
      const yy = y + dy;
      if (yy < 0 || yy >= rows) continue;
      let xx = x + dx;
      if (wrap) xx = (xx + cols) % cols;
      else if (xx < 0 || xx >= cols) continue;
      if (!land[yy * cols + xx]) return true;
    }
    return false;
  };
  const seen = new Uint8Array(n);
  let lakes = 0;
  const tryLake = (seed: number, limit: number) => {
    if (seen[seed] || !land[seed] || water[seed] === W_CHANNEL || seaTouch(seed)) return false;
    if (drainage[seed]! > 0.42 || height[seed]! >= 168) return false;
    const comp: number[] = [];
    const q = [seed];
    seen[seed] = 1;
    while (q.length) {
      const c = q.pop()!;
      comp.push(c);
      if (comp.length > limit) return false;
      const y = (c / cols) | 0;
      const x = c - y * cols;
      for (const [dx, dy] of n4) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        const k = yy * cols + xx;
        if (seen[k] || !land[k] || water[k] === W_CHANNEL || seaTouch(k)) continue;
        if (height[k]! > height[seed]! + 3) continue;
        seen[k] = 1;
        q.push(k);
      }
    }
    if (comp.length < 3) return false;
    let spill = 255;
    for (const c of comp) {
      const y = (c / cols) | 0;
      const x = c - y * cols;
      for (const [dx, dy] of n4) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        const k = yy * cols + xx;
        if (comp.includes(k) || !land[k]) continue;
        if (height[k]! < spill) spill = height[k]!;
      }
    }
    if (spill === 255) return false;
    for (const c of comp) {
      water[c] = W_LAKE;
      height[c] = spill;
    }
    return true;
  };
  for (let i = 0; i < n && lakes < 10; i++) {
    if (tryLake(i, 36)) lakes += 1;
  }
  if (lakes === 0) {
    let seed = -1;
    for (let i = 0; i < n; i++) {
      if (!land[i] || water[i] || seaTouch(i)) continue;
      if (height[i]! >= 160) continue;
      if (seed < 0 || drainage[i]! < drainage[seed]!) seed = i;
    }
    if (seed >= 0) {
      const y = (seed / cols) | 0;
      const x = seed - y * cols;
      const comp = [seed];
      for (const [dx, dy] of n4) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        const j = yy * cols + xx;
        if (land[j] && !water[j] && !seaTouch(j)) comp.push(j);
      }
      let spill = 255;
      const markSet = new Set(comp);
      for (const c of comp) {
        const cy = (c / cols) | 0;
        const cx = c - cy * cols;
        for (const [dx, dy] of n4) {
          const yy = cy + dy;
          if (yy < 0 || yy >= rows) continue;
          let xx = cx + dx;
          if (wrap) xx = (xx + cols) % cols;
          else if (xx < 0 || xx >= cols) continue;
          const k = yy * cols + xx;
          if (markSet.has(k) || !land[k]) continue;
          if (height[k]! < spill) spill = height[k]!;
        }
      }
      if (spill !== 255) {
        for (const c of comp) {
          water[c] = W_LAKE;
          height[c] = spill;
        }
      }
    }
  }
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < n; i++) {
      if (water[i] !== W_LAKE) continue;
      const y = (i / cols) | 0;
      const x = i - y * cols;
      let rim = 255;
      for (const [dx, dy] of n4) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        let xx = x + dx;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        const j = yy * cols + xx;
        if (water[j] === W_LAKE) continue;
        if (height[j]! < rim) rim = height[j]!;
      }
      if (rim < 255 && height[i]! > rim) height[i] = rim;
    }
  }
  for (let i = 0; i < n; i++) {
    if (water[i] !== W_CHANNEL) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    for (const j of ortho(x, y, cols, rows, wrap)) {
      if (!land[j] || water[j] || height[j]! >= 168) continue;
      water[j] = W_FLOOD;
    }
  }
  for (let i = 0; i < n; i++) {
    if (!land[i] || water[i]) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    for (const [dx, dy] of n4) {
      const yy = y + dy;
      if (yy < 0 || yy >= rows) continue;
      let xx = x + dx;
      if (wrap) xx = (xx + cols) % cols;
      else if (xx < 0 || xx >= cols) continue;
      if (!land[yy * cols + xx]) {
        water[i] = W_COAST;
        break;
      }
    }
  }
  return water;
}

function assignHeights(
  elev: Float32Array,
  crest: Float32Array,
  sea: number,
  mountains: number,
  cols: number,
  rows: number,
  wrap: boolean,
): { height: Uint8Array; land: Uint8Array } {
  const n = elev.length;
  const height = new Uint8Array(n);
  const land = new Uint8Array(n);
  const mtn = mountains / 100;
  let maxAbove = 0.0001;
  for (let i = 0; i < n; i++) if (elev[i]! > sea) maxAbove = Math.max(maxAbove, elev[i]! - sea);
  const landIdx: number[] = [];
  for (let i = 0; i < n; i++) {
    if (elev[i]! <= sea) {
      const depth = clamp01((sea - elev[i]!) / 0.22);
      height[i] = byte(16 + (1 - depth) * 52);
      continue;
    }
    land[i] = 1;
    landIdx.push(i);
    const t = clamp01((elev[i]! - sea) / maxAbove);
    height[i] = byte(114 + t * 18);
  }
  if (mtn >= 0.05 && landIdx.length > 40) {
    const ranked = landIdx.slice().sort((a, b) => crest[b]! - crest[a]! || b - a);
    const peakN = Math.max(1, Math.floor(landIdx.length * Math.min(0.045, 0.008 + mtn * 0.032)));
    const rangeN = Math.max(peakN + 1, Math.floor(landIdx.length * Math.min(0.09, 0.038 + mtn * 0.055)));
    const hillN = Math.floor(landIdx.length * 0.12);
    const isHigh = new Uint8Array(n);
    for (let k = 0; k < ranked.length && k < hillN; k++) {
      const i = ranked[k]!;
      if (k < peakN) {
        height[i] = byte(220 + crest[i]! * 20);
        isHigh[i] = 2;
      } else if (k < rangeN) {
        height[i] = byte(178 + crest[i]! * 22);
        isHigh[i] = 1;
      } else height[i] = byte(146 + (k % 4) * 3);
    }
    const widen: number[] = [];
    for (let i = 0; i < n; i++) if (isHigh[i] === 1) widen.push(i);
    for (const i of widen) {
      const y = (i / cols) | 0;
      const x = i - y * cols;
      let xx = x + 1;
      if (wrap) xx = xx % cols;
      else if (xx >= cols) continue;
      const j = y * cols + xx;
      if (!land[j] || isHigh[j]) continue;
      height[j] = 176;
      isHigh[j] = 1;
    }
  } else {
    for (const i of landIdx) if (height[i]! >= 168) height[i] = 136;
  }
  return { height, land };
}

/** Rain, wind, and cloud bytes. Deterministic from seed, age, height, and water. */
export function applyWeather(field: TerrainField): void {
  const { cols, rows, wrap } = field;
  const noise = noisesFor(field.seed, field.age ?? 0);
  const wetK = 1 + ((field.wetness - 50) / 50) * 0.22;
  const n = cols * rows;
  if (!field.sky || field.sky.length !== n) field.sky = new Uint8Array(n);
  if (!field.moist || field.moist.length !== n) field.moist = new Uint8Array(n);
  for (let y = 0; y < rows; y++) {
    const ny = rows <= 1 ? 0 : y / (rows - 1);
    const lat = Math.abs(ny - 0.5) * 2;
    let wind = 0.42;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const prevX = wrap ? (x === 0 ? cols - 1 : x - 1) : Math.max(0, x - 1);
      const prev = y * cols + prevX;
      const h = field.height[i] ?? 0;
      const land = h >= 96;
      const ang = (x / cols) * Math.PI * 2;
      const lon = wrap ? sampleCyl(noise.moist, ang, ny, 2.4, 1.8, 2) : fbm(noise.moist, (x / cols) * 2.2, ny * 1.6, 2);
      if (!land) {
        wind = Math.min(0.8, wind + 0.05);
        const m = clamp01(0.58 + (lon - 0.5) * 0.08);
        field.moist[i] = byte(m * 255);
        const cloud = clamp01(0.3 + lat * 0.28 + lon * 0.25);
        field.sky[i] = byte(52 + cloud * 150);
        continue;
      }
      const rise = (h - (field.height[prev] ?? h)) / 255;
      const lift = rise > 0.015 ? Math.min(0.16, rise * 1.5) : 0;
      const shadow = rise < -0.015 ? Math.min(0.18, -rise * 1.3) : 0;
      wind = Math.max(0.1, Math.min(0.82, wind - lift * 0.85 + 0.006));
      let m = 0.42;
      m += Math.exp(-(lat * lat) / 0.018) * 0.4;
      m += Math.exp(-((lat - 0.58) * (lat - 0.58)) / 0.02) * 0.14;
      m -= Math.exp(-((lat - 0.34) * (lat - 0.34)) / 0.007) * 0.3;
      m -= Math.exp(-((lat - 0.5) * (lat - 0.5)) / 0.01) * 0.08;
      m -= Math.max(0, lat - 0.8) * 0.28;
      m += (lon - 0.5) * 0.08;
      m = m * wetK;
      m = m * 0.88 + wind * 0.08 + lift * 0.25 - shadow * 0.4;
      const wk = field.water?.[i] ?? 0;
      if (wk === W_CHANNEL || wk === W_FLOOD) m += 0.02;
      else if (wk === W_LAKE) m += 0.04;
      m = clamp01(m);
      field.moist[i] = byte(m * 255);
      const cloud = clamp01(0.22 + m * 0.5 + (lon - 0.5) * 0.08);
      field.sky[i] = byte(48 + cloud * 160);
    }
  }
}
function cellNoise(x: number, y: number, salt: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function buildUnderSky(
  land: Uint8Array,
  height: Uint8Array,
  cols: number,
  rows: number,
  wrap: boolean,
): { under: Uint8Array; columns: ColumnCell[] } {
  const n = cols * rows;
  const under = new Uint8Array(n);
  const seaD = new Uint16Array(n).fill(65535);
  const q: number[] = [];
  for (let i = 0; i < n; i++) {
    if (land[i]) {
      seaD[i] = 0;
      q.push(i);
    }
  }
  for (let k = 0; k < q.length; k++) {
    const i = q[k]!;
    const d = seaD[i]!;
    if (d >= 10) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    for (const j of ortho(x, y, cols, rows, wrap)) {
      if (seaD[j]! <= d + 1) continue;
      seaD[j] = d + 1;
      q.push(j);
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const blob = cellNoise(x >> 3, y >> 3, 3.1) * 0.62 + cellNoise(x >> 1, y >> 2, 8.4) * 0.38;
      const deep = !land[i] && seaD[i]! > 7;
      const cut = deep ? 0.9 : 0.73;
      if (blob > cut) under[i] = 1;
    }
  }
  const rooms: { x: number; y: number }[] = [];
  const seen = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (!under[i] || seen[i]) continue;
    const stack = [i];
    seen[i] = 1;
    let sx = 0;
    let sy = 0;
    let c = 0;
    while (stack.length) {
      const k = stack.pop()!;
      const y = (k / cols) | 0;
      const x = k - y * cols;
      sx += x;
      sy += y;
      c += 1;
      for (const j of ortho(x, y, cols, rows, wrap)) {
        if (!under[j] || seen[j]) continue;
        seen[j] = 1;
        stack.push(j);
      }
    }
    if (c >= 4) rooms.push({ x: sx / c, y: sy / c });
  }
  for (let a = 0; a < rooms.length; a++) {
    for (let b = a + 1; b < rooms.length; b++) {
      const dx = rooms[a]!.x - rooms[b]!.x;
      const dy = rooms[a]!.y - rooms[b]!.y;
      const d = Math.hypot(dx, dy);
      if (d < 10 || d > 28) continue;
      if (cellNoise(a, b, 2.2) < 0.62) continue;
      const steps = Math.max(1, Math.round(d));
      for (let s = 0; s <= steps; s++) {
        const px = Math.round(rooms[a]!.x + ((rooms[b]!.x - rooms[a]!.x) * s) / steps);
        const py = Math.round(rooms[a]!.y + ((rooms[b]!.y - rooms[a]!.y) * s) / steps);
        if (py < 0 || py >= rows) continue;
        let xx = px;
        if (wrap) xx = (xx + cols) % cols;
        else if (xx < 0 || xx >= cols) continue;
        under[py * cols + xx] = under[py * cols + xx] === 1 ? 1 : 2;
      }
      break;
    }
  }
  let up = -1;
  let down = -1;
  for (let i = 0; i < n; i++) {
    if (!land[i]) continue;
    if (up < 0 || height[i]! > height[up]!) up = i;
    if (height[i]! >= 176 && (down < 0 || height[i]! < height[down]!)) down = i;
  }
  if (down < 0) down = up;
  const columns: ColumnCell[] = [];
  if (down >= 0) {
    under[down] = 1;
    columns.push({ x: down % cols, y: (down / cols) | 0, dir: "down" });
  }
  if (up >= 0 && (up !== down || columns.length === 0)) {
    columns.push({ x: up % cols, y: (up / cols) | 0, dir: "up" });
  }
  return { under, columns };
}

function placeHearths(field: TerrainField) {
  const { cols, rows } = field;
  const scored: { j: number; score: number }[] = [];
  for (let y = 1; y < rows - 1; y++) {
    const ny = y / rows;
    if (ny < 0.14 || ny > 0.86) continue;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const w = field.water[i] ?? 0;
      if (w !== W_CHANNEL && w !== W_FLOOD) continue;
      const cover = field.cover[i] ?? 2;
      if (cover === 6 || cover === 0 || cover === 16) continue;
      let score = (field.moist[i] ?? 0) / 255;
      if (cover === 2 || cover === 3 || cover === 7 || cover === 11) score += 1.2;
      if ((field.relief[i] ?? 0) > R_HILL) score -= 0.4;
      scored.push({ j: i, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  const hearths: HearthCell[] = [];
  const take = (minScore: number, sepX: number, sepY: number) => {
    for (const { j, score } of scored) {
      if (score < minScore) continue;
      const y = (j / cols) | 0;
      const x = j - y * cols;
      if (hearths.some((h) => Math.abs(h.x - x) < sepX && Math.abs(h.y - y) < sepY)) continue;
      hearths.push({ x, y });
      if (hearths.length >= 5) return;
    }
  };
  take(0.2, 18, 12);
  if (hearths.length < 3) take(-1, 18, 12);
  if (hearths.length < 3) take(-1, 8, 6);
  field.hearths = hearths;
}

function previewOf(cover: number, water: number): number {
  if (cover === 0 || cover === 1 || cover === 16) return cover;
  if (water === W_LAKE) return 10;
  if (water === W_CHANNEL) return 9;
  return cover;
}

function finishWorld(
  cols: number,
  rows: number,
  wrap: boolean,
  elev: Float32Array,
  crest: Float32Array,
  drainage: Float32Array,
  seaLevel: number,
  job: {
    seed: string;
    sea: number;
    warmth: number;
    wetness: number;
    mountains: number;
    scale: number;
    layout: WorldLayout;
    level: WorldLevel;
    breakup: number;
    gap: number;
    age: number;
  },
  noise: FieldNoise,
): TerrainField {
  const { height, land } = assignHeights(elev, crest, seaLevel, job.mountains, cols, rows, wrap);
  const n = cols * rows;
  const shelf = new Uint8Array(n);
  const jag = new Float32Array(n);
  const oceanDist = new Uint16Array(n).fill(65535);
  const shelfQ: number[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const ang = (x / cols) * Math.PI * 2;
      const ny = y / rows;
      jag[i] = wrap ? cylSample(noise.warp, ang, ny, 2.2, 2) : fbm(noise.warp, x / 40, y / 30, 2);
      if (!land[i]) continue;
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
        if (land[j] || oceanDist[j] !== 65535) continue;
        oceanDist[j] = 1;
        shelfQ.push(j);
      }
    }
  }
  for (let k = 0; k < shelfQ.length; k++) {
    const i = shelfQ[k]!;
    const d = oceanDist[i]!;
    if (d >= 2) continue;
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
      if (land[j] || oceanDist[j]! <= d + 1) continue;
      oceanDist[j] = d + 1;
      shelfQ.push(j);
    }
  }
  for (let i = 0; i < n; i++) {
    if (land[i] || oceanDist[i] === 65535) continue;
    const reach = shelfReach(jag[i]!, job.layout);
    if (oceanDist[i]! <= reach) {
      shelf[i] = 1;
      height[i] = byte(84 - oceanDist[i]! * 4);
    }
  }
  const water = carveWater(height, land, drainage, cols, rows, wrap);
  const cover = new Uint8Array(n);
  const terrain = new Uint8Array(n);
  const relief = new Uint8Array(n);
  const tempA = new Uint8Array(n);
  const tempF = new Float32Array(n);
  const moistF = new Float32Array(n);
  const field: TerrainField = {
    cols,
    rows,
    seed: job.seed,
    sea: job.sea,
    warmth: job.warmth,
    wetness: job.wetness,
    mountains: job.mountains,
    scale: job.scale,
    wrap,
    layout: job.layout,
    level: job.level,
    breakup: job.breakup,
    gap: job.gap,
    terrain,
    height,
    temp: tempA,
    moist: new Uint8Array(n),
    relief,
    water,
    cover,
    owner: new Uint8Array(n),
    ownerIds: [],
    hearths: [],
    columns: [],
    gates: [],
    realms: [],
    known: { x0: 0, x1: 1, y0: 0, y1: 1 },
    age: job.age,
    under: new Uint8Array(n),
    sky: new Uint8Array(n),
    seen: new Uint8Array(n),
  };
  applyWeather(field);
  for (let i = 0; i < n; i++) moistF[i] = (field.moist[i] ?? 128) / 255;
  const warmK = 0.8 + ((job.warmth - 50) / 50) * 0.22;
  for (let y = 0; y < rows; y++) {
    const ny = y / rows;
    const lat = Math.abs(ny - 0.5) * 2;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let temp = Math.pow(Math.max(0, 1 - Math.pow(lat, 1.12)), 1.05) * warmK;
      if (height[i]! > 150) temp -= ((height[i]! - 150) / 220) * 0.85;
      temp += (job.warmth - 50) / 260;
      temp += (jag[i]! - 0.5) * 0.04;
      if (moistF[i]! > 0.55 && temp > 0.3 && temp < 0.7) temp -= 0.03;
      tempF[i] = clamp01(temp);
      tempA[i] = byte(tempF[i]! * 255);
    }
  }
  for (let y = 0; y < rows; y++) {
    const ny = y / rows;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const isLand = land[i] === 1;
      const ang = (x / cols) * Math.PI * 2;
      const iceN = wrap ? sampleCyl(noise.warp, ang + 0.4, ny, 1.7, 1.5, 2) : fbm(noise.warp, (x / cols) * 1.8, ny * 1.4, 2);
      const id = coverLookup(isLand, shelf[i] === 1, tempF[i]!, moistF[i]!, drainage[i]!, height[i]!, ny, iceN);
      cover[i] = id;
    }
  }
  rebalanceCover(cover, land, moistF, tempF, drainage, height);
  for (let i = 0; i < n; i++) {
    if (!land[i] && shelf[i]) cover[i] = 1;
    if (!land[i] && !shelf[i] && cover[i] !== 16) cover[i] = 0;
    const isLand = land[i] === 1;
    let rel = R_OCEAN;
    if (!isLand) rel = shelf[i] ? R_SHELF : R_OCEAN;
    else if (tempF[i]! < 0.1 && height[i]! >= 150) rel = R_ICE;
    else if (height[i]! >= 214) rel = R_PEAK;
    else if (height[i]! >= 172) rel = R_RANGE;
    else if (height[i]! >= 140) rel = R_HILL;
    else rel = R_LOW;
    relief[i] = rel;
    terrain[i] = previewOf(cover[i]!, water[i]!);
    if (water[i] === W_CHANNEL || water[i] === W_LAKE) {
      if (cover[i] === 9 || cover[i] === 10 || cover[i] === 0) cover[i] = 2;
    }
  }
  const strata = buildUnderSky(land, height, cols, rows, wrap);
  field.under = strata.under;
  field.columns = strata.columns;
  placeHearths(field);
  const gates: WorldGate[] = [];
  const realms: RealmStub[] = [
    { id: "void", name: "Void", nodes: 12 },
    { id: "other", name: "Other hearth", nodes: 8 },
  ];
  if (field.hearths[0]) gates.push({ x: field.hearths[0].x, y: field.hearths[0].y, from: "surface", realm: "other" });
  const up = field.columns.find((c) => c.dir === "up");
  if (up) gates.push({ x: up.x, y: up.y, from: "surface", realm: "void" });
  else if (field.hearths[1]) gates.push({ x: field.hearths[1].x, y: field.hearths[1].y, from: "surface", realm: "void" });
  field.gates = gates;
  field.realms = realms;
  field.known = knownForAge(cols, rows, field.hearths, field.age);
  field.seen = hearthSight(cols, rows, field.hearths, wrap);
  return field;
}

function generateCrust(job: {
  seed: string;
  sea: number;
  warmth: number;
  wetness: number;
  mountains: number;
  scale: number;
  layout: WorldLayout;
  level: WorldLevel;
  breakup: number;
  gap: number;
  wrap: boolean;
}): TerrainField {
  const cols = CRUST_COLS;
  const rows = CRUST_ROWS;
  const noise = noisesFor(job.seed, 0);
  const freq = freqFor(job.layout, job.scale, job.breakup);
  const landFrac = landFracFor(job.layout, job.sea);
  let best: { elev: Float32Array; crest: Float32Array; drainage: Float32Array; sea: number } | null = null;
  let bestScore = -1e9;
  for (let attempt = 0; attempt < 6; attempt++) {
    const phase = attempt * 0.77;
    const fields = buildScalarFields(
      cols,
      rows,
      job.wrap,
      noise,
      freq * (1 + attempt * 0.04),
      phase,
      job.breakup + attempt * 4,
      job.layout,
    );
    const seaLevel = fitSea(fields.elev, cols, rows, job.wrap, job.layout, landFrac);
    const mask = maskFrom(fields.elev, seaLevel);
    let landN = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i]) landN += 1;
    const bodies = labelLand(mask, cols, rows, job.wrap);
    const score = layoutScore(job.layout, bodies, landN, landN / mask.length, landFrac);
    if (score > bestScore) {
      bestScore = score;
      best = { ...fields, sea: seaLevel };
    }
    if (layoutOk(job.layout, bodies, landN)) break;
  }
  const picked = best!;
  return finishWorld(cols, rows, job.wrap, picked.elev, picked.crest, picked.drainage, picked.sea, { ...job, age: 0 }, noise);
}

function resampleU8(src: Uint8Array, sc: number, sr: number, dc: number, dr: number): Uint8Array {
  const out = new Uint8Array(dc * dr);
  for (let y = 0; y < dr; y++) {
    const sy = Math.min(sr - 1, Math.floor(((y + 0.5) * sr) / dr));
    for (let x = 0; x < dc; x++) {
      const sx = Math.min(sc - 1, Math.floor(((x + 0.5) * sc) / dc));
      out[y * dc + x] = src[sy * sc + sx]!;
    }
  }
  return out;
}

function resampleField(src: TerrainField, cols: number, rows: number): TerrainField {
  if (src.cols === cols && src.rows === rows) return src;
  const next: TerrainField = {
    ...src,
    cols,
    rows,
    terrain: resampleU8(src.terrain, src.cols, src.rows, cols, rows),
    height: resampleU8(src.height, src.cols, src.rows, cols, rows),
    temp: resampleU8(src.temp, src.cols, src.rows, cols, rows),
    moist: resampleU8(src.moist, src.cols, src.rows, cols, rows),
    relief: resampleU8(src.relief, src.cols, src.rows, cols, rows),
    water: resampleU8(src.water, src.cols, src.rows, cols, rows),
    cover: resampleU8(src.cover, src.cols, src.rows, cols, rows),
    under: resampleU8(src.under, src.cols, src.rows, cols, rows),
    sky: resampleU8(src.sky, src.cols, src.rows, cols, rows),
    owner: new Uint8Array(cols * rows),
    hearths: [],
    columns: src.columns.map((c) => ({
      x: Math.min(cols - 1, Math.round((c.x / src.cols) * cols)),
      y: Math.min(rows - 1, Math.round((c.y / src.rows) * rows)),
      dir: c.dir,
    })),
    gates: src.gates.map((g) => ({
      ...g,
      x: Math.min(cols - 1, Math.round((g.x / src.cols) * cols)),
      y: Math.min(rows - 1, Math.round((g.y / src.rows) * rows)),
    })),
    seen: new Uint8Array(cols * rows),
  };
  placeHearths(next);
  next.known = knownForAge(cols, rows, next.hearths, next.age);
  next.seen = hearthSight(cols, rows, next.hearths, next.wrap);
  return next;
}

export function generateTerrain(seed: string, sea = 46, extra?: WorldGenInput): TerrainField {
  const sized = gridForMap(extra?.mapWidth ?? 6145, extra?.mapHeight ?? 3530);
  const warmth = clampByte(extra?.warmth ?? 50);
  const wetness = clampByte(extra?.wetness ?? 50);
  const mountains = clampByte(extra?.mountains ?? 42);
  const scale = clampByte(extra?.scale ?? 58);
  const layout: WorldLayout = extra?.layout ?? "earthlike";
  const level: WorldLevel = extra?.level ?? "standard";
  const breakup = clampByte(extra?.breakup ?? 50);
  const gap = clampByte(extra?.gap ?? 70);
  const wrap = layout === "theater" ? false : extra?.wrap !== false;
  const field = generateCrust({
    seed,
    sea,
    warmth,
    wetness,
    mountains,
    scale,
    layout,
    level,
    breakup,
    gap,
    wrap: layout === "theater" ? false : wrap,
  });
  return resampleField(field, sized.cols, sized.rows);
}

export function cellStack(field: TerrainField, i: number): CellStack {
  let cover = field.cover?.[i] ?? field.terrain?.[i] ?? 0;
  if (cover === 9 || cover === 10) cover = 2;
  return {
    relief: field.relief?.[i] ?? R_LOW,
    cover,
    water: field.water?.[i] ?? 0,
    temp: (field.temp?.[i] ?? 128) / 255,
    moist: (field.moist?.[i] ?? 128) / 255,
    height: field.height?.[i] ?? 0,
  };
}

export function effects(stack: CellStack): CellEffects {
  let move = 1;
  let forage = 1;
  let defense = 0;
  let conceal = 0;
  let disease = 0;
  let supply = 0;
  const tags: string[] = [];
  if (stack.relief === R_HILL) {
    move += 1;
    defense += 1;
    tags.push("hills");
  } else if (stack.relief === R_RANGE) {
    move += 2;
    defense += 2;
    tags.push("range");
  } else if (stack.relief === R_PEAK) {
    move += 3;
    defense += 3;
    tags.push("peak");
  } else if (stack.relief === R_ICE) {
    move += 3;
    forage -= 1;
    tags.push("ice");
  }
  const c = stack.cover;
  if (c === 3) {
    conceal += 2;
    move += 1;
    tags.push("forest");
  } else if (c === 13) {
    conceal += 2;
    move += 1;
    tags.push("jungle");
  } else if (c === 14) {
    conceal += 1;
    move += 1;
    tags.push("taiga");
  } else if (c === 8) {
    forage -= 1;
    tags.push("desert", "arid");
    if (stack.temp > 0.55) disease += 1;
  } else if (c === 11) {
    forage -= 0.5;
    tags.push("steppe");
    if (stack.moist < 0.45) tags.push("arid");
  } else if (c === 12) tags.push("savanna");
  else if (c === 7) {
    move += 1;
    disease += 1;
    tags.push("marsh");
  } else if (c === 6) {
    move += 2;
    forage -= 1;
    if (!tags.includes("ice")) tags.push("ice");
  } else if (c === 2) tags.push("grain");
  else if (c === 15) tags.push("tundra");
  else if (c === 0) tags.push("ocean");
  else if (c === 1) tags.push("shelf");
  else if (c === 16) tags.push("sea ice");
  if (stack.water === W_CHANNEL || stack.water === W_FLOOD) {
    move += 1;
    supply += 1;
    tags.push("river");
  } else if (stack.water === W_LAKE) {
    supply += 1;
    move += 2;
    tags.push("lake");
  } else if (stack.water === W_COAST) {
    supply += 1;
    tags.push("coast");
  }
  if (stack.moist < 0.34 && stack.cover !== 0 && stack.cover !== 1 && stack.cover !== 16 && !tags.includes("arid")) {
    forage -= 0.5;
    tags.push("arid");
  }
  if (stack.moist > 0.62 && stack.temp > 0.6) disease += 1;
  return { move, forage, defense, conceal, disease, supply, tags };
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
    x1: Math.min(1, x1 + 0.07),
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

function clampByte(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
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
  const stack = cellStack(field, i);
  const fx = effects(stack);
  const reliefName = RELIEF_LABEL[stack.relief] ?? "Lowland";
  const coverName = TERRAINS[stack.cover]?.label ?? "Ground";
  const claim = field.owner[i] ? (field.ownerIds[field.owner[i]! - 1] ?? "") : "";
  const sea = stack.cover === 0 || stack.cover === 1 || stack.cover === 16;
  return {
    biome: fx.tags.length ? fx.tags.join(" + ") : coverName,
    tags: fx.tags,
    relief: sea ? "" : reliefName,
    cover: coverName,
    water: stack.water,
    climate: climateName(field.temp[i] ?? 128, field.moist[i] ?? 128),
    band: heightBand(stack.height),
    claim,
    effects: fx,
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
      if (!field.cover || field.cover.length !== field.terrain.length) field.cover = new Uint8Array(field.terrain);
      if (!field.water || field.water.length !== field.terrain.length) field.water = new Uint8Array(field.terrain.length);
      if (def.id === 9) field.water[i] = 1;
      else if (def.id === 10) field.water[i] = 3;
      else if (def.id === 0 || def.id === 1 || def.id === 16) field.water[i] = 0;
      if (def.id !== 9 && def.id !== 10) field.cover[i] = def.id;
      else if (field.cover[i] === 0 || field.cover[i] === 9 || field.cover[i] === 10) field.cover[i] = 2;
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
      field.cover[i] = id === 9 || id === 10 ? 2 : id;
      field.water[i] = id === 9 ? 1 : id === 10 ? 3 : 0;
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
    water: new Uint8Array(n),
    cover: new Uint8Array(n),
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
      const previewId = terrain[i]!;
      const coverHere = field.cover?.[i];
      const id =
        coverHere === undefined || view === "height" || view === "climate"
          ? previewId
          : coverHere === 9 || coverHere === 10
            ? 2
            : coverHere;
      const waterK = field.water?.[i] ?? (previewId === 9 ? 1 : previewId === 10 ? 3 : 0);
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
      if ((view === "terrain" || political) && rel >= R_RANGE && id !== 0 && id !== 1 && id !== 16) {
        r *= 0.78;
        g *= 0.74;
        b *= 0.68;
      }
      if ((view === "terrain" || political) && (waterK === 1 || waterK === 2)) {
        const a = waterK === 1 ? 0.42 : 0.22;
        r = r * (1 - a) + 47 * a;
        g = g * (1 - a) + 134 * a;
        b = b * (1 - a) + 196 * a;
      } else if ((view === "terrain" || political) && waterK === 3) {
        r = r * 0.35 + 29 * 0.65;
        g = g * 0.35 + 111 * 0.65;
        b = b * 0.35 + 166 * 0.65;
      }
      if ((view === "terrain" || political) && (field.temp[i] ?? 128) < 34 && id !== 0 && id !== 16) {
        r = r * 0.62 + 236 * 0.38;
        g = g * 0.62 + 242 * 0.38;
        b = b * 0.62 + 246 * 0.38;
      }
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
        const ny = rows <= 1 ? 0 : cy / (rows - 1);
        const lat = Math.abs(ny - 0.5) * 2;
        const skyB = field.sky?.[i] ?? 80;
        const cloud = clamp01((skyB - 48) / 140);
        r = 150 - lat * 40;
        g = 176 - lat * 28;
        b = 206 - lat * 10;
        if (cloud > 0.35) {
          const a = Math.min(0.85, (cloud - 0.35) * 1.4);
          r = r * (1 - a) + 236 * a;
          g = g * (1 - a) + 240 * a;
          b = b * (1 - a) + 244 * a;
        }
        if (upStair[i] === 1) {
          r = Math.min(255, r + 18);
          g = Math.min(255, g + 16);
          b = Math.min(255, b + 10);
        }
        shade = 1;
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
    water: bytesToB64(field.water ?? new Uint8Array(field.cols * field.rows)),
    cover: bytesToB64(field.cover ?? new Uint8Array(field.cols * field.rows)),
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

function legacyCover(terrain: Uint8Array, cols: number, rows: number, wrap: boolean): Uint8Array {
  const cover = new Uint8Array(terrain.length);
  for (let i = 0; i < terrain.length; i++) {
    const id = terrain[i]!;
    if (id !== 9 && id !== 10) {
      cover[i] = id;
      continue;
    }
    const y = (i / cols) | 0;
    const x = i - y * cols;
    let picked = 2;
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
      const nid = terrain[yy * cols + xx]!;
      if (nid !== 9 && nid !== 10 && nid !== 0 && nid !== 1 && nid !== 16) {
        picked = nid;
        break;
      }
    }
    cover[i] = picked;
  }
  return cover;
}

function legacyWater(terrain: Uint8Array, cols: number, rows: number, wrap: boolean): Uint8Array {
  const water = new Uint8Array(terrain.length);
  const landish = (id: number) => id !== 0 && id !== 1 && id !== 16;
  for (let i = 0; i < terrain.length; i++) {
    const id = terrain[i]!;
    if (id === 9) water[i] = 1;
    else if (id === 10) water[i] = 3;
    else if (!landish(id)) water[i] = 0;
  }
  for (let i = 0; i < terrain.length; i++) {
    if (water[i] || !landish(terrain[i]!)) continue;
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
      const nid = terrain[yy * cols + xx]!;
      if (nid === 0 || nid === 1 || nid === 16) {
        water[i] = 4;
        break;
      }
    }
  }
  return water;
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
    water: pack.water ? b64ToBytes(pack.water, n) : legacyWater(b64ToBytes(pack.cells, n), pack.cols, pack.rows, pack.wrap !== false),
    cover: pack.cover ? b64ToBytes(pack.cover, n) : legacyCover(b64ToBytes(pack.cells, n), pack.cols, pack.rows, pack.wrap !== false),
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
