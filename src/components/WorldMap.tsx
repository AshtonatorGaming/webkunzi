"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  ImageOverlay,
  CircleMarker,
  Circle,
  Popup,
  Tooltip,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { CRS, LatLngBounds, divIcon } from "leaflet";
import type { Army, MarchMode, Nation, Pop, PopKind, ResourceNode } from "@/engine/types";
import { MAP_INK, MAP_LAYERS, colorFromKey, type MapLayer } from "@/engine/mapLayers";
import { distance, enemyBlockers, stackedWith, stackOffsets, stopForZoc, ZOC_PX } from "@/engine/movement";
import { armyStrength, armiesInContact, isGhost } from "@/engine/battle";
import PopEditor from "./PopEditor";
import NodeEditor from "./NodeEditor";
import ArmyEditor from "./ArmyEditor";
import { cn } from "@/lib/cn";

type Tool = "none" | "pop" | "node" | "army";
type Preview = { x: number; y: number };

type Props = {
  mapWidth: number;
  mapHeight: number;
  marchRange: number;
  selectedArmyId: string | null;
  marchingArmyId: string | null;
  staffLive: boolean;
  pops: Pop[];
  nodes: ResourceNode[];
  armies: Army[];
  nations: Nation[];
  onSelectArmy: (id: string | null) => void;
  onMoveArmy: (id: string, x: number, y: number) => void;
  onPlacePop: (y: number, x: number) => void;
  onPlaceNode: (y: number, x: number) => void;
  onPlaceArmy: (y: number, x: number) => void;
  onUpdatePop: (id: string, patch: Partial<Pop>) => void;
  onRemovePop: (id: string) => void;
  onUpdateNode: (id: string, patch: Partial<ResourceNode>) => void;
  onRemoveNode: (id: string) => void;
  onUpdateArmy: (id: string, patch: Partial<Army>) => void;
  onRemoveArmy: (id: string) => void;
  onStartMarch: (id: string, mode: MarchMode) => void;
  onAttack: (attackerId: string, defenderId: string) => void;
  onEntrench: (id: string) => void;
};

function safeHex(color: string): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : "#c8c4bc";
}

function bannerIcon(color: string, strength: number, state: "idle" | "selected" | "march", ghost: boolean) {
  const ring = state === "march" ? "#e8dcc8" : state === "selected" ? "#c4a574" : "#1a1814";
  const ghostClass = ghost ? " ink-banner-ghost" : "";
  return divIcon({
    className: "ink-banner",
    iconSize: [26, 40],
    iconAnchor: [13, 40],
    popupAnchor: [0, -36],
    tooltipAnchor: [0, -36],
    html: `<div class="ink-banner-inner${ghostClass}" style="--c:${safeHex(color)};--ring:${ring}"><span class="ink-banner-pole"></span><span class="ink-banner-flag"></span><span class="ink-banner-n">${Math.round(strength)}</span></div>`,
  });
}

function popRadius(kind?: PopKind): number {
  if (kind === "city") return 11;
  if (kind === "town") return 9;
  if (kind === "fort") return 8;
  if (kind === "camp") return 6;
  return 7;
}

function FitPainting() {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(id);
  }, [map]);
  return null;
}

function MapPointer({
  tool,
  marchingArmyId,
  armies,
  marchRange,
  onPlacePop,
  onPlaceNode,
  onPlaceArmy,
  onMoveArmy,
  onPreview,
  onSelectArmy,
  onPickStack,
}: {
  tool: Tool;
  marchingArmyId: string | null;
  armies: Army[];
  marchRange: number;
  onPlacePop: (y: number, x: number) => void;
  onPlaceNode: (y: number, x: number) => void;
  onPlaceArmy: (y: number, x: number) => void;
  onMoveArmy: (id: string, x: number, y: number) => void;
  onPreview: (preview: Preview | null) => void;
  onSelectArmy: (id: string | null) => void;
  onPickStack: (ids: string[]) => void;
}) {
  useMapEvents({
    mousemove(e) {
      if (!marchingArmyId || tool !== "none") {
        onPreview(null);
        return;
      }
      const army = armies.find((a) => a.id === marchingArmyId);
      if (!army) {
        onPreview(null);
        return;
      }
      const y = e.latlng.lat;
      const x = e.latlng.lng;
      if (distance(army.x, army.y, x, y) > marchRange) {
        onPreview(null);
        return;
      }
      const stopped = stopForZoc(army.x, army.y, x, y, enemyBlockers(army, armies));
      onPreview({ x: stopped.x, y: stopped.y });
    },
    click(e) {
      const y = e.latlng.lat;
      const x = e.latlng.lng;
      if (tool === "pop") {
        onPlacePop(y, x);
        return;
      }
      if (tool === "node") {
        onPlaceNode(y, x);
        return;
      }
      if (tool === "army") {
        onPlaceArmy(y, x);
        return;
      }
      if (!marchingArmyId) {
        const near = armies.filter((a) => distance(a.x, a.y, x, y) <= 22);
        if (near.length > 1) {
          onPickStack(near.map((a) => a.id));
          return;
        }
        if (near.length === 1) {
          onSelectArmy(near[0]!.id);
          return;
        }
        onSelectArmy(null);
        onPickStack([]);
        return;
      }
      const army = armies.find((a) => a.id === marchingArmyId);
      if (!army) return;
      if (distance(army.x, army.y, x, y) > marchRange) {
        onSelectArmy(null);
        return;
      }
      const stopped = stopForZoc(army.x, army.y, x, y, enemyBlockers(army, armies));
      onMoveArmy(army.id, stopped.x, stopped.y);
      onPreview(null);
    },
  });
  return null;
}

export default function WorldMap({
  mapWidth,
  mapHeight,
  marchRange,
  selectedArmyId,
  marchingArmyId,
  staffLive,
  pops,
  nodes,
  armies,
  nations,
  onSelectArmy,
  onMoveArmy,
  onPlacePop,
  onPlaceNode,
  onPlaceArmy,
  onUpdatePop,
  onRemovePop,
  onUpdateNode,
  onRemoveNode,
  onUpdateArmy,
  onRemoveArmy,
  onStartMarch,
  onAttack,
  onEntrench,
}: Props) {
  const [tool, setTool] = useState<Tool>("none");
  const [layer, setLayer] = useState<MapLayer>("political");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [pickStack, setPickStack] = useState<string[]>([]);
  const colorById = useMemo(() => new Map(nations.map((n) => [n.id, n.color])), [nations]);
  const offsets = useMemo(() => stackOffsets(armies), [armies]);
  const PAD = 400;
  const BOUNDS = useMemo(() => new LatLngBounds([0, 0], [mapHeight, mapWidth]), [mapHeight, mapWidth]);
  const VIEW_BOUNDS = useMemo(
    () => new LatLngBounds([-PAD, -PAD], [mapHeight + PAD, mapWidth + PAD]),
    [mapHeight, mapWidth],
  );
  const selected = armies.find((a) => a.id === selectedArmyId);
  const marching = armies.find((a) => a.id === marchingArmyId);
  const showAllZoc = layer === "military";
  const showPops =
    layer === "all" || layer === "political" || layer === "culture" || layer === "religion";
  const showNodes = layer === "all" || layer === "resources";
  const showArmies = layer === "all" || layer === "military" || layer === "political";

  function popFill(pop: Pop): string {
    if (layer === "culture") return colorFromKey(pop.culture);
    if (layer === "religion") return colorFromKey(pop.religion);
    return colorById.get(pop.ownerId) ?? MAP_INK.unset;
  }

  function toolBtn(id: Tool, label: string) {
    return (
      <button
        type="button"
        onClick={() => setTool((t) => (t === id ? "none" : id))}
        className={cn(
          "rounded-sm px-3 py-2 text-sm font-medium",
          tool === id ? "bg-accent text-accent-fg" : "bg-raised text-fg",
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="relative h-full w-full">
      {staffLive && (
        <div className="absolute top-3 left-1/2 z-chrome hidden max-w-[calc(100%-1rem)] -translate-x-1/2 flex-wrap justify-center gap-1 rounded-sm border border-gold-dim bg-bg/85 px-2 py-1 md:flex">
          {toolBtn("pop", "Place pop")}
          {toolBtn("node", "Place node")}
          {toolBtn("army", "Place army")}
          <span className="self-center px-2 text-[11px] text-muted tabular">
            {pops.length} pops · {nodes.length} nodes · {armies.length} banners
          </span>
        </div>
      )}
      <div className="absolute top-3 left-1/2 z-chrome flex max-w-[calc(100%-1rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-sm border border-gold-dim bg-bg/90 p-1 md:top-auto md:bottom-3">
        {MAP_LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            title={l.label}
            onClick={() => setLayer(l.id)}
            className={cn(
              "h-10 min-w-12 shrink-0 rounded-sm px-2 text-[11px] tracking-wide",
              layer === l.id
                ? "bg-fg text-bg"
                : "text-fg hover:bg-hover",
            )}
          >
            <span className="md:hidden">{l.short}</span>
            <span className="hidden md:inline">{l.label}</span>
          </button>
        ))}
      </div>
      <MapContainer
        key={`inkunzi-world-${mapWidth}x${mapHeight}`}
        attributionControl={false}
        crs={CRS.Simple}
        bounds={BOUNDS}
        maxBounds={VIEW_BOUNDS}
        maxBoundsViscosity={0.2}
        minZoom={-3}
        maxZoom={3}
        style={{ height: "100%", width: "100%", background: "var(--color-map)" }}
      >
        <ImageOverlay url="/maps/world.jpg" bounds={BOUNDS} />
        <FitPainting />
        <MapPointer
          tool={tool}
          marchingArmyId={marchingArmyId}
          armies={armies}
          marchRange={marchRange}
          onPlacePop={onPlacePop}
          onPlaceNode={onPlaceNode}
          onPlaceArmy={onPlaceArmy}
          onMoveArmy={onMoveArmy}
          onPreview={setPreview}
          onSelectArmy={onSelectArmy}
          onPickStack={setPickStack}
        />
        {showAllZoc &&
          armies.map((army) => (
            <Circle
              key={`zoc-${army.id}`}
              center={[army.y, army.x]}
              radius={ZOC_PX}
              interactive={false}
              pathOptions={{
                color: colorById.get(army.ownerId) ?? MAP_INK.zoc,
                weight: 1,
                fillOpacity: 0.06,
              }}
            />
          ))}
        {selected && !showAllZoc && (
          <Circle
            center={[selected.y, selected.x]}
            radius={ZOC_PX}
            interactive={false}
            pathOptions={{ color: MAP_INK.zoc, weight: 1, fillOpacity: 0.08 }}
          />
        )}
        {marching && (
          <Circle
            center={[marching.y, marching.x]}
            radius={marchRange}
            interactive={false}
            pathOptions={{ color: MAP_INK.range, weight: 1, fillOpacity: 0.04 }}
          />
        )}
        {preview && marching && (
          <>
            <Circle
              center={[preview.y, preview.x]}
              radius={ZOC_PX}
              interactive={false}
              pathOptions={{ color: MAP_INK.range, weight: 1, fillOpacity: 0.1 }}
            />
            <CircleMarker
              center={[preview.y, preview.x]}
              radius={10}
              interactive={false}
              pathOptions={{
                color: MAP_INK.range,
                fillColor: colorById.get(marching.ownerId) ?? MAP_INK.unset,
                fillOpacity: 0.45,
                weight: 2,
              }}
            />
          </>
        )}
        {showPops &&
          pops.map((pop) => (
            <CircleMarker
              key={pop.id}
              center={[pop.y, pop.x]}
              radius={popRadius(pop.kind)}
              pathOptions={{
                color: pop.kind === "city" || pop.kind === "fort" ? MAP_INK.selected : pop.settled ? MAP_INK.stroke : MAP_INK.zoc,
                fillColor: popFill(pop),
                fillOpacity: 0.92,
                weight: pop.kind === "fort" ? 3 : 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {(pop.kind ?? "pop").toUpperCase()} · {nations.find((n) => n.id === pop.ownerId)?.name ?? pop.ownerId}
              </Tooltip>
              <Popup>
                <PopEditor
                  pop={pop}
                  nations={nations}
                  onChange={(patch) => onUpdatePop(pop.id, patch)}
                  onDelete={() => onRemovePop(pop.id)}
                />
              </Popup>
            </CircleMarker>
          ))}
        {showNodes &&
          nodes.map((node) => (
            <CircleMarker
              key={node.id}
              center={[node.y, node.x]}
              radius={6}
              pathOptions={{
                color: MAP_INK.stroke,
                fillColor: colorFromKey(node.resourceId),
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Tooltip direction="top">{node.resourceId}</Tooltip>
              <Popup>
                <NodeEditor
                  node={node}
                  nations={nations}
                  onChange={(patch) => onUpdateNode(node.id, patch)}
                  onDelete={() => onRemoveNode(node.id)}
                />
              </Popup>
            </CircleMarker>
          ))}
        {showArmies &&
          armies.map((army) => {
            const state =
              army.id === marchingArmyId ? "march" : army.id === selectedArmyId ? "selected" : "idle";
            const off = offsets.get(army.id) ?? { dx: 0, dy: 0 };
            const stack = stackedWith(army, armies);
            return (
              <Marker
                key={army.id}
                position={[army.y + off.dy, army.x + off.dx]}
                icon={bannerIcon(
                  colorById.get(army.ownerId) ?? MAP_INK.unset,
                  armyStrength(army),
                  state,
                  isGhost(army),
                )}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    if (tool !== "none") return;
                    const selected = armies.find((a) => a.id === selectedArmyId);
                    if (
                      selected &&
                      selected.id !== army.id &&
                      selected.ownerId !== army.ownerId &&
                      armiesInContact(selected, army)
                    ) {
                      onAttack(selected.id, army.id);
                      e.target.closePopup();
                      return;
                    }
                    if (stack.length > 1) setPickStack(stack.map((a) => a.id));
                    else setPickStack([]);
                    onSelectArmy(army.id);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -36]}>
                  {nations.find((n) => n.id === army.ownerId)?.name ?? army.ownerId} · {isGhost(army) ? "ghost" : Math.round(armyStrength(army))}
                </Tooltip>
                <Popup>
                  {stack.length > 1 && (
                    <div className="mb-2 border-b border-border pb-2 text-xs">
                      <div className="mb-1 text-[11px] tracking-[0.12em] text-gold">STACKED</div>
                      {stack.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          className="block w-full py-1 text-left"
                          onClick={() => onSelectArmy(a.id)}
                        >
                          {nations.find((n) => n.id === a.ownerId)?.name ?? a.ownerId} · {Math.round(armyStrength(a))}
                        </button>
                      ))}
                    </div>
                  )}
                  <ArmyEditor
                    army={army}
                    armies={armies}
                    nations={nations}
                    marching={army.id === marchingArmyId}
                    staffLive={staffLive}
                    onChange={(patch) => onUpdateArmy(army.id, patch)}
                    onDelete={() => onRemoveArmy(army.id)}
                    onMarch={(mode) => onStartMarch(army.id, mode)}
                    onAttack={(defenderId) => onAttack(army.id, defenderId)}
                    onEntrench={() => onEntrench(army.id)}
                  />
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
      {pickStack.length > 1 && (
        <div className="absolute top-14 left-3 z-chrome w-48 rounded-sm border border-gold-dim bg-bg/95 p-2 md:top-3">
          <div className="mb-1 text-[11px] tracking-[0.14em] text-gold">STACK</div>
          {pickStack.map((id) => {
            const a = armies.find((x) => x.id === id);
            if (!a) return null;
            return (
              <button
                key={id}
                type="button"
                className={cn(
                  "block w-full py-1 text-left text-xs",
                  selectedArmyId === id && "text-gold",
                )}
                onClick={() => onSelectArmy(id)}
              >
                {nations.find((n) => n.id === a.ownerId)?.name ?? a.ownerId} · {Math.round(armyStrength(a))}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
