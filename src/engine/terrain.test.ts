import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyWeather,
  cellStack,
  effects,
  generateTerrain,
  gridForMap,
  LAYOUT_RECIPES,
  nearestTerrain,
  packTerrain,
  readTerrainPack,
  stampSight,
  TERRAINS,
  unpackTerrain,
} from "./terrain.ts";

test("same seed raises the same ground", () => {
  const a = generateTerrain("inkunzi", 46);
  const b = generateTerrain("inkunzi", 46);
  assert.equal(a.terrain.length, b.terrain.length);
  assert.equal(a.terrain[0], b.terrain[0]);
  assert.equal(a.terrain[4000], b.terrain[4000]);
  assert.equal(a.height[4000], b.height[4000]);
  const other = generateTerrain("other-shore", 46);
  let differ = 0;
  for (let i = 0; i < a.terrain.length; i += 50) {
    if (a.terrain[i] !== other.terrain[i]) differ += 1;
  }
  assert.ok(differ > 10);
});

test("a world has ocean and more than one kind of land", () => {
  const world = generateTerrain("inkunzi", 46);
  const counts = new Map<number, number>();
  for (const id of world.terrain) counts.set(id, (counts.get(id) ?? 0) + 1);
  const ocean = counts.get(0) ?? 0;
  const land = world.terrain.length - ocean;
  assert.ok(ocean > world.terrain.length * 0.12, `ocean ${ocean}`);
  assert.ok(land > world.terrain.length * 0.25, `land ${land}`);
  const kinds = [...counts.keys()].filter((id) => id !== 0);
  assert.ok(kinds.length >= 4, `kinds ${kinds.join(",")}`);
});

test("terrain pack roundtrips climate and wrap", () => {
  const world = generateTerrain("pack", 40);
  world.owner[10] = 1;
  world.ownerIds = ["vestoria"];
  assert.equal(world.wrap, true);
  const back = unpackTerrain(packTerrain(world));
  assert.ok(back);
  assert.equal(back!.seed, "pack");
  assert.equal(back!.wrap, true);
  assert.equal(back!.owner[10], 1);
  assert.deepEqual(back!.ownerIds, ["vestoria"]);
  assert.equal(back!.terrain[1234], world.terrain[1234]);
  assert.equal(back!.temp[1234], world.temp[1234]);
  assert.equal(back!.moist[1234], world.moist[1234]);
  assert.equal(back!.relief[1234], world.relief[1234]);
  assert.equal(back!.water[1234], world.water[1234]);
  assert.equal(back!.cover[1234], world.cover[1234]);
  const theater = generateTerrain("pack", 40, { wrap: false });
  assert.equal(theater.wrap, false);
});

test("starter nations are raised on land", () => {
  const world = generateTerrain("inkunzi", 46);
  assert.ok(world.hearths.length >= 3, `hearths ${world.hearths.length}`);
  for (const h of world.hearths) {
    const i = h.y * world.cols + h.x;
    const w = world.water[i];
    assert.ok(w === 1 || w === 2, `hearth water ${w}`);
    assert.notEqual(world.cover[i], 0);
    assert.notEqual(world.cover[i], 6);
    assert.notEqual(world.cover[i], 16);
  }
});

test("default seed reads as a planet", () => {
  const world = generateTerrain("inkunzi", 46);
  const counts = new Map<number, number>();
  for (const id of world.terrain) counts.set(id, (counts.get(id) ?? 0) + 1);
  const land = [...counts.entries()].reduce((n, [id, c]) => (id === 0 || id === 16 ? n : n + c), 0);
  const cold = (row: number) => {
    let ice = 0;
    for (let x = 0; x < world.cols; x++) {
      const id = world.terrain[row * world.cols + x]!;
      if (id === 6 || id === 16 || id === 15) ice += 1;
    }
    return ice;
  };
  const north = Math.floor(world.rows * 0.04);
  const south = world.rows - 1 - north;
  assert.ok(cold(north) > world.cols * 0.4, `north ice ${cold(north)}`);
  assert.ok(cold(south) > world.cols * 0.4, `south ice ${cold(south)}`);
  assert.ok((counts.get(8) ?? 0) > 200, `desert ${counts.get(8)}`);
  assert.ok((counts.get(3) ?? 0) + (counts.get(13) ?? 0) > 400, "forest belt");
  assert.ok((counts.get(5) ?? 0) / land < 0.22, `ranges ${counts.get(5)} / ${land}`);
  let mouths = 0;
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      if (world.terrain[y * world.cols + x] !== 9) continue;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const ny = y + dy;
        if (ny < 0 || ny >= world.rows) continue;
        const nx = (x + dx + world.cols) % world.cols;
        const n = world.terrain[ny * world.cols + nx];
        if (n === 0 || n === 1 || n === 16) mouths += 1;
      }
    }
  }
  assert.ok(mouths > 20, `river mouths ${mouths}`);
  let hsum = 0;
  let same = 0;
  for (let y = 0; y < world.rows; y++) {
    hsum += Math.abs(world.height[y * world.cols]! - world.height[y * world.cols + world.cols - 1]!);
    if (world.terrain[y * world.cols] === world.terrain[y * world.cols + world.cols - 1]) same += 1;
  }
  assert.ok(hsum / world.rows < 12, `seam height ${hsum / world.rows}`);
  assert.ok(same > world.rows * 0.45, `seam biome ${same}`);
  let mirror = 0;
  let samples = 0;
  for (let y = 8; y < world.rows - 8; y += 4) {
    for (let x = 4; x < world.cols / 2 - 4; x += 6) {
      const a = world.terrain[y * world.cols + x]!;
      const b = world.terrain[y * world.cols + (world.cols - 1 - x)]!;
      if ((a === 0 || a === 16) && (b === 0 || b === 16)) continue;
      if (a === b) mirror += 1;
      samples += 1;
    }
  }
  assert.ok(samples > 40, `land pairs ${samples}`);
  assert.ok(mirror / samples < 0.55, `mirror ${mirror}/${samples}`);
});

test("regions hold together and water reaches the land", () => {
  const world = generateTerrain("inkunzi", 46);
  const counts = new Map<number, number>();
  for (const id of world.terrain) counts.set(id, (counts.get(id) ?? 0) + 1);
  const names = ["ocean", "coast", "plains", "forest", "hills", "mountain", "snow", "marsh", "desert", "river", "lake"];
  for (const [id, n] of [...counts.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(names[id], n);
  }
  let coherent = 0;
  let samples = 0;
  const { cols, terrain } = world;
  for (let i = cols; i < terrain.length - cols; i += 17) {
    const id = terrain[i]!;
    let same = 0;
    if (terrain[i - 1] === id) same += 1;
    if (terrain[i + 1] === id) same += 1;
    if (terrain[i - cols] === id) same += 1;
    if (terrain[i + cols] === id) same += 1;
    if (same >= 3) coherent += 1;
    samples += 1;
  }
  assert.ok(coherent / samples > 0.72, `coherence ${coherent}/${samples}`);
  assert.ok((counts.get(9) ?? 0) > 40, `rivers ${counts.get(9)}`);
  assert.ok((counts.get(1) ?? 0) > 200, `coast ${counts.get(1)}`);
});

test("staff can size the rectangle without blowing the grid", () => {
  const table = gridForMap(6145, 3530);
  assert.equal(table.cols, 360);
  assert.equal(table.rows, 206);
  const small = gridForMap(3072, 1764);
  assert.ok(small.cols < table.cols);
  const vast = gridForMap(14400, 8100);
  assert.ok(vast.cols <= 800);
  assert.ok(vast.rows <= 450);
  const world = generateTerrain("inkunzi", 46, { mapWidth: 3072, mapHeight: 1764 });
  assert.equal(world.cols, small.cols);
  assert.equal(world.rows, small.rows);
  assert.equal(world.wrap, true);
});

test("table and vast keep the same height field", () => {
  const table = generateTerrain("inkunzi", 46, { mapWidth: 6145, mapHeight: 3530 });
  const vast = generateTerrain("inkunzi", 46, { mapWidth: 14400, mapHeight: 8100 });
  const landish = (field: ReturnType<typeof generateTerrain>, nx: number, ny: number) => {
    const x = Math.min(field.cols - 1, Math.floor(nx * field.cols));
    const y = Math.min(field.rows - 1, Math.floor(ny * field.rows));
    return (field.height[y * field.cols + x] ?? 0) >= 110;
  };
  let same = 0;
  let samples = 0;
  for (let k = 0; k < 480; k++) {
    const nx = ((k * 37) % 97) / 97;
    const ny = 0.08 + (((k * 19) % 84) / 84) * 0.84;
    if (landish(table, nx, ny) === landish(vast, nx, ny)) same += 1;
    samples += 1;
  }
  assert.ok(same / samples > 0.86, `same plates ${same}/${samples}`);
});

test("a painted color lands on the matching ground", () => {
  assert.equal(nearestTerrain(26, 78, 130), 0);
  assert.equal(nearestTerrain(62, 198, 212), 1);
  assert.equal(nearestTerrain(70, 176, 196), 1);
  assert.equal(nearestTerrain(36, 112, 48), 3);
  assert.equal(nearestTerrain(196, 96, 48), 8);
  assert.equal(nearestTerrain(236, 234, 228), 6);
  const forest = TERRAINS.find((t) => t.key === "forest")!;
  const n = Number.parseInt(forest.color.slice(1), 16);
  assert.equal(nearestTerrain((n >> 16) & 255, (n >> 8) & 255, n & 255), forest.id);
});

test("platforms dominate and belts stay a minority", () => {
  const world = generateTerrain("inkunzi", 46);
  let land = 0;
  let low = 0;
  let hill = 0;
  let range = 0;
  let peak = 0;
  for (let i = 0; i < world.terrain.length; i++) {
    const id = world.terrain[i]!;
    if (id === 0 || id === 1 || id === 16) continue;
    land += 1;
    const rel = world.relief[i]!;
    if (rel <= 2) low += 1;
    else if (rel === 3) hill += 1;
    else if (rel === 4) range += 1;
    else if (rel === 5) peak += 1;
  }
  assert.ok(low / land > 0.55, `plains ${low}/${land}`);
  assert.ok(range / land > 0.04, `range thin ${range}/${land}`);
  assert.ok(peak / land > 0.008, `peaks missing ${peak}/${land}`);
  assert.ok((range + peak) / land < 0.2, `belts ${range + peak}/${land}`);
  assert.ok(peak / land < 0.08, `peaks ${peak}/${land}`);
  void hill;
});

test("hearths sit on river land and strata stay packed", () => {
  const world = generateTerrain("inkunzi", 46);
  assert.ok(world.hearths.length >= 3);
  let riverish = 0;
  for (const h of world.hearths) {
    const i = h.y * world.cols + h.x;
    const id = world.cover[i]!;
    assert.notEqual(id, 0);
    assert.notEqual(id, 6);
    assert.notEqual(id, 16);
    const w = world.water[i]!;
    assert.ok(w === 1 || w === 2, `hearth water ${w}`);
    riverish += 1;
  }
  assert.ok(riverish >= 3, `liveable hearths ${riverish}`);
  let fertile = 0;
  for (const h of world.hearths) {
    if ((world.moist[h.y * world.cols + h.x] ?? 0) > 90) fertile += 1;
  }
  assert.ok(fertile >= 2, `fertile hearths ${fertile}`);
  let under = 0;
  let sky = 0;
  let open = 0;
  let openRange = 0;
  let skySame = 0;
  for (let i = 0; i < world.under.length; i++) {
    const u = world.under[i] ?? 0;
    if (u) under += 1;
    if (u === 1 || u === 2) {
      open += 1;
      if ((world.relief[i] ?? 0) >= 4) openRange += 1;
    }
    if (world.sky[i]) sky += 1;
    if (world.sky[i] === world.terrain[i]) skySame += 1;
  }
  assert.ok(under > 20, `under ${under}`);
  assert.ok(open > 20, `open under ${open}`);
  assert.ok(openRange / Math.max(1, open) < 0.45, `under follows range ${openRange}/${open}`);
  assert.ok(sky > 0, `sky ${sky}`);
  assert.ok(skySame / world.sky.length < 0.15, `sky copy ${skySame}`);
  assert.ok(world.columns.some((c) => c.dir === "down"));
  assert.ok(world.columns.some((c) => c.dir === "up"));
  assert.ok(world.gates.length >= 1);
  assert.ok(world.realms.some((r) => r.id === "void"));
  const back = unpackTerrain(packTerrain(world));
  assert.equal(back!.hearths.length, world.hearths.length);
  assert.equal(back!.gates.length, world.gates.length);
  assert.equal(back!.columns.length, world.columns.length);
  assert.equal(back!.under[world.columns[0]!.y * world.cols + world.columns[0]!.x], world.under[world.columns[0]!.y * world.cols + world.columns[0]!.x]);
  let seenHearth = 0;
  for (const h of world.hearths) {
    if (world.seen[h.y * world.cols + h.x]) seenHearth += 1;
  }
  assert.equal(seenHearth, world.hearths.length);
  let far = -1;
  for (let y = 0; y < world.rows && far < 0; y += 2) {
    for (let x = 0; x < world.cols; x += 2) {
      let close = false;
      for (const h of world.hearths) {
        let dx = Math.abs(h.x - x);
        if (world.wrap) dx = Math.min(dx, world.cols - dx);
        if (dx <= 16 && Math.abs(h.y - y) <= 16) close = true;
      }
      if (!close) {
        far = y * world.cols + x;
        break;
      }
    }
  }
  assert.ok(far >= 0, "no unseen cell");
  const farY = (far / world.cols) | 0;
  const farX = far - farY * world.cols;
  assert.equal(world.seen[far], 0);
  let seenN = 0;
  for (const v of world.seen) if (v) seenN += 1;
  assert.ok(seenN / world.seen.length < 0.25, `seen ${seenN}/${world.seen.length}`);
  assert.equal(back!.seen[world.hearths[0]!.y * world.cols + world.hearths[0]!.x], 1);
  const heightBefore = world.height[far]!;
  const terrainBefore = world.terrain[far]!;
  stampSight(world, farX + 0.5, world.rows - farY - 0.5, world.cols, world.rows, 2, true);
  assert.equal(world.seen[far], 1);
  assert.equal(world.height[far], heightBefore);
  assert.equal(world.terrain[far], terrainBefore);
  const stamped = unpackTerrain(packTerrain(world));
  assert.equal(stamped!.seen[far], 1);
  const bare = packTerrain(world);
  delete bare.seen;
  const disks = unpackTerrain(bare);
  assert.equal(disks!.seen[world.hearths[0]!.y * world.cols + world.hearths[0]!.x], 1);
  let diskN = 0;
  for (const v of disks!.seen) if (v) diskN += 1;
  assert.ok(diskN / disks!.seen.length < 0.25, `fallback seen ${diskN}`);
});

test("a belt is one long range, not a speckle net", () => {
  const world = generateTerrain("inkunzi", 46);
  const { cols, rows, relief } = world;
  const seen = new Uint8Array(relief.length);
  let best = 0;
  const stack: number[] = [];
  for (let i = 0; i < relief.length; i++) {
    if (seen[i] || (relief[i] !== 4 && relief[i] !== 5)) continue;
    let n = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const k = stack.pop()!;
      n += 1;
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
        const xx = (x + dx + cols) % cols;
        const j = yy * cols + xx;
        if (seen[j] || (relief[j] !== 4 && relief[j] !== 5)) continue;
        seen[j] = 1;
        stack.push(j);
      }
    }
    if (n > best) best = n;
  }
  assert.ok(best > 40, `longest belt ${best}`);
});

test("polar ice is broken, not a solid footer", () => {
  const world = generateTerrain("inkunzi", 46);
  const rowIce = (row: number) => {
    let ice = 0;
    let open = 0;
    for (let x = 0; x < world.cols; x++) {
      const id = world.terrain[row * world.cols + x]!;
      if (id === 6 || id === 16 || id === 15) ice += 1;
      else open += 1;
    }
    return { ice, open };
  };
  const north = rowIce(1);
  assert.ok(north.open > 0, "north row is a solid bar");
  assert.ok(north.ice < world.cols, "north row is solid ice");
});

function longestRange(world: ReturnType<typeof generateTerrain>) {
  const { cols, rows, relief } = world;
  const seen = new Uint8Array(relief.length);
  let best = 0;
  const stack: number[] = [];
  for (let i = 0; i < relief.length; i++) {
    if (seen[i] || (relief[i] !== 4 && relief[i] !== 5)) continue;
    let n = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const k = stack.pop()!;
      n += 1;
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
        const xx = (x + dx + cols) % cols;
        const j = yy * cols + xx;
        if (seen[j] || (relief[j] !== 4 && relief[j] !== 5)) continue;
        seen[j] = 1;
        stack.push(j);
      }
    }
    if (n > best) best = n;
  }
  return best;
}

function landBodies(world: ReturnType<typeof generateTerrain>, min: number) {
  const { cols, rows, terrain } = world;
  const seen = new Uint8Array(terrain.length);
  const solid = (id: number) => id !== 0 && id !== 1 && id !== 16;
  const bodies: { n: number; y: number }[] = [];
  const stack: number[] = [];
  for (let i = 0; i < terrain.length; i++) {
    if (seen[i] || !solid(terrain[i]!)) continue;
    let n = 0;
    let sy = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const k = stack.pop()!;
      n += 1;
      sy += (k / cols) | 0;
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
        const xx = (x + dx + cols) % cols;
        const j = yy * cols + xx;
        if (seen[j] || !solid(terrain[j]!)) continue;
        seen[j] = 1;
        stack.push(j);
      }
    }
    if (n >= min) bodies.push({ n, y: sy / n / rows });
  }
  return bodies.filter((b) => b.y > 0.08 && b.y < 0.92);
}

test("mountains at 0 has no long range and mountains at 100 keeps the peak cap", () => {
  const flat = generateTerrain("inkunzi", 46, { ...LAYOUT_RECIPES.earthlike, mountains: 0, layout: "earthlike", level: "standard" });
  assert.ok(longestRange(flat) < 24, `flat range ${longestRange(flat)}`);
  const high = generateTerrain("inkunzi", 46, { ...LAYOUT_RECIPES.earthlike, mountains: 100, layout: "earthlike", level: "standard" });
  let land = 0;
  let peak = 0;
  for (let i = 0; i < high.terrain.length; i++) {
    const id = high.terrain[i]!;
    if (id === 0 || id === 1 || id === 16) continue;
    land += 1;
    if (high.relief[i] === 5) peak += 1;
  }
  assert.ok(peak / land < 0.08, `peaks ${peak}/${land}`);
  assert.ok(longestRange(high) > 20, "high mountains still have a ridge");
});

test("archipelago is many bodies and pangaea is one", () => {
  const isles = generateTerrain("inkunzi-isles", LAYOUT_RECIPES.archipelago.sea, {
    ...LAYOUT_RECIPES.archipelago,
    layout: "archipelago",
    level: "standard",
  });
  const pangaea = generateTerrain("inkunzi-pangaea", LAYOUT_RECIPES.pangaea.sea, {
    ...LAYOUT_RECIPES.pangaea,
    layout: "pangaea",
    level: "standard",
  });
  const isleBodies = landBodies(isles, 12);
  const panBodies = landBodies(pangaea, 80);
  assert.ok(isleBodies.length >= 6, `archipelago bodies ${isleBodies.length}`);
  assert.equal(panBodies.length, 1, `pangaea bodies ${panBodies.length}`);
  const panLand = panBodies.reduce((s, b) => s + b.n, 0);
  assert.ok(panBodies[0]!.n / panLand > 0.8, "pangaea is one mass");
});

test("a pack keeps layout, seen, and height and a file load does not generate", () => {
  const world = generateTerrain("inkunzi", 46, { ...LAYOUT_RECIPES.continents, layout: "continents", level: "standard" });
  const pack = packTerrain(world);
  assert.equal(pack.layout, "continents");
  const back = unpackTerrain(pack);
  assert.equal(back!.layout, "continents");
  assert.equal(back!.breakup, world.breakup);
  assert.equal(back!.height[20], world.height[20]);
  assert.equal(back!.seen[world.hearths[0]!.y * world.cols + world.hearths[0]!.x], 1);
  const loaded = readTerrainPack(JSON.stringify(pack));
  assert.equal(loaded!.height[20], world.height[20]);
  assert.equal(loaded!.layout, "continents");
  assert.equal(loaded!.seen[world.hearths[0]!.y * world.cols + world.hearths[0]!.x], world.seen[world.hearths[0]!.y * world.cols + world.hearths[0]!.x]);
});

test("pangaea does not paint a second full-height mountain wall", () => {
  const world = generateTerrain("inkunzi-pangaea", LAYOUT_RECIPES.pangaea.sea, {
    ...LAYOUT_RECIPES.pangaea,
    layout: "pangaea",
    level: "standard",
  });
  const { cols, rows, relief, terrain } = world;
  const land = (id: number) => id !== 0 && id !== 1 && id !== 16;
  let tall = 0;
  for (let x = 0; x < cols; x++) {
    let n = 0;
    let rowsLand = 0;
    for (let y = Math.floor(rows * 0.18); y < rows * 0.82; y++) {
      const i = y * cols + x;
      if (!land(terrain[i]!)) continue;
      rowsLand += 1;
      if (relief[i] === 4 || relief[i] === 5) n += 1;
    }
    if (rowsLand > 20 && n / rowsLand > 0.55) tall += 1;
  }
  assert.ok(tall < 6, `pangaea stroke columns ${tall}`);
});

test("polar mid-ocean row is not an ice bar", () => {
  const world = generateTerrain("inkunzi", 46);
  const y = Math.max(1, Math.floor(world.rows * 0.04));
  let ice = 0;
  let ocean = 0;
  for (let x = 0; x < world.cols; x++) {
    const id = world.terrain[y * world.cols + x]!;
    if (id === 6 || id === 16) ice += 1;
    if (id === 0) ocean += 1;
  }
  assert.ok(ocean > world.cols * 0.12, `open polar water ${ocean}`);
  assert.ok(ice < world.cols * 0.9, `ice bar ${ice}`);
});

test("earthlike wraps and theater does not", () => {
  const planet = generateTerrain("inkunzi", 46, { ...LAYOUT_RECIPES.earthlike, layout: "earthlike", wrap: true });
  const theater = generateTerrain("inkunzi", 46, { ...LAYOUT_RECIPES.theater, layout: "theater", wrap: false });
  assert.equal(planet.wrap, true);
  assert.equal(theater.wrap, false);
});

test("earthlike grows islands besides the two mains", () => {
  const world = generateTerrain("inkunzi", 46);
  const bodies = landBodies(world, 3).sort((a, b) => b.n - a.n);
  const extras = bodies.slice(2);
  assert.ok(extras.length >= 3, `island bodies ${extras.length} sizes ${bodies.map((b) => b.n).join(",")}`);
});

test("no single cover sheets the land", () => {
  const world = generateTerrain("inkunzi", 46);
  const counts = new Map<number, number>();
  let land = 0;
  for (let i = 0; i < world.cover.length; i++) {
    const id = world.cover[i]!;
    if (id === 0 || id === 1 || id === 16) continue;
    land += 1;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const [id, n] of counts) {
    assert.ok(n / land <= 0.4, `cover ${id} sheets ${n}/${land}`);
  }
  for (const id of [2, 3, 7, 8, 11, 12, 13]) {
    assert.ok((counts.get(id) ?? 0) > 30, `cover ${id} ${(counts.get(id) ?? 0)}`);
  }
});

test("ranges are a thin belt and the coast is not a stair", () => {
  const world = generateTerrain("inkunzi", 46);
  const { cols, rows, relief, terrain } = world;
  const dry = (id: number) => id !== 0 && id !== 1 && id !== 16;
  let runs = 0;
  let width = 0;
  let wash = 0;
  for (let y = 0; y < rows; y++) {
    let run = 0;
    const flush = () => {
      if (run > 0) {
        runs += 1;
        width += run;
        run = 0;
      }
    };
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (dry(terrain[i]!) && relief[i]! >= 4) run += 1;
      else flush();
    }
    flush();
  }
  const mean = runs ? width / runs : 0;
  assert.ok(mean >= 2 && mean <= 8, `belt width ${mean} runs ${runs}`);
  for (let x = 0; x < cols; x++) {
    let n = 0;
    let landRows = 0;
    for (let y = 0; y < rows; y++) {
      const i = y * cols + x;
      if (!dry(terrain[i]!)) continue;
      landRows += 1;
      if (relief[i]! >= 4) n += 1;
    }
    if (landRows > 12 && n / landRows > 0.18) wash += 1;
  }
  assert.ok(wash < 80, `washboard columns ${wash}`);
  let shore = 0;
  let jagged = 0;
  const side: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (!dry(terrain[i]!)) continue;
      let landN = 0;
      let waterN = 0;
      for (const [dx, dy] of side) {
        const yy = y + dy;
        if (yy < 0 || yy >= rows) continue;
        const xx = (x + dx + cols) % cols;
        if (dry(terrain[yy * cols + xx]!)) landN += 1;
        else waterN += 1;
      }
      if (waterN < 1) continue;
      shore += 1;
      if (landN <= 2) jagged += 1;
    }
  }
  const stair = shore ? jagged / shore : 1;
  assert.ok(stair > 0.15 && stair < 0.85, `coast stair ${stair} shore ${shore}`);
});

test("islands layout is many bodies and pangaea stays one", () => {
  const isles = generateTerrain("inkunzi-islands", LAYOUT_RECIPES.islands.sea, {
    ...LAYOUT_RECIPES.islands,
    layout: "islands",
    level: "standard",
  });
  const pangaea = generateTerrain("inkunzi-pangaea", LAYOUT_RECIPES.pangaea.sea, {
    ...LAYOUT_RECIPES.pangaea,
    layout: "pangaea",
    level: "standard",
  });
  const isleBodies = landBodies(isles, 8);
  const panBodies = landBodies(pangaea, 80);
  assert.ok(isleBodies.length >= 6, `islands bodies ${isleBodies.length}`);
  assert.equal(panBodies.length, 1, `pangaea bodies ${panBodies.length}`);
});

test("desert river keeps both layers and forest can stand on a ridge", () => {
  const seeds = ["inkunzi", "inkunzi-dry", "vestoria", "river-desert", "stack"];
  let hit = false;
  for (const seed of seeds) {
    const world = generateTerrain(seed, 46);
    for (let i = 0; i < world.cover.length; i++) {
      const cover = world.cover[i]!;
      if ((cover === 8 || cover === 11) && world.water[i] === 1) {
        const tags = effects(cellStack(world, i)).tags;
        const arid = tags.includes("desert") || tags.includes("arid") || tags.includes("steppe");
        assert.ok(arid && tags.includes("river"), tags.join(","));
        assert.notEqual(cover, 9);
        hit = true;
        break;
      }
    }
    if (hit) break;
  }
  assert.ok(hit, "no desert or steppe channel");
  const world = generateTerrain("inkunzi", 46);
  let forestRidge = 0;
  for (let i = 0; i < world.cover.length; i++) {
    const c = world.cover[i]!;
    if ((c === 3 || c === 13 || c === 14) && (world.relief[i] ?? 0) >= 3) forestRidge += 1;
  }
  assert.ok(forestRidge > 0, "no forest on a hill or range");
});

test("rivers are incised and lakes sit in basins", () => {
  const world = generateTerrain("inkunzi", 46);
  let ch = 0;
  let chH = 0;
  let nb = 0;
  let nbH = 0;
  const { cols, rows, height, water, cover } = world;
  for (let i = 0; i < water.length; i++) {
    if (water[i] !== 1) continue;
    const y = (i / cols) | 0;
    const x = i - y * cols;
    ch += 1;
    chH += height[i]!;
    assert.notEqual(cover[i], 9);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ] as const) {
      const yy = y + dy;
      if (yy < 0 || yy >= rows) continue;
      const xx = (x + dx + cols) % cols;
      const j = yy * cols + xx;
      if (water[j] === 1) continue;
      if (cover[j] === 0 || cover[j] === 1 || cover[j] === 16) continue;
      nb += 1;
      nbH += height[j]!;
    }
  }
  assert.ok(ch > 10, `channels ${ch}`);
  assert.ok(nb > 0);
  assert.ok(chH / ch < nbH / nb, `channel ${chH / ch} neighbors ${nbH / nb}`);
  let lakes = 0;
  for (let i = 0; i < water.length; i++) if (water[i] === 3) lakes += 1;
  assert.ok(lakes > 0, "no lakes");
  for (let i = 0; i < water.length; i++) {
    if (water[i] !== 3) continue;
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
      const xx = (x + dx + cols) % cols;
      const j = yy * cols + xx;
      if (water[j] === 3) continue;
      assert.ok(height[i]! <= height[j]!, `lake not a basin ${height[i]} vs ${height[j]}`);
    }
  }
});

test("earthlike landmasses are mixed sizes and not a mirror pair", () => {
  const world = generateTerrain("inkunzi", 46);
  const bodies = landBodies(world, 12).sort((a, b) => b.n - a.n);
  assert.ok(bodies.some((b) => b.n >= 80), `no large body ${bodies.map((b) => b.n).join(",")}`);
  assert.ok(bodies.filter((b) => b.n >= 12).length >= 2, `bodies ${bodies.length}`);
});

test("under is not a surface silhouette and weather is deterministic", () => {
  const world = generateTerrain("inkunzi", 46);
  let n = world.under.length;
  let landN = 0;
  let openN = 0;
  let both = 0;
  for (let i = 0; i < n; i++) {
    const land = world.cover[i] !== 0 && world.cover[i] !== 1 && world.cover[i] !== 16;
    const open = world.under[i] === 1 || world.under[i] === 2;
    if (land) landN += 1;
    if (open) openN += 1;
    if (land && open) both += 1;
  }
  const pl = landN / n;
  const po = openN / n;
  const pboth = both / n;
  const corr = (pboth - pl * po) / Math.sqrt(Math.max(1e-9, pl * (1 - pl) * po * (1 - po)));
  assert.ok(corr < 0.55, `under corr ${corr}`);
  const a = unpackTerrain(packTerrain(world))!;
  const b = unpackTerrain(packTerrain(world))!;
  applyWeather(a);
  applyWeather(b);
  let mismatch = 0;
  for (let i = 0; i < a.moist.length; i += 10) if (a.moist[i] !== b.moist[i]) mismatch += 1;
  assert.equal(mismatch, 0);
});


