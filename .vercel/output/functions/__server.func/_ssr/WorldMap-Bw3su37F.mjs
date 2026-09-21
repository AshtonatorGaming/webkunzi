import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RESOURCES, i as compositionOf, n as Button, r as cn } from "./routes-Dqtxk11g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/WorldMap-Bw3su37F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** SSR/Nitro stand-in so Leaflet never touches `window` on the server. */
var MapContainer = () => null;
var ImageOverlay = () => null;
var CircleMarker = () => null;
var Circle = () => null;
var Popup = () => null;
var Tooltip = () => null;
var Marker = () => null;
var useMap = () => ({ invalidateSize() {} });
var CRS = { Simple: {} };
var LatLngBounds = class {
	constructor() {}
};
function divIcon() {
	return {};
}
var MAP_LAYERS = [
	{
		id: "all",
		label: "All",
		short: "ALL"
	},
	{
		id: "political",
		label: "Political",
		short: "POL"
	},
	{
		id: "culture",
		label: "Culture",
		short: "CUL"
	},
	{
		id: "religion",
		label: "Religion",
		short: "REL"
	},
	{
		id: "resources",
		label: "Resources",
		short: "RES"
	},
	{
		id: "military",
		label: "Military",
		short: "MIL"
	}
];
var MAP_INK = {
	unset: "#c8c4bc",
	range: "#d9d1c3",
	zoc: "#8f4d45",
	stroke: "#1a1814",
	selected: "#ece7dc"
};
var UNSET = /* @__PURE__ */ new Set([
	"",
	"unknown",
	"unclaimed",
	"none",
	"unset"
]);
var PALETTE = [
	"#66bb44",
	"#4488aa",
	"#c88444",
	"#aa4488",
	"#44aaaa",
	"#888844",
	"#8866cc",
	"#cc6666"
];
function colorFromKey(key) {
	const normalized = key.trim().toLowerCase();
	if (UNSET.has(normalized)) return MAP_INK.unset;
	let h = 0;
	for (let i = 0; i < normalized.length; i++) h = h * 31 + normalized.charCodeAt(i) | 0;
	return PALETTE[Math.abs(h) % PALETTE.length];
}
var KINDS = [
	{
		id: "pop",
		label: "Pop"
	},
	{
		id: "town",
		label: "Town"
	},
	{
		id: "city",
		label: "City"
	},
	{
		id: "fort",
		label: "Fort"
	},
	{
		id: "camp",
		label: "Camp"
	}
];
function PopEditor({ pop, nations, onChange, onDelete }) {
	const known = nations.some((n) => n.id === pop.ownerId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-48 flex-col gap-2 text-sm text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Owner", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: pop.ownerId,
					onChange: (e) => onChange({ ownerId: e.target.value }),
					children: [!known && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: pop.ownerId,
						children: [pop.ownerId, " (missing)"]
					}), nations.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: n.id,
						children: n.name
					}, n.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Kind", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: pop.kind ?? "pop",
					onChange: (e) => {
						const kind = e.target.value;
						onChange({
							kind,
							settled: kind !== "camp"
						});
					},
					children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: k.id,
						children: k.label
					}, k.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Culture", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: pop.culture,
					onChange: (e) => onChange({ culture: e.target.value })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Religion", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: pop.religion,
					onChange: (e) => onChange({ religion: e.target.value })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-2 text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: pop.settled,
					onChange: (e) => onChange({ settled: e.target.checked })
				}), "Settled"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
				className: "text-subtle tabular",
				children: [
					pop.x.toFixed(0),
					", ",
					pop.y.toFixed(0)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-1 text-left text-danger",
				onClick: onDelete,
				children: "Delete pop"
			})
		]
	});
}
function NodeEditor({ node, nations, onChange, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-48 flex-col gap-2 text-sm text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Resource", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: node.resourceId,
					onChange: (e) => onChange({ resourceId: e.target.value }),
					children: RESOURCES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: r.id,
						children: r.label
					}, r.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Owner", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: node.ownerId,
					onChange: (e) => onChange({ ownerId: e.target.value }),
					children: nations.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: n.id,
						children: n.name
					}, n.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Yield", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "number",
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: node.yield,
					onChange: (e) => onChange({ yield: Number(e.target.value) })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-1 text-left text-danger",
				onClick: onDelete,
				children: "Delete node"
			})
		]
	});
}
function ArmyEditor({ army, nations, marching, onChange, onDelete, onMarch }) {
	const comp = compositionOf(army);
	const [strengthText, setStrengthText] = (0, import_react.useState)(String(army.strength));
	const [shock, setShock] = (0, import_react.useState)(String(Math.round(comp.shock)));
	const [ranged, setRanged] = (0, import_react.useState)(String(Math.round(comp.ranged)));
	const [melee, setMelee] = (0, import_react.useState)(String(Math.round(comp.melee)));
	(0, import_react.useEffect)(() => {
		const next = compositionOf(army);
		setStrengthText(String(army.strength));
		setShock(String(Math.round(next.shock)));
		setRanged(String(Math.round(next.ranged)));
		setMelee(String(Math.round(next.melee)));
	}, [
		army.id,
		army.strength,
		army.composition
	]);
	function commitStrength() {
		const value = Number(strengthText);
		if (!Number.isFinite(value)) {
			setStrengthText(String(army.strength));
			return;
		}
		onChange({ strength: Math.max(0, value) });
	}
	function commitComp() {
		const s = Number(shock);
		const r = Number(ranged);
		const m = Number(melee);
		if (![
			s,
			r,
			m
		].every(Number.isFinite)) return;
		onChange({
			composition: {
				shock: Math.max(0, s),
				ranged: Math.max(0, r),
				melee: Math.max(0, m)
			},
			strength: Math.max(0, s + r + m) || army.strength
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-48 flex-col gap-2 text-sm text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Owner", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: army.ownerId,
					onChange: (e) => onChange({ ownerId: e.target.value }),
					children: nations.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: n.id,
						children: n.name
					}, n.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-muted",
				children: ["Strength", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					inputMode: "numeric",
					className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg",
					value: strengthText,
					onChange: (e) => setStrengthText(e.target.value),
					onBlur: commitStrength,
					onKeyDown: (e) => {
						if (e.key === "Enter") commitStrength();
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted",
						children: ["Shock", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-1 py-1 text-fg",
							value: shock,
							onChange: (e) => setShock(e.target.value),
							onBlur: commitComp
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted",
						children: ["Ranged", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-1 py-1 text-fg",
							value: ranged,
							onChange: (e) => setRanged(e.target.value),
							onBlur: commitComp
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted",
						children: ["Melee", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-0.5 w-full rounded-sm border border-border bg-raised px-1 py-1 text-fg",
							value: melee,
							onChange: (e) => setMelee(e.target.value),
							onBlur: commitComp
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: marching ? "primary" : "ghost",
				onClick: onMarch,
				children: marching ? "Click map to march" : "March"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-left text-danger",
				onClick: onDelete,
				children: "Delete army"
			})
		]
	});
}
function safeHex(color) {
	return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : "#c8c4bc";
}
function bannerIcon(color, strength, state) {
	const ring = state === "march" ? "#e8dcc8" : state === "selected" ? "#c4a574" : "#1a1814";
	return divIcon({
		className: "ink-banner",
		iconSize: [26, 40],
		iconAnchor: [8, 38],
		html: `<div class="ink-banner-inner" style="--c:${safeHex(color)};--ring:${ring}"><span class="ink-banner-flag"></span><span class="ink-banner-n">${Math.round(strength)}</span></div>`
	});
}
function popRadius(kind) {
	if (kind === "city") return 11;
	if (kind === "town") return 9;
	if (kind === "fort") return 8;
	if (kind === "camp") return 6;
	return 7;
}
function FitPainting() {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		const id = window.setTimeout(() => map.invalidateSize(), 80);
		return () => window.clearTimeout(id);
	}, [map]);
	return null;
}
function MapPointer({ tool, marchingArmyId, armies, marchRange, onPlacePop, onPlaceNode, onPlaceArmy, onMoveArmy, onPreview, onSelectArmy }) {
	return null;
}
function WorldMap({ mapWidth, mapHeight, marchRange, selectedArmyId, marchingArmyId, staffLive, pops, nodes, armies, nations, onSelectArmy, onMoveArmy, onPlacePop, onPlaceNode, onPlaceArmy, onUpdatePop, onRemovePop, onUpdateNode, onRemoveNode, onUpdateArmy, onRemoveArmy, onStartMarch }) {
	const [tool, setTool] = (0, import_react.useState)("none");
	const [layer, setLayer] = (0, import_react.useState)("political");
	const [preview, setPreview] = (0, import_react.useState)(null);
	const colorById = (0, import_react.useMemo)(() => new Map(nations.map((n) => [n.id, n.color])), [nations]);
	const PAD = 400;
	const BOUNDS = (0, import_react.useMemo)(() => new LatLngBounds([0, 0], [mapHeight, mapWidth]), [mapHeight, mapWidth]);
	const VIEW_BOUNDS = (0, import_react.useMemo)(() => new LatLngBounds([-400, -400], [mapHeight + PAD, mapWidth + PAD]), [mapHeight, mapWidth]);
	const selected = armies.find((a) => a.id === selectedArmyId);
	const marching = armies.find((a) => a.id === marchingArmyId);
	const showAllZoc = layer === "military";
	const showPops = layer === "all" || layer === "political" || layer === "culture" || layer === "religion";
	const showNodes = layer === "all" || layer === "resources";
	const showArmies = layer === "all" || layer === "military" || layer === "political";
	function popFill(pop) {
		if (layer === "culture") return colorFromKey(pop.culture);
		if (layer === "religion") return colorFromKey(pop.religion);
		return colorById.get(pop.ownerId) ?? MAP_INK.unset;
	}
	function toolBtn(id, label) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setTool((t) => t === id ? "none" : id),
			className: cn("rounded-sm px-3 py-2 text-sm font-medium", tool === id ? "bg-accent text-accent-fg" : "bg-raised text-fg"),
			children: label
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-full w-full",
		children: [
			staffLive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-3 left-1/2 z-chrome hidden max-w-[calc(100%-1rem)] -translate-x-1/2 flex-wrap justify-center gap-1 rounded-sm border border-gold-dim bg-bg/85 px-2 py-1 md:flex",
				children: [
					toolBtn("pop", "Place pop"),
					toolBtn("node", "Place node"),
					toolBtn("army", "Place army"),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "self-center px-2 text-[11px] text-muted tabular",
						children: [
							pops.length,
							" pops · ",
							nodes.length,
							" nodes · ",
							armies.length,
							" banners"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-3 left-1/2 z-chrome flex max-w-[calc(100%-1rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-sm border border-gold-dim bg-bg/90 p-1 md:top-auto md:bottom-3",
				children: MAP_LAYERS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					title: l.label,
					onClick: () => setLayer(l.id),
					className: cn("h-10 min-w-12 shrink-0 rounded-sm px-2 text-[11px] tracking-wide", layer === l.id ? "bg-fg text-bg" : "text-fg hover:bg-hover"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "md:hidden",
						children: l.short
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden md:inline",
						children: l.label
					})]
				}, l.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
				attributionControl: false,
				crs: CRS.Simple,
				bounds: BOUNDS,
				maxBounds: VIEW_BOUNDS,
				maxBoundsViscosity: .6,
				minZoom: -3,
				maxZoom: 3,
				style: {
					height: "100%",
					width: "100%",
					background: "var(--color-map)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOverlay, {
						url: "/maps/world.jpg",
						bounds: BOUNDS
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FitPainting, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPointer, {
						tool,
						marchingArmyId,
						armies,
						marchRange,
						onPlacePop,
						onPlaceNode,
						onPlaceArmy,
						onMoveArmy,
						onPreview: setPreview,
						onSelectArmy
					}),
					showAllZoc && armies.map((army) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
						center: [army.y, army.x],
						radius: 64,
						interactive: false,
						pathOptions: {
							color: colorById.get(army.ownerId) ?? MAP_INK.zoc,
							weight: 1,
							fillOpacity: .06
						}
					}, `zoc-${army.id}`)),
					selected && !showAllZoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
						center: [selected.y, selected.x],
						radius: 64,
						interactive: false,
						pathOptions: {
							color: MAP_INK.zoc,
							weight: 1,
							fillOpacity: .08
						}
					}),
					marching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
						center: [marching.y, marching.x],
						radius: marchRange,
						interactive: false,
						pathOptions: {
							color: MAP_INK.range,
							weight: 1,
							fillOpacity: .04
						}
					}),
					preview && marching && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
						center: [preview.y, preview.x],
						radius: 64,
						interactive: false,
						pathOptions: {
							color: MAP_INK.range,
							weight: 1,
							fillOpacity: .1
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
						center: [preview.y, preview.x],
						radius: 10,
						interactive: false,
						pathOptions: {
							color: MAP_INK.range,
							fillColor: colorById.get(marching.ownerId) ?? MAP_INK.unset,
							fillOpacity: .45,
							weight: 2
						}
					})] }),
					showPops && pops.map((pop) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CircleMarker, {
						center: [pop.y, pop.x],
						radius: popRadius(pop.kind),
						pathOptions: {
							color: pop.kind === "city" || pop.kind === "fort" ? MAP_INK.selected : pop.settled ? MAP_INK.stroke : MAP_INK.zoc,
							fillColor: popFill(pop),
							fillOpacity: .92,
							weight: pop.kind === "fort" ? 3 : 2
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, {
							direction: "top",
							offset: [0, -8],
							children: [
								(pop.kind ?? "pop").toUpperCase(),
								" · ",
								nations.find((n) => n.id === pop.ownerId)?.name ?? pop.ownerId
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopEditor, {
							pop,
							nations,
							onChange: (patch) => onUpdatePop(pop.id, patch),
							onDelete: () => onRemovePop(pop.id)
						}) })]
					}, pop.id)),
					showNodes && nodes.map((node) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CircleMarker, {
						center: [node.y, node.x],
						radius: 6,
						pathOptions: {
							color: MAP_INK.stroke,
							fillColor: colorFromKey(node.resourceId),
							fillOpacity: .95,
							weight: 2
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							direction: "top",
							children: node.resourceId
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeEditor, {
							node,
							nations,
							onChange: (patch) => onUpdateNode(node.id, patch),
							onDelete: () => onRemoveNode(node.id)
						}) })]
					}, node.id)),
					showArmies && armies.map((army) => {
						const state = army.id === marchingArmyId ? "march" : army.id === selectedArmyId ? "selected" : "idle";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Marker, {
							position: [army.y, army.x],
							icon: bannerIcon(colorById.get(army.ownerId) ?? MAP_INK.unset, army.strength, state),
							eventHandlers: { click: (e) => {
								e.originalEvent.stopPropagation();
								if (tool !== "none") return;
								onSelectArmy(army.id);
							} },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, {
								direction: "top",
								offset: [0, -28],
								children: [
									nations.find((n) => n.id === army.ownerId)?.name ?? army.ownerId,
									" · ",
									Math.round(army.strength)
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArmyEditor, {
								army,
								nations,
								marching: army.id === marchingArmyId,
								onChange: (patch) => onUpdateArmy(army.id, patch),
								onDelete: () => onRemoveArmy(army.id),
								onMarch: () => onStartMarch(army.id)
							}) })]
						}, army.id);
					})
				]
			}, `inkunzi-world-${mapWidth}x${mapHeight}`)
		]
	});
}
//#endregion
export { WorldMap as default };
