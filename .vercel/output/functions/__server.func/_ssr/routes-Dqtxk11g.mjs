import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dqtxk11g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var RETREAT_KINDS = /* @__PURE__ */ new Set([
	"town",
	"city",
	"fort"
]);
function turnMarchRange(session) {
	return session.pixelsPerDayMarch * session.daysPerTurn;
}
function distance(x1, y1, x2, y2) {
	return Math.hypot(x2 - x1, y2 - y1);
}
function isRetreatNode(pop) {
	if (pop.kind === "camp") return false;
	if (pop.kind && RETREAT_KINDS.has(pop.kind)) return true;
	return pop.settled && pop.kind !== "pop";
}
function nearestTown(pops, ownerId, fromX, fromY) {
	const towns = pops.filter((p) => p.ownerId === ownerId && isRetreatNode(p));
	const fallback = towns.length ? towns : pops.filter((p) => p.ownerId === ownerId && p.settled && p.kind !== "camp");
	if (!fallback.length) return null;
	return fallback.reduce((best, pop) => distance(pop.x, pop.y, fromX, fromY) < distance(best.x, best.y, fromX, fromY) ? pop : best);
}
/** Half a move toward the nearest friendly city / town / fort. Camp is not a retreat. */
function retreatTowardTown(army, winner, pops) {
	const town = nearestTown(pops, army.ownerId, army.x, army.y);
	if (town && distance(army.x, army.y, town.x, town.y) > 16) return {
		...army,
		x: army.x + (town.x - army.x) * .5,
		y: army.y + (town.y - army.y) * .5
	};
	const dx = army.x - winner.x;
	const dy = army.y - winner.y;
	const len = Math.hypot(dx, dy) || 1;
	return {
		...army,
		x: army.x + dx / len * 80,
		y: army.y + dy / len * 80
	};
}
var RESOURCES = [
	{
		id: "food",
		label: "Rations",
		kind: "food",
		mode: "ledger"
	},
	{
		id: "lumber",
		label: "Lumber",
		kind: "material",
		mode: "ledger"
	},
	{
		id: "stone",
		label: "Stone",
		kind: "material",
		mode: "ledger"
	},
	{
		id: "metal",
		label: "Metal",
		kind: "military",
		mode: "ledger"
	}
];
function emptyLedger() {
	return Object.fromEntries(RESOURCES.map((r) => [r.id, 0]));
}
var CONTACT_PX = 64;
var PHASES = [
	"shock",
	"early",
	"late"
];
var WEIGHTS = {
	shock: {
		shock: 1.5,
		ranged: .25,
		melee: .6
	},
	early: {
		shock: .4,
		ranged: 1.35,
		melee: .85
	},
	late: {
		shock: .55,
		ranged: .35,
		melee: 1.25
	}
};
function armiesInContact(a, b) {
	if (a.id === b.id) return false;
	if (a.ownerId === b.ownerId) return false;
	if (a.ownerId === "unclaimed" || b.ownerId === "unclaimed") return false;
	return distance(a.x, a.y, b.x, b.y) <= CONTACT_PX;
}
function firstContact(moved, armies) {
	return armies.find((a) => armiesInContact(moved, a)) ?? null;
}
function compositionOf(army) {
	const c = army.composition;
	const total = c ? c.shock + c.ranged + c.melee : 0;
	if (c && total > 0) return c;
	return {
		shock: army.strength * .2,
		ranged: army.strength * .3,
		melee: army.strength * .5
	};
}
function terrainMods(terrain, side) {
	const role = {
		shock: 1,
		ranged: 1,
		melee: 1
	};
	let sideMod = 1;
	if (terrain === "fort" && side === "defender") sideMod *= 1.25;
	if (terrain === "marsh") {
		role.shock *= .65;
		role.ranged *= .85;
		role.melee *= .85;
	}
	if (terrain === "hills") {
		if (side === "defender") sideMod *= 1.1;
		role.shock *= .85;
	}
	if (terrain === "forest") {
		role.ranged *= .75;
		role.shock *= .85;
	}
	if (terrain === "river" && side === "attacker") sideMod *= .85;
	if (terrain === "rain") role.ranged *= .8;
	return {
		role,
		sideMod
	};
}
function power(army, phase, terrain, side) {
	const comp = compositionOf(army);
	const w = WEIGHTS[phase];
	const mods = terrainMods(terrain, side);
	return (comp.shock * w.shock * mods.role.shock + comp.ranged * w.ranged * mods.role.ranged + comp.melee * w.melee * mods.role.melee) * mods.sideMod;
}
function applyLoss(army, loss) {
	const next = Math.max(0, army.strength - loss);
	const scale = army.strength > 0 ? next / army.strength : 0;
	const c = compositionOf(army);
	return {
		...army,
		strength: next,
		composition: {
			shock: c.shock * scale,
			ranged: c.ranged * scale,
			melee: c.melee * scale
		}
	};
}
function resolveFieldBattle(attacker, defender, terrain = "open") {
	let atk = attacker;
	let def = defender;
	const phases = [];
	let atkWins = 0;
	let defWins = 0;
	let wipe = false;
	for (const id of PHASES) {
		if (atk.strength <= 0 || def.strength <= 0) {
			wipe = true;
			break;
		}
		if (atkWins === 2 || defWins === 2) break;
		const attackerPower = power(atk, id, terrain, "attacker");
		const defenderPower = power(def, id, terrain, "defender");
		const winner = attackerPower > defenderPower ? "attacker" : "defender";
		const winnerPower = winner === "attacker" ? attackerPower : defenderPower;
		const loserPower = winner === "attacker" ? defenderPower : attackerPower;
		let attackerLoss = Math.max(1, Math.floor((winner === "defender" ? winnerPower : loserPower) * .12));
		let defenderLoss = Math.max(1, Math.floor((winner === "attacker" ? winnerPower : loserPower) * .12));
		if (winner === "attacker") {
			defenderLoss = Math.max(1, Math.floor(winnerPower * .18));
			attackerLoss = Math.max(1, Math.floor(loserPower * .08));
		} else {
			attackerLoss = Math.max(1, Math.floor(winnerPower * .18));
			defenderLoss = Math.max(1, Math.floor(loserPower * .08));
		}
		if (id === "late") {
			if (winner === "attacker") defenderLoss = Math.floor(defenderLoss * 1.1);
			else attackerLoss = Math.floor(attackerLoss * 1.1);
		}
		atk = applyLoss(atk, attackerLoss);
		def = applyLoss(def, defenderLoss);
		if (winner === "attacker") atkWins += 1;
		else defWins += 1;
		if (atk.strength <= 0 || def.strength <= 0) wipe = true;
		phases.push({
			id,
			attackerPower: Math.round(attackerPower * 10) / 10,
			defenderPower: Math.round(defenderPower * 10) / 10,
			winner,
			attackerLoss,
			defenderLoss
		});
	}
	const winner = wipe ? atk.strength > 0 ? "attacker" : "defender" : atkWins >= defWins ? "attacker" : "defender";
	const summary = wipe ? `${winner === "attacker" ? "Attacker" : "Defender"} wiped the field.` : `${winner === "attacker" ? "Attacker" : "Defender"} takes the field ${atkWins}–${defWins}.`;
	return {
		attacker: atk,
		defender: def,
		report: {
			attackerId: attacker.id,
			defenderId: defender.id,
			terrain,
			phases,
			winner,
			wipe,
			summary
		}
	};
}
function applyBattleToArmies(armies, pops, attackerId, defenderId, terrain) {
	const attacker = armies.find((a) => a.id === attackerId);
	const defender = armies.find((a) => a.id === defenderId);
	if (!attacker || !defender) return {
		armies,
		report: null
	};
	const result = resolveFieldBattle(attacker, defender, terrain);
	let nextAtk = result.attacker;
	let nextDef = result.defender;
	if (!result.report.wipe) {
		if (result.report.winner === "attacker" && nextDef.strength > 0) nextDef = retreatTowardTown(nextDef, nextAtk, pops);
		else if (result.report.winner === "defender" && nextAtk.strength > 0) nextAtk = retreatTowardTown(nextAtk, nextDef, pops);
	}
	return {
		armies: armies.map((a) => {
			if (a.id === nextAtk.id) return nextAtk;
			if (a.id === nextDef.id) return nextDef;
			return a;
		}).filter((a) => a.strength > 0),
		report: result.report
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Button({ className, variant = "ghost", type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex min-h-9 items-center justify-center rounded-sm px-3 text-sm font-medium", "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50", variant === "primary" && "bg-accent text-accent-fg hover:opacity-90", variant === "ghost" && "border border-border bg-raised text-fg hover:bg-hover", variant === "danger" && "bg-danger text-fg hover:opacity-90", variant === "staff" && "bg-staff text-fg hover:opacity-90", variant === "gold" && "border border-gold-dim bg-raised text-gold hover:bg-hover", className),
		...props
	});
}
var worldMapPromise = import("./WorldMap-Bw3su37F.mjs");
function PaintingFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full place-items-center bg-map text-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display tracking-[0.18em] text-gold",
				children: "INKUNZI"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm",
				children: "Unrolling the painting…"
			})]
		})
	});
}
function WorldMapReady(props) {
	const Map = (0, import_react.use)(worldMapPromise).default;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-full w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { ...props })
	});
}
function WorldMapLoader(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaintingFallback, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldMapReady, { ...props })
	});
}
function laneLabel(a) {
	const lane = a.lane ?? 2;
	if (lane === 1) return "Lane 1 · auto";
	if (lane === 2) return `Lane 2 · roll${a.dc ? ` DC ${a.dc}` : ""}`;
	return "Lane 3 · staff gate";
}
function ActionPanel({ actions, onSubmit, onAccept, onDeny }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [detail, setDetail] = (0, import_react.useState)("");
	const pending = actions.filter((a) => a.status === "pending");
	const recent = actions.filter((a) => a.status !== "pending").slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "ink-scroll h-full w-full overflow-y-auto bg-surface p-3 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-display text-xs tracking-[0.16em] text-gold",
				children: "QUEUE"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mb-3 space-y-2",
				onSubmit: (e) => {
					e.preventDefault();
					if (!title.trim()) return;
					onSubmit(title.trim(), detail.trim());
					setTitle("");
					setDetail("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm",
						placeholder: "War / RP / claim",
						value: title,
						onChange: (e) => setTitle(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm",
						placeholder: "Detail for staff",
						value: detail,
						onChange: (e) => setDetail(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "primary",
						className: "h-10 w-full",
						children: "Queue"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-2",
				children: [pending.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "No pending actions. Staff live applies peacetime marches now."
				}), pending.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-sm border border-border bg-raised px-2 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-sm text-fg",
							children: a.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-gold",
							children: laneLabel(a)
						}),
						a.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-subtle",
							children: a.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "staff",
								className: "h-8 px-2 text-xs",
								onClick: () => onAccept(a.id),
								children: "Accept"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								className: "h-8 px-2 text-xs",
								onClick: () => onDeny(a.id),
								children: "Deny"
							})]
						})
					]
				}, a.id))]
			}),
			recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 text-[11px] tracking-[0.14em] text-subtle",
					children: "RESOLVED"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-xs text-muted",
					children: recent.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						a.status,
						a.result && a.result !== "unset" ? `/${a.result}` : "",
						" · ",
						a.title
					] }, a.id))
				})]
			})
		]
	});
}
function WindowFrame({ win, onMove, onClose, onFocus, children }) {
	const [drag, setDrag] = (0, import_react.useState)(null);
	const left = typeof window === "undefined" ? win.x : Math.min(Math.max(8, win.x), Math.max(8, window.innerWidth - 24));
	const top = typeof window === "undefined" ? win.y : Math.min(Math.max(8, win.y), Math.max(8, window.innerHeight - 72));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("ink-panel absolute w-[min(22rem,calc(100vw-1.5rem))] text-fg"),
		style: {
			left,
			top,
			zIndex: 2e3
		},
		onPointerDown: () => onFocus(win.id),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ink-hairline flex cursor-move items-center justify-between bg-raised px-3 py-2",
			onPointerDown: (e) => {
				if (e.target.closest("button")) return;
				e.currentTarget.setPointerCapture(e.pointerId);
				setDrag({
					dx: e.clientX - win.x,
					dy: e.clientY - win.y
				});
			},
			onPointerMove: (e) => {
				if (!drag) return;
				onMove(win.id, Math.max(8, e.clientX - drag.dx), Math.max(8, e.clientY - drag.dy));
			},
			onPointerUp: (e) => {
				if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
				setDrag(null);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display truncate text-sm tracking-wide text-gold",
				children: win.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-8 place-items-center rounded-sm text-muted hover:bg-hover hover:text-fg",
				onClick: () => onClose(win.id),
				"aria-label": "Close window",
				children: "×"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-[min(32rem,70vh)] overflow-y-auto p-3 text-sm ink-scroll",
			children
		})]
	});
}
function countPopsByOwner(pops) {
	const byId = /* @__PURE__ */ new Map();
	for (const pop of pops) {
		const row = byId.get(pop.ownerId) ?? {
			ownerId: pop.ownerId,
			pops: 0,
			settled: 0,
			nomad: 0
		};
		row.pops += 1;
		if (pop.settled) row.settled += 1;
		else row.nomad += 1;
		byId.set(pop.ownerId, row);
	}
	return byId;
}
function formatPeople(pops, popValue) {
	return (pops * popValue).toLocaleString("en-US");
}
function districtCap(baseSlots, settled) {
	return Math.max(baseSlots, 3) + Math.floor(Math.max(0, settled - 3) / 4);
}
function Crest({ color, size = 28, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: size,
		height: Math.round(size * 1.15),
		viewBox: "0 0 24 28",
		"aria-hidden": title ? void 0 : true,
		role: title ? "img" : "presentation",
		children: [
			title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: title }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12 1.4 L22 5.2 V14.2 C22 20.2 12 26.6 12 26.6 C12 26.6 2 20.2 2 14.2 V5.2 Z",
				fill: color,
				stroke: "#c4a574",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12 4.2 L19 7 V14 C19 18.4 12 23.2 12 23.2 C12 23.2 5 18.4 5 14 V7 Z",
				fill: "none",
				stroke: "#0e0c0a",
				strokeOpacity: "0.35"
			})
		]
	});
}
var DISTRICT_KINDS = [
	{
		id: "farm",
		label: "Farm"
	},
	{
		id: "market",
		label: "Market"
	},
	{
		id: "port",
		label: "Port"
	},
	{
		id: "fort",
		label: "Fort"
	},
	{
		id: "admin",
		label: "Admin"
	}
];
function NationWindow({ nation, pops, characters, session, docked, onOpenCharacter, onChange, onConvert, onClose }) {
	const c = countPopsByOwner(pops).get(nation.id);
	const slots = districtCap(nation.districtSlots, c?.settled ?? 0);
	const rulers = characters.filter((ch) => ch.nationId === nation.id);
	function addDistrict(kind) {
		if (nation.districts.filter((d) => d.kind === kind).length >= 3) return;
		if (nation.districts.length >= slots) return;
		onChange({ districts: [...nation.districts, {
			id: crypto.randomUUID(),
			kind,
			tier: 1
		}] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: docked ? "flex h-full flex-col" : "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-3 py-3",
			style: { background: `linear-gradient(90deg, ${nation.color} 0 8px, transparent 8px)` },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
					color: nation.color,
					size: 36
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-base tracking-wide",
						children: nation.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-muted tabular",
						children: [
							c?.pops ?? 0,
							" pops · ",
							formatPeople(c?.pops ?? 0, session.popValue),
							" souls"
						]
					})]
				}),
				docked && onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid size-8 place-items-center text-muted",
					onClick: onClose,
					"aria-label": "Close country",
					children: "×"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 px-3 pb-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-x-3 gap-y-1 text-xs tabular",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Treasury",
							v: `$${nation.treasury}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Stability",
							v: String(nation.stability)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "War support",
							v: String(nation.warSupport)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Infamy",
							v: String(nation.infamy)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Manpower",
							v: nation.manpower.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Legitimacy",
							v: String(nation.legitimacy)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 text-[11px] tracking-[0.14em] text-gold",
					children: "LEDGER"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-0.5 text-sm",
					children: RESOURCES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [r.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 text-[10px] text-subtle",
							children: r.mode === "cap" ? " cap" : " stock"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular text-fg",
							children: nation.resources[r.id] ?? 0
						})]
					}, r.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mb-1 text-[11px] tracking-[0.14em] text-gold",
						children: [
							"DISTRICTS ",
							nation.districts.length,
							"/",
							slots
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mb-2 space-y-1 text-sm",
						children: [nation.districts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-muted",
							children: "Empty slots. One building each."
						}), nation.districts.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								d.kind,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: ["T", d.tier]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-xs text-danger",
								onClick: () => onChange({ districts: nation.districts.filter((x) => x.id !== d.id) }),
								children: "Strip"
							})]
						}, d.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: DISTRICT_KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "h-8 px-2 text-xs",
							disabled: nation.districts.length >= slots || nation.districts.filter((d) => d.kind === k.id).length >= 3,
							onClick: () => addDistrict(k.id),
							children: k.label
						}, k.id))
					})
				] }),
				rulers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 text-[11px] tracking-[0.14em] text-gold",
					children: "COURT"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: rulers.map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-gold",
						onClick: () => onOpenCharacter(ch.id),
						children: ch.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 text-[11px] text-muted",
						children: ["prestige ", ch.prestige]
					})] }, ch.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "gold",
					className: "h-10 w-full",
					onClick: onConvert,
					children: "Write a conversion"
				})
			]
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-fg",
			children: v
		})]
	});
}
var TERRAIN = [
	{
		id: "open",
		label: "Open"
	},
	{
		id: "fort",
		label: "Fort"
	},
	{
		id: "marsh",
		label: "Marsh"
	},
	{
		id: "hills",
		label: "Hills"
	},
	{
		id: "forest",
		label: "Forest"
	},
	{
		id: "river",
		label: "River"
	},
	{
		id: "rain",
		label: "Rain"
	}
];
function WarWindow({ wars, armies, nations, onTerrain, onResolve }) {
	const nameOf = (nationId) => nations.find((n) => n.id === nationId)?.name ?? nationId;
	const colorOf = (nationId) => nations.find((n) => n.id === nationId)?.color ?? "#c8c4bc";
	const armyOf = (id) => armies.find((a) => a.id === id);
	const open = wars.filter((w) => w.status === "declared");
	const done = wars.filter((w) => w.status === "resolved").slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Friday field. Shock loves cavalry, Early loves bows, Late loves melee. Best two of three. Loser retreats toward a city, town, or fort — not a camp."
			}),
			open.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No declared wars. March a banner into an enemy zone of control."
			}),
			open.map((war) => {
				const atk = armyOf(war.attackerArmyId);
				const def = armyOf(war.defenderArmyId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-sm border border-border bg-raised p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
									color: colorOf(war.attackerNationId),
									size: 18
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: nameOf(war.attackerNationId)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: "vs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
									color: colorOf(war.defenderNationId),
									size: 18
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: nameOf(war.defenderNationId)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-xs text-muted tabular",
							children: [
								atk ? `Atk ${Math.round(atk.strength)}` : "Attacker gone",
								" ·",
								" ",
								def ? `Def ${Math.round(def.strength)}` : "Defender gone"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-2 block text-xs text-muted",
							children: ["Ground", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg",
								value: war.terrain,
								onChange: (e) => onTerrain(war.id, e.target.value),
								children: TERRAIN.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t.id,
									children: t.label
								}, t.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "staff",
							className: "mt-2 h-10 w-full",
							disabled: !atk || !def,
							onClick: () => onResolve(war.id),
							children: "Resolve field"
						})
					]
				}, war.id);
			}),
			done.map((war) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-sm border border-border p-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-muted",
					children: [
						"Resolved · ",
						nameOf(war.attackerNationId),
						" vs ",
						nameOf(war.defenderNationId)
					]
				}), war.report && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-fg",
					children: war.report.summary
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-1 space-y-0.5 text-subtle",
					children: war.report.phases.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "capitalize",
						children: [
							p.id,
							": ",
							p.winner,
							" (",
							p.attackerPower,
							" / ",
							p.defenderPower,
							") −",
							p.attackerLoss,
							"/−",
							p.defenderLoss
						]
					}, p.id))
				})] })]
			}, war.id))
		]
	});
}
function d20() {
	return 1 + Math.floor(Math.random() * 20);
}
/** 1d20 + stat vs DC. Mixed if within 3 below the DC. */
function checkStat(stat, dc, roll = d20()) {
	const total = roll + stat;
	let result = "fail";
	if (total >= dc) result = "success";
	else if (total >= dc - 3) result = "mixed";
	return {
		roll,
		stat,
		total,
		dc,
		result
	};
}
var STATS = [
	{
		key: "rulership",
		label: "Rulership"
	},
	{
		key: "charisma",
		label: "Charisma"
	},
	{
		key: "landTactics",
		label: "Land tactics"
	},
	{
		key: "seaTactics",
		label: "Sea tactics"
	},
	{
		key: "intrigue",
		label: "Intrigue"
	},
	{
		key: "business",
		label: "Business"
	}
];
function CharacterWindow({ character, armies, onChange, onRolled }) {
	const host = armies.filter((a) => a.ownerId === character.nationId);
	const [stat, setStat] = (0, import_react.useState)("charisma");
	const [dc, setDc] = (0, import_react.useState)("15");
	const [last, setLast] = (0, import_react.useState)(null);
	function roll() {
		const dcN = Number(dc);
		if (!Number.isFinite(dcN)) return;
		const result = checkStat(character.stats[stat], dcN);
		setLast(result);
		const label = STATS.find((s) => s.key === stat)?.label ?? stat;
		onRolled?.(`${character.name} rolls ${result.roll}+${result.stat}=${result.total} vs DC ${result.dc} (${label}) — ${result.result}.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display text-base",
				children: character.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted tabular",
				children: ["Prestige ", character.prestige]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "grid grid-cols-2 gap-x-3 gap-y-1 text-sm",
				children: STATS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular",
						children: character.stats[s.key]
					})]
				}, s.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-sm border border-border bg-raised p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 text-[11px] tracking-[0.14em] text-gold",
						children: "1d20 + STAT vs DC"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs text-muted",
							children: ["Stat", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg",
								value: stat,
								onChange: (e) => setStat(e.target.value),
								children: STATS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.key,
									children: s.label
								}, s.key))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs text-muted",
							children: ["DC", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg",
								value: dc,
								onChange: (e) => setDc(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "gold",
						className: "mt-2 h-10 w-full",
						onClick: roll,
						children: "Roll"
					}),
					last && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs tabular text-fg",
						children: [
							last.roll,
							" + ",
							last.stat,
							" = ",
							last.total,
							" vs ",
							last.dc,
							" · ",
							last.result
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Attached army", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg",
					value: character.armyId ?? "",
					onChange: (e) => onChange({ armyId: e.target.value || void 0 }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "None"
					}), host.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: a.id,
						children: ["Banner · str ", a.strength]
					}, a.id))]
				})]
			})
		]
	});
}
var AGES = [
	{
		id: "tribal",
		label: "Tribal",
		popValue: 5e3,
		foodMult: 1,
		yearsPerSession: 5
	},
	{
		id: "bronze",
		label: "Bronze",
		popValue: 15e3,
		foodMult: 1.1,
		yearsPerSession: 10
	},
	{
		id: "classical",
		label: "Classical",
		popValue: 27500,
		foodMult: 1.2,
		yearsPerSession: 20
	},
	{
		id: "crown",
		label: "Crown",
		popValue: 5e4,
		foodMult: 1.25,
		yearsPerSession: 10
	},
	{
		id: "early-modern",
		label: "Early Modern",
		popValue: 1e5,
		foodMult: 1.4,
		yearsPerSession: 5
	}
];
function ageById(id) {
	return AGES.find((a) => a.id === id) ?? AGES[1];
}
var KEY$7 = "inkunzi.session.v1";
var DEFAULT_SESSION = {
	name: "Inkunzi",
	mechanicalTurn: 1,
	calendarDay: 1,
	daysPerTurn: 14,
	mapWidth: 6145,
	mapHeight: 3530,
	pixelsPerDayMarch: 80,
	popValue: 15e3,
	ageId: "bronze",
	workRate: 2,
	ration: 1
};
function loadSession() {
	if (typeof window === "undefined") return DEFAULT_SESSION;
	try {
		const raw = window.localStorage.getItem(KEY$7);
		if (!raw) return DEFAULT_SESSION;
		return {
			...DEFAULT_SESSION,
			...JSON.parse(raw)
		};
	} catch {
		return DEFAULT_SESSION;
	}
}
function saveSession(session) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$7, JSON.stringify(session));
	} catch {}
}
function advanceDay(session) {
	return {
		...session,
		calendarDay: session.calendarDay + 1
	};
}
function advanceTurn(session) {
	return {
		...session,
		mechanicalTurn: session.mechanicalTurn + 1,
		calendarDay: session.calendarDay + session.daysPerTurn
	};
}
function setAge(session, ageId) {
	const age = ageById(ageId);
	return {
		...session,
		ageId: age.id,
		popValue: age.popValue
	};
}
function SessionWindow({ session, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Table name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg",
					value: session.name,
					onChange: (e) => onChange({
						...session,
						name: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Age", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg",
					value: session.ageId,
					onChange: (e) => onChange(setAge(session, e.target.value)),
					children: AGES.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: a.id,
						children: [
							a.label,
							" · ",
							a.popValue.toLocaleString(),
							" / pop"
						]
					}, a.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted tabular",
				children: [
					"People per painted dot: ",
					session.popValue.toLocaleString(),
					". New dots stay rare; the value jumps when the age advances."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted",
						children: ["Days / tick", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg",
							value: session.daysPerTurn,
							onChange: (e) => onChange({
								...session,
								daysPerTurn: Number(e.target.value) || session.daysPerTurn
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted",
						children: ["Px / day march", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg",
							value: session.pixelsPerDayMarch,
							onChange: (e) => onChange({
								...session,
								pixelsPerDayMarch: Number(e.target.value) || session.pixelsPerDayMarch
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted",
						children: ["Work rate", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg",
							value: session.workRate,
							onChange: (e) => onChange({
								...session,
								workRate: Number(e.target.value) || session.workRate
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted",
						children: ["Ration", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg",
							value: session.ration,
							onChange: (e) => onChange({
								...session,
								ration: Number(e.target.value) || session.ration
							})
						})]
					})
				]
			})
		]
	});
}
function TopBar({ session, staffLive, openWars, log, onStaffLive, onDay, onSaturday, onFriday, onClock, onQueue, onExport, onImport }) {
	const age = ageById(session.ageId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "ink-hairline relative z-chrome flex shrink-0 items-center gap-2 bg-surface px-2 py-1.5 sm:px-3 sm:py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 shrink-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
					color: "#4d8a3a",
					size: 26,
					title: "Inkunzi"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden min-w-0 sm:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-sm leading-none tracking-[0.18em] text-gold",
						children: "INKUNZI"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] text-muted",
						children: session.name
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex min-w-0 flex-col items-center rounded-sm border border-gold-dim bg-bg px-3 py-1 sm:px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display text-sm tracking-widest text-fg tabular",
					children: ["TURN ", session.mechanicalTurn]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden text-[11px] text-muted tabular sm:block",
					children: [
						age.label,
						" · Day ",
						session.calendarDay,
						" · ",
						session.popValue.toLocaleString(),
						" / pop"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "hidden max-w-xs truncate text-[11px] text-muted xl:block",
						children: log
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-9 items-center gap-2 rounded-sm border border-border bg-raised px-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: staffLive,
							onChange: (e) => onStaffLive(e.target.checked)
						}), "Staff"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "gold",
						onClick: onFriday,
						children: ["Friday", openWars ? ` ${openWars}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "staff",
						onClick: onSaturday,
						children: "Saturday"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden items-center gap-1.5 md:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: onQueue,
								children: "Queue"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: onDay,
								children: "+Day"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: onClock,
								children: "Clock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: onExport,
								children: "Export"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex min-h-9 cursor-pointer items-center rounded-sm border border-border bg-raised px-3 text-sm",
								children: ["Import", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "application/json",
									className: "hidden",
									onChange: (e) => {
										const file = e.target.files?.[0];
										if (file) onImport(file);
										e.target.value = "";
									}
								})]
							})
						]
					})
				]
			})
		]
	});
}
function Outliner({ nations, pops, armies, characters, wars, session, selectedNationId, onAdd, onOpenNation, onOpenCharacter, onSelectArmy }) {
	const counts = countPopsByOwner(pops);
	const [name, setName] = (0, import_react.useState)("");
	const open = wars.filter((w) => w.status === "declared");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "ink-scroll h-full w-full overflow-y-auto bg-surface p-3 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-display text-xs tracking-[0.16em] text-gold",
				children: "OUTLINER"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mb-3 flex gap-1",
				onSubmit: (e) => {
					e.preventDefault();
					if (!name.trim()) return;
					onAdd(name.trim());
					setName("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "h-10 min-w-0 flex-1 rounded-sm border border-border bg-raised px-2 text-sm",
					placeholder: "New nation",
					value: name,
					onChange: (e) => setName(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "h-10 px-3 text-xs",
					children: "Add"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: nations.filter((n) => n.id !== "unclaimed").map((n) => {
					const c = counts.get(n.id);
					const host = armies.filter((a) => a.ownerId === n.id);
					const rulers = characters.filter((ch) => ch.nationId === n.id);
					const selected = selectedNationId === n.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: selected ? "rounded-sm border border-gold-dim bg-raised p-2" : "rounded-sm p-2 hover:bg-raised",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex w-full items-center gap-2 text-left",
								onClick: () => onOpenNation(n.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crest, {
									color: n.color,
									size: 18
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: n.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 pl-7 text-[11px] text-muted tabular",
								children: [
									c?.pops ?? 0,
									" pops · ",
									formatPeople(c?.pops ?? 0, session.popValue)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pl-7 text-[11px] text-subtle tabular",
								children: [
									"$",
									n.treasury,
									" · stab ",
									n.stability,
									" · WS ",
									n.warSupport
								]
							}),
							host.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mt-1 block pl-7 text-left text-[11px] text-fg/80",
								onClick: () => onSelectArmy(a.id),
								children: ["Banner · ", Math.round(a.strength)]
							}, a.id)),
							rulers.map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mt-1 block pl-7 text-left text-[11px] text-gold",
								onClick: () => onOpenCharacter(ch.id),
								children: ch.name
							}, ch.id))
						]
					}, n.id);
				})
			}),
			open.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 text-[11px] tracking-[0.14em] text-gold",
					children: "FRIDAY"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-xs text-muted",
					children: open.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: w.title }, w.id))
				})]
			})
		]
	});
}
var STARTER_POPS = [
	{
		id: "p1",
		x: 811,
		y: 2254,
		ownerId: "vestoria",
		culture: "Eldari",
		religion: "Solar",
		settled: true,
		kind: "city"
	},
	{
		id: "p2",
		x: 851,
		y: 2214,
		ownerId: "vestoria",
		culture: "Eldari",
		religion: "Solar",
		settled: true,
		kind: "town"
	},
	{
		id: "p3",
		x: 891,
		y: 2174,
		ownerId: "vestoria",
		culture: "Eldari",
		religion: "Solar",
		settled: true,
		kind: "pop"
	},
	{
		id: "p4",
		x: 771,
		y: 2214,
		ownerId: "vestoria",
		culture: "Eldari",
		religion: "Solar",
		settled: true,
		kind: "fort"
	},
	{
		id: "p5",
		x: 1221,
		y: 1702,
		ownerId: "tunnu",
		culture: "Tunnu",
		religion: "Mountain Folk",
		settled: true,
		kind: "town"
	},
	{
		id: "p6",
		x: 1180,
		y: 1740,
		ownerId: "tunnu",
		culture: "Tunnu",
		religion: "Mountain Folk",
		settled: true,
		kind: "pop"
	},
	{
		id: "p7",
		x: 4958,
		y: 1788,
		ownerId: "rekolia",
		culture: "Rekolian",
		religion: "Hearth",
		settled: true,
		kind: "town"
	},
	{
		id: "p8",
		x: 4761,
		y: 1524,
		ownerId: "rekolia",
		culture: "Rekolian",
		religion: "Hearth",
		settled: true,
		kind: "pop"
	},
	{
		id: "p9",
		x: 4424,
		y: 2204,
		ownerId: "unclaimed",
		culture: "Steppe",
		religion: "Sky",
		settled: false,
		kind: "camp"
	}
];
var KEY$6 = "inkunzi.pops.v3";
var LEGACY_KEYS = ["inkunzi.pops.v2", "inkunzi.pops.v1"];
var NAME_TO_ID = {
	Vestoria: "vestoria",
	Tunnu: "tunnu",
	Rekolia: "rekolia",
	Unclaimed: "unclaimed",
	Horde: "unclaimed"
};
var KINDS = [
	"pop",
	"town",
	"city",
	"fort",
	"camp"
];
function resolveOwnerId(p) {
	const fromName = p.owner ? NAME_TO_ID[p.owner] : void 0;
	if (fromName && fromName !== "unclaimed") return fromName;
	if (p.ownerId && p.ownerId !== "unclaimed") return p.ownerId;
	return fromName || p.ownerId || "unclaimed";
}
function resolveKind(p) {
	if (p.kind && KINDS.includes(p.kind)) return p.kind;
	if (!p.settled) return "camp";
	return "pop";
}
function migrate(raw) {
	return raw.map((row) => {
		const p = row;
		return {
			id: p.id,
			x: p.x,
			y: p.y,
			ownerId: resolveOwnerId(p),
			culture: p.culture,
			religion: p.religion,
			settled: p.settled,
			kind: resolveKind(p)
		};
	});
}
function loadPops() {
	if (typeof window === "undefined") return STARTER_POPS;
	try {
		for (const key of [KEY$6, ...LEGACY_KEYS]) {
			const raw = window.localStorage.getItem(key);
			if (!raw) continue;
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length) return migrate(parsed);
		}
		return STARTER_POPS;
	} catch {
		return STARTER_POPS;
	}
}
function savePops(pops) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$6, JSON.stringify(pops));
	} catch {}
}
function makePop(x, y) {
	return {
		id: crypto.randomUUID(),
		x,
		y,
		ownerId: "unclaimed",
		culture: "Unknown",
		religion: "Unknown",
		settled: true,
		kind: "pop"
	};
}
function updatePop(pops, id, patch) {
	return pops.map((pop) => pop.id === id ? {
		...pop,
		...patch
	} : pop);
}
function removePop(pops, id) {
	return pops.filter((pop) => pop.id !== id);
}
function usePops() {
	const [pops, setPops] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setPops(loadPops());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		savePops(pops);
	}, [pops, ready]);
	return {
		pops,
		setPops,
		ready,
		place: (x, y) => setPops((cur) => [...cur, makePop(x, y)]),
		update: (id, patch) => setPops((cur) => updatePop(cur, id, patch)),
		remove: (id) => setPops((cur) => removePop(cur, id))
	};
}
function nation(partial) {
	return {
		treasury: 0,
		stability: 50,
		warSupport: 50,
		infamy: 0,
		manpower: 0,
		technology: 0,
		legitimacy: 50,
		centralisation: 50,
		districtSlots: 3,
		districts: [],
		resources: emptyLedger(),
		...partial
	};
}
var STARTER_NATIONS = [
	nation({
		id: "unclaimed",
		name: "Unclaimed",
		color: "#c8c4bc",
		stability: 50,
		warSupport: 0,
		legitimacy: 0
	}),
	nation({
		id: "vestoria",
		name: "Vestoria",
		color: "#4d8a3a",
		treasury: 100,
		stability: 52,
		warSupport: 55,
		legitimacy: 60,
		districts: [{
			id: "d-vestoria-farm",
			kind: "farm",
			tier: 1
		}],
		resources: {
			...emptyLedger(),
			food: 8,
			lumber: 2,
			stone: 2,
			metal: 3
		}
	}),
	nation({
		id: "tunnu",
		name: "Tunnu",
		color: "#3d6f8a",
		treasury: 80,
		stability: 50,
		warSupport: 60,
		legitimacy: 48,
		districts: [{
			id: "d-tunnu-fort",
			kind: "fort",
			tier: 1
		}],
		resources: {
			...emptyLedger(),
			food: 8,
			lumber: 2,
			stone: 2,
			metal: 3
		}
	}),
	nation({
		id: "rekolia",
		name: "Rekolia",
		color: "#a56a32",
		treasury: 40,
		stability: 45,
		warSupport: 40,
		legitimacy: 42,
		resources: {
			...emptyLedger(),
			food: 6,
			lumber: 2,
			stone: 2,
			metal: 1
		}
	})
];
var KEY$5 = "inkunzi.nations.v2";
var LEGACY_KEY = "inkunzi.nations.v1";
function slug(name) {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "nation";
}
function normalize(n) {
	const resources = {
		...emptyLedger(),
		...n.resources ?? {}
	};
	if (n.grain != null && resources.food === 0) resources.food = n.grain;
	return {
		id: n.id,
		name: n.name,
		color: n.color,
		treasury: n.treasury ?? 0,
		stability: n.stability ?? 50,
		warSupport: n.warSupport ?? 50,
		infamy: n.infamy ?? 0,
		manpower: n.manpower ?? 0,
		technology: n.technology ?? 0,
		legitimacy: n.legitimacy ?? 50,
		centralisation: n.centralisation ?? 50,
		districtSlots: n.districtSlots ?? 3,
		districts: n.districts ?? [],
		resources
	};
}
function mergeWithSeed(saved) {
	const byId = new Map(saved.map((n) => [n.id, n]));
	for (const seed of STARTER_NATIONS) if (!byId.has(seed.id)) byId.set(seed.id, seed);
	return STARTER_NATIONS.map((seed) => byId.get(seed.id) ?? seed).concat(saved.filter((n) => !STARTER_NATIONS.some((s) => s.id === n.id)));
}
function read() {
	if (typeof window === "undefined") return null;
	for (const key of [KEY$5, LEGACY_KEY]) {
		const raw = window.localStorage.getItem(key);
		if (!raw) continue;
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed) && parsed.length) return parsed.map(normalize);
	}
	return null;
}
function loadNations() {
	try {
		const saved = read();
		if (!saved) return STARTER_NATIONS;
		return mergeWithSeed(saved);
	} catch {
		return STARTER_NATIONS;
	}
}
function saveNations(nations) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$5, JSON.stringify(nations));
	} catch {}
}
function updateNation(nations, id, patch) {
	return nations.map((n) => n.id === id ? {
		...n,
		...patch
	} : n);
}
function makeNation(name, color = "#888888") {
	return {
		id: `${slug(name)}-${crypto.randomUUID().slice(0, 8)}`,
		name: name.trim() || "New Nation",
		color,
		treasury: 20,
		stability: 50,
		warSupport: 50,
		infamy: 0,
		manpower: 0,
		technology: 0,
		legitimacy: 50,
		centralisation: 50,
		districtSlots: 3,
		districts: [],
		resources: {
			...emptyLedger(),
			food: 8,
			lumber: 2,
			stone: 2,
			metal: 3
		}
	};
}
function addNation(nations, name, color) {
	return [...nations, makeNation(name, color)];
}
function useNations() {
	const [nations, setNations] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setNations(loadNations());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveNations(nations);
	}, [nations, ready]);
	return {
		nations,
		ready,
		update: (id, patch) => setNations((cur) => updateNation(cur, id, patch)),
		add: (name, color) => setNations((cur) => addNation(cur, name, color)),
		setNations
	};
}
var STARTER_NODES = [
	{
		id: "n1",
		x: 820,
		y: 2180,
		resourceId: "food",
		ownerId: "vestoria",
		yield: 1
	},
	{
		id: "n2",
		x: 780,
		y: 2260,
		resourceId: "lumber",
		ownerId: "vestoria",
		yield: 1
	},
	{
		id: "n3",
		x: 860,
		y: 2240,
		resourceId: "stone",
		ownerId: "vestoria",
		yield: 1
	},
	{
		id: "n4",
		x: 1220,
		y: 1680,
		resourceId: "stone",
		ownerId: "tunnu",
		yield: 1
	},
	{
		id: "n5",
		x: 1160,
		y: 1720,
		resourceId: "metal",
		ownerId: "tunnu",
		yield: 1
	},
	{
		id: "n6",
		x: 4900,
		y: 1760,
		resourceId: "metal",
		ownerId: "rekolia",
		yield: 1
	},
	{
		id: "n7",
		x: 5e3,
		y: 1820,
		resourceId: "food",
		ownerId: "rekolia",
		yield: 1
	}
];
var KEY$4 = "inkunzi.nodes.v1";
function loadNodes() {
	if (typeof window === "undefined") return STARTER_NODES;
	try {
		const raw = window.localStorage.getItem(KEY$4);
		if (!raw) return STARTER_NODES;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.length ? parsed : STARTER_NODES;
	} catch {
		return STARTER_NODES;
	}
}
function saveNodes(nodes) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$4, JSON.stringify(nodes));
	} catch {}
}
function makeNode(x, y, resourceId = "food") {
	return {
		id: crypto.randomUUID(),
		x,
		y,
		resourceId,
		ownerId: "unclaimed",
		yield: 1
	};
}
function updateNode(nodes, id, patch) {
	return nodes.map((n) => n.id === id ? {
		...n,
		...patch
	} : n);
}
function removeNode(nodes, id) {
	return nodes.filter((n) => n.id !== id);
}
function useNodes() {
	const [nodes, setNodes] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setNodes(loadNodes());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveNodes(nodes);
	}, [nodes, ready]);
	return {
		nodes,
		setNodes,
		ready,
		place: (x, y) => setNodes((cur) => [...cur, makeNode(x, y)]),
		update: (id, patch) => setNodes((cur) => updateNode(cur, id, patch)),
		remove: (id) => setNodes((cur) => removeNode(cur, id))
	};
}
var STARTER_ARMIES = [
	{
		id: "a-vestoria",
		x: 830,
		y: 2220,
		ownerId: "vestoria",
		strength: 40,
		composition: {
			shock: 8,
			ranged: 12,
			melee: 20
		}
	},
	{
		id: "a-tunnu",
		x: 1200,
		y: 1760,
		ownerId: "tunnu",
		strength: 28,
		composition: {
			shock: 10,
			ranged: 4,
			melee: 14
		}
	},
	{
		id: "a-rekolia",
		x: 4960,
		y: 1800,
		ownerId: "rekolia",
		strength: 16,
		composition: {
			shock: 2,
			ranged: 6,
			melee: 8
		}
	}
];
var KEY$3 = "inkunzi.armies.v1";
function loadArmies() {
	if (typeof window === "undefined") return STARTER_ARMIES;
	try {
		const raw = window.localStorage.getItem(KEY$3);
		if (!raw) return STARTER_ARMIES;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.length ? parsed : STARTER_ARMIES;
	} catch {
		return STARTER_ARMIES;
	}
}
function saveArmies(armies) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$3, JSON.stringify(armies));
	} catch {}
}
function makeArmy(x, y) {
	return {
		id: crypto.randomUUID(),
		x,
		y,
		ownerId: "unclaimed",
		strength: 10,
		composition: {
			shock: 2,
			ranged: 3,
			melee: 5
		}
	};
}
function updateArmy(armies, id, patch) {
	return armies.map((a) => a.id === id ? {
		...a,
		...patch
	} : a);
}
function removeArmy(armies, id) {
	return armies.filter((a) => a.id !== id);
}
function useArmies() {
	const [armies, setArmies] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setArmies(loadArmies());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveArmies(armies);
	}, [armies, ready]);
	return {
		armies,
		setArmies,
		ready,
		place: (x, y) => setArmies((cur) => [...cur, makeArmy(x, y)]),
		update: (id, patch) => setArmies((cur) => updateArmy(cur, id, patch)),
		remove: (id) => setArmies((cur) => removeArmy(cur, id))
	};
}
function useSession() {
	const [session, setSession] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setSession(loadSession());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!session) return;
		saveSession(session);
	}, [session]);
	return {
		session,
		setSession
	};
}
function laneDefaults(kind) {
	if (kind === "march" || kind === "build") return {
		lane: 1,
		auto: true
	};
	if (kind === "convert") return {
		lane: 2,
		needsRoll: true,
		dc: 15
	};
	if (kind === "spy" || kind === "flavor") return {
		lane: 2,
		needsRoll: true,
		dc: 12
	};
	return { lane: 3 };
}
var KEY$2 = "inkunzi.actions.v1";
function loadActions() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY$2);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function saveActions(actions) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$2, JSON.stringify(actions));
	} catch {}
}
function makeAction(kind, title, detail, extra = {}) {
	return {
		id: crypto.randomUUID(),
		kind,
		title,
		detail,
		status: "pending",
		result: "unset",
		...laneDefaults(kind),
		...extra
	};
}
function useActions() {
	const [actions, setActions] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setActions(loadActions());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveActions(actions);
	}, [actions, ready]);
	return {
		actions,
		setActions,
		ready,
		add: (action) => setActions((cur) => [action, ...cur]),
		setStatus: (id, status) => setActions((cur) => cur.map((a) => a.id === id ? {
			...a,
			status
		} : a)),
		setResult: (id, result) => setActions((cur) => cur.map((a) => a.id === id ? {
			...a,
			result,
			status: "accepted"
		} : a))
	};
}
var STARTER_CHARACTERS = [
	{
		id: "c-vestoria",
		name: "The Vestorian Emperor",
		nationId: "vestoria",
		prestige: 20,
		armyId: "a-vestoria",
		stats: {
			rulership: 4,
			charisma: 2,
			landTactics: 2,
			seaTactics: 0,
			intrigue: 1,
			business: 1
		}
	},
	{
		id: "c-tunnu",
		name: "Speaker of Tunnu",
		nationId: "tunnu",
		prestige: 14,
		armyId: "a-tunnu",
		stats: {
			rulership: 3,
			charisma: 1,
			landTactics: 3,
			seaTactics: 0,
			intrigue: 2,
			business: 1
		}
	},
	{
		id: "c-rekolia",
		name: "Rekolian Seat",
		nationId: "rekolia",
		prestige: 8,
		stats: {
			rulership: 3,
			charisma: 3,
			landTactics: 1,
			seaTactics: 1,
			intrigue: 1,
			business: 1
		}
	}
];
var KEY$1 = "inkunzi.characters.v1";
function loadCharacters() {
	if (typeof window === "undefined") return STARTER_CHARACTERS;
	try {
		const raw = window.localStorage.getItem(KEY$1);
		if (!raw) return STARTER_CHARACTERS;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.length ? parsed : STARTER_CHARACTERS;
	} catch {
		return STARTER_CHARACTERS;
	}
}
function saveCharacters(characters) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$1, JSON.stringify(characters));
	} catch {}
}
function makeCharacter(name, nationId) {
	return {
		id: crypto.randomUUID(),
		name: name.trim() || "New Character",
		nationId,
		prestige: 0,
		stats: {
			rulership: 2,
			charisma: 2,
			landTactics: 2,
			seaTactics: 0,
			intrigue: 2,
			business: 2
		}
	};
}
function updateCharacter(list, id, patch) {
	return list.map((c) => c.id === id ? {
		...c,
		...patch
	} : c);
}
function useCharacters() {
	const [characters, setCharacters] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setCharacters(loadCharacters());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveCharacters(characters);
	}, [characters, ready]);
	return {
		characters,
		setCharacters,
		ready,
		add: (name, nationId) => setCharacters((cur) => [...cur, makeCharacter(name, nationId)]),
		update: (id, patch) => setCharacters((cur) => updateCharacter(cur, id, patch))
	};
}
var KEY = "inkunzi.wars.v1";
function loadWars() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function saveWars(wars) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY, JSON.stringify(wars));
	} catch {}
}
function makeWar(attacker, defender, terrain = "open", names) {
	const atk = names?.attacker ?? attacker.ownerId;
	const def = names?.defender ?? defender.ownerId;
	return {
		id: crypto.randomUUID(),
		attackerArmyId: attacker.id,
		defenderArmyId: defender.id,
		attackerNationId: attacker.ownerId,
		defenderNationId: defender.ownerId,
		title: `${atk} marches on ${def}`,
		terrain,
		status: "declared"
	};
}
function findOpenWar(wars, a, b) {
	return wars.find((w) => w.status === "declared" && (w.attackerArmyId === a && w.defenderArmyId === b || w.attackerArmyId === b && w.defenderArmyId === a));
}
function updateWar(wars, id, patch) {
	return wars.map((w) => w.id === id ? {
		...w,
		...patch
	} : w);
}
function useWars() {
	const [wars, setWars] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setWars(loadWars());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveWars(wars);
	}, [wars, ready]);
	return {
		wars,
		setWars,
		ready,
		add: (war) => setWars((cur) => [war, ...cur]),
		update: (id, patch) => setWars((cur) => updateWar(cur, id, patch))
	};
}
function taxFromPops(popCount) {
	return popCount * 1;
}
function buildingMult(nation) {
	return 1 + nation.districts.filter((d) => d.kind === "farm").reduce((sum, d) => sum + d.tier * .1, 0);
}
function foodProduced(settledCount, session, mult = 1) {
	const age = ageById(session.ageId);
	return Math.round(settledCount * session.workRate * age.foodMult * mult);
}
function foodEaten(popCount, session) {
	return Math.round(popCount * session.ration);
}
function armyUpkeep(strength) {
	return Math.max(0, Math.round(strength));
}
function tickNation(nation, pops, nodes, armies, session) {
	if (nation.id === "unclaimed") return {
		nation,
		log: []
	};
	const owned = pops.filter((p) => p.ownerId === nation.id);
	const settled = owned.filter((p) => p.settled).length;
	const host = armies.filter((a) => a.ownerId === nation.id);
	const resources = { ...nation.resources };
	const log = [];
	const produced = foodProduced(settled, session, buildingMult(nation));
	const eaten = foodEaten(owned.length, session);
	resources.food = (resources.food ?? 0) + produced - eaten;
	for (const def of RESOURCES) {
		if (def.id === "food") continue;
		const yieldSum = nodes.filter((n) => n.ownerId === nation.id && n.resourceId === def.id).reduce((sum, n) => sum + n.yield, 0);
		if (def.mode === "cap") resources[def.id] = yieldSum;
		else resources[def.id] = (resources[def.id] ?? 0) + yieldSum;
	}
	const upkeep = host.reduce((sum, a) => sum + armyUpkeep(a.strength), 0);
	const starving = (resources.food ?? 0) < 0;
	if (starving) log.push(`${nation.name} starved (−5 stability).`);
	const manpower = Math.floor(settled * session.popValue * .7);
	return {
		nation: {
			...nation,
			treasury: nation.treasury + taxFromPops(owned.length) - upkeep,
			resources,
			manpower,
			stability: starving ? nation.stability - 5 : nation.stability
		},
		log
	};
}
function tickAll(nations, pops, nodes, armies, session) {
	const log = [`Saturday tick — turn ${session.mechanicalTurn}.`];
	return {
		nations: nations.map((n) => {
			const row = tickNation(n, pops, nodes, armies, session);
			log.push(...row.log);
			return row.nation;
		}),
		log
	};
}
function buildSnapshot(session, nations, pops, nodes, armies, actions = [], characters = [], wars = []) {
	return {
		version: 1,
		session,
		nations,
		pops,
		nodes,
		armies,
		actions,
		characters,
		wars
	};
}
function parseSnapshot(raw) {
	const data = JSON.parse(raw);
	if (!data || data.version !== 1 || !data.session) throw new Error("Not an Inkunzi world file");
	return {
		...data,
		actions: data.actions ?? [],
		characters: data.characters ?? [],
		wars: data.wars ?? []
	};
}
function downloadSnapshot(snap) {
	const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${snap.session.name.replace(/\s+/g, "-").toLowerCase()}-t${snap.session.mechanicalTurn}.json`;
	a.click();
	URL.revokeObjectURL(url);
}
function makeWindow(kind, title, payload, x = 80, y = 80) {
	return {
		id: crypto.randomUUID(),
		kind,
		title,
		x,
		y,
		payload
	};
}
function TableApp() {
	const popsState = usePops();
	const nationsState = useNations();
	const nodesState = useNodes();
	const armiesState = useArmies();
	const { session, setSession } = useSession();
	const actionsState = useActions();
	const charactersState = useCharacters();
	const warsState = useWars();
	const [windows, setWindows] = (0, import_react.useState)([]);
	const [selectedArmyId, setSelectedArmyId] = (0, import_react.useState)(null);
	const [marchingArmyId, setMarchingArmyId] = (0, import_react.useState)(null);
	const [selectedNationId, setSelectedNationId] = (0, import_react.useState)("vestoria");
	const [log, setLog] = (0, import_react.useState)("Staffed table. Friday is war. Saturday is numbers.");
	const [staffLive, setStaffLive] = (0, import_react.useState)(true);
	const [dock, setDock] = (0, import_react.useState)("none");
	if (!(session && popsState.ready && nationsState.ready && nodesState.ready && armiesState.ready && actionsState.ready && charactersState.ready && warsState.ready) || !session || !setSession) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display tracking-[0.22em] text-gold",
				children: "INKUNZI"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Laying out the table…"
			})]
		})
	});
	const current = session;
	const { pops, setPops } = popsState;
	const { nations, setNations } = nationsState;
	const { actions, add: addAction, setStatus, setActions } = actionsState;
	const selectedNation = nations.find((n) => n.id === selectedNationId) ?? null;
	const openWars = warsState.wars.filter((w) => w.status === "declared").length;
	function exportWorld() {
		downloadSnapshot(buildSnapshot(current, nations, pops, nodesState.nodes, armiesState.armies, actions, charactersState.characters, warsState.wars));
	}
	async function importWorld(file) {
		const snap = parseSnapshot(await file.text());
		setSession(snap.session);
		setNations(snap.nations);
		setPops(snap.pops);
		nodesState.setNodes(snap.nodes);
		armiesState.setArmies(snap.armies);
		setActions(snap.actions ?? []);
		charactersState.setCharacters(snap.characters ?? []);
		warsState.setWars(snap.wars ?? []);
		setLog("World imported. If it is not on the sheet, it did not happen — until now.");
	}
	function pushWindow(kind, title, payload) {
		setWindows((cur) => {
			const existing = cur.find((w) => w.kind === kind && w.payload === payload);
			if (existing) return [...cur.filter((w) => w.id !== existing.id), existing];
			const slot = kind === "war" ? {
				x: 420,
				y: 72
			} : kind === "queue" ? {
				x: 92,
				y: 72
			} : kind === "session" ? {
				x: 360,
				y: 72
			} : {
				x: 460,
				y: 96 + cur.length * 16
			};
			const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
			const vh = typeof window === "undefined" ? 800 : window.innerHeight;
			const width = Math.min(352, vw - 24);
			const x = Math.min(Math.max(8, slot.x), Math.max(8, vw - width - 8));
			const y = Math.min(Math.max(52, slot.y), Math.max(52, vh - 160));
			return [...cur, makeWindow(kind, title, payload, x, y)];
		});
	}
	function openNation(id) {
		setSelectedNationId(id);
	}
	function openCharacter(id) {
		const c = charactersState.characters.find((x) => x.id === id);
		if (!c) return;
		pushWindow("character", c.name, c.id);
	}
	function applyMarch(armyId, x, y) {
		const moved = armiesState.armies.map((a) => a.id === armyId ? {
			...a,
			x,
			y
		} : a);
		const army = moved.find((a) => a.id === armyId);
		armiesState.setArmies(moved);
		setMarchingArmyId(null);
		setSelectedArmyId(null);
		if (!army) {
			setLog("Marched.");
			return;
		}
		const foe = firstContact(army, moved);
		if (!foe) {
			setLog("Peacetime march. No contact.");
			return;
		}
		if (findOpenWar(warsState.wars, army.id, foe.id)) {
			setLog("Contact — war already declared.");
			return;
		}
		const war = makeWar(army, foe, "open", {
			attacker: nations.find((n) => n.id === army.ownerId)?.name ?? army.ownerId,
			defender: nations.find((n) => n.id === foe.ownerId)?.name ?? foe.ownerId
		});
		warsState.add(war);
		addAction({ ...makeAction("war", war.title, "Field battle pending Friday", {
			armyId,
			nationId: army.ownerId,
			defenderArmyId: foe.id,
			warId: war.id,
			lane: 3,
			auto: false,
			status: "accepted"
		}) });
		setLog(`Contact — ${war.title}. Friday to resolve.`);
		pushWindow("war", "Friday wars", "board");
	}
	function moveArmy(id, x, y) {
		const army = armiesState.armies.find((a) => a.id === id);
		const title = `March ${nations.find((n) => n.id === army?.ownerId)?.name ?? "army"}`;
		const detail = `to ${Math.round(x)}, ${Math.round(y)}`;
		if (staffLive) {
			addAction({ ...makeAction("march", title, detail, {
				armyId: id,
				toX: x,
				toY: y,
				auto: true,
				status: "accepted"
			}) });
			applyMarch(id, x, y);
			return;
		}
		addAction(makeAction("march", title, detail, {
			armyId: id,
			toX: x,
			toY: y
		}));
		setLog("March queued for staff. Permission is not the outcome.");
		setMarchingArmyId(null);
	}
	function acceptAction(id) {
		const action = actions.find((a) => a.id === id);
		if (!action) return;
		if (action.kind === "march" && action.armyId != null && action.toX != null && action.toY != null) applyMarch(action.armyId, action.toX, action.toY);
		if (action.kind === "convert" && action.needsRoll) {
			const ruler = charactersState.characters.find((c) => c.nationId === action.nationId);
			const roll = checkStat(ruler?.stats.charisma ?? 0, action.dc ?? 15);
			actionsState.setResult(id, roll.result);
			setLog(`${ruler?.name ?? "A courtier"} rolls ${roll.roll}+${roll.stat}=${roll.total} vs DC ${roll.dc} — ${roll.result}.`);
			return;
		}
		setStatus(id, "accepted");
	}
	function resolveWar(id) {
		const war = warsState.wars.find((w) => w.id === id);
		if (!war || war.status !== "declared") return;
		const result = applyBattleToArmies(armiesState.armies, pops, war.attackerArmyId, war.defenderArmyId, war.terrain);
		armiesState.setArmies(result.armies);
		warsState.update(id, {
			status: "resolved",
			report: result.report ?? void 0
		});
		setLog(result.report?.summary ?? "Field resolved.");
	}
	function runTick() {
		const result = tickAll(nations, pops, nodesState.nodes, armiesState.armies, current);
		setNations(result.nations);
		setSession(advanceTurn(current));
		setLog(result.log.join(" "));
	}
	function queueConvert(nationId) {
		const n = nations.find((x) => x.id === nationId);
		addAction(makeAction("convert", `Convert in ${n?.name ?? nationId}`, "A priest writes. Staff will roll.", {
			nationId,
			needsRoll: true,
			dc: 15,
			lane: 2
		}));
		setLog("Conversion queued. Lane 2 — the dice color the result.");
		setDock("actions");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				session: current,
				staffLive,
				openWars,
				log,
				onStaffLive: setStaffLive,
				onDay: () => setSession(advanceDay(current)),
				onSaturday: runTick,
				onFriday: () => pushWindow("war", "Friday wars", "board"),
				onClock: () => pushWindow("session", "Session clock", "session"),
				onQueue: () => pushWindow("queue", "Action queue", "queue"),
				onExport: exportWorld,
				onImport: (file) => void importWorld(file)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldMapLoader, {
							mapWidth: current.mapWidth,
							mapHeight: current.mapHeight,
							marchRange: turnMarchRange(current),
							selectedArmyId,
							marchingArmyId,
							staffLive,
							pops,
							nodes: nodesState.nodes,
							armies: armiesState.armies,
							nations,
							onSelectArmy: (id) => {
								setSelectedArmyId(id);
								setMarchingArmyId(null);
								if (id) {
									const army = armiesState.armies.find((a) => a.id === id);
									if (army) setSelectedNationId(army.ownerId);
								}
							},
							onStartMarch: (id) => {
								setSelectedArmyId(id);
								setMarchingArmyId(id);
							},
							onMoveArmy: moveArmy,
							onPlacePop: (y, x) => popsState.place(x, y),
							onPlaceNode: (y, x) => nodesState.place(x, y),
							onPlaceArmy: (y, x) => armiesState.place(x, y),
							onUpdatePop: popsState.update,
							onRemovePop: popsState.remove,
							onUpdateNode: nodesState.update,
							onRemoveNode: nodesState.remove,
							onUpdateArmy: armiesState.update,
							onRemoveArmy: armiesState.remove
						})
					}),
					selectedNation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ink-panel ink-scroll absolute top-3 left-3 z-chrome hidden max-h-[calc(100%-4.5rem)] w-80 overflow-y-auto md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NationWindow, {
							nation: selectedNation,
							pops,
							characters: charactersState.characters,
							session: current,
							docked: true,
							onOpenCharacter: openCharacter,
							onChange: (patch) => nationsState.update(selectedNation.id, patch),
							onConvert: () => queueConvert(selectedNation.id),
							onClose: () => setSelectedNationId(null)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ink-panel absolute top-3 right-3 z-chrome hidden h-[calc(100%-4.5rem)] w-64 overflow-hidden lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outliner, {
							nations,
							pops,
							armies: armiesState.armies,
							characters: charactersState.characters,
							wars: warsState.wars,
							session: current,
							selectedNationId,
							onAdd: nationsState.add,
							onOpenNation: openNation,
							onOpenCharacter: openCharacter,
							onSelectArmy: (id) => {
								setSelectedArmyId(id);
								setMarchingArmyId(null);
							}
						})
					})
				]
			}),
			dock !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-16 z-chrome max-h-[60vh] overflow-hidden border-t border-gold-dim bg-surface md:hidden",
				children: dock === "actions" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionPanel, {
					actions,
					onSubmit: (title, detail) => addAction(makeAction("flavor", title, detail)),
					onAccept: acceptAction,
					onDeny: (id) => setStatus(id, "denied")
				}) : selectedNation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NationWindow, {
					nation: selectedNation,
					pops,
					characters: charactersState.characters,
					session: current,
					docked: true,
					onOpenCharacter: openCharacter,
					onChange: (patch) => nationsState.update(selectedNation.id, patch),
					onConvert: () => queueConvert(selectedNation.id),
					onClose: () => setDock("none")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-3 text-sm text-muted",
					children: "Pick a nation from the outliner."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "relative z-chrome flex shrink-0 border-t border-gold-dim bg-surface md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("min-h-12 flex-1", dock === "actions" && "bg-raised"),
						onClick: () => setDock((d) => d === "actions" ? "none" : "actions"),
						children: "Queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-12 flex-1",
						onClick: () => setDock("none"),
						children: "Map"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("min-h-12 flex-1", dock === "nations" && "bg-raised"),
						onClick: () => setDock((d) => d === "nations" ? "none" : "nations"),
						children: "Court"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "hidden border-t border-gold-dim bg-bg px-3 py-1 text-[11px] text-muted md:block",
				children: log
			}),
			windows.map((win) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(WindowFrame, {
				win,
				onFocus: (id) => setWindows((cur) => {
					const w = cur.find((x) => x.id === id);
					if (!w) return cur;
					return [...cur.filter((x) => x.id !== id), w];
				}),
				onMove: (id, x, y) => setWindows((cur) => cur.map((w) => w.id === id ? {
					...w,
					x,
					y
				} : w)),
				onClose: (id) => setWindows((cur) => cur.filter((w) => w.id !== id)),
				children: [
					win.kind === "nation" && (() => {
						const nation = nations.find((n) => n.id === win.payload);
						return nation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NationWindow, {
							nation,
							pops,
							characters: charactersState.characters,
							session: current,
							onOpenCharacter: openCharacter,
							onChange: (patch) => nationsState.update(nation.id, patch),
							onConvert: () => queueConvert(nation.id)
						}) : null;
					})(),
					win.kind === "queue" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionPanel, {
						actions,
						onSubmit: (title, detail) => addAction(makeAction("flavor", title, detail)),
						onAccept: acceptAction,
						onDeny: (id) => setStatus(id, "denied")
					}),
					win.kind === "war" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarWindow, {
						wars: warsState.wars,
						armies: armiesState.armies,
						nations,
						onTerrain: (id, terrain) => warsState.update(id, { terrain }),
						onResolve: resolveWar
					}),
					win.kind === "character" && (() => {
						const ch = charactersState.characters.find((c) => c.id === win.payload);
						return ch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterWindow, {
							character: ch,
							armies: armiesState.armies,
							onChange: (patch) => charactersState.update(ch.id, patch),
							onRolled: setLog
						}) : null;
					})(),
					win.kind === "session" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionWindow, {
						session: current,
						onChange: setSession
					})
				]
			}, win.id))
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableApp, {});
}
//#endregion
export { RESOURCES as a, compositionOf as i, Button as n, cn as r, routes_exports as t };
