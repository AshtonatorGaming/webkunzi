import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as stackedWith, T as stackOffsets, _ as compositionOf, a as useAtlasUi, b as unitsOf, c as paintSight, d as TERRAINS, f as cellBrief, g as armyStrength, h as armiesInContact, i as RESOURCES, l as setTerrainPreview, m as seenWindow, n as Button, o as paintBorder, p as renderTerrain, r as cn, s as paintGround, u as useTerrainField, v as engagedEnemies, w as setMapWrap, x as unitTypeById, y as isGhost } from "./routes-bjoMYz_w.mjs";
import { a as Mountain, c as KeyRound, d as Cloud, f as CloudSun, i as Sun, l as Gem, o as LayoutGrid, p as ArrowDown, r as Swords, s as Layers, t as Users, u as Flag } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/WorldMap-BfISiZNa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MapContainer = () => null;
var CircleMarker = () => null;
var Circle = () => null;
var Tooltip = () => null;
var Marker = () => null;
var ZoomControl = () => null;
var useMap = () => ({ invalidateSize() {} });
var DomUtil = {
	setPosition() {},
	getPosition() {
		return {
			x: 0,
			y: 0
		};
	}
};
var CRS = { Simple: {} };
var LatLngBounds = class {
	constructor() {}
};
var Point = class {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
};
function divIcon() {
	return {};
}
var MAP_PLANES = [
	{
		id: "surface",
		label: "Surface"
	},
	{
		id: "under",
		label: "Under"
	},
	{
		id: "sky",
		label: "Sky"
	}
];
var MAP_LAYERS = [
	{
		id: "terrain",
		label: "Terrain",
		short: "GEO"
	},
	{
		id: "climate",
		label: "Climate",
		short: "CLM"
	},
	{
		id: "height",
		label: "Height",
		short: "HGT"
	},
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
function ArmyEditor({ army, armies, nations, marching, staffLive = false, campaign = false, onChange, onDelete, onMarch, onAttack, onEntrench }) {
	const comp = compositionOf(army);
	const units = unitsOf(army);
	const foes = staffLive ? armies.filter((a) => a.id !== army.id && a.ownerId !== army.ownerId && a.ownerId !== "unclaimed") : engagedEnemies(army, armies);
	const [strengthText, setStrengthText] = (0, import_react.useState)(String(armyStrength(army)));
	const [shock, setShock] = (0, import_react.useState)(String(Math.round(comp.shock)));
	const [ranged, setRanged] = (0, import_react.useState)(String(Math.round(comp.ranged)));
	const [melee, setMelee] = (0, import_react.useState)(String(Math.round(comp.melee)));
	const [correct, setCorrect] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const next = compositionOf(army);
		setStrengthText(String(armyStrength(army)));
		setShock(String(Math.round(next.shock)));
		setRanged(String(Math.round(next.ranged)));
		setMelee(String(Math.round(next.melee)));
	}, [army]);
	function commitStrength() {
		const value = Number(strengthText);
		if (!Number.isFinite(value)) {
			setStrengthText(String(armyStrength(army)));
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
		const nextUnits = [
			{
				id: `${army.id}-cav`,
				typeId: "cavalry",
				name: units.find((u) => u.typeId === "cavalry")?.name ?? "Cavalry",
				fielded: Math.max(0, s)
			},
			{
				id: `${army.id}-bow`,
				typeId: "archers",
				name: units.find((u) => u.typeId === "archers")?.name ?? "Archers",
				fielded: Math.max(0, r)
			},
			{
				id: `${army.id}-ft`,
				typeId: "infantry",
				name: units.find((u) => u.typeId === "infantry")?.name ?? "Infantry",
				fielded: Math.max(0, m)
			}
		].filter((u) => u.fielded > 0);
		onChange({
			composition: {
				shock: Math.max(0, s),
				ranged: Math.max(0, r),
				melee: Math.max(0, m)
			},
			units: nextUnits,
			strength: Math.max(0, s + r + m)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-48 flex-col gap-2 text-sm text-fg",
		children: [
			isGhost(army) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.12em] text-gold",
				children: "GHOST — 0 on the pin. Attack deletes if not reinforced."
			}),
			staffLive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-0.5 text-xs",
				children: units.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						u.name || unitTypeById(u.typeId).label,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-subtle",
							children: [
								"(",
								unitTypeById(u.typeId).short,
								")"
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular",
						children: Math.round(u.fielded)
					})]
				}, u.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-subtle",
				children: "Orders move the banner. The fight writes the lines."
			}),
			staffLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-left text-xs text-gold",
				onClick: () => setCorrect((v) => !v),
				children: correct ? "Hide line corrections" : "Correct lines"
			}),
			staffLive && correct && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
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
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px] text-subtle",
				children: [
					army.posture && army.posture !== "plain" ? army.posture.replace("forceMarched", "force-marched") : "plain",
					army.moveUsed ? " · move spent" : "",
					army.actionUsed ? " · action spent" : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: marching ? "primary" : "ghost",
				onClick: () => onMarch("march"),
				children: marching ? "Click map to march" : "March"
			}),
			campaign && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => onMarch("force"),
					children: "Force-march"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => onMarch("skirmish"),
					children: "Skirmish"
				})]
			}),
			campaign && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onEntrench,
				disabled: army.actionUsed,
				children: "Entrench"
			}),
			foes.length === 0 && campaign && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-subtle",
				children: "Approach a banner to Attack. Contact is not a battle."
			}),
			foes.map((foe) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "gold",
				onClick: () => onAttack(foe.id),
				disabled: isGhost(army) || Boolean(army.actionUsed) && !isGhost(foe),
				children: isGhost(foe) ? `Strike ghost ${nations.find((n) => n.id === foe.ownerId)?.name ?? foe.ownerId}` : `Attack ${nations.find((n) => n.id === foe.ownerId)?.name ?? foe.ownerId}`
			}, foe.id)),
			!campaign && foes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-subtle",
				children: "Peacetime march. A war, when it comes, will be obvious."
			}),
			staffLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-left text-danger",
				onClick: onDelete,
				children: "Delete army"
			})
		]
	});
}
function rebaseDrag(map) {
	const drag = map.dragging._draggable;
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
function safeHex(color) {
	return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : "#c8c4bc";
}
function bannerIcon(color, strength, state, ghost) {
	const ring = state === "march" ? "#e8dcc8" : state === "selected" ? "#c4a574" : "#1a1814";
	return divIcon({
		className: "ink-banner",
		iconSize: [26, 40],
		iconAnchor: [13, 40],
		popupAnchor: [0, -36],
		tooltipAnchor: [0, -36],
		html: `<div class="ink-banner-inner${ghost ? " ink-banner-ghost" : ""}" style="--c:${safeHex(color)};--ring:${ring}"><span class="ink-banner-pole"></span><span class="ink-banner-flag"></span><span class="ink-banner-n">${Math.round(strength)}</span></div>`
	});
}
function popRadius(kind) {
	if (kind === "city") return 11;
	if (kind === "town") return 9;
	if (kind === "fort") return 8;
	if (kind === "camp") return 6;
	return 7;
}
function HearthFrame({ mapWidth, mapHeight, staff, seed, field }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		const id = window.setTimeout(() => {
			map.invalidateSize({
				pan: false,
				animate: false
			});
			const known = !staff && field ? seenWindow(field) : null;
			if (staff || !known) {
				map.fitBounds([[0, 0], [mapHeight, mapWidth]], {
					animate: false,
					padding: [12, 12]
				});
				return;
			}
			const west = known.x0 * mapWidth;
			const east = Math.max(west + 80, known.x1 * mapWidth);
			const north = mapHeight * (1 - known.y0);
			const south = mapHeight * (1 - known.y1);
			map.fitBounds([[Math.min(south, north), west], [Math.max(south, north), east]], {
				animate: false,
				padding: [36, 36]
			});
		}, 140);
		return () => window.clearTimeout(id);
	}, [
		map,
		mapWidth,
		mapHeight,
		staff,
		seed,
		field
	]);
	return null;
}
function DragGate({ locked }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		if (locked) map.dragging.disable();
		else map.dragging.enable();
		return () => {
			map.dragging.enable();
		};
	}, [locked, map]);
	return null;
}
function WrapCamera({ mapWidth, enabled }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
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
		return () => {
			map.off("move", onMove);
		};
	}, [
		map,
		mapWidth,
		enabled
	]);
	return null;
}
function OneWidth({ mapWidth, enabled }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		if (!enabled || mapWidth <= 0) {
			map.setMinZoom(-3);
			return;
		}
		const apply = () => {
			const w = Math.max(1, map.getSize().x);
			const floor = Math.log2(w / mapWidth) + .06;
			map.setMinZoom(floor);
			if (map.getZoom() < floor - .001) map.setZoom(floor, { animate: false });
		};
		apply();
		map.on("resize", apply);
		return () => {
			map.off("resize", apply);
			map.setMinZoom(-3);
		};
	}, [
		map,
		mapWidth,
		enabled
	]);
	return null;
}
function GroundLayer({ field, rev, view, nations, bounds, reveal, plane, dim }) {
	const map = useMap();
	const canvasRef = (0, import_react.useRef)([]);
	const nationKey = nations.map((n) => `${n.id}:${n.color}`).join("|");
	const drawW = field.cols * 2;
	const drawH = field.rows * 2;
	(0, import_react.useEffect)(() => {
		const copies = field.wrap ? 3 : 1;
		const pane = map.getPane("overlayPane");
		const nodes = [];
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
			nodes.forEach((canvas, k) => {
				const shift = field.wrap ? (k - 1) * w : 0;
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
	}, [
		map,
		bounds,
		field.cols,
		field.rows,
		field.wrap,
		drawW,
		drawH
	]);
	(0, import_react.useEffect)(() => {
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
		const timer = window.setTimeout(() => {
			const main = nodes[field.wrap ? 1 : 0];
			if (main) setTerrainPreview(main.toDataURL("image/png"));
		}, 300);
		return () => window.clearTimeout(timer);
	}, [
		field,
		rev,
		view,
		nationKey,
		nations,
		drawW,
		drawH,
		reveal,
		plane,
		dim
	]);
	return null;
}
function MapPointer({ tool, marchingArmyId, armies, marchRange, onPlacePop, onPlaceNode, onPlaceArmy, onMoveArmy, onPreview, onSelectArmy, onPickStack, onClearPin, onPaint, onHover, wrapWidth }) {
	const painting = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const up = () => {
			painting.current = false;
		};
		window.addEventListener("mouseup", up);
		return () => window.removeEventListener("mouseup", up);
	}, []);
	return null;
}
function ModeMark({ id }) {
	const cls = "size-3.5 shrink-0";
	if (id === "terrain") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mountain, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "climate") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSun, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "height") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "all") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "political") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "culture") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "religion") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "resources") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "military") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, {
		className: cls,
		strokeWidth: 1.75
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {
		className: cls,
		strokeWidth: 1.75
	});
}
function PlaneMark({ id }) {
	const cls = "size-3.5 shrink-0";
	if (id === "under") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
		className: cls,
		strokeWidth: 1.75
	});
	if (id === "sky") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, {
		className: cls,
		strokeWidth: 1.75
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mountain, {
		className: cls,
		strokeWidth: 1.75
	});
}
function WorldMap({ mapWidth, mapHeight, marchRange, selectedArmyId, marchingArmyId, staffLive, atWarNationIds = [], pops, nodes, armies, nations, onSelectArmy, onMoveArmy, onPlacePop, onPlaceNode, onPlaceArmy, onUpdatePop, onRemovePop, onUpdateNode, onRemoveNode, onUpdateArmy, onRemoveArmy, onStartMarch, onAttack, onEntrench }) {
	const atlasUi = useAtlasUi();
	const tool = staffLive ? atlasUi.tool : "none";
	const brush = atlasUi.brush;
	const groundId = atlasUi.groundId;
	const borderId = atlasUi.borderId;
	const [layer, setLayer] = (0, import_react.useState)("terrain");
	const [plane, setPlane] = (0, import_react.useState)("surface");
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [pickStack, setPickStack] = (0, import_react.useState)([]);
	const [pin, setPin] = (0, import_react.useState)(null);
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [keyOpen, setKeyOpen] = (0, import_react.useState)(false);
	const [hover, setHover] = (0, import_react.useState)("");
	const { field, rev } = useTerrainField();
	const colorById = (0, import_react.useMemo)(() => new Map(nations.map((n) => [n.id, n.color])), [nations]);
	const offsets = (0, import_react.useMemo)(() => stackOffsets(armies), [armies]);
	const PAD = 400;
	const wrapped = Boolean(field?.wrap);
	const BOUNDS = (0, import_react.useMemo)(() => new LatLngBounds([0, 0], [mapHeight, mapWidth]), [mapHeight, mapWidth]);
	const VIEW_BOUNDS = (0, import_react.useMemo)(() => new LatLngBounds([-400, wrapped ? -mapWidth * 8 : -400], [mapHeight + PAD, wrapped ? mapWidth * 9 : mapWidth + PAD]), [
		mapHeight,
		mapWidth,
		wrapped
	]);
	const selected = armies.find((a) => a.id === selectedArmyId);
	const marching = armies.find((a) => a.id === marchingArmyId);
	const pinnedPop = pin?.kind === "pop" ? pops.find((p) => p.id === pin.id) : void 0;
	const pinnedNode = pin?.kind === "node" ? nodes.find((n) => n.id === pin.id) : void 0;
	const inspectArmy = selected ?? null;
	const inspectPop = inspectArmy ? void 0 : pinnedPop;
	const inspectNode = inspectArmy || inspectPop ? void 0 : pinnedNode;
	const showAllZoc = layer === "military";
	const showPops = layer === "all" || layer === "political" || layer === "culture" || layer === "religion" || layer === "terrain" || layer === "climate" || layer === "height";
	const showNodes = layer === "all" || layer === "resources";
	const showArmies = layer === "all" || layer === "military" || layer === "political" || layer === "terrain" || layer === "climate" || layer === "height";
	const groundView = layer === "climate" ? "climate" : layer === "height" ? "height" : layer === "political" || layer === "all" ? "political" : "terrain";
	const dim = layer === "culture" || layer === "religion" || layer === "resources" || layer === "military";
	const drawing = tool === "ground" || tool === "border" || tool === "reveal" || tool === "shroud";
	const shifts = wrapped ? [
		-mapWidth,
		0,
		mapWidth
	] : [0];
	(0, import_react.useEffect)(() => {
		setMapWrap(wrapped ? mapWidth : 0);
	}, [wrapped, mapWidth]);
	function groundLine(x, y) {
		if (!field) return "";
		const brief = cellBrief(field, x, y, mapWidth, mapHeight);
		const claim = brief.claim ? nations.find((n) => n.id === brief.claim)?.name ?? "" : "";
		const bits = [brief.biome];
		if (brief.relief) bits.push(brief.relief);
		bits.push(brief.climate, brief.band);
		if (claim) bits.push(claim);
		return bits.join(" · ");
	}
	function popFill(pop) {
		if (layer === "culture") return colorFromKey(pop.culture);
		if (layer === "religion") return colorFromKey(pop.religion);
		return colorById.get(pop.ownerId) ?? MAP_INK.unset;
	}
	const onPaint = drawing && field ? (x, y) => {
		if (tool === "ground") paintGround(x, y, mapWidth, mapHeight, groundId, brush);
		else if (tool === "border") paintBorder(x, y, mapWidth, mapHeight, borderId || null, brush);
		else paintSight(x, y, mapWidth, mapHeight, brush, tool === "reveal");
	} : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-full w-full",
		children: [
			keyOpen && layer === "terrain" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ink-legend",
				"aria-hidden": true,
				children: TERRAINS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: t.color } }), t.label] }, t.id))
			}),
			keyOpen && layer === "climate" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ink-legend",
				"aria-hidden": true,
				children: [
					["#d6e4ea", "Freezing"],
					["#7d9a78", "Cold"],
					["#247a40", "Wet"],
					["#e2a654", "Dry"],
					["#0c3d66", "Ocean"]
				].map(([color, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: color } }), label] }, label))
			}),
			keyOpen && layer === "height" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ink-legend",
				"aria-hidden": true,
				children: [
					["#04183a", "Deep"],
					["#2e96a8", "Low"],
					["#96b056", "Rising"],
					["#a8844e", "High"],
					["#f4f7fb", "Peak"]
				].map(([color, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: color } }), label] }, label))
			}),
			hover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ink-cellread",
				children: hover
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ink-planes",
				role: "tablist",
				"aria-label": "Plane",
				children: MAP_PLANES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "tab",
					"aria-selected": plane === p.id,
					onClick: () => setPlane(p.id),
					className: cn("font-display flex h-11 min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-2 text-[11px] tracking-[0.14em] lg:w-full lg:flex-none", plane === p.id ? "bg-fg text-bg" : "text-gold hover:bg-hover"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaneMark, { id: p.id }), p.label.toUpperCase()]
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ink-mapmodes",
				role: "tablist",
				"aria-label": "Map mode",
				children: [MAP_LAYERS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "tab",
					"aria-selected": layer === l.id,
					title: l.label,
					onClick: () => setLayer(l.id),
					className: cn("flex h-10 min-w-12 shrink-0 items-center justify-center gap-1 rounded-sm px-2 text-[11px] tracking-wide", layer === l.id ? "bg-fg text-bg" : "text-fg hover:bg-hover"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeMark, { id: l.id }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "md:hidden",
							children: l.short
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden md:inline",
							children: l.label
						})
					]
				}, l.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": keyOpen,
					onClick: () => setKeyOpen((v) => !v),
					className: cn("flex h-10 min-w-12 shrink-0 items-center justify-center gap-1 rounded-sm px-2 text-[11px] tracking-wide", keyOpen ? "bg-fg text-bg" : "text-fg hover:bg-hover"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeMark, { id: "key" }), "Key"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
				attributionControl: false,
				zoomControl: false,
				crs: CRS.Simple,
				bounds: BOUNDS,
				maxBounds: VIEW_BOUNDS,
				maxBoundsViscosity: 1,
				minZoom: -6,
				maxZoom: 3,
				zoomSnap: 0,
				zoomDelta: .4,
				wheelPxPerZoomLevel: 320,
				wheelDebounceTime: 12,
				zoomAnimation: false,
				fadeAnimation: false,
				markerZoomAnimation: false,
				bounceAtZoomLimits: false,
				style: {
					height: "100%",
					width: "100%",
					background: "var(--color-map)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomControl, { position: "topleft" }),
					field && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroundLayer, {
						field,
						rev,
						view: groundView,
						nations,
						bounds: BOUNDS,
						reveal: staffLive,
						plane,
						dim
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HearthFrame, {
						mapWidth,
						mapHeight,
						staff: staffLive,
						seed: field?.seed ?? "",
						field
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WrapCamera, {
						mapWidth,
						enabled: wrapped
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OneWidth, {
						mapWidth,
						enabled: wrapped
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragGate, { locked: drawing }),
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
						onSelectArmy,
						onPickStack: setPickStack,
						onClearPin: () => setPin(null),
						onPaint,
						wrapWidth: wrapped ? mapWidth : 0,
						onHover: (x, y) => setHover(groundLine(x, y))
					}),
					shifts.map((shift) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
						showAllZoc && armies.map((army) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
							center: [army.y, army.x + shift],
							radius: 64,
							interactive: false,
							pathOptions: {
								color: colorById.get(army.ownerId) ?? MAP_INK.zoc,
								weight: 1,
								fillOpacity: .06
							}
						}, `zoc-${shift}-${army.id}`)),
						selected && !showAllZoc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
							center: [selected.y, selected.x + shift],
							radius: 64,
							interactive: false,
							pathOptions: {
								color: MAP_INK.zoc,
								weight: 1,
								fillOpacity: .08
							}
						}, `sel-${shift}`),
						marching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
							center: [marching.y, marching.x + shift],
							radius: marchRange,
							interactive: false,
							pathOptions: {
								color: MAP_INK.range,
								weight: 1,
								fillOpacity: .04
							}
						}, `march-${shift}`),
						preview && marching && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
							center: [preview.y, preview.x + shift],
							radius: 64,
							interactive: false,
							pathOptions: {
								color: MAP_INK.range,
								weight: 1,
								fillOpacity: .1
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
							center: [preview.y, preview.x + shift],
							radius: 10,
							interactive: false,
							pathOptions: {
								color: MAP_INK.range,
								fillColor: colorById.get(marching.ownerId) ?? MAP_INK.unset,
								fillOpacity: .45,
								weight: 2
							}
						})] }, `prev-${shift}`),
						showPops && pops.map((pop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
							center: [pop.y, pop.x + shift],
							radius: popRadius(pop.kind),
							pathOptions: {
								color: pop.kind === "city" || pop.kind === "fort" ? MAP_INK.selected : pop.settled ? MAP_INK.stroke : MAP_INK.zoc,
								fillColor: popFill(pop),
								fillOpacity: .92,
								weight: pop.kind === "fort" ? 3 : 2
							},
							bubblingMouseEvents: false,
							eventHandlers: { click: (e) => {
								e.originalEvent.stopPropagation();
								if (tool !== "none") return;
								onSelectArmy(null);
								setPickStack([]);
								setPin({
									kind: "pop",
									id: pop.id
								});
								setCollapsed(false);
							} },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, {
								direction: "top",
								offset: [0, -8],
								children: [
									(pop.kind ?? "pop").toUpperCase(),
									" · ",
									nations.find((n) => n.id === pop.ownerId)?.name ?? pop.ownerId
								]
							})
						}, `${shift}-${pop.id}`)),
						showNodes && nodes.map((node) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
							center: [node.y, node.x + shift],
							radius: 6,
							pathOptions: {
								color: MAP_INK.stroke,
								fillColor: colorFromKey(node.resourceId),
								fillOpacity: .95,
								weight: 2
							},
							bubblingMouseEvents: false,
							eventHandlers: { click: (e) => {
								e.originalEvent.stopPropagation();
								if (tool !== "none") return;
								onSelectArmy(null);
								setPickStack([]);
								setPin({
									kind: "node",
									id: node.id
								});
								setCollapsed(false);
							} },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								direction: "top",
								children: node.resourceId
							})
						}, `${shift}-${node.id}`)),
						showArmies && armies.map((army) => {
							const state = army.id === marchingArmyId ? "march" : army.id === selectedArmyId ? "selected" : "idle";
							const off = offsets.get(army.id) ?? {
								dx: 0,
								dy: 0
							};
							const stack = stackedWith(army, armies);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
								position: [army.y + off.dy, army.x + off.dx + shift],
								keyboard: false,
								autoPanOnFocus: false,
								icon: bannerIcon(colorById.get(army.ownerId) ?? MAP_INK.unset, armyStrength(army), state, isGhost(army)),
								eventHandlers: { click: (e) => {
									e.originalEvent.stopPropagation();
									if (tool !== "none") return;
									const picked = armies.find((a) => a.id === selectedArmyId);
									if (picked && picked.id !== army.id && picked.ownerId !== army.ownerId && armiesInContact(picked, army)) {
										onAttack(picked.id, army.id);
										e.target.closePopup();
										return;
									}
									if (stack.length > 1) setPickStack(stack.map((a) => a.id));
									else setPickStack([]);
									setPin(null);
									setCollapsed(false);
									onSelectArmy(army.id);
								} },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, {
									direction: "top",
									offset: [0, -36],
									children: [
										nations.find((n) => n.id === army.ownerId)?.name ?? army.ownerId,
										" · ",
										isGhost(army) ? "ghost" : Math.round(armyStrength(army))
									]
								})
							}, `${shift}-${army.id}`);
						})
					] }, shift))
				]
			}, `inkunzi-world-${mapWidth}x${mapHeight}`),
			(inspectArmy || inspectPop || inspectNode) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("ink-inspector ink-panel", collapsed && "is-collapsed"),
				"aria-label": "Selected",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "ink-inspector-head",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ink-inspector-stripe",
							style: { background: safeHex(inspectArmy ? colorById.get(inspectArmy.ownerId) ?? "#c8c4bc" : inspectPop ? colorById.get(inspectPop.ownerId) ?? "#c8c4bc" : "#c4a574") }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate font-display text-sm tracking-wide text-fg",
								children: inspectArmy ? nations.find((n) => n.id === inspectArmy.ownerId)?.name ?? "Banner" : inspectPop ? (inspectPop.kind ?? "pop").toUpperCase() : inspectNode?.resourceId ?? "Node"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-[11px] text-muted tabular",
								children: inspectArmy ? `${isGhost(inspectArmy) ? "Ghost" : `${Math.round(armyStrength(inspectArmy))} fielded`}${field ? ` · ${groundLine(inspectArmy.x, inspectArmy.y)}` : ""}` : inspectPop ? `${nations.find((n) => n.id === inspectPop.ownerId)?.name ?? inspectPop.ownerId}${field ? ` · ${groundLine(inspectPop.x, inspectPop.y)}` : ""}` : "Resource"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ink-inspector-icon",
							"aria-expanded": !collapsed,
							onClick: () => setCollapsed((v) => !v),
							children: collapsed ? "Open" : "Hide"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ink-inspector-icon",
							"aria-label": "Deselect",
							onClick: () => {
								onSelectArmy(null);
								setPin(null);
								setPickStack([]);
							},
							children: "Close"
						})
					]
				}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ink-inspector-body ink-scroll",
					children: [
						inspectArmy && pickStack.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 border-b border-border pb-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-1 text-[11px] tracking-[0.12em] text-gold",
								children: "STACKED"
							}), pickStack.map((id) => {
								const a = armies.find((x) => x.id === id);
								if (!a) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: cn("block w-full py-1 text-left", selectedArmyId === id && "text-gold"),
									onClick: () => onSelectArmy(id),
									children: [
										nations.find((n) => n.id === a.ownerId)?.name ?? a.ownerId,
										" · ",
										Math.round(armyStrength(a))
									]
								}, id);
							})]
						}),
						inspectArmy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArmyEditor, {
							army: inspectArmy,
							armies,
							nations,
							marching: inspectArmy.id === marchingArmyId,
							staffLive,
							campaign: staffLive || atWarNationIds.includes(inspectArmy.ownerId),
							onChange: (patch) => onUpdateArmy(inspectArmy.id, patch),
							onDelete: () => onRemoveArmy(inspectArmy.id),
							onMarch: (mode) => onStartMarch(inspectArmy.id, mode),
							onAttack: (defenderId) => onAttack(inspectArmy.id, defenderId),
							onEntrench: () => onEntrench(inspectArmy.id)
						}),
						inspectPop && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopEditor, {
							pop: inspectPop,
							nations,
							onChange: (patch) => onUpdatePop(inspectPop.id, patch),
							onDelete: () => {
								onRemovePop(inspectPop.id);
								setPin(null);
							}
						}),
						inspectNode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeEditor, {
							node: inspectNode,
							nations,
							onChange: (patch) => onUpdateNode(inspectNode.id, patch),
							onDelete: () => {
								onRemoveNode(inspectNode.id);
								setPin(null);
							}
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { WorldMap as default };
