"use client";

import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { createPortal } from "react-dom";
import {
  MapContainer,
  CircleMarker,
  Circle,
  Tooltip,
  Marker,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { CRS, DomUtil, LatLngBounds, Point, divIcon } from "leaflet";
import {
  ArrowDown,
  Cloud,
  CloudSun,
  Flag,
  Gem,
  KeyRound,
  Layers,
  LayoutGrid,
  Mountain,
  Sun,
  Swords,
  Users,
} from "lucide-react";
import type { Army, MarchMode, Nation, Pop, PopKind, ResourceNode } from "@/engine/types";
import { MAP_INK, MAP_LAYERS, MAP_PLANES, colorFromKey, type MapLayer, type MapPlane } from "@/engine/mapLayers";
import { distance, enemyBlockers, setMapWrap, stackedWith, stackOffsets, stopForZoc, ZOC_PX } from "@/engine/movement";
import { armyStrength, armiesInContact, isGhost } from "@/engine/battle";
import { TERRAINS, TERRAIN_DRAW_SCALE, cellBrief, renderTerrain, seenWindow, type GroundDraw, type TerrainField } from "@/engine/terrain";
import {
  getTerrainPreview,
  paintBorder,
  paintGround,
  paintSight,
  setTerrainPreview,
  useTerrainField,
} from "@/engine/useTerrain";
import { useAtlasUi, type AtlasTool } from "@/engine/atlasUi";
import PopEditor from "./PopEditor";
import NodeEditor from "./NodeEditor";
import ArmyEditor from "./ArmyEditor";
import { cn } from "@/lib/cn";

type Preview = { x: number; y: number };
type DragLike = {
  _moving?: boolean;
  _startPos?: Point;
  _newPos?: Point;
  _startPoint?: Point;
  _lastEvent?: { clientX: number; clientY: number; touches?: ArrayLike<{ clientX: number; clientY: number }> };
};

function rebaseDrag(map: { dragging: unknown; getPane: (name: string) => HTMLElement | undefined }) {
  const drag = (map.dragging as { _draggable?: DragLike })._draggable;
  if (!drag?._moving) return;
  const pane = map.getPane("mapPane");
  if (!pane) return;
  const pos = DomUtil.getPosition(pane);
  const ev = drag._lastEvent;
  const src = ev?.touches && ev.touches.length ? ev.touches[0] : ev;
  if (src && drag._startPoint) {
    const offset = new Point(src.clientX, src.clientY).subtract(drag._startPoint);
    drag._startPos = pos.subtract(offset);
    drag._newPos = pos.clone();
  } else {
    drag._startPos = pos.clone();
    drag._newPos = pos.clone();
  }
}

type Props = {
  mapWidth: number;
  mapHeight: number;
  marchRange: number;
  selectedArmyId: string | null;
  marchingArmyId: string | null;
  staffLive: boolean;
  atWarNationIds?: string[];
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

function wrapLng(x: number, width: number) {
  if (width <= 0) return x;
  let v = x % width;
  if (v < 0) v += width;
  return v;
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

function HearthFrame({
  mapWidth,
  mapHeight,
  staff,
  seed,
  field,
}: {
  mapWidth: number;
  mapHeight: number;
  staff: boolean;
  seed: string;
  field: TerrainField | null;
}) {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => {
      map.invalidateSize({ pan: false, animate: false });
      const known = !staff && field ? seenWindow(field) : null;
      if (staff || !known) {
        map.fitBounds(
          [
            [0, 0],
            [mapHeight, mapWidth],
          ],
          { animate: false, padding: [12, 12] },
        );
        return;
      }
      const west = known.x0 * mapWidth;
      const east = Math.max(west + 80, known.x1 * mapWidth);
      const north = mapHeight * (1 - known.y0);
      const south = mapHeight * (1 - known.y1);
      map.fitBounds(
        [
          [Math.min(south, north), west],
          [Math.max(south, north), east],
        ],
        { animate: false, padding: [36, 36] },
      );
    }, 140);
    return () => window.clearTimeout(id);
  }, [map, mapWidth, mapHeight, staff, seed, field]);
  return null;
}

function DragGate({ locked }: { locked: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (locked) map.dragging.disable();
    else map.dragging.enable();
    return () => {
      map.dragging.enable();
    };
  }, [locked, map]);
  return null;
}

function WrapCamera({ mapWidth, enabled }: { mapWidth: number; enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || mapWidth <= 0) return;
    let jumping = false;
    const onMove = () => {
      if (jumping) return;
      const c = map.getCenter();
      let lng = c.lng;
      let hops = 0;
      while (lng < 0 && hops < 12) {
        lng += mapWidth;
        hops += 1;
      }
      while (lng >= mapWidth && hops < 12) {
        lng -= mapWidth;
        hops += 1;
      }
      if (!hops) return;
      jumping = true;
      map.setView([c.lat, lng], map.getZoom(), { animate: false });
      rebaseDrag(map);
      jumping = false;
    };
    map.on("move", onMove);
    map.on("moveend", onMove);
    return () => {
      map.off("move", onMove);
      map.off("moveend", onMove);
    };
  }, [map, mapWidth, enabled]);
  return null;
}

function WorldZoom({ mapWidth, mapHeight }: { mapWidth: number; mapHeight: number }) {
  const map = useMap();
  useEffect(() => {
    const apply = () => {
      const size = map.getSize();
      const byW = Math.log2(Math.max(1, size.x) / Math.max(1, mapWidth));
      const byH = Math.log2(Math.max(1, size.y - 28) / Math.max(1, mapHeight));
      const floor = Math.max(-6, Math.min(byW, byH) - 0.08);
      map.setMinZoom(floor);
    };
    apply();
    map.on("resize", apply);
    return () => {
      map.off("resize", apply);
      map.setMinZoom(-6);
    };
  }, [map, mapWidth, mapHeight]);
  return null;
}

function MiniMap({
  mapWidth,
  mapHeight,
  wrapped,
  fieldRev,
}: {
  mapWidth: number;
  mapHeight: number;
  wrapped: boolean;
  fieldRev: number;
}) {
  const map = useMap();
  const [src, setSrc] = useState("");
  const [box, setBox] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => {
    setHost(document.querySelector(".ink-mapwell"));
  }, []);
  useEffect(() => {
    const tick = window.setTimeout(() => setSrc(getTerrainPreview()), 40);
    return () => window.clearTimeout(tick);
  }, [fieldRev]);
  useEffect(() => {
    const apply = () => {
      const b = map.getBounds();
      const wrapX = (v: number) => {
        if (!wrapped || mapWidth <= 0) return v;
        let n = v % mapWidth;
        if (n < 0) n += mapWidth;
        return n;
      };
      const x0 = wrapX(b.getWest());
      const x1 = wrapX(b.getEast());
      const y0 = Math.min(mapHeight, Math.max(0, b.getNorth()));
      const y1 = Math.min(mapHeight, Math.max(0, b.getSouth()));
      const top = 1 - y0 / mapHeight;
      const bot = 1 - y1 / mapHeight;
      const span = (b.getEast() - b.getWest()) / mapWidth;
      if (span >= 0.98) {
        setBox({ x: 0, y: Math.min(top, bot), w: 1, h: Math.abs(bot - top) });
        return;
      }
      setBox({
        x: x0 / mapWidth,
        y: Math.min(top, bot),
        w: x1 > x0 ? (x1 - x0) / mapWidth : 1 - x0 / mapWidth + x1 / mapWidth,
        h: Math.abs(bot - top),
      });
    };
    apply();
    map.on("move zoom resize", apply);
    return () => {
      map.off("move zoom resize", apply);
    };
  }, [map, mapWidth, mapHeight, wrapped]);
  if (!host) return null;
  return createPortal(
    <button
      type="button"
      className="ink-minimap"
      aria-label="Minimap"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
        const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
        map.setView([mapHeight * (1 - ny), nx * mapWidth], map.getZoom(), { animate: false });
      }}
    >
      {src ? <img src={src} alt="" /> : <span className="ink-minimap-void" />}
      <i
        className="ink-minimap-view"
        style={{
          left: `${box.x * 100}%`,
          top: `${box.y * 100}%`,
          width: `${Math.max(4, box.w * 100)}%`,
          height: `${Math.max(4, box.h * 100)}%`,
        }}
      />
    </button>,
    host,
  );
}

function GroundLayer({
  field,
  rev,
  view,
  nations,
  bounds,
  reveal,
  plane,
  dim,
}: {
  field: NonNullable<ReturnType<typeof useTerrainField>["field"]>;
  rev: number;
  view: GroundDraw;
  nations: Nation[];
  bounds: LatLngBounds;
  reveal: boolean;
  plane: MapPlane;
  dim: boolean;
}) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement[]>([]);
  const nationKey = nations.map((n) => `${n.id}:${n.color}`).join("|");
  const drawW = field.cols * TERRAIN_DRAW_SCALE;
  const drawH = field.rows * TERRAIN_DRAW_SCALE;

  useEffect(() => {
    const copies = field.wrap ? 3 : 1;
    const pane = map.getPane("overlayPane");
    const nodes: HTMLCanvasElement[] = [];
    for (let k = 0; k < copies; k++) {
      const canvas = document.createElement("canvas");
      canvas.width = drawW;
      canvas.height = drawH;
      canvas.className = "ink-terrain";
      if (pane) {
        if (pane.firstChild) pane.insertBefore(canvas, pane.firstChild);
        else pane.appendChild(canvas);
      }
      nodes.push(canvas);
    }
    canvasRef.current = nodes;
    const place = () => {
      const nw = map.latLngToLayerPoint(bounds.getNorthWest());
      const se = map.latLngToLayerPoint(bounds.getSouthEast());
      const w = Math.max(1, se.x - nw.x);
      const h = Math.max(1, se.y - nw.y);
      const mapW = bounds.getEast();
      const view = map.getBounds();
      const span = view.getEast() - view.getWest();
      const wider = field.wrap && span >= mapW * 0.98;
      const needLeft = field.wrap && (wider || view.getWest() < -mapW * 0.004);
      const needRight = field.wrap && (wider || view.getEast() > mapW * 1.004);
      nodes.forEach((canvas, k) => {
        const shift = field.wrap ? (k - 1) * w : 0;
        const show = !field.wrap || k === 1 || (k === 0 && needLeft) || (k === 2 && needRight);
        canvas.style.display = show ? "" : "none";
        if (!show) return;
        DomUtil.setPosition(canvas, new Point(nw.x + shift, nw.y));
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      });
    };
    map.on("zoom viewreset move resize", place);
    place();
    return () => {
      map.off("zoom viewreset move resize", place);
      for (const canvas of nodes) canvas.remove();
      canvasRef.current = [];
    };
  }, [map, bounds, field.cols, field.rows, field.wrap, drawW, drawH]);

  useEffect(() => {
    const nodes = canvasRef.current;
    if (!nodes.length) return;
    const off = document.createElement("canvas");
    off.width = drawW;
    off.height = drawH;
    const ctx = off.getContext("2d");
    if (!ctx) return;
    const image = ctx.createImageData(drawW, drawH);
    renderTerrain(field, image.data, (id) => nations.find((n) => n.id === id)?.color, view, reveal, plane, dim);
    ctx.putImageData(image, 0, 0);
    for (const canvas of nodes) canvas.getContext("2d")?.drawImage(off, 0, 0);
    if (off.width > 0 && off.height > 0) {
      const mini = document.createElement("canvas");
      mini.width = 168;
      mini.height = 96;
      const mctx = mini.getContext("2d");
      if (mctx) {
        mctx.clearRect(0, 0, mini.width, mini.height);
        mctx.imageSmoothingEnabled = false;
        if (field.wrap) {
          mctx.drawImage(off, 0, 0, mini.width - 1, mini.height);
          const strip = Math.max(1, Math.round(off.width / Math.max(1, field.cols)));
          mctx.drawImage(off, 0, 0, strip, off.height, mini.width - 1, 0, 1, mini.height);
        } else {
          mctx.drawImage(off, 0, 0, mini.width, mini.height);
        }
        setTerrainPreview(mini.toDataURL("image/png"));
      }
    }
    return undefined;
  }, [field, rev, view, nationKey, nations, drawW, drawH, reveal, plane, dim]);

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
  onClearPin,
  onPaint,
  onHover,
  wrapWidth,
}: {
  tool: AtlasTool;
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
  onClearPin: () => void;
  onPaint: ((x: number, y: number) => void) | null;
  onHover: (x: number, y: number, client?: { x: number; y: number }) => void;
  wrapWidth: number;
}) {
  const painting = useRef(false);
  useEffect(() => {
    const up = () => {
      painting.current = false;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);
  useMapEvents({
    mousedown(e) {
      if (!onPaint) return;
      painting.current = true;
      const x = wrapLng(e.latlng.lng, wrapWidth);
      onPaint(x, e.latlng.lat);
    },
    mouseup() {
      painting.current = false;
    },
    mouseout() {
      onHover(-1, -1);
    },
    mousemove(e) {
      const y = e.latlng.lat;
      const x = wrapLng(e.latlng.lng, wrapWidth);
      const oe = e.originalEvent as MouseEvent | undefined;
      onHover(x, y, oe ? { x: oe.clientX, y: oe.clientY } : undefined);
      if (painting.current && onPaint) {
        onPaint(x, y);
        return;
      }
      if (!marchingArmyId || tool !== "none") {
        onPreview(null);
        return;
      }
      const army = armies.find((a) => a.id === marchingArmyId);
      if (!army) {
        onPreview(null);
        return;
      }
      if (distance(army.x, army.y, x, y) > marchRange) {
        onPreview(null);
        return;
      }
      const stopped = stopForZoc(army.x, army.y, x, y, enemyBlockers(army, armies));
      onPreview({ x: stopped.x, y: stopped.y });
    },
    click(e) {
      if (onPaint) return;
      const y = e.latlng.lat;
      const x = wrapLng(e.latlng.lng, wrapWidth);
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
        onClearPin();
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

function ModeMark({ id }: { id: MapLayer | "key" }) {
  const cls = "size-3.5 shrink-0";
  if (id === "terrain") return <Mountain className={cls} strokeWidth={1.75} />;
  if (id === "climate") return <CloudSun className={cls} strokeWidth={1.75} />;
  if (id === "height") return <Layers className={cls} strokeWidth={1.75} />;
  if (id === "all") return <LayoutGrid className={cls} strokeWidth={1.75} />;
  if (id === "political") return <Flag className={cls} strokeWidth={1.75} />;
  if (id === "culture") return <Users className={cls} strokeWidth={1.75} />;
  if (id === "religion") return <Sun className={cls} strokeWidth={1.75} />;
  if (id === "resources") return <Gem className={cls} strokeWidth={1.75} />;
  if (id === "military") return <Swords className={cls} strokeWidth={1.75} />;
  return <KeyRound className={cls} strokeWidth={1.75} />;
}

function PlaneMark({ id }: { id: MapPlane }) {
  const cls = "size-3.5 shrink-0";
  if (id === "under") return <ArrowDown className={cls} strokeWidth={1.75} />;
  if (id === "sky") return <Cloud className={cls} strokeWidth={1.75} />;
  return <Mountain className={cls} strokeWidth={1.75} />;
}

export default function WorldMap({
  mapWidth,
  mapHeight,
  marchRange,
  selectedArmyId,
  marchingArmyId,
  staffLive,
  atWarNationIds = [],
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
  const atlasUi = useAtlasUi();
  const tool = staffLive ? atlasUi.tool : "none";
  const brush = atlasUi.brush;
  const groundId = atlasUi.groundId;
  const borderId = atlasUi.borderId;
  const [layer, setLayer] = useState<MapLayer>("terrain");
  const [plane, setPlane] = useState<MapPlane>("surface");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [pickStack, setPickStack] = useState<string[]>([]);
  const [pin, setPin] = useState<{ kind: "pop" | "node"; id: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [hover, setHover] = useState("");
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const { field, rev } = useTerrainField();
  const colorById = useMemo(() => new Map(nations.map((n) => [n.id, n.color])), [nations]);
  const offsets = useMemo(() => stackOffsets(armies), [armies]);
  const PAD = 400;
  const wrapped = Boolean(field?.wrap);
  const BOUNDS = useMemo(() => new LatLngBounds([0, 0], [mapHeight, mapWidth]), [mapHeight, mapWidth]);
  const VIEW_BOUNDS = useMemo(
    () =>
      new LatLngBounds(
        [-PAD, wrapped ? -mapWidth * 8 : -PAD],
        [mapHeight + PAD, wrapped ? mapWidth * 9 : mapWidth + PAD],
      ),
    [mapHeight, mapWidth, wrapped],
  );
  const selected = armies.find((a) => a.id === selectedArmyId);
  const marching = armies.find((a) => a.id === marchingArmyId);
  const pinnedPop = pin?.kind === "pop" ? pops.find((p) => p.id === pin.id) : undefined;
  const pinnedNode = pin?.kind === "node" ? nodes.find((n) => n.id === pin.id) : undefined;
  const inspectArmy = selected ?? null;
  const inspectPop = inspectArmy ? undefined : pinnedPop;
  const inspectNode = inspectArmy || inspectPop ? undefined : pinnedNode;
  const showAllZoc = layer === "military";
  const showPops =
    layer === "all" || layer === "political" || layer === "culture" || layer === "religion" || layer === "terrain" || layer === "climate" || layer === "height";
  const showNodes = layer === "all" || layer === "resources";
  const showArmies = layer === "all" || layer === "military" || layer === "political" || layer === "terrain" || layer === "climate" || layer === "height";
  const political = layer === "political" || layer === "all";
  const groundView: GroundDraw =
    layer === "climate" ? "climate" : layer === "height" ? "height" : political ? "political" : "terrain";
  const dim = layer === "culture" || layer === "religion" || layer === "resources" || layer === "military";
  const drawing = tool === "ground" || tool === "border" || tool === "reveal" || tool === "shroud";
  const shifts = wrapped ? [-mapWidth, 0, mapWidth] : [0];

  useEffect(() => {
    setMapWrap(wrapped ? mapWidth : 0);
  }, [wrapped, mapWidth]);

  function groundLine(x: number, y: number) {
    if (!field) return "";
    const brief = cellBrief(field, x, y, mapWidth, mapHeight, plane);
    const claim = brief.claim ? (nations.find((n) => n.id === brief.claim)?.name ?? "") : "";
    const tags = brief.tags?.length ? brief.tags.join(" + ") : brief.biome;
    const bits = [tags];
    if (brief.relief) bits.push(brief.relief);
    if (brief.climate) bits.push(brief.climate);
    if (brief.band) bits.push(brief.band);
    if (layer === "military" && plane === "surface" && brief.effects) {
      bits.push(`move ${brief.effects.move}`, `forage ${brief.effects.forage}`);
    }
    if (claim) bits.push(claim);
    return bits.filter(Boolean).join(" · ");
  }

  function popFill(pop: Pop): string {
    if (layer === "culture") return colorFromKey(pop.culture);
    if (layer === "religion") return colorFromKey(pop.religion);
    return colorById.get(pop.ownerId) ?? MAP_INK.unset;
  }

  const onPaint =
    drawing && field
      ? (x: number, y: number) => {
          if (tool === "ground") paintGround(x, y, mapWidth, mapHeight, groundId, brush);
          else if (tool === "border") paintBorder(x, y, mapWidth, mapHeight, borderId || null, brush);
          else paintSight(x, y, mapWidth, mapHeight, brush, tool === "reveal");
        }
      : null;

  return (
    <div className="ink-mapstage">
      <div className="ink-rail ink-rail-n" aria-hidden>
        <span>INKUNZI</span>
      </div>
      <div className="ink-mapwell">
      {keyOpen && layer === "terrain" && (
        <div className="ink-legend" aria-hidden>
          {TERRAINS.map((t) => (
            <span key={t.id}>
              <i style={{ background: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      )}
      {keyOpen && layer === "climate" && (
        <div className="ink-legend" aria-hidden>
          {[
            ["#d6e4ea", "Freezing"],
            ["#7d9a78", "Cold"],
            ["#247a40", "Wet"],
            ["#e2a654", "Dry"],
            ["#0c3d66", "Ocean"],
          ].map(([color, label]) => (
            <span key={label}>
              <i style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      )}
      {keyOpen && layer === "height" && (
        <div className="ink-legend" aria-hidden>
          {[
            ["#04183a", "Deep"],
            ["#2e96a8", "Low"],
            ["#96b056", "Rising"],
            ["#a8844e", "High"],
            ["#f4f7fb", "Peak"],
          ].map(([color, label]) => (
            <span key={label}>
              <i style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      )}
      {hover && (
        <div
          className="ink-cellread"
          style={hoverPos ? { left: hoverPos.x, top: hoverPos.y, bottom: "auto", transform: "none" } : undefined}
        >
          {hover}
        </div>
      )}
      <div className="ink-planes" role="tablist" aria-label="Plane">
        {MAP_PLANES.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={plane === p.id}
            onClick={() => setPlane(p.id)}
            className={cn(
              "font-display flex h-11 min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-2 text-[11px] tracking-[0.14em] lg:w-full lg:flex-none",
              plane === p.id ? "bg-fg text-bg" : "text-gold hover:bg-hover",
            )}
          >
            <PlaneMark id={p.id} />
            {p.label.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="ink-mapmodes" role="tablist" aria-label="Map mode">
        {MAP_LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={layer === l.id}
            title={l.label}
            onClick={() => setLayer(l.id)}
            className={cn(
              "flex h-10 min-w-12 shrink-0 items-center justify-center gap-1 rounded-sm px-2 text-[11px] tracking-wide",
              layer === l.id ? "bg-fg text-bg" : "text-fg hover:bg-hover",
            )}
          >
            <ModeMark id={l.id} />
            <span className="md:hidden">{l.short}</span>
            <span className="hidden md:inline">{l.label}</span>
          </button>
        ))}
        <button
          type="button"
          aria-pressed={keyOpen}
          onClick={() => setKeyOpen((v) => !v)}
          className={cn(
            "flex h-10 min-w-12 shrink-0 items-center justify-center gap-1 rounded-sm px-2 text-[11px] tracking-wide",
            keyOpen ? "bg-fg text-bg" : "text-fg hover:bg-hover",
          )}
        >
          <ModeMark id="key" />
          Key
        </button>
      </div>
      <MapContainer
        key={`inkunzi-world-${mapWidth}x${mapHeight}`}
        attributionControl={false}
        zoomControl={false}
        crs={CRS.Simple}
        bounds={BOUNDS}
        maxBounds={VIEW_BOUNDS}
        maxBoundsViscosity={0.55}
        minZoom={-6}
        maxZoom={3}
        zoomSnap={0}
        zoomDelta={0.4}
        wheelPxPerZoomLevel={320}
        wheelDebounceTime={12}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
        bounceAtZoomLimits={false}
        style={{ height: "100%", width: "100%", background: "var(--color-map)" }}
      >
        <ZoomControl position="topleft" />
        {field && (
          <GroundLayer
            field={field}
            rev={rev}
            view={groundView}
            nations={nations}
            bounds={BOUNDS}
            reveal={staffLive}
            plane={plane}
            dim={dim}
          />
        )}
        <HearthFrame
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          staff={staffLive}
          seed={field?.seed ?? ""}
          field={field}
        />
        <WrapCamera mapWidth={mapWidth} enabled={wrapped} />
        <WorldZoom mapWidth={mapWidth} mapHeight={mapHeight} />
        {field && <MiniMap mapWidth={mapWidth} mapHeight={mapHeight} wrapped={wrapped} fieldRev={rev} />}
        <DragGate locked={drawing} />
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
          onClearPin={() => setPin(null)}
          onPaint={onPaint}
          wrapWidth={wrapped ? mapWidth : 0}
          onHover={(x, y, client) => {
            if (x < 0) {
              setHover("");
              setHoverPos(null);
              return;
            }
            setHover(groundLine(x, y));
            if (client) {
              const well = document.querySelector(".ink-mapwell");
              const rect = well?.getBoundingClientRect();
              if (rect) setHoverPos({ x: client.x - rect.left + 14, y: client.y - rect.top + 16 });
            }
          }}
        />
        {shifts.map((shift) => (
          <Fragment key={shift}>
        {showAllZoc &&
          armies.map((army) => (
            <Circle
              key={`zoc-${shift}-${army.id}`}
              center={[army.y, army.x + shift]}
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
            key={`sel-${shift}`}
            center={[selected.y, selected.x + shift]}
            radius={ZOC_PX}
            interactive={false}
            pathOptions={{ color: MAP_INK.zoc, weight: 1, fillOpacity: 0.08 }}
          />
        )}
        {marching && (
          <Circle
            key={`march-${shift}`}
            center={[marching.y, marching.x + shift]}
            radius={marchRange}
            interactive={false}
            pathOptions={{ color: MAP_INK.range, weight: 1, fillOpacity: 0.04 }}
          />
        )}
        {preview && marching && (
          <Fragment key={`prev-${shift}`}>
            <Circle
              center={[preview.y, preview.x + shift]}
              radius={ZOC_PX}
              interactive={false}
              pathOptions={{ color: MAP_INK.range, weight: 1, fillOpacity: 0.1 }}
            />
            <CircleMarker
              center={[preview.y, preview.x + shift]}
              radius={10}
              interactive={false}
              pathOptions={{
                color: MAP_INK.range,
                fillColor: colorById.get(marching.ownerId) ?? MAP_INK.unset,
                fillOpacity: 0.45,
                weight: 2,
              }}
            />
          </Fragment>
        )}
        {showPops &&
          pops.map((pop) => (
            <CircleMarker
              key={`${shift}-${pop.id}`}
              center={[pop.y, pop.x + shift]}
              radius={popRadius(pop.kind)}
              pathOptions={{
                color: pop.kind === "city" || pop.kind === "fort" ? MAP_INK.selected : pop.settled ? MAP_INK.stroke : MAP_INK.zoc,
                fillColor: popFill(pop),
                fillOpacity: 0.92,
                weight: pop.kind === "fort" ? 3 : 2,
              }}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  if (tool !== "none") return;
                  onSelectArmy(null);
                  setPickStack([]);
                  setPin({ kind: "pop", id: pop.id });
                  setCollapsed(false);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {(pop.kind ?? "pop").toUpperCase()} · {nations.find((n) => n.id === pop.ownerId)?.name ?? pop.ownerId}
              </Tooltip>
            </CircleMarker>
          ))}
        {showNodes &&
          nodes.map((node) => (
            <CircleMarker
              key={`${shift}-${node.id}`}
              center={[node.y, node.x + shift]}
              radius={6}
              pathOptions={{
                color: MAP_INK.stroke,
                fillColor: colorFromKey(node.resourceId),
                fillOpacity: 0.95,
                weight: 2,
              }}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  if (tool !== "none") return;
                  onSelectArmy(null);
                  setPickStack([]);
                  setPin({ kind: "node", id: node.id });
                  setCollapsed(false);
                },
              }}
            >
              <Tooltip direction="top">{node.resourceId}</Tooltip>
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
                key={`${shift}-${army.id}`}
                position={[army.y + off.dy, army.x + off.dx + shift]}
                keyboard={false}
                autoPanOnFocus={false}
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
                    const picked = armies.find((a) => a.id === selectedArmyId);
                    if (
                      picked &&
                      picked.id !== army.id &&
                      picked.ownerId !== army.ownerId &&
                      armiesInContact(picked, army)
                    ) {
                      onAttack(picked.id, army.id);
                      e.target.closePopup();
                      return;
                    }
                    if (stack.length > 1) setPickStack(stack.map((a) => a.id));
                    else setPickStack([]);
                    setPin(null);
                    setCollapsed(false);
                    onSelectArmy(army.id);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -36]}>
                  {nations.find((n) => n.id === army.ownerId)?.name ?? army.ownerId} · {isGhost(army) ? "ghost" : Math.round(armyStrength(army))}
                </Tooltip>
              </Marker>
            );
          })}
          </Fragment>
        ))}
      </MapContainer>
      {(inspectArmy || inspectPop || inspectNode) && (
        <aside
          className={cn("ink-inspector ink-panel", collapsed && "is-collapsed")}
          aria-label="Selected"
        >
          <header className="ink-inspector-head">
            <span
              className="ink-inspector-stripe"
              style={{
                background: safeHex(
                  inspectArmy
                    ? (colorById.get(inspectArmy.ownerId) ?? "#c8c4bc")
                    : inspectPop
                      ? (colorById.get(inspectPop.ownerId) ?? "#c8c4bc")
                      : "#c4a574",
                ),
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-sm tracking-wide text-fg">
                {inspectArmy
                  ? (nations.find((n) => n.id === inspectArmy.ownerId)?.name ?? "Banner")
                  : inspectPop
                    ? (inspectPop.kind ?? "pop").toUpperCase()
                    : (inspectNode?.resourceId ?? "Node")}
              </div>
              <div className="truncate text-[11px] text-muted tabular">
                {inspectArmy
                  ? `${isGhost(inspectArmy) ? "Ghost" : `${Math.round(armyStrength(inspectArmy))} fielded`}${
                      field ? ` · ${groundLine(inspectArmy.x, inspectArmy.y)}` : ""
                    }`
                  : inspectPop
                    ? `${nations.find((n) => n.id === inspectPop.ownerId)?.name ?? inspectPop.ownerId}${
                        field ? ` · ${groundLine(inspectPop.x, inspectPop.y)}` : ""
                      }`
                    : "Resource"}
              </div>
            </div>
            <button
              type="button"
              className="ink-inspector-icon"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? "Open" : "Hide"}
            </button>
            <button
              type="button"
              className="ink-inspector-icon"
              aria-label="Deselect"
              onClick={() => {
                onSelectArmy(null);
                setPin(null);
                setPickStack([]);
              }}
            >
              Close
            </button>
          </header>
          {!collapsed && (
            <div className="ink-inspector-body ink-scroll">
              {inspectArmy && pickStack.length > 1 && (
                <div className="mb-2 border-b border-border pb-2 text-xs">
                  <div className="mb-1 text-[11px] tracking-[0.12em] text-gold">STACKED</div>
                  {pickStack.map((id) => {
                    const a = armies.find((x) => x.id === id);
                    if (!a) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        className={cn(
                          "block w-full py-1 text-left",
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
              {inspectArmy && (
                <ArmyEditor
                  army={inspectArmy}
                  armies={armies}
                  nations={nations}
                  marching={inspectArmy.id === marchingArmyId}
                  staffLive={staffLive}
                  campaign={staffLive || atWarNationIds.includes(inspectArmy.ownerId)}
                  onChange={(patch) => onUpdateArmy(inspectArmy.id, patch)}
                  onDelete={() => onRemoveArmy(inspectArmy.id)}
                  onMarch={(mode) => onStartMarch(inspectArmy.id, mode)}
                  onAttack={(defenderId) => onAttack(inspectArmy.id, defenderId)}
                  onEntrench={() => onEntrench(inspectArmy.id)}
                />
              )}
              {inspectPop && (
                <PopEditor
                  pop={inspectPop}
                  nations={nations}
                  onChange={(patch) => onUpdatePop(inspectPop.id, patch)}
                  onDelete={() => {
                    onRemovePop(inspectPop.id);
                    setPin(null);
                  }}
                />
              )}
              {inspectNode && (
                <NodeEditor
                  node={inspectNode}
                  nations={nations}
                  onChange={(patch) => onUpdateNode(inspectNode.id, patch)}
                  onDelete={() => {
                    onRemoveNode(inspectNode.id);
                    setPin(null);
                  }}
                />
              )}
            </div>
          )}
        </aside>
      )}
      </div>
      <div className="ink-rail ink-rail-s" aria-hidden>
        <span>THE TABLE</span>
      </div>
    </div>
  );
}
