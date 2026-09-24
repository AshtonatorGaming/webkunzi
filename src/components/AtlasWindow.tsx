"use client";

import { useEffect, useState } from "react";
import { MAP_PRESETS, TERRAINS, LAYOUT_RECIPES, breakupForLevel, clampMapSize, gridForMap, type WorldLayout, type WorldLevel } from "@/engine/terrain";
import { getTerrain, loadPack, setWorldWrap, traceImage, useTerrainField } from "@/engine/useTerrain";
import { downloadShelfPack, fieldFromPackText, listShelf, saveShelf, type ShelfEntry } from "@/engine/worldShelf";
import { setAtlasUi, useAtlasUi, type AtlasTool } from "@/engine/atlasUi";
import type { Nation } from "@/engine/types";
import type { WorldGenInput } from "@/engine/terrain";
import { cn } from "@/lib/cn";

export type AtlasGenerate = {
  width: number;
  height: number;
  seed: string;
  sea: number;
} & WorldGenInput;

export default function AtlasWindow({
  mapWidth,
  mapHeight,
  nations,
  onGenerate,
}: {
  mapWidth: number;
  mapHeight: number;
  nations: Nation[];
  onGenerate: (job: AtlasGenerate) => void;
}) {
  const { field } = useTerrainField();
  const ui = useAtlasUi();
  const [seedText, setSeedText] = useState("inkunzi");
  const [sea, setSea] = useState(46);
  const [warmth, setWarmth] = useState(50);
  const [wetness, setWetness] = useState(50);
  const [mountains, setMountains] = useState(42);
  const [continent, setContinent] = useState(58);
  const [layout, setLayout] = useState<WorldLayout>("earthlike");
  const [level, setLevel] = useState<WorldLevel>("standard");
  const [breakup, setBreakup] = useState(50);
  const [gap, setGap] = useState(70);
  const [shelfName, setShelfName] = useState("Earthlike");
  const [shelfRev, setShelfRev] = useState(0);
  const [planet, setPlanet] = useState(true);
  const [draftW, setDraftW] = useState(mapWidth);
  const [draftH, setDraftH] = useState(mapHeight);

  useEffect(() => {
    setDraftW(mapWidth);
    setDraftH(mapHeight);
  }, [mapWidth, mapHeight]);

  useEffect(() => {
    if (!field) return;
    setSeedText(field.seed || "inkunzi");
    setSea(field.sea ?? 46);
    setWarmth(field.warmth ?? 50);
    setWetness(field.wetness ?? 50);
    setMountains(field.mountains ?? 42);
    setContinent(field.scale ?? 58);
    setLayout(field.layout ?? "earthlike");
    setLevel(field.level ?? "standard");
    setBreakup(field.breakup ?? 50);
    setGap(field.gap ?? 70);
    setPlanet(field.wrap !== false);
  }, [field]);

  const grid = gridForMap(draftW, draftH);
  const cell = Math.max(1, Math.round(grid.width / grid.cols));

  function slider(label: string, min: number, max: number, value: number, set: (n: number) => void) {
    return (
      <label className="flex items-center gap-2 text-[11px] text-muted">
        <span className="w-16 shrink-0">{label}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          aria-label={label}
          className="min-w-0 flex-1"
          onChange={(e) => set(Number(e.target.value))}
        />
        <span className="w-7 text-right tabular text-fg">{value}</span>
      </label>
    );
  }

  function toolBtn(id: AtlasTool, label: string) {
    return (
      <button
        type="button"
        aria-pressed={ui.tool === id}
        onClick={() => setAtlasUi({ tool: ui.tool === id ? "none" : id })}
        className={cn(
          "rounded-sm px-2 py-1.5 text-xs",
          ui.tool === id ? "bg-accent text-accent-fg" : "bg-raised text-fg",
        )}
      >
        {label}
      </button>
    );
  }

  function traceFile(file: File) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const current = getTerrain();
      const canvas = document.createElement("canvas");
      canvas.width = current?.cols ?? grid.cols;
      canvas.height = current?.rows ?? grid.rows;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      traceImage(data.data, canvas.width, canvas.height, canvas.width, canvas.height, planet);
      setWorldWrap(planet);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  const drawing = ui.tool === "ground" || ui.tool === "border" || ui.tool === "reveal" || ui.tool === "shroud";

  return (
    <div className="ink-scroll max-h-[min(70vh,36rem)] space-y-3 overflow-auto p-3 text-sm">
      <div>
        <div className="mb-1 text-[11px] tracking-[0.14em] text-gold">SIZE</div>
        <div className="flex flex-wrap gap-1">
          {MAP_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cn(
                "rounded-sm px-2 py-1 text-xs",
                draftW === p.w && draftH === p.h ? "bg-fg text-bg" : "bg-raised text-fg",
              )}
              onClick={() => {
                setDraftW(p.w);
                setDraftH(p.h);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <label className="flex min-w-0 flex-1 flex-col text-[11px] text-muted">
            Width
            <input
              type="number"
              aria-label="Map width"
              className="mt-0.5 h-8 rounded-sm border border-border bg-raised px-2 text-sm text-fg"
              value={draftW}
              min={2048}
              onChange={(e) => setDraftW(Number(e.target.value))}
            />
          </label>
          <label className="flex min-w-0 flex-1 flex-col text-[11px] text-muted">
            Height
            <input
              type="number"
              aria-label="Map height"
              className="mt-0.5 h-8 rounded-sm border border-border bg-raised px-2 text-sm text-fg"
              value={draftH}
              min={1176}
              onChange={(e) => setDraftH(Number(e.target.value))}
            />
          </label>
        </div>
        <p className="mt-1 text-[11px] text-muted tabular">
          {grid.cols}×{grid.rows} cells · ~{cell}px · as large as the table can carry
        </p>
      </div>

      <div>
        <div className="mb-1 text-[11px] tracking-[0.14em] text-gold">LAYOUT</div>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(LAYOUT_RECIPES) as WorldLayout[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={layout === id}
              className={cn("rounded-sm px-2 py-1 text-xs capitalize", layout === id ? "bg-fg text-bg" : "bg-raised text-fg")}
              onClick={() => {
                const recipe = LAYOUT_RECIPES[id];
                setLayout(id);
                setLevel("standard");
                setSea(recipe.sea);
                setWarmth(recipe.warmth);
                setWetness(recipe.wetness);
                setMountains(recipe.mountains);
                setContinent(recipe.scale);
                setBreakup(recipe.breakup);
                setGap(recipe.gap);
                setPlanet(recipe.wrap);
                setShelfName(id);
              }}
            >
              {id}
            </button>
          ))}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {(["compact", "standard", "scattered"] as WorldLevel[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={level === id}
              className={cn("rounded-sm px-2 py-1 text-xs capitalize", level === id ? "bg-fg text-bg" : "bg-raised text-fg")}
              onClick={() => {
                setLevel(id);
                setBreakup(breakupForLevel(LAYOUT_RECIPES[layout].breakup, id));
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-[11px] tracking-[0.14em] text-gold">WORLD</div>
        <input
          className="h-8 w-full rounded-sm border border-border bg-raised px-2 text-xs text-fg"
          value={seedText}
          aria-label="World seed"
          onChange={(e) => setSeedText(e.target.value)}
        />
        {slider("Sea", 32, 62, sea, setSea)}
        {slider("Warmth", 0, 100, warmth, setWarmth)}
        {slider("Wetness", 0, 100, wetness, setWetness)}
        {slider("Mountains", 0, 100, mountains, setMountains)}
        {slider("Scale", 0, 100, continent, setContinent)}
        {slider("Breakup", 0, 100, breakup, setBreakup)}
        {(layout === "earthlike" || layout === "continents") && slider("Gap", 0, 100, gap, setGap)}
        <div className="flex gap-1 pt-1">
          <button
            type="button"
            aria-pressed={planet}
            className={cn("h-8 flex-1 rounded-sm px-2 text-xs", planet ? "bg-fg text-bg" : "bg-raised text-fg")}
            onClick={() => {
              setPlanet(true);
              setWorldWrap(true);
            }}
          >
            Planet
          </button>
          <button
            type="button"
            aria-pressed={!planet}
            className={cn("h-8 flex-1 rounded-sm px-2 text-xs", !planet ? "bg-fg text-bg" : "bg-raised text-fg")}
            onClick={() => {
              setPlanet(false);
              setWorldWrap(false);
            }}
          >
            Theater
          </button>
          <button
            type="button"
            className="h-8 flex-1 rounded-sm bg-accent px-2 text-xs text-accent-fg"
            onClick={() => {
              const size = clampMapSize(draftW, draftH);
              onGenerate({
                width: size.width,
                height: size.height,
                seed: seedText,
                sea,
                warmth,
                wetness,
                mountains,
                scale: continent,
                wrap: planet,
                layout,
                level,
                breakup,
                gap,
                mapWidth: size.width,
                mapHeight: size.height,
              });
            }}
          >
            Generate
          </button>
        </div>
        <p className="text-[11px] text-muted">Generate replaces the world. Pins keep their place on the rectangle.</p>
      </div>

      <ShelfBlock
        name={shelfName}
        setName={setShelfName}
        rev={shelfRev}
        mapWidth={grid.width}
        mapHeight={grid.height}
        onSaved={() => setShelfRev((n) => n + 1)}
        onLoadPack={(pack) => loadPack(pack)}
        onGenerate={onGenerate}
      />

      <div>
        <div className="mb-1 text-[11px] tracking-[0.14em] text-gold">PAINT</div>
        <div className="flex flex-wrap gap-1">
          {toolBtn("pop", "Place pop")}
          {toolBtn("node", "Place node")}
          {toolBtn("army", "Place army")}
          {toolBtn("ground", "Ground")}
          {toolBtn("border", "Borders")}
          {toolBtn("reveal", "Reveal")}
          {toolBtn("shroud", "Shroud")}
          <label className="rounded-sm bg-raised px-2 py-1.5 text-xs">
            Trace
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) traceFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {drawing && (
          <div className="mt-2 space-y-1">
            <div className="flex flex-wrap gap-1">
              {[1, 3, 6, 12].map((size) => (
                <button
                  key={size}
                  type="button"
                  className={cn(
                    "h-7 min-w-7 rounded-sm px-2 text-xs",
                    ui.brush === size ? "bg-fg text-bg" : "bg-raised text-fg",
                  )}
                  onClick={() => setAtlasUi({ brush: size })}
                >
                  {size}
                </button>
              ))}
            </div>
            {ui.tool === "ground" && (
              <div className="flex flex-wrap gap-1">
                {TERRAINS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.label}
                    aria-label={t.label}
                    aria-pressed={ui.groundId === t.id}
                    className={cn("h-6 w-6 rounded-sm border", ui.groundId === t.id ? "border-fg" : "border-transparent")}
                    style={{ background: t.color }}
                    onClick={() => setAtlasUi({ groundId: t.id })}
                  />
                ))}
              </div>
            )}
            {ui.tool === "border" && (
              <select
                className="h-8 w-full rounded-sm border border-border bg-raised px-2 text-xs text-fg"
                value={ui.borderId}
                onChange={(e) => setAtlasUi({ borderId: e.target.value })}
              >
                <option value="">Clear border</option>
                {nations
                  .filter((n) => n.id !== "unclaimed")
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
              </select>
            )}
            <p className="text-[11px] text-muted">
              {ui.tool === "reveal" || ui.tool === "shroud"
                ? "Drag writes the fog. It does not change the ground."
                : "Drag paints. Click the tool again to pan."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShelfBlock({
  name,
  setName,
  rev,
  mapWidth,
  mapHeight,
  onSaved,
  onLoadPack,
  onGenerate,
}: {
  name: string;
  setName: (n: string) => void;
  rev: number;
  mapWidth: number;
  mapHeight: number;
  onSaved: () => void;
  onLoadPack: (pack: NonNullable<ShelfEntry["pack"]>) => void;
  onGenerate: (job: AtlasGenerate) => void;
}) {
  const entries = listShelf();
  void rev;
  function openEntry(entry: ShelfEntry) {
    if (entry.pack) {
      onLoadPack(entry.pack);
      return;
    }
    if (entry.layout === "traced") return;
    const recipe = LAYOUT_RECIPES[entry.layout];
    onGenerate({
      width: mapWidth,
      height: mapHeight,
      seed: entry.seed,
      ...recipe,
      layout: entry.layout,
      level: "standard",
      mapWidth,
      mapHeight,
    });
  }
  return (
    <div>
      <div className="mb-1 text-[11px] tracking-[0.14em] text-gold">SHELF</div>
      <div className="mb-1 flex gap-1">
        <input
          className="h-8 min-w-0 flex-1 rounded-sm border border-border bg-raised px-2 text-xs text-fg"
          aria-label="Shelf name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          className="h-8 rounded-sm bg-raised px-2 text-xs text-fg"
          onClick={() => {
            const field = getTerrain();
            if (!field) return;
            saveShelf(field, name);
            onSaved();
          }}
        >
          Save
        </button>
        <button
          type="button"
          className="h-8 rounded-sm bg-raised px-2 text-xs text-fg"
          onClick={() => {
            const field = getTerrain();
            if (field) downloadShelfPack(field, name);
          }}
        >
          Download
        </button>
      </div>
      <label className="mb-1 inline-block rounded-sm bg-raised px-2 py-1.5 text-xs text-fg">
        Load pack
        <input
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const text = String(reader.result ?? "");
              if (!fieldFromPackText(text)) return;
              onLoadPack(JSON.parse(text) as NonNullable<ShelfEntry["pack"]>);
            };
            reader.readAsText(file);
            e.target.value = "";
          }}
        />
      </label>
      <ul className="space-y-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="flex w-full items-baseline justify-between gap-2 rounded-sm bg-raised px-2 py-1 text-left text-xs text-fg"
              onClick={() => openEntry(entry)}
            >
              <span className="truncate">
                {entry.name}
                <span className="text-muted"> · {entry.layout} · {entry.seed}</span>
              </span>
              <span className="shrink-0 tabular text-muted">
                {entry.cols}×{entry.rows}
                {entry.bundled ? " · bundled" : entry.savedAt ? ` · ${new Date(entry.savedAt).toLocaleDateString()}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[11px] text-muted">A pack is the world, not a picture. Trace stays under Paint.</p>
    </div>
  );
}
