import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-bjoMYz_w.js
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
var wrapSpan = 0;
function setMapWrap(width) {
	wrapSpan = width > 0 ? width : 0;
}
function distance(x1, y1, x2, y2) {
	let dx = x2 - x1;
	if (wrapSpan > 0) {
		if (dx > wrapSpan / 2) dx -= wrapSpan;
		else if (dx < -wrapSpan / 2) dx += wrapSpan;
	}
	return Math.hypot(dx, y2 - y1);
}
function inZocOf(army, other, radius = 64) {
	if (army.id === other.id) return false;
	return distance(army.x, army.y, other.x, other.y) <= radius;
}
function isRetreatNode(pop) {
	if (pop.kind === "camp") return false;
	if (pop.kind && RETREAT_KINDS.has(pop.kind)) return true;
	return pop.settled && pop.kind !== "pop";
}
function coverOf$1(army, pops) {
	const holds = pops.filter((p) => p.ownerId === army.ownerId && isRetreatNode(p));
	let covering = false;
	for (const pop of holds) {
		const d = distance(army.x, army.y, pop.x, pop.y);
		if (d <= 18) return "garrison";
		if (d <= 64) covering = true;
	}
	return covering ? "covering" : "field";
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
function stackKey(army, gap = 18) {
	return `${Math.round(army.x / gap)}_${Math.round(army.y / gap)}`;
}
function stackOffsets(armies, gap = 18) {
	const groups = /* @__PURE__ */ new Map();
	for (const army of armies) {
		const key = stackKey(army, gap);
		const group = groups.get(key) ?? [];
		group.push(army);
		groups.set(key, group);
	}
	const out = /* @__PURE__ */ new Map();
	for (const group of groups.values()) {
		if (group.length === 1) {
			out.set(group[0].id, {
				dx: 0,
				dy: 0
			});
			continue;
		}
		group.forEach((army, i) => {
			const ang = i / group.length * Math.PI * 2 - Math.PI / 2;
			out.set(army.id, {
				dx: Math.cos(ang) * 16,
				dy: Math.sin(ang) * 16
			});
		});
	}
	return out;
}
function stackedWith(army, armies, gap = 18) {
	const key = stackKey(army, gap);
	return armies.filter((a) => stackKey(a, gap) === key);
}
/** Shock → Early → Late. Staff may edit the three numbers per type later. */
var BATTLE_PHASES = [
	"shock",
	"early",
	"late"
];
/**
* Every named line fights every phase. Weight by Units type only.
* Mounted / Ranged / Melee × Shock / Early / Late.
*/
var PHASE_WEIGHTS = {
	shock: {
		shock: 1.4,
		ranged: .7,
		melee: .9
	},
	early: {
		shock: .8,
		ranged: 1.3,
		melee: 1
	},
	late: {
		shock: .7,
		ranged: .8,
		melee: 1.3
	}
};
var PHASE_LABEL = {
	shock: "Shock",
	early: "Early",
	late: "Late"
};
var UNIT_TYPES = [
	{
		id: "cavalry",
		label: "Cavalry",
		short: "Cav",
		role: "shock"
	},
	{
		id: "archers",
		label: "Archers",
		short: "Bow",
		role: "ranged"
	},
	{
		id: "infantry",
		label: "Infantry",
		short: "Ft",
		role: "melee"
	},
	{
		id: "levy",
		label: "Levy",
		short: "Levy",
		role: "melee"
	}
];
function unitTypeById(id) {
	return UNIT_TYPES.find((t) => t.id === id) ?? UNIT_TYPES[2];
}
function roleOf(typeId) {
	return unitTypeById(typeId).role;
}
var CONTACT_PX = 64;
function armiesInContact(a, b) {
	if (a.id === b.id) return false;
	if (a.ownerId === b.ownerId) return false;
	if (a.ownerId === "unclaimed" || b.ownerId === "unclaimed") return false;
	return distance(a.x, a.y, b.x, b.y) <= CONTACT_PX;
}
function firstContact(moved, armies) {
	return armies.find((a) => armiesInContact(moved, a)) ?? null;
}
function engagedEnemies(army, armies) {
	return armies.filter((a) => armiesInContact(army, a));
}
function unitsOf(army) {
	if (army.units && army.units.length) return army.units.map((u) => ({
		...u,
		fielded: Math.max(0, u.fielded)
	}));
	const c = army.composition;
	const total = c ? c.shock + c.ranged + c.melee : 0;
	if (c && total > 0) return [
		{
			id: `${army.id}-cav`,
			typeId: "cavalry",
			name: "Cavalry",
			fielded: c.shock
		},
		{
			id: `${army.id}-bow`,
			typeId: "archers",
			name: "Archers",
			fielded: c.ranged
		},
		{
			id: `${army.id}-ft`,
			typeId: "infantry",
			name: "Infantry",
			fielded: c.melee
		}
	].filter((u) => u.fielded > 0);
	const s = army.strength;
	return [
		{
			id: `${army.id}-cav`,
			typeId: "cavalry",
			name: "Cavalry",
			fielded: s * .2
		},
		{
			id: `${army.id}-bow`,
			typeId: "archers",
			name: "Archers",
			fielded: s * .3
		},
		{
			id: `${army.id}-ft`,
			typeId: "infantry",
			name: "Infantry",
			fielded: s * .5
		}
	];
}
function armyStrength(army) {
	const sum = unitsOf(army).reduce((n, u) => n + u.fielded, 0);
	if (army.units && army.units.length) return sum;
	return sum > 0 ? sum : army.strength;
}
function isGhost(army) {
	return armyStrength(army) <= 0;
}
function sideWiped(armies) {
	return armies.length === 0 || armies.every(isGhost);
}
function compositionOf(army) {
	const units = army.units;
	if (units && units.length) {
		const next = {
			shock: 0,
			ranged: 0,
			melee: 0
		};
		for (const u of units) next[roleOf(u.typeId)] += u.fielded;
		return next;
	}
	const c = army.composition;
	const total = c ? c.shock + c.ranged + c.melee : 0;
	if (c && total > 0) return c;
	return {
		shock: army.strength * .2,
		ranged: army.strength * .3,
		melee: army.strength * .5
	};
}
function eligibleJoiners(lead, enemies, armies) {
	return armies.filter((a) => {
		if (a.id === lead.id) return false;
		if (a.ownerId !== lead.ownerId) return false;
		if (isGhost(a)) return false;
		return enemies.some((e) => inZocOf(a, e));
	});
}
function suggestTerrain(defender, pops) {
	return coverOf$1(defender, pops) === "garrison" ? "fort" : "open";
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
function postureMod(army, side) {
	let m = 1;
	if (army.posture === "skirmish") m *= .7;
	if (army.posture === "entrenched" && side === "defender") m *= 1.2;
	if (army.posture === "forceMarched" && side === "defender") m *= .85;
	return m;
}
function power(army, phase, terrain, side) {
	const mods = terrainMods(terrain, side);
	const posture = postureMod(army, side);
	const w = PHASE_WEIGHTS[phase];
	let raw = 0;
	for (const u of unitsOf(army)) {
		const role = roleOf(u.typeId);
		raw += u.fielded * w[role] * mods.role[role];
	}
	return raw * mods.sideMod * posture;
}
function sidePower(armies, phase, terrain, side) {
	return armies.reduce((n, a) => n + power(a, phase, terrain, side), 0);
}
function applyUnitLoss(units, loss) {
	const live = units.map((u) => ({ ...u }));
	let remain = loss;
	const total = live.reduce((n, u) => n + u.fielded, 0);
	if (total <= 0) return live;
	for (const u of live) {
		const share = u.fielded / total * loss;
		const take = Math.min(u.fielded, share);
		u.fielded = Math.max(0, u.fielded - take);
		remain -= take;
	}
	if (remain > .01) for (const u of live) {
		if (remain <= 0) break;
		const take = Math.min(u.fielded, remain);
		u.fielded -= take;
		remain -= take;
	}
	return live;
}
function withUnits(army, units) {
	const strength = units.reduce((n, u) => n + u.fielded, 0);
	const comp = {
		shock: 0,
		ranged: 0,
		melee: 0
	};
	for (const u of units) comp[roleOf(u.typeId)] += u.fielded;
	return {
		...army,
		units,
		strength,
		composition: comp
	};
}
function distributeLoss(armies, loss) {
	const weights = armies.map((a) => Math.max(1e-4, armyStrength(a)));
	const sum = weights.reduce((n, w) => n + w, 0);
	return armies.map((army, i) => {
		const share = Math.max(0, loss * weights[i] / sum);
		return withUnits(army, applyUnitLoss(unitsOf(army), share));
	});
}
function tagsOf(armies, pops) {
	const tags = /* @__PURE__ */ new Set();
	for (const a of armies) {
		if (a.posture === "entrenched") tags.add("entrenched");
		if (a.posture === "forceMarched") tags.add("force-marched");
		if (a.posture === "skirmish") tags.add("skirmish");
		const cover = coverOf$1(a, pops);
		if (cover === "garrison") tags.add("garrison");
		if (cover === "covering") tags.add("covering");
	}
	return [...tags];
}
function snapshotLines(armies) {
	return armies.flatMap((army) => unitsOf(army).map((u) => ({
		armyId: army.id,
		nationId: army.ownerId,
		unitId: u.id,
		typeId: u.typeId,
		name: u.name || unitTypeById(u.typeId).label,
		fielded: u.fielded,
		remain: u.fielded,
		dead: 0
	})));
}
function closeLines(before, after) {
	return before.map((line) => {
		const army = after.find((a) => a.id === line.armyId);
		const remain = (army ? unitsOf(army).find((u) => u.id === line.unitId) : void 0)?.fielded ?? 0;
		return {
			...line,
			remain,
			dead: Math.max(0, line.fielded - remain)
		};
	});
}
function gradeBattle(opts) {
	if (opts.winner === "inconclusive" || opts.atkWins === opts.defWins) return "inconclusive";
	const winLoss = opts.winner === "attacker" ? opts.atkLoss : opts.defLoss;
	const loseLoss = opts.winner === "attacker" ? opts.defLoss : opts.atkLoss;
	const winField = opts.winner === "attacker" ? opts.atkFielded : opts.defFielded;
	const loseField = opts.winner === "attacker" ? opts.defFielded : opts.atkFielded;
	const odds = winField / Math.max(1, loseField);
	const lossRatio = loseLoss / Math.max(1, loseField);
	const winHurt = winLoss / Math.max(1, winField);
	if (winHurt >= .35 && winHurt >= lossRatio * .9 && !opts.wipe) return "pyrrhic";
	if (odds >= 2.2 && lossRatio >= .45 && winHurt < .15) return "legendary";
	if (opts.wipe && odds >= 1.4) return "crushing";
	if (odds >= 1.6 && lossRatio >= .35) return "crushing";
	if (winHurt >= .28 && lossRatio >= .25) return "hard fought";
	if (Math.abs(opts.atkWins - opts.defWins) === 1) return "narrow";
	if (lossRatio < .2 && !opts.wipe) return "narrow";
	return "hard fought";
}
var GRADE_LABEL = {
	legendary: "Legendary",
	crushing: "Crushing",
	"hard fought": "Hard fought",
	pyrrhic: "Pyrrhic",
	narrow: "Narrow",
	inconclusive: "Inconclusive"
};
function reportHeadline(grade, winner, phase) {
	if (winner === "inconclusive" || grade === "inconclusive") return "INCONCLUSIVE";
	const side = winner === "attacker" ? "ATTACKER" : "DEFENDER";
	const phaseBit = phase ? ` ${phase.toUpperCase()}` : "";
	return `${GRADE_LABEL[grade].toUpperCase()} ${side}${phaseBit} VICTORY`;
}
function summaryLine(grade, winner, decisive) {
	if (winner === "inconclusive" || grade === "inconclusive") return decisive ? `Inconclusive — last phase ${decisive}.` : "Inconclusive. Neither side takes the field.";
	const side = winner === "attacker" ? "attacker" : "defender";
	const phase = decisive ? ` on ${decisive}` : "";
	return `${GRADE_LABEL[grade]} ${side} victory${phase}.`;
}
function fieldCenter(attackers, defenders) {
	const field = [...attackers, ...defenders];
	return {
		x: field.reduce((s, a) => s + a.x, 0) / Math.max(1, field.length),
		y: field.reduce((s, a) => s + a.y, 0) / Math.max(1, field.length)
	};
}
function casualtiesOf(units) {
	const byNation = /* @__PURE__ */ new Map();
	for (const line of units) byNation.set(line.nationId, (byNation.get(line.nationId) ?? 0) + line.dead);
	return [...byNation.entries()].map(([nationId, dead]) => ({
		nationId,
		dead
	}));
}
function runPhase(id, atk, def, terrain) {
	const attackerPower = sidePower(atk, id, terrain, "attacker");
	const defenderPower = sidePower(def, id, terrain, "defender");
	const winner = Math.abs(attackerPower - defenderPower) < 1e-4 ? "draw" : attackerPower > defenderPower ? "attacker" : "defender";
	const winnerPower = winner === "defender" ? defenderPower : attackerPower;
	const loserPower = winner === "defender" ? attackerPower : defenderPower;
	let aLoss = Math.max(1, Math.floor(loserPower * .08));
	let dLoss = Math.max(1, Math.floor(loserPower * .08));
	if (winner === "attacker") {
		dLoss = Math.max(1, Math.floor(winnerPower * .18));
		aLoss = Math.max(1, Math.floor(loserPower * .08));
	} else if (winner === "defender") {
		aLoss = Math.max(1, Math.floor(winnerPower * .18));
		dLoss = Math.max(1, Math.floor(loserPower * .08));
	} else {
		aLoss = Math.max(1, Math.floor(attackerPower * .1));
		dLoss = Math.max(1, Math.floor(defenderPower * .1));
	}
	if (id === "late" && winner !== "draw") {
		if (winner === "attacker") dLoss = Math.floor(dLoss * 1.1);
		else aLoss = Math.floor(aLoss * 1.1);
	}
	const nextAtk = distributeLoss(atk, aLoss);
	const nextDef = distributeLoss(def, dLoss);
	return {
		atk: nextAtk,
		def: nextDef,
		wipe: sideWiped(nextAtk) || sideWiped(nextDef),
		result: {
			id,
			attackerPower: Math.round(attackerPower * 10) / 10,
			defenderPower: Math.round(defenderPower * 10) / 10,
			winner,
			attackerLoss: aLoss,
			defenderLoss: dLoss
		}
	};
}
function fieldedTotals(fielded, armyIds) {
	return fielded.filter((l) => armyIds.includes(l.armyId)).reduce((n, l) => n + l.fielded, 0);
}
function phaseView(opts) {
	const last = opts.phases[opts.phases.length - 1];
	const wipe = sideWiped(opts.atk) || sideWiped(opts.def);
	const atkLive = !sideWiped(opts.atk);
	const defLive = !sideWiped(opts.def);
	const atkWins = opts.phases.filter((p) => p.winner === "attacker").length;
	const defWins = opts.phases.filter((p) => p.winner === "defender").length;
	const atkFielded = fieldedTotals(opts.fielded, opts.atk.map((a) => a.id));
	const defFielded = fieldedTotals(opts.fielded, opts.def.map((a) => a.id));
	const atkLoss = opts.phases.reduce((n, p) => n + p.attackerLoss, 0);
	const defLoss = opts.phases.reduce((n, p) => n + p.defenderLoss, 0);
	let winner;
	if (wipe) winner = atkLive ? "attacker" : defLive ? "defender" : "inconclusive";
	else if (opts.live) winner = !last || last.winner === "draw" ? "inconclusive" : last.winner;
	else if (atkWins === defWins) winner = "inconclusive";
	else winner = atkWins > defWins ? "attacker" : "defender";
	const gradeWinsAtk = opts.live ? last?.winner === "attacker" ? 1 : 0 : atkWins;
	const gradeWinsDef = opts.live ? last?.winner === "defender" ? 1 : 0 : defWins;
	const gradeLossAtk = opts.live ? last?.attackerLoss ?? atkLoss : atkLoss;
	const gradeLossDef = opts.live ? last?.defenderLoss ?? defLoss : defLoss;
	const grade = gradeBattle({
		winner,
		wipe,
		atkFielded,
		defFielded,
		atkLoss: gradeLossAtk,
		defLoss: gradeLossDef,
		atkWins: gradeWinsAtk,
		defWins: gradeWinsDef
	});
	const decisive = opts.live ? last?.id ?? null : winner === "inconclusive" ? null : [...opts.phases].reverse().find((p) => p.winner === winner)?.id ?? last?.id ?? null;
	const units = closeLines(opts.fielded, [...opts.atk, ...opts.def]);
	const { x, y } = fieldCenter(opts.atk, opts.def);
	return {
		attackerIds: opts.atk.map((a) => a.id),
		defenderIds: opts.def.map((a) => a.id),
		terrain: opts.terrain,
		phases: opts.phases,
		winner,
		wipe,
		grade,
		decisivePhase: winner === "inconclusive" ? opts.live ? last?.id ?? null : null : decisive,
		attackerTags: opts.attackerTags,
		defenderTags: opts.defenderTags,
		units,
		casualtiesByNation: casualtiesOf(units),
		attackerLoss: atkLoss,
		defenderLoss: defLoss,
		summary: summaryLine(grade, winner, winner === "inconclusive" ? null : decisive),
		x,
		y
	};
}
function settleField(opts) {
	let atk = opts.attackers.map((a, i) => i === 0 ? {
		...a,
		actionUsed: true
	} : { ...a });
	let def = opts.defenders.map((a) => ({ ...a }));
	if (opts.winner === "attacker" && atk[0]) {
		atk = atk.map((a, i) => i === 0 ? {
			...a,
			x: opts.occupyX,
			y: opts.occupyY,
			actionUsed: true,
			moveUsed: opts.leftoverAtk ? false : true
		} : a);
		if (!opts.wipe) def = def.map((a) => isGhost(a) ? a : retreatTowardTown(a, atk[0], opts.pops));
	} else if (opts.winner === "defender" && def[0]) {
		def = def.map((a, i) => i === 0 ? {
			...a,
			moveUsed: opts.leftoverDef ? false : a.moveUsed
		} : a);
		if (!opts.wipe) atk = atk.map((a) => isGhost(a) ? a : retreatTowardTown(a, def[0], opts.pops));
	}
	const updated = new Map([...atk, ...def].map((a) => [a.id, a]));
	return opts.armies.map((a) => updated.get(a.id) ?? a);
}
function mergeReelArmies(armies, reel) {
	const updated = new Map([...reel.attackers, ...reel.defenders].map((a) => [a.id, a]));
	return armies.map((a) => updated.get(a.id) ?? a);
}
function packReel(opts) {
	const report = phaseView({
		atk: opts.atk,
		def: opts.def,
		fielded: opts.fielded,
		phases: opts.phases,
		terrain: opts.terrain,
		attackerTags: opts.attackerTags,
		defenderTags: opts.defenderTags,
		live: true
	});
	return {
		index: opts.index,
		frozen: false,
		leftoverAtk: opts.leftoverAtk,
		leftoverDef: opts.leftoverDef,
		occupyX: opts.occupyX,
		occupyY: opts.occupyY,
		attackers: opts.atk,
		defenders: opts.def,
		fielded: opts.fielded,
		terrain: opts.terrain,
		attackerTags: opts.attackerTags,
		defenderTags: opts.defenderTags,
		phases: opts.phases,
		report,
		done: opts.done || report.wipe
	};
}
function startReel(opts) {
	const terrain = opts.terrain ?? "open";
	const pops = opts.pops ?? [];
	const atk0 = opts.attackers.map((a) => withUnits(a, unitsOf(a)));
	const def0 = opts.defenders.map((a) => withUnits(a, unitsOf(a)));
	const occupy = def0[0] ?? atk0[0];
	const step = runPhase("shock", atk0, def0, terrain);
	return packReel({
		index: 0,
		leftoverAtk: !opts.attackers[0]?.moveUsed,
		leftoverDef: !opts.defenders[0]?.moveUsed,
		occupyX: occupy?.x ?? 0,
		occupyY: occupy?.y ?? 0,
		atk: step.atk,
		def: step.def,
		fielded: [...snapshotLines(atk0), ...snapshotLines(def0)],
		terrain,
		attackerTags: tagsOf(opts.attackers, pops),
		defenderTags: tagsOf(opts.defenders, pops),
		phases: [step.result],
		done: step.wipe
	});
}
function applyStaffRemain(reel, remains) {
	const map = new Map(remains.map((r) => [r.unitId, Math.max(0, r.remain)]));
	const patch = (army) => withUnits(army, unitsOf(army).map((u) => map.has(u.id) ? {
		...u,
		fielded: map.get(u.id)
	} : u));
	const atk = reel.attackers.map(patch);
	const def = reel.defenders.map(patch);
	const wipe = sideWiped(atk) || sideWiped(def);
	return packReel({
		index: reel.index,
		leftoverAtk: reel.leftoverAtk,
		leftoverDef: reel.leftoverDef,
		occupyX: reel.occupyX,
		occupyY: reel.occupyY,
		atk,
		def,
		fielded: reel.fielded,
		terrain: reel.terrain,
		attackerTags: reel.attackerTags,
		defenderTags: reel.defenderTags,
		phases: reel.phases,
		done: reel.done || wipe
	});
}
function overallReport(reel) {
	return phaseView({
		atk: reel.attackers,
		def: reel.defenders,
		fielded: reel.fielded,
		phases: reel.phases,
		terrain: reel.terrain,
		attackerTags: reel.attackerTags,
		defenderTags: reel.defenderTags,
		live: false
	});
}
function closeReel(reel, armies, pops) {
	const report = overallReport(reel);
	return {
		armies: settleField({
			armies,
			pops,
			attackers: reel.attackers,
			defenders: reel.defenders,
			winner: report.winner,
			wipe: report.wipe,
			leftoverAtk: reel.leftoverAtk,
			leftoverDef: reel.leftoverDef,
			occupyX: reel.occupyX,
			occupyY: reel.occupyY
		}),
		report
	};
}
function playOutReel(reel) {
	let current = {
		...reel,
		frozen: false
	};
	while (!current.done) {
		const nextId = BATTLE_PHASES[current.index + 1];
		if (!nextId) return {
			...current,
			done: true
		};
		const step = runPhase(nextId, current.attackers, current.defenders, current.terrain);
		current = packReel({
			index: current.index + 1,
			leftoverAtk: current.leftoverAtk,
			leftoverDef: current.leftoverDef,
			occupyX: current.occupyX,
			occupyY: current.occupyY,
			atk: step.atk,
			def: step.def,
			fielded: current.fielded,
			terrain: current.terrain,
			attackerTags: current.attackerTags,
			defenderTags: current.defenderTags,
			phases: [...current.phases, step.result],
			done: step.wipe || nextId === "late"
		});
	}
	return current;
}
function continueReel(reel, armies, pops = [], staff) {
	let current = staff?.length ? applyStaffRemain(reel, staff) : {
		...reel,
		frozen: false
	};
	if (reel.done) {
		const closed = closeReel(current, armies, pops);
		return {
			reel: null,
			armies: closed.armies,
			report: closed.report,
			occupied: true
		};
	}
	if (current.done) return {
		reel: current,
		armies: mergeReelArmies(armies, current),
		report: current.report,
		occupied: false
	};
	const nextId = BATTLE_PHASES[current.index + 1];
	if (!nextId) {
		const closed = closeReel(current, armies, pops);
		return {
			reel: null,
			armies: closed.armies,
			report: closed.report,
			occupied: true
		};
	}
	const step = runPhase(nextId, current.attackers, current.defenders, current.terrain);
	const next = packReel({
		index: current.index + 1,
		leftoverAtk: current.leftoverAtk,
		leftoverDef: current.leftoverDef,
		occupyX: current.occupyX,
		occupyY: current.occupyY,
		atk: step.atk,
		def: step.def,
		fielded: current.fielded,
		terrain: current.terrain,
		attackerTags: current.attackerTags,
		defenderTags: current.defenderTags,
		phases: [...current.phases, step.result],
		done: step.wipe || nextId === "late"
	});
	return {
		reel: next,
		armies: mergeReelArmies(armies, next),
		report: next.report,
		occupied: false
	};
}
function strikeGhost(armies, attackerId, ghostId) {
	const ghost = armies.find((a) => a.id === ghostId);
	const atk = armies.find((a) => a.id === attackerId);
	if (!ghost || !atk || !isGhost(ghost) || isGhost(atk)) return armies;
	return armies.filter((a) => a.id !== ghostId).map((a) => a.id === attackerId ? {
		...a,
		actionUsed: true
	} : a);
}
var MAP_MIN_W = 2048;
var MAP_MIN_H = 1176;
var MAP_MAX_W = 48e3;
var MAP_MAX_H = 28e3;
var MAP_PRESETS = [
	{
		id: "small",
		label: "Small",
		w: 3072,
		h: 1764
	},
	{
		id: "table",
		label: "Table",
		w: 6145,
		h: 3530
	},
	{
		id: "grand",
		label: "Grand",
		w: 9218,
		h: 5295
	},
	{
		id: "vast",
		label: "Vast",
		w: 14400,
		h: 8100
	}
];
function clampMapSize(w, h) {
	return {
		width: Math.max(MAP_MIN_W, Math.min(MAP_MAX_W, Math.round(Number.isFinite(w) ? w : 6145))),
		height: Math.max(MAP_MIN_H, Math.min(MAP_MAX_H, Math.round(Number.isFinite(h) ? h : 3530)))
	};
}
/** Cells stay near 17px until the cap, then the ground stretches. */
function gridForMap(mapW, mapH) {
	const { width, height } = clampMapSize(mapW, mapH);
	if (width === 6145 && height === 3530) return {
		width,
		height,
		cols: 360,
		rows: 206
	};
	let cols = Math.max(64, Math.round(width / 17));
	let rows = Math.max(40, Math.round(height / 17));
	const scale = Math.max(1, cols / 800, rows / 450);
	cols = Math.max(64, Math.min(800, Math.round(cols / scale)));
	rows = Math.max(40, Math.min(450, Math.round(rows / scale)));
	return {
		width,
		height,
		cols,
		rows
	};
}
var RELIEF_LABEL = [
	"Ocean",
	"Shelf",
	"Lowland",
	"Hills",
	"Range",
	"Peak",
	"Ice"
];
var R_OCEAN = 0;
var R_SHELF = 1;
var R_LOW = 2;
var R_HILL = 3;
var R_RANGE = 4;
var R_PEAK = 5;
var R_ICE = 6;
var TERRAINS = [
	{
		id: 0,
		key: "ocean",
		label: "Ocean",
		color: "#0c3d66",
		height: 36
	},
	{
		id: 1,
		key: "coast",
		label: "Shelf",
		color: "#3ec6d4",
		height: 86
	},
	{
		id: 2,
		key: "plains",
		label: "Grainland",
		color: "#b5c44a",
		height: 118
	},
	{
		id: 3,
		key: "forest",
		label: "Forest",
		color: "#2f8f3c",
		height: 128
	},
	{
		id: 4,
		key: "hills",
		label: "Hills",
		color: "#a6844e",
		height: 158
	},
	{
		id: 5,
		key: "mountain",
		label: "Range",
		color: "#c4a07a",
		height: 206
	},
	{
		id: 6,
		key: "snow",
		label: "Ice",
		color: "#f4f7fb",
		height: 228
	},
	{
		id: 7,
		key: "marsh",
		label: "Marsh",
		color: "#3f7048",
		height: 100
	},
	{
		id: 8,
		key: "desert",
		label: "Desert",
		color: "#f0d59a",
		height: 122
	},
	{
		id: 9,
		key: "river",
		label: "River",
		color: "#2f86c4",
		height: 96
	},
	{
		id: 10,
		key: "lake",
		label: "Lake",
		color: "#1d6fa6",
		height: 78
	},
	{
		id: 11,
		key: "steppe",
		label: "Steppe",
		color: "#d4b15a",
		height: 120
	},
	{
		id: 12,
		key: "savanna",
		label: "Savanna",
		color: "#c48a3a",
		height: 122
	},
	{
		id: 13,
		key: "jungle",
		label: "Jungle",
		color: "#0e5c38",
		height: 126
	},
	{
		id: 14,
		key: "taiga",
		label: "Taiga",
		color: "#1f6a58",
		height: 130
	},
	{
		id: 15,
		key: "tundra",
		label: "Tundra",
		color: "#c9d4c6",
		height: 124
	},
	{
		id: 16,
		key: "seaice",
		label: "Sea ice",
		color: "#d5e7f2",
		height: 48
	}
];
var RGB = TERRAINS.map((t) => {
	const n = Number.parseInt(t.color.slice(1), 16);
	return [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	];
});
var LAYOUT_RECIPES = {
	earthlike: {
		sea: 46,
		warmth: 50,
		wetness: 50,
		mountains: 42,
		scale: 58,
		breakup: 50,
		gap: 70,
		wrap: true
	},
	continents: {
		sea: 48,
		warmth: 50,
		wetness: 50,
		mountains: 40,
		scale: 48,
		breakup: 55,
		gap: 40,
		wrap: true
	},
	pangaea: {
		sea: 40,
		warmth: 50,
		wetness: 50,
		mountains: 48,
		scale: 78,
		breakup: 30,
		gap: 70,
		wrap: true
	},
	archipelago: {
		sea: 58,
		warmth: 50,
		wetness: 50,
		mountains: 22,
		scale: 30,
		breakup: 70,
		gap: 70,
		wrap: true
	},
	islands: {
		sea: 62,
		warmth: 50,
		wetness: 50,
		mountains: 12,
		scale: 22,
		breakup: 80,
		gap: 70,
		wrap: true
	},
	theater: {
		sea: 42,
		warmth: 50,
		wetness: 50,
		mountains: 36,
		scale: 70,
		breakup: 35,
		gap: 70,
		wrap: false
	}
};
function breakupForLevel(base, level) {
	return Math.max(0, Math.min(100, Math.round(base + (level === "compact" ? -20 : level === "scattered" ? 20 : 0))));
}
var N8 = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
	[1, 1],
	[1, -1],
	[-1, 1],
	[-1, -1]
];
function hashSeed(seed) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return function rand() {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function makeNoise(rand) {
	const grid = /* @__PURE__ */ new Float32Array(65536);
	for (let i = 0; i < grid.length; i++) grid[i] = rand();
	return function sample(x, y) {
		const x0 = Math.floor(x) & 255;
		const y0 = Math.floor(y) & 255;
		const tx = x - Math.floor(x);
		const ty = y - Math.floor(y);
		const sx = tx * tx * (3 - 2 * tx);
		const sy = ty * ty * (3 - 2 * ty);
		const i00 = y0 * 256 + x0;
		const i10 = y0 * 256 + (x0 + 1 & 255);
		const i01 = (y0 + 1 & 255) * 256 + x0;
		const i11 = (y0 + 1 & 255) * 256 + (x0 + 1 & 255);
		const a = grid[i00] + (grid[i10] - grid[i00]) * sx;
		return a + (grid[i01] + (grid[i11] - grid[i01]) * sx - a) * sy;
	};
}
function fbm(noise, x, y, octaves) {
	let amp = .55;
	let sum = 0;
	let norm = 0;
	let freq = 1;
	for (let i = 0; i < octaves; i++) {
		sum += amp * noise(x * freq, y * freq);
		norm += amp;
		amp *= .5;
		freq *= 2.05;
	}
	return sum / norm;
}
function clamp01(n) {
	return Math.max(0, Math.min(1, n));
}
function byte(n) {
	return Math.max(0, Math.min(255, Math.round(n)));
}
function ridged(noise, x, y) {
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
		amp *= .48;
		freq *= 2.2;
	}
	return sum / norm;
}
/** Seamless on X. `freq` is how many times the pattern turns around the cylinder. */
function cylinder(noise, ang, ny, freq, octaves) {
	const radius = 28 * Math.max(.45, freq);
	const x = Math.cos(ang) * radius;
	const z = Math.sin(ang) * radius;
	return fbm(noise, x * .42 + 19, ny * freq * 5.5 + z * .28, octaves);
}
function coverOf(land, temp, moist, relief, ny, jag, cap = .5) {
	if (!land) {
		const pole = Math.min(ny, 1 - ny);
		const edge = .014 + cap * .092 + (jag - .5) * .042;
		if (pole < .008) return jag > .58 ? 0 : 16;
		if (pole < edge && jag < .84) return 16;
		return 0;
	}
	if (relief === R_ICE) return 6;
	if (relief >= R_PEAK) return temp < .22 ? 6 : 5;
	if (relief >= R_RANGE) return temp < .18 ? 6 : 5;
	if (temp < .12) return relief >= R_HILL ? 6 : 15;
	if (relief === R_LOW && moist > .7 && temp > .32 && temp < .7) return 7;
	if (temp > .56 && moist < .32) return 8;
	if (temp > .48 && moist < .46) return 12;
	if (temp > .54 && moist > .54) return 13;
	if (temp < .36 && moist > .38) return 14;
	if (temp < .52 && moist < .42) return 11;
	if (moist > .46 && temp > .24 && temp < .74) return 3;
	return 2;
}
function reliefOf(land, h, shelf) {
	if (!land) return shelf ? R_SHELF : R_OCEAN;
	if (h >= 214) return R_PEAK;
	if (h >= 172) return R_RANGE;
	if (h >= 140) return R_HILL;
	return R_LOW;
}
var CRUST_COLS = 360;
var CRUST_ROWS = 206;
function hpush(c, i, cost, index) {
	c.push(cost);
	i.push(index);
	let k = c.length - 1;
	while (k > 0) {
		const p = k - 1 >> 1;
		if (c[p] <= c[k]) break;
		const tc = c[p];
		const ti = i[p];
		c[p] = c[k];
		i[p] = i[k];
		c[k] = tc;
		i[k] = ti;
		k = p;
	}
}
function hpop(c, i) {
	if (!c.length) return null;
	const cost = c[0];
	const index = i[0];
	const lc = c.pop();
	const li = i.pop();
	if (c.length) {
		c[0] = lc;
		i[0] = li;
		let k = 0;
		for (;;) {
			const l = k * 2 + 1;
			const r = l + 1;
			let m = k;
			if (l < c.length && c[l] < c[m]) m = l;
			if (r < c.length && c[r] < c[m]) m = r;
			if (m === k) break;
			const tc = c[k];
			const ti = i[k];
			c[k] = c[m];
			i[k] = i[m];
			c[m] = tc;
			i[m] = ti;
			k = m;
		}
	}
	return [cost, index];
}
function neighborVote(plate, x, y, wc, wr, wrap) {
	let oceanN = 0;
	let landN = 0;
	let vote = -1;
	let voteN = 0;
	const tally = /* @__PURE__ */ new Int16Array(12);
	for (const [dx, dy] of N8) {
		const ny = y + dy;
		if (ny < 0 || ny >= wr) continue;
		let nx = x + dx;
		if (wrap) nx = (nx + wc) % wc;
		else if (nx < 0 || nx >= wc) continue;
		const p = plate[ny * wc + nx];
		if (p < 0) oceanN += 1;
		else {
			landN += 1;
			const id = p < tally.length ? p : 0;
			const c = tally[id] + 1;
			tally[id] = c;
			if (c > voteN) {
				voteN = c;
				vote = p;
			}
		}
	}
	return {
		oceanN,
		landN,
		vote
	};
}
function paintNamedBelts(chewed, wc, wr) {
	const belt = new Float32Array(wc * wr);
	const pass = new Uint8Array(wc * wr);
	const midLat = (y) => {
		if (y < 0 || y >= wr) return false;
		const ny = (y + .5) / wr;
		return Math.min(ny, 1 - ny) >= .1;
	};
	const inHemi = (x, hemi) => {
		const nx = x / wc;
		return hemi === "ow" ? nx >= .02 && nx <= .5 : nx >= .58 && nx <= .98;
	};
	const landAt = (x, y, hemi) => midLat(y) && inHemi(x, hemi) && chewed[y * wc + x] >= 0;
	const nearestLand = (x, y, hemi, rad) => {
		const x0 = Math.round(x);
		const y0 = Math.round(y);
		if (landAt(x0, y0, hemi)) return {
			x: x0,
			y: y0
		};
		let best = null;
		let bestD = 1e9;
		for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
			const xx = x0 + dx;
			const yy = y0 + dy;
			if (xx < 0 || xx >= wc || !landAt(xx, yy, hemi)) continue;
			const d = dx * dx + dy * dy;
			if (d < bestD) {
				bestD = d;
				best = {
					x: xx,
					y: yy
				};
			}
		}
		return best;
	};
	const bbox = (hemi) => {
		let minX = wc;
		let maxX = 0;
		let minY = wr;
		let maxY = 0;
		let n = 0;
		let sx = 0;
		let sy = 0;
		for (let y = 0; y < wr; y++) for (let x = 0; x < wc; x++) {
			if (!landAt(x, y, hemi)) continue;
			n += 1;
			sx += x;
			sy += y;
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}
		if (n < 80) return null;
		return {
			minX,
			maxX,
			minY,
			maxY,
			n,
			cx: sx / n,
			cy: sy / n
		};
	};
	const stamp = (x, y, hemi, asPass, t = .5) => {
		const waist = asPass ? 1 : .82 + Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * .28;
		const spineR = 1.35 * waist;
		const rangeR = 5.6 * waist;
		const hillR = 8.2 * waist;
		const r = Math.ceil(asPass ? 3.4 : hillR);
		for (let dy = -r; dy <= r; dy++) {
			const yy = y + dy;
			if (yy < 0 || yy >= wr || !midLat(yy)) continue;
			for (let dx = -r; dx <= r; dx++) {
				const xx = x + dx;
				if (xx < 0 || xx >= wc || !inHemi(xx, hemi)) continue;
				if (chewed[yy * wc + xx] < 0) continue;
				const d = Math.hypot(dx, dy);
				const j = yy * wc + xx;
				if (asPass) {
					if (d <= 3.4) pass[j] = 1;
					if (belt[j] < .38) belt[j] = .38;
					continue;
				}
				let v = 0;
				if (d <= spineR) v = 1;
				else if (d <= rangeR) v = .65;
				else if (d <= hillR) v = .38;
				if (v > belt[j]) belt[j] = v;
			}
		}
	};
	const box = bbox("ow");
	if (box) {
		const spanX = Math.max(8, box.maxX - box.minX);
		const spanY = Math.max(8, box.maxY - box.minY);
		const snap = (fx, fy) => {
			const tx = box.minX + spanX * fx;
			const ty = box.minY + spanY * fy;
			let best = null;
			let bestD = 1e9;
			for (let y = box.minY; y <= box.maxY; y++) for (let x = box.minX; x <= box.maxX; x++) {
				if (!landAt(x, y, "ow")) continue;
				const d = (x - tx) * (x - tx) + (y - ty) * (y - ty);
				if (d < bestD) {
					bestD = d;
					best = {
						x,
						y
					};
				}
			}
			return best;
		};
		const a = snap(.18, .28);
		const b = snap(.82, .74);
		if (a && b) {
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const len = Math.hypot(dx, dy) || 1;
			const px = -dy / len;
			const py = dx / len;
			const bow = box.cx + box.cy * .17 > wc * .22 ? .2 : -.2;
			const cx = (a.x + b.x) / 2 + px * spanX * bow;
			const cy = (a.y + b.y) / 2 + py * spanY * bow * .55;
			const steps = Math.max(16, Math.ceil(len * 1.2));
			for (let s = 0; s <= steps; s++) {
				const t = s / steps;
				const u = 1 - t;
				const x = u * u * a.x + 2 * u * t * cx + t * t * b.x;
				const y = u * u * a.y + 2 * u * t * cy + t * t * b.y;
				const wob = Math.sin(t * Math.PI * 2.6) * 2.8;
				const hit = nearestLand(x + px * wob, y + py * wob, "ow", 14);
				if (!hit) continue;
				stamp(hit.x, hit.y, "ow", t > .5 && t < .57, t);
			}
		}
	}
	const neu = bbox("nw");
	if (neu) for (let y = neu.minY; y <= neu.maxY; y++) {
		if (!midLat(y)) continue;
		let west = -1;
		let east = -1;
		for (let x = neu.minX; x <= neu.maxX; x++) {
			if (!landAt(x, y, "nw")) continue;
			if (west < 0) west = x;
			east = x;
		}
		if (west < 0 || east - west < 8) continue;
		const wob = Math.sin(y * .19) * 3.1 + Math.sin(y * .061 + .7) * 4.2;
		const hit = nearestLand(Math.min(east - 3, Math.max(west + 2, Math.round(west + 6 + wob))), y, "nw", 4);
		if (!hit) continue;
		const span = Math.max(1, neu.maxY - neu.minY);
		stamp(hit.x, hit.y, "nw", false, (y - neu.minY) / span);
	}
	for (let i = 0; i < belt.length; i++) if (pass[i] && belt[i] > .38) belt[i] = .38;
	return belt;
}
function sprinkleCrumbs(chewed, wc, wr, rand, many) {
	const stamp = (cx, cy, r) => {
		for (let dy = -r; dy <= r; dy++) {
			const y = cy + dy;
			if (y < 2 || y >= wr - 2) continue;
			for (let dx = -r; dx <= r; dx++) {
				if (dx * dx + dy * dy > r * r) continue;
				const x = cx + dx;
				if (x < 1 || x >= wc - 1) continue;
				const j = y * wc + x;
				if (chewed[j] >= 0) continue;
				let touch = false;
				for (const [ox, oy] of N8) {
					const yy = y + oy;
					const xx = x + ox;
					if (yy < 0 || yy >= wr || xx < 0 || xx >= wc) continue;
					if (chewed[yy * wc + xx] >= 0) touch = true;
				}
				if (touch) continue;
				chewed[j] = 6;
			}
		}
	};
	const disks = many ? 8 : 5;
	for (let k = 0; k < disks; k++) stamp(Math.floor(wc * (.505 + rand() * .065)), Math.floor(wr * (.28 + rand() * .44)), rand() < .35 ? 2 : 1);
	const y0 = Math.floor(wr * (.38 + rand() * .18));
	const x0 = Math.floor(wc * (.512 + rand() * .02));
	for (let s = 0; s < 6; s++) stamp(x0 + s * 2, y0 + Math.round(Math.sin(s * .9) * 1.4), 1);
}
function paintLesserRidge(belt, plate, cols, rows, rand) {
	let sx = -1;
	let sy = -1;
	for (let attempt = 0; attempt < 48; attempt++) {
		const x = Math.floor(rand() * cols);
		const y = Math.floor(rows * (.18 + rand() * .64));
		const i = y * cols + x;
		if (plate[i] < 0 || belt[i] > .2) continue;
		sx = x;
		sy = y;
		break;
	}
	if (sx < 0) return;
	const len = 16 + Math.floor(rand() * 14);
	const dir = rand() * Math.PI * 2;
	for (let s = 0; s < len; s++) {
		const t = len <= 1 ? .5 : s / (len - 1);
		const waist = .55 + Math.sin(t * Math.PI) * .45;
		const x = Math.round(sx + Math.cos(dir) * s * 1.35);
		const y = Math.round(sy + Math.sin(dir) * s * 1.05);
		const rad = 1.2 + waist * 1.6;
		const v = Math.min(.7, .42 + waist * .28);
		const r = Math.ceil(rad);
		for (let dy = -r; dy <= r; dy++) {
			const yy = y + dy;
			if (yy < 0 || yy >= rows) continue;
			for (let dx = -r; dx <= r; dx++) {
				if (dx * dx + dy * dy > rad * rad) continue;
				const xx = x + dx;
				if (xx < 0 || xx >= cols) continue;
				const j = yy * cols + xx;
				if (plate[j] < 0) continue;
				if (v > belt[j]) belt[j] = v;
			}
		}
	}
}
function raiseCrust(cols, rows, wrap, landFrac, scale, rand, elevN, warpN, warpN2, aspect, job) {
	const wc = CRUST_COLS;
	const wr = CRUST_ROWS;
	const wn = wc * wr;
	const count = 3 + Math.round((100 - scale) / 100 * 2);
	const stretches = [
		1.72,
		2.45,
		1.5,
		2.65,
		1.88
	];
	const seeds = [];
	const lobes = [];
	const necks = [];
	const place = (lobe) => {
		if (wrap) lobe.x = (lobe.x % wc + wc) % wc;
		else lobe.x = Math.max(6, Math.min(353, lobe.x));
		lobe.y = Math.max(3, Math.min(202, lobe.y));
		lobes.push(lobe);
		return lobe;
	};
	const layout = job?.layout ?? "earthlike";
	const breakupN = job?.breakup ?? 50;
	const gapN = job?.gap ?? 70;
	const sizeK = scale === 58 ? 1 : .55 + scale / 100;
	const placed = [];
	const mass = (nx, ny, along0, cross0, id, hooked) => {
		const dir = rand() * Math.PI * 2;
		const vx = Math.cos(dir);
		const vy = Math.sin(dir);
		const along = sizeK === 1 ? along0 : along0 * sizeK;
		const cross = Math.max(8, sizeK === 1 ? cross0 : cross0 * sizeK);
		seeds.push({
			x: nx,
			y: ny,
			vx,
			vy,
			polar: false,
			cap: wn,
			stretch: Math.max(1.05, along / cross)
		});
		const primary = place({
			x: nx * wc,
			y: ny * wr,
			vx,
			vy,
			along,
			cross,
			id,
			polar: false
		});
		placed.push({
			x: primary.x,
			y: primary.y,
			id
		});
		if (!hooked) return;
		const side = rand() < .5 ? 1 : -1;
		const hook = .62 + rand() * .5;
		const off = along * (.42 + rand() * .16);
		const hx = Math.cos(dir + side * hook);
		const hy = Math.sin(dir + side * hook);
		const cross2 = Math.max(10, cross * (.7 + rand() * .2));
		const secondary = place({
			x: nx * wc + hx * off,
			y: ny * wr + hy * off,
			vx: hx,
			vy: hy,
			along: along * (.5 + rand() * .16),
			cross: cross2,
			id,
			polar: false
		});
		let rad = Math.max(8, Math.min(cross, cross2) * .42);
		if (breakupN !== 50) rad *= Math.max(.4, 1 - (breakupN - 50) * .012);
		necks.push({
			ax: primary.x,
			ay: primary.y,
			bx: secondary.x,
			by: secondary.y,
			id,
			rad
		});
	};
	if (layout === "earthlike") {
		const nOw = Math.min(3, Math.max(2, count - 1));
		const nNw = Math.max(1, count - nOw);
		let ow0 = .08;
		let ow1 = .4;
		let nw0 = .64;
		let nw1 = .9;
		if (gapN !== 70) {
			const half = .12 * (gapN / 70);
			const mid = .52;
			ow1 = Math.max(.2, Math.min(.46, mid - half));
			nw0 = Math.max(.54, Math.min(.8, mid + half));
		}
		const bands = [{
			x0: ow0,
			x1: ow1,
			n: nOw
		}, {
			x0: nw0,
			x1: nw1,
			n: nNw
		}];
		for (const band of bands) for (let k = 0; k < band.n; k++) {
			const s = seeds.length;
			const x = band.x0 + (k + .42 + (rand() - .5) * .18) / band.n * (band.x1 - band.x0);
			const y = band.n > 1 && k === band.n - 1 ? .36 + rand() * .22 : .3 + rand() * .28;
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
			seeds.push({
				x,
				y,
				vx,
				vy,
				polar: false,
				cap: wn,
				stretch
			});
			const primary = place({
				x: x * wc,
				y: y * wr,
				vx,
				vy,
				along,
				cross,
				id: s,
				polar: false
			});
			const side = rand() < .5 ? 1 : -1;
			const hook = .62 + rand() * .5;
			const off = along * (.46 + rand() * .12);
			const hx = Math.cos(dir + side * hook);
			const hy = Math.sin(dir + side * hook);
			const cross2 = Math.max(24, cross * (.82 + rand() * .12));
			const secondary = place({
				x: x * wc + hx * off,
				y: y * wr + hy * off,
				vx: hx,
				vy: hy,
				along: along * (.58 + rand() * .14),
				cross: cross2,
				id: s,
				polar: false
			});
			let rad = Math.max(14, Math.min(cross, cross2) * .46);
			if (breakupN !== 50) rad *= Math.max(.42, 1 - (breakupN - 50) * .012);
			necks.push({
				ax: primary.x,
				ay: primary.y,
				bx: secondary.x,
				by: secondary.y,
				id: s,
				rad
			});
			placed.push({
				x: primary.x,
				y: primary.y,
				id: s
			});
		}
		for (let a = 0; a < placed.length; a++) for (let b = a + 1; b < placed.length; b++) {
			const A = placed[a];
			const B = placed[b];
			const ax = A.x / wc;
			const bx = B.x / wc;
			if (!(ax < .5 && bx < .5) && !(ax > .55 && bx > .55)) continue;
			let dx = B.x - A.x;
			if (wrap) {
				if (dx > wc * .5) dx -= wc;
				else if (dx < -180) dx += wc;
			}
			const dy = B.y - A.y;
			if (Math.hypot(dx, dy) > wc * .22) continue;
			let link = 11;
			if (breakupN !== 50) link *= Math.max(.42, 1 - (breakupN - 50) * .012);
			necks.push({
				ax: A.x,
				ay: A.y,
				bx: B.x,
				by: B.y,
				id: A.id,
				rad: link
			});
		}
	} else if (layout === "pangaea") {
		const x = .3 + rand() * .1;
		const y = .4 + rand() * .08;
		mass(x, y, 118 + rand() * 28, 68 + rand() * 8, 0, true);
		mass(Math.min(.78, x + .18 + rand() * .06), y - .04 + rand() * .1, 78 + rand() * 18, 44, 0, true);
		if (placed.length >= 2) necks.push({
			ax: placed[0].x,
			ay: placed[0].y,
			bx: placed[1].x,
			by: placed[1].y,
			id: 0,
			rad: 16 + rand() * 8
		});
	} else if (layout === "continents") {
		let n = 4;
		if (breakupN >= 68) n = 5;
		else if (breakupN <= 34) n = 3;
		if (scale >= 80) n = Math.max(3, n - 1);
		if (scale <= 28) n = Math.min(5, n + 1);
		const gutter = .02 + gapN / 100 * .07;
		for (let k = 0; k < n; k++) {
			const x = Math.max(.07, Math.min(.93, .06 + (k + .5) / n * .88 + (rand() - .5) * gutter));
			const y = .3 + rand() * .28;
			const along = 44 + rand() * 26;
			mass(x, y, along, Math.max(20, along / 2.2), k, breakupN < 62);
		}
	} else if (layout === "archipelago") {
		const n = Math.max(8, Math.min(16, 8 + Math.round((100 - scale) / 16) + Math.round((breakupN - 40) / 22)));
		for (let k = 0; k < n; k++) {
			const along = 13 + rand() * 15;
			mass(.06 + rand() * .88, .14 + rand() * .7, along, Math.max(8, along * (.42 + rand() * .28)), k, rand() < .22);
		}
	} else if (layout === "islands") {
		const n = Math.max(10, Math.min(20, 11 + Math.round(breakupN / 14)));
		for (let k = 0; k < n; k++) {
			const big = k === 0;
			const along = big ? 32 + rand() * 14 : 6 + rand() * 8;
			mass(.07 + rand() * .86, .12 + rand() * .74, along, Math.max(5, along * (big ? .52 : .62)), k, big);
		}
	} else mass(.5 + (rand() - .5) * .05, .47 + (rand() - .5) * .05, 148 + rand() * 18, 76 + rand() * 10, 0, true);
	const polarY = rand() < .5 ? .035 : .965;
	const pdir = rand() * Math.PI * 2;
	const polar = {
		x: rand(),
		y: polarY,
		vx: Math.cos(pdir),
		vy: Math.sin(pdir),
		polar: true,
		cap: Math.max(6, Math.round(wn * .008)),
		stretch: 1.12
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
		polar: true
	});
	const score = new Float32Array(wn);
	const who = new Int16Array(wn).fill(-1);
	for (let y = 0; y < wr; y++) {
		const ny = (y + .5) / wr;
		const pole = Math.min(ny, 1 - ny);
		for (let x = 0; x < wc; x++) {
			const i = y * wc + x;
			const ang = x / wc * Math.PI * 2;
			const broad = cylinder(elevN, ang, ny, .55, 2);
			const wob = (cylinder(warpN, ang + 1.15, ny, 6.2, 2) - .5) * .3 + (broad - .5) * .16;
			let best = 0;
			let id = -1;
			for (let L = 0; L < lobes.length; L++) {
				const lobe = lobes[L];
				if (lobe.polar && pole > .09) continue;
				let dx = x + .5 - lobe.x;
				if (wrap) {
					if (dx > wc * .5) dx -= wc;
					else if (dx < -180) dx += wc;
				}
				const dy = y + .5 - lobe.y;
				const along = dx * lobe.vx + dy * lobe.vy;
				const cross = -dx * lobe.vy + dy * lobe.vx;
				let d = Math.hypot(along / lobe.along, cross / lobe.cross) - (lobe.polar ? wob * .25 : wob);
				if (!lobe.polar && pole < .16) d += (.16 - pole) * 2.6;
				const inf = d >= 1.14 ? 0 : d <= .12 ? 1 : (1.14 - d) / 1.02;
				if (inf > best) {
					best = inf;
					id = lobe.id;
				}
			}
			score[i] = best;
			who[i] = id;
		}
	}
	const ranked = [];
	for (let i = 0; i < wn; i++) {
		const id = who[i];
		if (id >= 0 && !seeds[id].polar && score[i] > .05) ranked.push(score[i]);
	}
	ranked.sort((a, b) => b - a);
	const take = Math.max(8, Math.round(wn * landFrac));
	const cut = ranked[Math.min(ranked.length, take) - 1] ?? .45;
	const plate = new Int16Array(wn).fill(-1);
	const polarId = seeds.length - 1;
	const polarPick = [];
	for (let i = 0; i < wn; i++) {
		const id = who[i];
		if (id < 0) continue;
		if (id === polarId) {
			if (score[i] >= .52) polarPick.push(i);
			continue;
		}
		if (score[i] >= cut) plate[i] = id;
	}
	polarPick.sort((a, b) => score[b] - score[a]);
	const polarCap = seeds[polarId].cap;
	for (let k = 0; k < polarPick.length && k < polarCap; k++) plate[polarPick[k]] = polarId;
	for (const neck of necks) {
		let dx = neck.bx - neck.ax;
		if (wrap) {
			if (dx > wc * .5) dx -= wc;
			else if (dx < -180) dx += wc;
		}
		const dy = neck.by - neck.ay;
		const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
		const r = Math.ceil(neck.rad);
		for (let s = 0; s <= steps; s++) {
			const px = neck.ax + dx * s / steps;
			const py = neck.ay + dy * s / steps;
			for (let oy = -r; oy <= r; oy++) {
				const y = Math.round(py + oy);
				if (y < 2 || y >= 204) continue;
				for (let ox = -r; ox <= r; ox++) {
					if (ox * ox + oy * oy > neck.rad * neck.rad) continue;
					let x = Math.round(px + ox);
					if (wrap) x = (x % wc + wc) % wc;
					else if (x < 0 || x >= wc) continue;
					const ny = (y + .5) / wr;
					if (Math.min(ny, 1 - ny) < .08) continue;
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
			const ang = x / wc * Math.PI * 2;
			const wx = (cylinder(warpN, ang, ny, .62, 2) - .5) * 2 * ampX;
			const wy = (cylinder(warpN2, ang + .9, ny, .5, 2) - .5) * 2 * ampY;
			let sx = Math.round(x + wx);
			let sy = Math.round(y + wy);
			if (wrap) sx = (sx % wc + wc) % wc;
			else sx = Math.max(0, Math.min(359, sx));
			sy = Math.max(0, Math.min(205, sy));
			bent[y * wc + x] = plate[sy * wc + sx];
		}
	}
	const specks = new Int16Array(bent);
	for (let y = 0; y < wr; y++) for (let x = 0; x < wc; x++) {
		const i = y * wc + x;
		const nb = neighborVote(bent, x, y, wc, wr, wrap);
		if (bent[i] >= 0 && nb.oceanN >= 7) specks[i] = -1;
		else if (bent[i] < 0 && nb.landN >= 7) specks[i] = nb.vote;
	}
	const coast = new Float32Array(wn);
	for (let y = 0; y < wr; y++) {
		const ny = y / wr;
		for (let x = 0; x < wc; x++) coast[y * wc + x] = cylinder(warpN, x / wc * Math.PI * 2 + 1.7, ny, 2.7, 3);
	}
	const landD = new Uint8Array(wn);
	const seaD = new Uint8Array(wn);
	const qL = [];
	const qS = [];
	for (let y = 0; y < wr; y++) for (let x = 0; x < wc; x++) {
		const i = y * wc + x;
		const nb = neighborVote(specks, x, y, wc, wr, wrap);
		if (specks[i] >= 0 && nb.oceanN > 0) {
			landD[i] = 1;
			qL.push(i);
		} else if (specks[i] < 0 && nb.landN > 0) {
			seaD[i] = 1;
			qS.push(i);
		}
	}
	const growDist = (dist, q, limit, onLand) => {
		for (let k = 0; k < q.length; k++) {
			const i = q[k];
			const d = dist[i];
			if (d >= limit) continue;
			const y = i / wc | 0;
			const x = i - y * wc;
			for (const [dx, dy] of N8) {
				const ny = y + dy;
				if (ny < 0 || ny >= wr) continue;
				let nx = x + dx;
				if (wrap) nx = (nx + wc) % wc;
				else if (nx < 0 || nx >= wc) continue;
				const j = ny * wc + nx;
				if (dist[j]) continue;
				if (onLand ? specks[j] < 0 : specks[j] >= 0) continue;
				dist[j] = d + 1;
				q.push(j);
			}
		}
	};
	growDist(landD, qL, 3, true);
	growDist(seaD, qS, 2, false);
	const chewed = new Int16Array(specks);
	const chewCut = breakupN === 50 ? .26 : Math.max(.16, Math.min(.5, .26 + (breakupN - 50) * .0032));
	for (let y = 0; y < wr; y++) for (let x = 0; x < wc; x++) {
		const i = y * wc + x;
		const nb = neighborVote(specks, x, y, wc, wr, wrap);
		const nse = coast[i];
		if (specks[i] >= 0 && landD[i] > 0 && landD[i] <= 2 && nb.oceanN > 0 && nse < chewCut) chewed[i] = -1;
		else if (specks[i] < 0 && seaD[i] === 1 && nb.landN >= 3 && nse > .86) chewed[i] = nb.vote;
	}
	if (layout === "earthlike" && job) sprinkleCrumbs(chewed, wc, wr, job.crumbRand, breakupN >= 68);
	const beltC = paintNamedBelts(chewed, wc, wr);
	const drift = [];
	const out = new Int16Array(cols * rows).fill(-1);
	const belt = new Float32Array(cols * rows);
	for (let y = 0; y < rows; y++) {
		const sy = Math.max(0, Math.min(205, Math.floor((y + .5) / rows * wr)));
		for (let x = 0; x < cols; x++) {
			let sx = Math.floor((x + .5) / cols * wc);
			if (wrap) sx = (sx % wc + wc) % wc;
			else sx = Math.max(0, Math.min(359, sx));
			const si = sy * wc + sx;
			out[y * cols + x] = chewed[si];
			belt[y * cols + x] = beltC[si];
		}
	}
	if (cols > 368) {
		const next = new Int16Array(out);
		for (let y = 0; y < rows; y++) {
			const ny = y / rows;
			for (let x = 0; x < cols; x++) {
				const i = y * cols + x;
				const nb = neighborVote(out, x, y, cols, rows, wrap);
				const nse = cylinder(warpN, x / cols * Math.PI * 2 + 2.4, ny, 3.3, 2);
				if (out[i] >= 0 && nb.oceanN >= 1 && nb.oceanN <= 5 && nse < .2) next[i] = -1;
				else if (out[i] < 0 && nb.landN >= 4 && nse > .9) next[i] = nb.vote;
			}
		}
		out.set(next);
		for (let i = 0; i < out.length; i++) if (out[i] < 0) belt[i] = 0;
	}
	const mountains = job?.mountains ?? 42;
	if (mountains < 12) belt.fill(0);
	else if (mountains > 78 && job) paintLesserRidge(belt, out, cols, rows, job.ridgeRand);
	return {
		plate: out,
		drift,
		belt
	};
}
function shelfPlan(x, y, cols, rows, landMask, jag, layout, wrap) {
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
	if (best > 64) return {
		reach: 1,
		trench: false
	};
	const onx = x / cols;
	const lnx = lx / cols;
	const inGap = onx >= .47 && onx <= .61;
	let active = layout === "earthlike" ? lnx < .52 ? x >= lx : x <= lx : x >= lx;
	if (inGap && (layout === "earthlike" || layout === "continents")) active = true;
	if (active) return {
		reach: jag < .18 ? 0 : 1,
		trench: true
	};
	const wide = 3 + Math.floor(Math.min(.999, jag) * 6);
	return {
		reach: jag < .36 ? Math.min(wide, 3) : wide,
		trench: false
	};
}
function paintRainShadow(moistF, tempF, belt, landMask, cols, rows, wrap, wetness) {
	const wetPush = (wetness - 50) / 50;
	const look = (x, y, dir, limit) => {
		for (let d = 1; d <= limit; d++) {
			let xx = x + dir * d;
			if (wrap) xx = (xx + cols) % cols;
			else if (xx < 0 || xx >= cols) return false;
			if (belt[y * cols + xx] >= .6) return true;
		}
		return false;
	};
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const i = y * cols + x;
		if (!landMask[i] || belt[i] >= .3) continue;
		const west = look(x, y, -1, 12);
		const east = look(x, y, 1, 12);
		if (west && !east) {
			const hotCap = look(x, y, -1, 6) ? .29 : Math.min(.4, .33 + Math.max(0, wetPush) * .06);
			const cap = tempF[i] > .56 ? Math.min(.38, hotCap) : .4;
			moistF[i] = Math.min(moistF[i], cap);
		} else if (east && !west) moistF[i] = wetness < 36 ? Math.min(moistF[i], .3) : Math.min(.92, moistF[i] + .07);
	}
}
function generateTerrain(seed, sea = 46, extra) {
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
	const layout = extra?.layout ?? "earthlike";
	const level = extra?.level ?? "standard";
	const breakup = clampByte(extra?.breakup ?? 50);
	const gap = clampByte(extra?.gap ?? 70);
	const warmK = .78 + (warmth - 50) / 50 * .28;
	const wetK = .84 + (wetness - 50) / 50 * .4;
	const mtnK = .55 + mountains / 100 * .9;
	let landFrac = Math.max(.2, Math.min(.42, .3 - (sea - 46) * .0045));
	if (layout === "pangaea") landFrac = Math.min(.55, landFrac + .12);
	else if (layout === "islands") landFrac = Math.min(.14, landFrac);
	else if (layout === "archipelago") landFrac = Math.min(.22, landFrac);
	else if (layout === "theater") landFrac = Math.min(.58, Math.max(.5, landFrac + .2));
	else if (layout === "continents") landFrac = Math.min(.48, landFrac + .04);
	const base = hashSeed(seed || "inkunzi");
	const elevN = makeNoise(mulberry32(base));
	const moistN = makeNoise(mulberry32(base ^ 2654435769));
	const warpN = makeNoise(mulberry32(base ^ 2246822507));
	const warpN2 = makeNoise(mulberry32(base ^ 3266489909));
	const ridgeN = makeNoise(mulberry32(base ^ 668265263));
	const rand = mulberry32(base ^ 374761393);
	const crust = raiseCrust(cols, rows, wrap, landFrac, scale, rand, elevN, warpN, warpN2, aspect, {
		layout,
		breakup,
		gap,
		mountains,
		crumbRand: mulberry32(base ^ 1540483477),
		ridgeRand: mulberry32(base ^ 1374493555)
	});
	const plateW = crust.plate;
	const belt = crust.belt;
	const jag = new Float32Array(n);
	for (let y = 0; y < rows; y++) {
		const ny = y / rows;
		for (let x = 0; x < cols; x++) jag[y * cols + x] = cylinder(warpN, x / cols * Math.PI * 2 + .7, ny, 2.4, 3);
	}
	const landMask = new Uint8Array(n);
	for (let i = 0; i < n; i++) landMask[i] = plateW[i] >= 0 ? 1 : 0;
	const height = new Uint8Array(n);
	const oceanNear = new Uint8Array(n);
	const shelfLim = new Uint8Array(n);
	const q = [];
	for (let i = 0; i < n; i++) {
		if (landMask[i]) continue;
		let shore = false;
		const y = i / cols | 0;
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
		const i = q[k];
		const d = oceanNear[i];
		if (d >= 8) continue;
		const y = i / cols | 0;
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
			const ang = x / cols * Math.PI * 2;
			if (!landMask[i]) {
				const near = oceanNear[i];
				const deep = 30 + jag[i] * 22;
				if (near > 0) {
					const plan = shelfPlan(x, y, cols, rows, landMask, jag[i], layout, wrap);
					shelfLim[i] = plan.reach;
					if (plan.reach > 0 && near <= plan.reach) height[i] = 84 - Math.min(near, 7) * 5;
					else if (plan.trench && near === plan.reach + 1) height[i] = byte(Math.max(8, deep * .62));
					else height[i] = byte(deep);
				} else height[i] = byte(deep);
				continue;
			}
			const gx = x / cols;
			const gy = y / rows;
			const detail = cylinder(warpN2, ang, ny, 1.3, 2);
			const along = ridged(ridgeN, gx * 18, gy * 10);
			const b = belt[i];
			let h = 118 + (detail - .5) * 8;
			if (b >= .95) h = 216 + along * 16 * mtnK;
			else if (b >= .6) h = 180 + along * 20;
			else if (b >= .3) h = 146 + (detail - .45) * 14;
			const pole = Math.min(ny, 1 - ny);
			if (pole < .06) h += (.06 - pole) * 30;
			height[i] = byte(Math.max(112, Math.min(244, h)));
		}
	}
	if (layout === "earthlike") {
		const trenchR = mulberry32(base ^ 659918);
		const ty = Math.floor(rows * (.42 + trenchR() * .16));
		const tx = Math.floor(cols * (.505 + trenchR() * .04));
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
		const lat = Math.abs(ny - .5) * 2;
		for (let x = 0; x < cols; x++) {
			const i = y * cols + x;
			const ang = x / cols * Math.PI * 2;
			const here = height[i] / 255;
			const lon = cylinder(moistN, ang, .3, 1.05, 3);
			const dryBelt = Math.exp(-((lat - .4) * (lat - .4)) / .02);
			const itcz = Math.exp(-(lat * lat) / .022);
			const storm = Math.exp(-((lat - .62) * (lat - .62)) / .034);
			let temp = Math.cos(lat * Math.PI * .5) * warmK + (warmth - 50) / 240;
			temp -= Math.max(0, here - .45) * .85;
			temp += (jag[i] - .5) * .06;
			temp += (lon - .5) * .04;
			tempF[i] = clamp01(temp);
			let moist = .36 + itcz * .46 + storm * .24 - dryBelt * (.32 + (1 - lon) * .62);
			moist += (lon - .46) * .58;
			moist += (jag[i] - .5) * .1;
			prior[i] = moist * wetK;
		}
	}
	const moistF = new Float32Array(n);
	for (let lap = 0; lap < 2; lap++) for (let y = 0; y < rows; y++) {
		let wind = lap === 0 || !wrap ? .5 : moistF[y * cols + cols - 1];
		for (let x = 0; x < cols; x++) {
			const i = y * cols + x;
			const prevX = wrap ? x === 0 ? cols - 1 : x - 1 : Math.max(0, x - 1);
			if (!landMask[i]) {
				if (!wrap && x === 0) wind = .62;
				wind = Math.max(.5, .58 + (1 - Math.abs(y / rows - .5)) * .14);
				moistF[i] = clamp01(wind);
				continue;
			}
			const rise = height[i] / 255 - height[y * cols + prevX] / 255;
			if (rise > .004) wind = Math.max(.02, wind - rise * 4.2);
			else wind = Math.min(.84, wind + .012);
			const shadow = rise < -.004 ? -rise * 3.6 : 0;
			const windward = rise > .008 ? rise * 1.8 : 0;
			moistF[i] = clamp01(prior[i] * .46 + wind * .66 + windward - shadow);
		}
	}
	paintRainShadow(moistF, tempF, belt, landMask, cols, rows, wrap, wetness);
	paintRiseMoisture(moistF, rises, landMask, cols, rows, wrap);
	for (let y = 0; y < rows; y++) {
		const ny = y / rows;
		for (let x = 0; x < cols; x++) {
			const i = y * cols + x;
			const land = landMask[i] === 1;
			const shelf = !land && shelfLim[i] > 0 && oceanNear[i] > 0 && oceanNear[i] <= shelfLim[i];
			tempA[i] = byte(tempF[i] * 255);
			moistA[i] = byte(moistF[i] * 255);
			let rel = reliefOf(land, height[i], shelf);
			const pole = Math.min(ny, 1 - ny);
			if (land && pole < .055) rel = R_ICE;
			else if (land && tempF[i] < .12 && rel >= R_RANGE && rel <= R_PEAK) rel = R_ICE;
			relief[i] = rel;
			const cap = cylinder(elevN, x / cols * Math.PI * 2, .08, .62, 2);
			let id = coverOf(land, tempF[i], moistF[i], rel, ny, jag[i], cap);
			if (shelf && id !== 16) id = 1;
			terrain[i] = id;
		}
	}
	smoothTerrain(terrain, cols, rows, wrap);
	for (let i = 0; i < n; i++) {
		const id = terrain[i];
		if (!landMask[i]) {
			if (id !== 16 && shelfLim[i] > 0 && oceanNear[i] > 0 && oceanNear[i] <= shelfLim[i]) {
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
			const yy = i / cols | 0;
			const cap = cylinder(elevN, i % cols / cols * Math.PI * 2, .08, .62, 2);
			terrain[i] = coverOf(true, tempF[i], moistF[i], relief[i], yy / rows, jag[i], cap);
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
		...strata
	};
}
function clampLandHistogram(height, landMask, belt) {
	const land = [];
	for (let i = 0; i < height.length; i++) if (landMask[i]) land.push(i);
	const count = land.length;
	if (count < 30) return;
	const demote = (keep, pred, to) => {
		const cells = land.filter((i) => pred(height[i])).sort((a, b) => height[a] - height[b]);
		for (let k = 0; k < cells.length - keep; k++) height[cells[k]] = to;
	};
	demote(Math.max(1, Math.floor(count * .04)), (h) => h >= 214, 198);
	demote(Math.max(1, Math.floor(count * .12)), (h) => h >= 172 && h < 214, 156);
	demote(Math.max(1, Math.floor(count * .2)), (h) => h >= 140 && h < 172, 126);
	let peaks = 0;
	for (const i of land) if (height[i] >= 214) peaks += 1;
	const want = Math.max(1, Math.floor(count * .025));
	if (peaks >= want) return;
	const spines = land.filter((i) => belt[i] >= .95 && height[i] < 214).sort((a, b) => height[b] - height[a]);
	for (const i of spines) {
		height[i] = 222;
		peaks += 1;
		if (peaks >= want) break;
	}
}
function stampRises(height, landMask, belt, cols, rows, rand) {
	let sx = 0;
	let sy = 0;
	let sn = 0;
	for (let y = 0; y < rows; y++) for (let x = 0; x < Math.floor(cols * .5); x++) {
		if (belt[y * cols + x] < .65) continue;
		sx += x;
		sy += y;
		sn += 1;
	}
	const cx = sn ? sx / sn : cols * .28;
	const cy = sn ? sy / sn : rows * .45;
	const rises = [];
	const paint = (kind, x0, x1, y0, y1) => {
		let best = -1;
		let bestD = 1e9;
		const xa = Math.max(0, Math.floor(x0));
		const xb = Math.min(cols - 1, Math.floor(x1));
		const ya = Math.max(0, Math.floor(y0));
		const yb = Math.min(rows - 1, Math.floor(y1));
		for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) {
			const i = y * cols + x;
			if (!landMask[i] || belt[i] >= .3 || height[i] >= 168) continue;
			const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		if (best < 0) {
			const bag = [];
			for (let y = Math.floor(rows * .28); y < rows * .72; y++) for (let x = Math.floor(cols * .08); x < cols * .46; x++) {
				const i = y * cols + x;
				if (landMask[i] && height[i] < 140 && belt[i] < .3) bag.push(i);
			}
			if (!bag.length) return;
			best = bag[Math.floor(rand() * bag.length)];
		}
		const y = best / cols | 0;
		const x = best - y * cols;
		if (rises.some((r) => Math.hypot(r.x - x, r.y - y) < 16)) return;
		const rad = 13;
		rises.push({
			x,
			y,
			kind,
			rad
		});
		for (let dy = -13; dy <= rad; dy++) for (let dx = -13; dx <= rad; dx++) {
			if (dx * dx + dy * dy > 169) continue;
			const yy = y + dy;
			if (yy < 0 || yy >= rows) continue;
			const xx = (x + dx + cols) % cols;
			const j = yy * cols + xx;
			if (!landMask[j] || height[j] >= 172 || belt[j] >= .6) continue;
			const edge = Math.hypot(dx, dy) / rad;
			const h = kind === "desert" ? 160 - edge * 12 : 154 - edge * 10;
			if (h > height[j]) height[j] = byte(h);
		}
	};
	const swell = (x0, x1, y0, y1) => {
		let best = -1;
		let bestD = 1e9;
		const xa = Math.max(0, Math.floor(Math.min(x0, x1)));
		const xb = Math.min(cols - 1, Math.floor(Math.max(x0, x1)));
		const ya = Math.max(0, Math.floor(Math.min(y0, y1)));
		const yb = Math.min(rows - 1, Math.floor(Math.max(y0, y1)));
		const mx = (xa + xb) / 2;
		const my = (ya + yb) / 2;
		for (let y = ya; y <= yb; y += 2) for (let x = xa; x <= xb; x += 2) {
			const i = y * cols + x;
			if (!landMask[i] || belt[i] >= .3 || height[i] >= 140) continue;
			const d = (x - mx) * (x - mx) + (y - my) * (y - my);
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		if (best < 0) return;
		const y = best / cols | 0;
		const x = best - y * cols;
		const rad = 16;
		for (let dy = -16; dy <= rad; dy++) for (let dx = -16; dx <= rad; dx++) {
			if (dx * dx + dy * dy > 256) continue;
			const yy = y + dy;
			if (yy < 0 || yy >= rows) continue;
			const xx = (x + dx + cols) % cols;
			const j = yy * cols + xx;
			if (!landMask[j] || belt[j] >= .3 || height[j] >= 172) continue;
			const h = 150 - Math.hypot(dx, dy) / rad * 8;
			if (h > height[j]) height[j] = byte(h);
		}
	};
	paint("desert", cx + 8, cols * .5, cy - 30, cy + 30);
	paint("forest", cols * .05, Math.max(cols * .08, cx - 6), cy - 34, cy + 22);
	swell(cols * .62, cols * .9, rows * .28, rows * .62);
	return rises;
}
function paintRiseMoisture(moistF, rises, landMask, cols, rows, wrap) {
	for (const rise of rises) for (let dy = -rise.rad; dy <= rise.rad; dy++) for (let dx = -rise.rad; dx <= rise.rad; dx++) {
		if (dx * dx + dy * dy > rise.rad * rise.rad) continue;
		const yy = rise.y + dy;
		if (yy < 0 || yy >= rows) continue;
		let xx = rise.x + dx;
		if (wrap) xx = (xx + cols) % cols;
		else if (xx < 0 || xx >= cols) continue;
		const j = yy * cols + xx;
		if (!landMask[j]) continue;
		moistF[j] = rise.kind === "desert" ? .14 : .76;
	}
}
var FULL_KNOWN = {
	x0: 0,
	x1: 1,
	y0: 0,
	y1: 1
};
function knownForAge(cols, rows, hearths, age) {
	if (age >= 4) return { ...FULL_KNOWN };
	if (age === 3) return {
		x0: 0,
		x1: .74,
		y0: 0,
		y1: 1
	};
	if (age === 2) return {
		x0: 0,
		x1: .56,
		y0: .02,
		y1: .98
	};
	if (age === 1) return {
		x0: .04,
		x1: .5,
		y0: .08,
		y1: .92
	};
	if (!hearths.length) return {
		x0: .08,
		x1: .42,
		y0: .22,
		y1: .72
	};
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
		x0: Math.max(0, x0 - .07),
		x1: Math.min(.52, x1 + .07),
		y0: Math.max(0, y0 - .08),
		y1: Math.min(1, y1 + .08)
	};
}
function paintSightDisk(seen, cols, rows, cx, cy, rad, wrap, value) {
	const r2 = rad * rad;
	for (let dy = -rad; dy <= rad; dy++) {
		const y = cy + dy;
		if (y < 0 || y >= rows) continue;
		for (let dx = -rad; dx <= rad; dx++) {
			if (dx * dx + dy * dy > r2) continue;
			let x = cx + dx;
			if (wrap) x = (x % cols + cols) % cols;
			else if (x < 0 || x >= cols) continue;
			seen[y * cols + x] = value;
		}
	}
}
function hearthSight(cols, rows, hearths, wrap) {
	const seen = new Uint8Array(cols * rows);
	for (const h of hearths) paintSightDisk(seen, cols, rows, h.x, h.y, 14, wrap, 1);
	return seen;
}
function stampSight(field, x, y, mapW, mapH, radius, open) {
	const col = Math.floor(x / mapW * field.cols);
	const row = Math.floor((mapH - y) / mapH * field.rows);
	if (!field.seen || field.seen.length !== field.cols * field.rows) field.seen = new Uint8Array(field.cols * field.rows);
	paintSightDisk(field.seen, field.cols, field.rows, col, row, Math.max(1, radius), field.wrap, open ? 1 : 0);
}
function seenWindow(field) {
	const seen = field.seen;
	if (!seen?.length) return null;
	let x0 = field.cols;
	let x1 = -1;
	let y0 = field.rows;
	let y1 = -1;
	let n = 0;
	for (let i = 0; i < seen.length; i++) {
		if (!seen[i]) continue;
		const y = i / field.cols | 0;
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
		y1: (y1 + 1) / field.rows
	};
}
function buildStrata(terrain, height, relief, belt, temp, moist, cols, rows, wrap) {
	const n = cols * rows;
	const under = new Uint8Array(n);
	const sky = new Uint8Array(n);
	const landish = (id) => id !== 0 && id !== 1 && id !== 16 && id !== 10;
	const scored = [];
	const ortho = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];
	for (let y = 1; y < rows - 1; y++) {
		const ny = y / rows;
		if (ny < .18 || ny > .8) continue;
		for (let x = 0; x < cols; x++) {
			const nx = x / cols;
			if (nx < .06 || nx > .48) continue;
			if (terrain[y * cols + x] !== 9) continue;
			for (const [dx, dy] of ortho) {
				const yy = y + dy;
				let xx = x + dx;
				if (wrap) xx = (xx + cols) % cols;
				const j = yy * cols + xx;
				const id = terrain[j];
				if (!landish(id) || id === 6 || id === 9) continue;
				if (relief[j] > R_HILL) continue;
				const m = moist[j] / 255;
				const t = temp[j] / 255;
				let score = m;
				if (m > .42 && t > .3 && t < .7) score += 2.4;
				else if (m > .28 && t > .22 && t < .75) score += 1;
				if (id === 2 || id === 3 || id === 7 || id === 11) score += 1.4;
				if (id === 8 || id === 12) score -= .7;
				scored.push({
					j,
					score
				});
				break;
			}
		}
	}
	scored.sort((a, b) => b.score - a.score);
	const hearths = [];
	for (const { j } of scored) {
		const y = j / cols | 0;
		const x = j - y * cols;
		if (hearths.some((h) => Math.abs(h.x - x) < 14 && Math.abs(h.y - y) < 10)) continue;
		hearths.push({
			x,
			y
		});
		if (hearths.length >= 5) break;
	}
	if (hearths.length < 3) for (let y = Math.floor(rows * .3); y < rows * .7 && hearths.length < 3; y += 6) for (let x = Math.floor(cols * .1); x < cols * .42 && hearths.length < 3; x += 8) {
		const i = y * cols + x;
		if (!landish(terrain[i]) || relief[i] > R_HILL || terrain[i] === 6) continue;
		hearths.push({
			x,
			y
		});
	}
	let down = -1;
	let up = -1;
	for (let y = 0; y < rows; y++) for (let x = 0; x < Math.floor(cols * .5); x++) {
		const i = y * cols + x;
		if (!landish(terrain[i])) continue;
		if (belt[i] >= .9 && (down < 0 || height[i] > height[down])) down = i;
		if (height[i] >= 188 && (up < 0 || height[i] > height[up])) up = i;
	}
	if (down < 0) down = up;
	if (up < 0) up = down;
	const columns = [];
	if (down >= 0) {
		under[down] = 1;
		columns.push({
			x: down % cols,
			y: down / cols | 0,
			dir: "down"
		});
	}
	if (up >= 0) {
		const cell = {
			x: up % cols,
			y: up / cols | 0,
			dir: "up"
		};
		if (!columns.some((c) => c.x === cell.x && c.y === cell.y && c.dir === "up")) columns.push(cell);
	}
	const cellNoise = (x, y, salt) => {
		const s = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
		return s - Math.floor(s);
	};
	const seaD = new Uint16Array(n).fill(65535);
	const seaQ = [];
	for (let i = 0; i < n; i++) {
		if (landish(terrain[i])) continue;
		seaD[i] = 0;
		seaQ.push(i);
	}
	for (let k = 0; k < seaQ.length; k++) {
		const i = seaQ[k];
		const d = seaD[i];
		if (d >= 14) continue;
		const y = i / cols | 0;
		const x = i - y * cols;
		for (const [dx, dy] of [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		]) {
			const yy = y + dy;
			if (yy < 0 || yy >= rows) continue;
			let xx = x + dx;
			if (wrap) xx = (xx + cols) % cols;
			else if (xx < 0 || xx >= cols) continue;
			const j = yy * cols + xx;
			if (seaD[j] <= d + 1) continue;
			seaD[j] = d + 1;
			seaQ.push(j);
		}
	}
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const i = y * cols + x;
		const id = terrain[i];
		if (!landish(id) || id === 6 || seaD[i] < 5) continue;
		if (cellNoise(x >> 2, y >> 2, 3.1) * .72 + cellNoise(x >> 4, y >> 3, 8.4) * .28 > .62) under[i] = 1;
	}
	const grown = new Uint8Array(under);
	for (let y = 1; y < rows - 1; y++) for (let x = 0; x < cols; x++) {
		const i = y * cols + x;
		if (under[i] || !landish(terrain[i]) || terrain[i] === 6 || seaD[i] < 5) continue;
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
	under.set(grown);
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const i = y * cols + x;
		if (!under[i]) continue;
		let near = 0;
		for (const [dx, dy] of [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		]) {
			const yy = y + dy;
			if (yy < 0 || yy >= rows) continue;
			let xx = x + dx;
			if (wrap) xx = (xx + cols) % cols;
			else if (xx < 0 || xx >= cols) continue;
			if (under[yy * cols + xx]) near += 1;
		}
		if (near < 2) under[i] = 0;
	}
	const comp = new Int32Array(n).fill(-1);
	const rooms = [];
	for (let i = 0; i < n; i++) {
		if (!under[i] || comp[i] >= 0) continue;
		const id = rooms.length;
		const stack = [i];
		comp[i] = id;
		let sx = 0;
		let sy = 0;
		let count = 0;
		while (stack.length) {
			const c = stack.pop();
			const y = c / cols | 0;
			const x = c - y * cols;
			sx += x;
			sy += y;
			count += 1;
			for (const [dx, dy] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1]
			]) {
				const yy = y + dy;
				if (yy < 0 || yy >= rows) continue;
				let xx = x + dx;
				if (wrap) xx = (xx + cols) % cols;
				else if (xx < 0 || xx >= cols) continue;
				const j = yy * cols + xx;
				if (!under[j] || comp[j] >= 0) continue;
				comp[j] = id;
				stack.push(j);
			}
		}
		rooms.push({
			id,
			sx: sx / count,
			sy: sy / count,
			n: count
		});
	}
	const linked = new Uint8Array(rooms.length);
	const pairs = [];
	for (let a = 0; a < rooms.length; a++) for (let b = a + 1; b < rooms.length; b++) {
		const dx = rooms[a].sx - rooms[b].sx;
		const dy = rooms[a].sy - rooms[b].sy;
		const d = Math.hypot(dx, dy);
		if (d < 8 || d > 26) continue;
		pairs.push({
			a,
			b,
			d
		});
	}
	pairs.sort((p, q) => p.d - q.d);
	for (const pair of pairs) {
		if (linked[pair.a] || linked[pair.b]) continue;
		if (cellNoise(pair.a + 3, pair.b + 1, 2.2) < .58) continue;
		linked[pair.a] = 1;
		linked[pair.b] = 1;
		let x = Math.round(rooms[pair.a].sx);
		let y = Math.round(rooms[pair.a].sy);
		const x1 = Math.round(rooms[pair.b].sx);
		const y1 = Math.round(rooms[pair.b].sy);
		const steps = Math.max(Math.abs(x1 - x), Math.abs(y1 - y));
		for (let s = 0; s <= steps; s++) {
			const px = steps ? Math.round(x + (x1 - x) * s / steps) : x;
			const py = steps ? Math.round(y + (y1 - y) * s / steps) : y;
			if (py < 0 || py >= rows) continue;
			let pxw = px;
			if (wrap) pxw = (pxw + cols) % cols;
			else if (pxw < 0 || pxw >= cols) continue;
			const j = py * cols + pxw;
			if (!landish(terrain[j]) || terrain[j] === 6) continue;
			under[j] = under[j] === 1 ? 1 : 2;
			if (s % 2 === 0) under[j] = 2;
		}
	}
	if (down >= 0) {
		const cy = down / cols | 0;
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
				if (!landish(terrain[j])) continue;
				under[j] = 1;
			}
		}
	}
	const cloudy = (i) => {
		const id = terrain[i];
		return landish(id) && id !== 8 && id !== 6 && id !== 15 && (moist[i] ?? 0) >= 125;
	};
	const cloud = new Uint8Array(n);
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const i = y * cols + x;
		if (!cloudy(i)) continue;
		if (cellNoise(x >> 3, y >> 3, 4.4) * .78 + cellNoise(x >> 1, y >> 1, 1.7) * .22 > .56) cloud[i] = 1;
	}
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
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
	for (let i = 0; i < n; i++) if (cloud[i] && cloudy(i)) sky[i] = 1;
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const i = y * cols + x;
		if (!sky[i]) continue;
		let near = 0;
		for (const [dx, dy] of [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		]) {
			const yy = y + dy;
			if (yy < 0 || yy >= rows) continue;
			let xx = x + dx;
			if (wrap) xx = (xx + cols) % cols;
			else if (xx < 0 || xx >= cols) continue;
			if (sky[yy * cols + xx]) near += 1;
		}
		if (near < 2 || !cloudy(i)) sky[i] = 0;
	}
	const gates = [];
	const realms = [{
		id: "void",
		name: "Void",
		nodes: 12
	}, {
		id: "other",
		name: "Other hearth",
		nodes: 8
	}];
	if (hearths[0]) gates.push({
		x: hearths[0].x,
		y: hearths[0].y,
		from: "surface",
		realm: "other"
	});
	if (up >= 0) gates.push({
		x: up % cols,
		y: up / cols | 0,
		from: "surface",
		realm: "void"
	});
	else if (hearths[1]) gates.push({
		x: hearths[1].x,
		y: hearths[1].y,
		from: "surface",
		realm: "void"
	});
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
		seen
	};
}
function clampByte(n) {
	return Math.max(0, Math.min(100, Math.round(n)));
}
function smoothTerrain(terrain, cols, rows, wrap) {
	const next = new Uint8Array(terrain.length);
	const tally = new Uint16Array(TERRAINS.length);
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		tally.fill(0);
		const i = y * cols + x;
		tally[terrain[i]] += 4;
		for (const [dx, dy] of N8) {
			const ny = y + dy;
			if (ny < 0 || ny >= rows) continue;
			const nx = wrap ? (x + dx + cols) % cols : x + dx;
			if (nx < 0 || nx >= cols) continue;
			tally[terrain[ny * cols + nx]] += 1;
		}
		let best = terrain[i];
		let bestN = -1;
		for (let t = 0; t < tally.length; t++) if (tally[t] > bestN) {
			bestN = tally[t];
			best = t;
		}
		const selfN = tally[terrain[i]];
		next[i] = best !== terrain[i] && bestN >= selfN + 2 ? best : terrain[i];
	}
	terrain.set(next);
}
function nibbleIce(terrain, cols, rows, jag) {
	for (let y = 0; y < rows; y++) {
		const ny = (y + .5) / rows;
		if (Math.min(ny, 1 - ny) > .09) continue;
		for (let x = 0; x < cols; x++) {
			const i = y * cols + x;
			const id = terrain[i];
			if (id !== 6 && id !== 16) continue;
			if (Math.sin(x / cols * Math.PI * 5) > .78 || jag[i] > .86) terrain[i] = id === 6 ? 15 : 0;
		}
	}
}
function softenHeight(height, cols, rows, wrap, belt) {
	const next = new Uint8Array(height.length);
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const i = y * cols + x;
		if (belt[i] >= .3) {
			next[i] = height[i];
			continue;
		}
		let sum = height[i] * 4;
		let n = 4;
		for (const [dx, dy] of N8) {
			const ny = y + dy;
			if (ny < 0 || ny >= rows) continue;
			const nx = wrap ? (x + dx + cols) % cols : x + dx;
			if (nx < 0 || nx >= cols) continue;
			const j = ny * cols + nx;
			if (belt[j] >= .3) continue;
			sum += height[j];
			n += 1;
		}
		next[i] = Math.round(sum / n);
	}
	height.set(next);
}
function flowRivers(terrain, height, relief, cols, rows, wrap, belt) {
	const n = cols * rows;
	const water = (id) => id === 0 || id === 1 || id === 16;
	const down = new Int32Array(n).fill(-1);
	const filled = new Float32Array(n);
	const reach = new Int32Array(n).fill(-1);
	const seen = new Uint8Array(n);
	const heapC = [];
	const heapI = [];
	for (let i = 0; i < n; i++) {
		if (!water(terrain[i])) continue;
		filled[i] = height[i];
		reach[i] = 0;
		seen[i] = 1;
		hpush(heapC, heapI, height[i], i);
	}
	while (heapC.length) {
		const popped = hpop(heapC, heapI);
		if (!popped) break;
		const [, i] = popped;
		const spill = filled[i];
		const y = i / cols | 0;
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
			reach[j] = reach[i] + 1;
			const nextSpill = Math.max(height[j], spill);
			filled[j] = nextSpill;
			hpush(heapC, heapI, nextSpill, j);
		}
	}
	const acc = new Float32Array(n);
	const order = [];
	for (let i = 0; i < n; i++) {
		if (water(terrain[i])) continue;
		acc[i] = 1;
		order.push(i);
	}
	order.sort((a, b) => reach[b] - reach[a] || height[b] - height[a] || a - b);
	for (const i of order) {
		const j = down[i];
		if (j >= 0 && !water(terrain[j])) acc[j] += acc[i];
	}
	const bestUp = new Int32Array(n).fill(-1);
	for (const i of order) {
		const j = down[i];
		if (j < 0 || water(terrain[j])) continue;
		if (bestUp[j] < 0 || acc[i] > acc[bestUp[j]]) bestUp[j] = i;
	}
	const mouthOf = new Int32Array(n).fill(-1);
	const findMouth = (start) => {
		let i = start;
		const guard = Math.min(n, cols + rows + 12);
		for (let hop = 0; hop < guard; hop++) {
			if (mouthOf[i] >= 0) return mouthOf[i];
			const j = down[i];
			if (j < 0 || water(terrain[j])) {
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
			const next = down[c];
			mouthOf[c] = m;
			if (next < 0 || water(terrain[next])) break;
			c = next;
		}
	}
	const threshold = Math.max(10, Math.round(n / 4200));
	const onBelt = (i) => (belt?.[i] ?? 0) >= .3;
	const mouths = [];
	for (let i = 0; i < n; i++) {
		if (water(terrain[i])) continue;
		const j = down[i];
		if (j >= 0 && water(terrain[j]) && acc[i] >= threshold) mouths.push(i);
	}
	mouths.sort((a, b) => acc[b] - acc[a]);
	const keep = new Uint8Array(n);
	for (let m = 0; m < mouths.length && m < 34; m++) keep[mouths[m]] = 1;
	const cap = Math.max(48, Math.round(n * .0042));
	const paint = [];
	for (let i = 0; i < n; i++) {
		if (water(terrain[i]) || terrain[i] === 6) continue;
		const m = mouthOf[i];
		if (m < 0 || !keep[m]) continue;
		if (acc[i] < threshold) continue;
		const j = down[i];
		const intoSea = j >= 0 && water(terrain[j]);
		const primary = j >= 0 && bestUp[j] === i;
		if (onBelt(i) && !intoSea) continue;
		if (!intoSea && !primary && acc[i] < threshold * 4) continue;
		paint.push(i);
	}
	paint.sort((a, b) => acc[b] - acc[a]);
	let painted = 0;
	for (const i of paint) {
		if (painted >= cap) break;
		terrain[i] = 9;
		const drop = relief[i] >= R_HILL ? 11 : 6;
		if (height[i] > 102) height[i] = Math.max(102, height[i] - drop);
		painted += 1;
	}
	for (const i of paint) {
		if (terrain[i] !== 9) continue;
		const j = down[i];
		if (j < 0 || !water(terrain[j])) continue;
		const y = i / cols | 0;
		const x = i - y * cols;
		const y2 = j / cols | 0;
		const x2 = j - y2 * cols;
		if (y === y2 || x === x2) continue;
		for (const [cx, cy] of [[x, y2], [x2, y]]) {
			const ny = cy;
			if (ny < 0 || ny >= rows) continue;
			const nx = wrap ? (cx + cols) % cols : cx;
			if (nx < 0 || nx >= cols) continue;
			const k = ny * cols + nx;
			if (water(terrain[k]) || terrain[k] === 6 || onBelt(k)) continue;
			terrain[k] = 9;
			break;
		}
	}
	const side = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];
	const kisses = (x, y) => {
		for (const [dx, dy] of side) {
			const ny = y + dy;
			if (ny < 0 || ny >= rows) continue;
			let nx = x + dx;
			if (wrap) nx = (nx + cols) % cols;
			else if (nx < 0 || nx >= cols) continue;
			if (water(terrain[ny * cols + nx])) return true;
		}
		return false;
	};
	for (let i = 0; i < n; i++) {
		if (terrain[i] !== 9) continue;
		const y = i / cols | 0;
		const x = i - y * cols;
		if (kisses(x, y)) continue;
		for (const [dx, dy] of side) {
			const ny = y + dy;
			if (ny < 0 || ny >= rows) continue;
			let nx = x + dx;
			if (wrap) nx = (nx + cols) % cols;
			else if (nx < 0 || nx >= cols) continue;
			const j = ny * cols + nx;
			if (water(terrain[j]) || terrain[j] === 6 || terrain[j] === 9 || onBelt(j)) continue;
			if (!kisses(nx, ny)) continue;
			terrain[j] = 9;
			break;
		}
	}
	const seenLake = new Uint8Array(n);
	let lakes = 0;
	for (let i = 0; i < n && lakes < 8; i++) {
		if (seenLake[i] || water(terrain[i]) || terrain[i] === 9 || terrain[i] === 6) continue;
		if (filled[i] < height[i] + 8) continue;
		const comp = [];
		const queue = [i];
		seenLake[i] = 1;
		let tooBig = false;
		while (queue.length) {
			const c = queue.pop();
			comp.push(c);
			if (comp.length > 64) {
				tooBig = true;
				break;
			}
			const y = c / cols | 0;
			const x = c - y * cols;
			for (const [dx, dy] of N8) {
				const ny = y + dy;
				if (ny < 0 || ny >= rows) continue;
				let nx = x + dx;
				if (wrap) nx = (nx + cols) % cols;
				else if (nx < 0 || nx >= cols) continue;
				const j = ny * cols + nx;
				if (seenLake[j] || water(terrain[j]) || terrain[j] === 9) continue;
				if (filled[j] < height[j] + 8) continue;
				seenLake[j] = 1;
				queue.push(j);
			}
		}
		if (tooBig || comp.length < 6) continue;
		for (const c of comp) terrain[c] = 10;
		lakes += 1;
	}
}
function cellIndex(field, x, y, mapW, mapH) {
	let nx = x / mapW;
	if (field.wrap) {
		nx = nx % 1;
		if (nx < 0) nx += 1;
	}
	const col = Math.max(0, Math.min(field.cols - 1, Math.floor(nx * field.cols)));
	return Math.max(0, Math.min(field.rows - 1, Math.floor((mapH - y) / mapH * field.rows))) * field.cols + col;
}
function climateName(temp, moist) {
	const t = temp / 255;
	const m = moist / 255;
	return `${t < .16 ? "Freezing" : t < .32 ? "Cold" : t < .52 ? "Mild" : t < .7 ? "Warm" : "Hot"} ${m < .34 ? "dry" : m < .55 ? "fair" : "wet"}`;
}
function heightBand(h) {
	if (h < 78) return "deep";
	if (h < 118) return "low";
	if (h < 158) return "rising";
	if (h < 198) return "high";
	return "peak";
}
function cellBrief(field, x, y, mapW, mapH) {
	const i = cellIndex(field, x, y, mapW, mapH);
	const biome = TERRAINS[field.terrain[i]] ?? TERRAINS[0];
	const reliefName = RELIEF_LABEL[field.relief?.[i] ?? R_LOW] ?? "Lowland";
	const water = biome.id === 0 || biome.id === 1 || biome.id === 16;
	const claim = field.owner[i] ? field.ownerIds[field.owner[i] - 1] ?? "" : "";
	return {
		biome: biome.label,
		relief: water ? "" : reliefName,
		climate: climateName(field.temp[i] ?? 128, field.moist[i] ?? 128),
		band: heightBand(field.height[i] ?? 0),
		claim
	};
}
function colOf(x, cols, wrap) {
	if (wrap) return (x + cols) % cols;
	return x;
}
function reliefForCover(id, prev) {
	if (id === 0 || id === 16) return R_OCEAN;
	if (id === 1) return R_SHELF;
	if (id === 5) return R_RANGE;
	if (id === 4) return R_HILL;
	if (id === 6) return R_ICE;
	if (id === 9 || id === 10) return prev >= R_LOW ? prev : R_LOW;
	if (prev >= R_LOW && prev <= R_ICE) return prev;
	return R_LOW;
}
function stampTerrain(field, x, y, mapW, mapH, terrainId, radius) {
	const col = Math.floor(x / mapW * field.cols);
	const row = Math.floor((mapH - y) / mapH * field.rows);
	const def = TERRAINS[terrainId] ?? TERRAINS[2];
	const r2 = radius * radius;
	for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
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
function stampOwner(field, x, y, mapW, mapH, nationId, radius) {
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
	const col = Math.floor(x / mapW * field.cols);
	const row = Math.floor((mapH - y) / mapH * field.rows);
	const r2 = radius * radius;
	for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
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
function traceRaster(rgba, width, height, sea = 46, cols = 360, rows = 206, wrap = true) {
	const field = blankField("traced", sea, wrap, cols, rows);
	for (let y = 0; y < field.rows; y++) {
		const temp = byte((1 - Math.abs(y / field.rows - .5) * 2) * 255);
		for (let x = 0; x < field.cols; x++) {
			const sx = Math.min(width - 1, Math.floor(x / field.cols * width));
			const p = (Math.min(height - 1, Math.floor(y / field.rows * height)) * width + sx) * 4;
			const id = nearestTerrain(rgba[p], rgba[p + 1], rgba[p + 2]);
			const i = y * field.cols + x;
			field.terrain[i] = id;
			field.height[i] = TERRAINS[id].height;
			field.relief[i] = reliefForCover(id, R_LOW);
			field.temp[i] = temp;
			field.moist[i] = 140;
		}
	}
	return field;
}
function blankField(seed, sea, wrap, cols = 360, rows = 206) {
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
		seen: new Uint8Array(n).fill(1)
	};
}
function nearestTerrain(r, g, b) {
	const max = Math.max(r, g, b);
	const sat = max - Math.min(r, g, b);
	if (max > 228 && sat < 42) return 6;
	let best = 0;
	let bestD = 0xe8d4a51000;
	for (let i = 0; i < RGB.length; i++) {
		const [tr, tg, tb] = RGB[i];
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
		if (max === r) hue = (g - b) / sat % 6;
		else if (max === g) hue = (b - r) / sat + 2;
		else hue = (r - g) / sat + 4;
		hue *= 60;
		if (hue < 0) hue += 360;
	}
	if (v > .86 && sat < 36) return 6;
	if (hue >= 165 && hue <= 255 && b > 60 && sat > 18) {
		if (v > .58 && g > b * .72) return 1;
		return 0;
	}
	if (hue >= 70 && hue <= 175 && g >= r - 5 && g >= b - 15) return sat < 28 && v < .4 ? 7 : 3;
	if (hue >= 8 && hue < 42 && r > g + 22 && sat > 35) return 8;
	if (sat < 32 && v > .28 && v < .78) return 5;
	if (hue >= 18 && hue < 55 && v < .5) return 4;
	if (hue >= 40 && hue < 100) return 2;
	return best;
}
function lerp(a, b, t) {
	const k = clamp01(t);
	return [
		Math.round(a[0] + (b[0] - a[0]) * k),
		Math.round(a[1] + (b[1] - a[1]) * k),
		Math.round(a[2] + (b[2] - a[2]) * k)
	];
}
function climateRgb(t, m, water) {
	if (water && t < .18) return [
		214,
		228,
		234
	];
	if (water) return lerp([
		6,
		36,
		72
	], [
		28,
		110,
		150
	], t);
	if (t < .16) return lerp([
		236,
		240,
		244
	], [
		176,
		196,
		186
	], m);
	const dry = t > .6 ? [
		226,
		168,
		86
	] : [
		206,
		176,
		96
	];
	const wet = t > .6 ? [
		16,
		100,
		58
	] : [
		36,
		128,
		64
	];
	const mid = t < .35 ? [
		168,
		180,
		150
	] : [
		176,
		170,
		78
	];
	const rgb = m < .45 ? lerp(dry, mid, m / .45) : lerp(mid, wet, (m - .45) / .55);
	if (t < .34) return lerp(rgb, [
		186,
		198,
		190
	], (.34 - t) / .28);
	return rgb;
}
function heightRgb(h) {
	if (h < 70) return lerp([
		4,
		24,
		58
	], [
		16,
		78,
		120
	], h / 70);
	if (h < 110) return lerp([
		46,
		150,
		168
	], [
		150,
		176,
		86
	], (h - 70) / 40);
	if (h < 160) return lerp([
		150,
		176,
		86
	], [
		168,
		132,
		78
	], (h - 110) / 50);
	if (h < 205) return lerp([
		168,
		132,
		78
	], [
		186,
		176,
		168
	], (h - 160) / 45);
	return lerp([
		186,
		176,
		168
	], [
		246,
		248,
		250
	], (h - 205) / 50);
}
function ecotoneOf(a, b) {
	const pair = (x, y) => a === x && b === y || a === y && b === x;
	if (pair(2, 8) || pair(11, 8) || pair(2, 12)) return RGB[12] ?? null;
	if (pair(3, 5) || pair(3, 4) || pair(13, 5)) return [
		78,
		118,
		64
	];
	if (pair(2, 3) || pair(11, 3)) return [
		112,
		148,
		62
	];
	return null;
}
function renderTerrain(field, out, nationColor, politicalOrView, reveal = true, plane = "surface", dim = false) {
	const view = politicalOrView === true ? "political" : politicalOrView === false ? "terrain" : politicalOrView;
	const scale = 2;
	const { cols, rows, terrain, height, owner, ownerIds } = field;
	const political = view === "political";
	const upStair = new Uint8Array(cols * rows);
	const downStair = new Uint8Array(cols * rows);
	const markStair = (mask, x, y) => {
		for (let dy = -2; dy <= 2; dy++) {
			const yy = y + dy;
			if (yy < 0 || yy >= rows) continue;
			for (let dx = -2; dx <= 2; dx++) {
				if (dx * dx + dy * dy > 4) continue;
				let xx = x + dx;
				if (field.wrap) xx = (xx % cols + cols) % cols;
				else if (xx < 0 || xx >= cols) continue;
				mask[yy * cols + xx] = 1;
			}
		}
	};
	for (const c of field.columns ?? []) markStair(c.dir === "up" ? upStair : downStair, c.x, c.y);
	for (let y = 0; y < rows * scale; y++) for (let x = 0; x < cols * scale; x++) {
		const cx = Math.floor(x / scale);
		const cy = Math.floor(y / scale);
		const i = cy * cols + cx;
		const id = terrain[i];
		const rel = field.relief?.[i] ?? R_LOW;
		const leftX = cx === 0 ? field.wrap ? cols - 1 : 0 : cx - 1;
		const rightX = cx === cols - 1 ? field.wrap ? 0 : cols - 1 : cx + 1;
		const hL = height[cy * cols + leftX];
		const hR = height[cy * cols + rightX];
		const hU = height[Math.max(0, cy - 1) * cols + cx];
		const hD = height[Math.min(rows - 1, cy + 1) * cols + cx];
		const light = -(hR - hL) * .92 - (hD - hU) * .58;
		const steep = Math.abs(hR - hL) + Math.abs(hD - hU) >= 8 && (rel >= R_HILL || view === "height");
		let shade = steep ? .97 + light / (!steep ? 520 : rel >= R_RANGE ? 26 : 48) : 1;
		if (view === "climate") shade = 1 + (shade - 1) * .35;
		shade = Math.max(steep ? .58 : .92, Math.min(steep ? 1.32 : 1.05, shade));
		let rgb;
		if (view === "climate") rgb = climateRgb((field.temp[i] ?? 128) / 255, (field.moist[i] ?? 128) / 255, id === 0 || id === 16);
		else if (view === "height") rgb = heightRgb(height[i]);
		else rgb = [
			RGB[id]?.[0] ?? 0,
			RGB[id]?.[1] ?? 0,
			RGB[id]?.[2] ?? 0
		];
		let r = rgb[0];
		let g = rgb[1];
		let b = rgb[2];
		if (political && owner[i] && id !== 0 && id !== 16 && id !== 10) {
			const hex = nationColor(ownerIds[owner[i] - 1] ?? "");
			if (hex) {
				const n = Number.parseInt(hex.slice(1), 16);
				if (Number.isFinite(n)) {
					r = Math.round(r * .34 + (n >> 16 & 255) * .66);
					g = Math.round(g * .34 + (n >> 8 & 255) * .66);
					b = Math.round(b * .34 + (n & 255) * .66);
				}
			}
			shade = Math.max(.72, Math.min(1.2, .98 + light / (steep ? 90 : 220)));
		}
		if (view === "terrain" || political) {
			if (id === 8) {
				const speck = (x * 5 + y * 3 & 3) - 1;
				r += speck * 4;
				g += speck * 3;
				b += speck;
			} else if (id === 3 || id === 13 || id === 14) {
				const spec = x * 17 + y * 11 & 7;
				const d = spec < 2 ? -14 : spec > 5 ? 9 : 0;
				r += d * .45;
				g += d;
				b += d * .25;
			} else if (id === 6 || id === 16) {
				if ((x * 5 ^ y * 13) % 19 === 0) {
					r += 16;
					g += 16;
					b += 18;
				}
			} else if (id === 2 || id === 11 || id === 12) {
				const speck = (x * 3 + y * 5 & 3) - 1;
				r += speck * 5;
				g += speck * 4;
			}
			{
				const fx = x % scale / scale - .5;
				const fy = y % scale / scale - .5;
				const upY = Math.max(0, cy - 1);
				const dnY = Math.min(rows - 1, cy + 1);
				const nid = fx > .2 ? terrain[cy * cols + rightX] : fx < -.2 ? terrain[cy * cols + leftX] : fy > .2 ? terrain[dnY * cols + cx] : fy < -.2 ? terrain[upY * cols + cx] : id;
				if (nid !== id && view === "terrain") {
					if (id === 1 && (nid === 0 || nid === 16)) {
						r = r * .64 + (RGB[0]?.[0] ?? 10) * .36;
						g = g * .64 + (RGB[0]?.[1] ?? 40) * .36;
						b = b * .64 + (RGB[0]?.[2] ?? 80) * .36;
					} else if (id === 9) {
						r = r * .84 + (RGB[9]?.[0] ?? 40) * .16;
						g = g * .84 + (RGB[9]?.[1] ?? 120) * .16;
						b = b * .84 + (RGB[9]?.[2] ?? 180) * .16;
					} else {
						const eco = ecotoneOf(id, nid);
						if (eco) {
							r = r * .58 + eco[0] * .42;
							g = g * .58 + eco[1] * .42;
							b = b * .58 + eco[2] * .42;
						}
					}
				}
			}
		}
		const left = owner[cy * cols + leftX];
		if (political && owner[i] && owner[i] !== left) shade *= .62;
		if (plane === "sky") {
			const hole = rel === R_PEAK || upStair[i] === 1;
			r = Math.round(r * .72);
			g = Math.round(g * .74);
			b = Math.round(b * .8);
			if (hole) {
				r = Math.min(255, r + 42);
				g = Math.min(255, g + 38);
				b = Math.min(255, b + 30);
			} else if (field.sky?.[i] === 1) {
				let alpha = .5;
				const fx = x % scale / scale - .5;
				const fy = y % scale / scale - .5;
				if (Math.max(Math.abs(fx), Math.abs(fy)) > .22) {
					const nx = fx > 0 ? rightX : leftX;
					const ny = fy > 0 ? Math.min(rows - 1, cy + 1) : Math.max(0, cy - 1);
					const edgeI = Math.abs(fx) > Math.abs(fy) ? cy * cols + nx : ny * cols + cx;
					if (field.sky?.[edgeI] !== 1) alpha = .3;
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
			const edge = [
				terrain[cy * cols + leftX],
				terrain[cy * cols + rightX],
				terrain[Math.max(0, cy - 1) * cols + cx],
				terrain[Math.min(rows - 1, cy + 1) * cols + cx]
			];
			if (!water && edge.some((t) => t === 0 || t === 16)) {
				cr += 18;
				cg += 16;
				cb += 12;
			}
			if (open && !water && !shelf) {
				if (view === "height") {
					const k = .45 + (1 - (height[i] ?? 0) / 255) * .7;
					cr = Math.round(cr * k);
					cg = Math.round(cg * k);
					cb = Math.round(cb * k);
				} else if (view === "climate") {
					const m = (field.moist[i] ?? 128) / 255;
					cr = Math.round(cr * (1 - m * .4) + 36 * m);
					cg = Math.round(cg * (1 - m * .25) + 78 * m);
					cb = Math.round(cb * (1 - m * .15) + 86 * m);
				}
				if (political && owner[i]) {
					const hex = nationColor(ownerIds[owner[i] - 1] ?? "");
					if (hex) {
						const n = Number.parseInt(hex.slice(1), 16);
						if (Number.isFinite(n)) {
							cr = Math.round(cr * .4 + (n >> 16 & 255) * .6);
							cg = Math.round(cg * .4 + (n >> 8 & 255) * .6);
							cb = Math.round(cb * .4 + (n & 255) * .6);
						}
					}
				}
			}
			r = cr;
			g = cg;
			b = cb;
			shade = Math.max(.78, Math.min(1.18, .96 + light / 90));
		}
		if (dim) {
			r = Math.round(r * .55 + 90);
			g = Math.round(g * .55 + 88.2);
			b = Math.round(b * .55 + 188 * .45);
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
function bytesToB64(bytes) {
	let s = "";
	const chunk = 32768;
	for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode(...bytes.subarray(i, Math.min(bytes.length, i + chunk)));
	return btoa(s);
}
function b64ToBytes(value, length) {
	const raw = atob(value);
	const out = new Uint8Array(length);
	const n = Math.min(length, raw.length);
	for (let i = 0; i < n; i++) out[i] = raw.charCodeAt(i);
	return out;
}
function latitudeTemp(cols, rows) {
	const out = new Uint8Array(cols * rows);
	for (let y = 0; y < rows; y++) {
		const t = byte((1 - Math.abs(y / rows - .5) * 2) * 220 + 20);
		for (let x = 0; x < cols; x++) out[y * cols + x] = t;
	}
	return out;
}
function packTerrain(field) {
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
		seen: bytesToB64(field.seen ?? new Uint8Array(field.cols * field.rows))
	};
}
function deriveRelief(terrain, height) {
	const relief = new Uint8Array(terrain.length);
	for (let i = 0; i < terrain.length; i++) {
		const id = terrain[i];
		const h = height[i];
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
function unpackTerrain(pack) {
	if (!pack?.cols || !pack.rows || !pack.cells || !pack.height || !pack.owner) return null;
	if (pack.cols < 16 || pack.rows < 16 || pack.cols > 800 || pack.rows > 450) return null;
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
		seen: pack.seen ? b64ToBytes(pack.seen, n) : hearthSight(pack.cols, pack.rows, hearths, pack.wrap !== false)
	};
}
/** File load. Unpacks a pack. Does not generate a world. */
function readTerrainPack(text) {
	try {
		const pack = JSON.parse(text);
		if (!pack || typeof pack !== "object") return null;
		return unpackTerrain(pack);
	} catch {
		return null;
	}
}
var KEY$8 = "inkunzi.terrain.v11";
var current = null;
var previewUrl = "";
var listeners$1 = /* @__PURE__ */ new Set();
var saveTimer = 0;
function emit() {
	for (const fn of listeners$1) fn();
}
function saveNow() {
	if (typeof window === "undefined" || !current) return;
	try {
		window.localStorage.setItem(KEY$8, JSON.stringify(packTerrain(current)));
	} catch {}
}
function scheduleSave() {
	if (typeof window === "undefined") return;
	window.clearTimeout(saveTimer);
	saveTimer = window.setTimeout(saveNow, 280);
}
function loadTerrain() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(KEY$8);
		if (!raw) return null;
		return unpackTerrain(JSON.parse(raw));
	} catch {
		return null;
	}
}
function getTerrain() {
	return current;
}
function getTerrainPreview() {
	return previewUrl;
}
function setTerrainPreview(url) {
	previewUrl = url;
}
function ensureTerrain() {
	if (!current) {
		current = loadTerrain() ?? generateTerrain("inkunzi", 46);
		saveNow();
	}
	return current;
}
function replaceTerrain(next) {
	current = next;
	saveNow();
	emit();
}
function paintGround(x, y, mapW, mapH, terrainId, radius) {
	stampTerrain(ensureTerrain(), x, y, mapW, mapH, terrainId, radius);
	scheduleSave();
	emit();
}
function paintSight(x, y, mapW, mapH, radius, open) {
	stampSight(ensureTerrain(), x, y, mapW, mapH, radius, open);
	scheduleSave();
	emit();
}
function revealAlong(x0, y0, x1, y1, mapW, mapH) {
	const field = ensureTerrain();
	let dx = x1 - x0;
	if (field.wrap && mapW > 0) {
		if (dx > mapW / 2) dx -= mapW;
		else if (dx < -mapW / 2) dx += mapW;
	}
	const steps = 5;
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		stampSight(field, x0 + dx * t, y0 + (y1 - y0) * t, mapW, mapH, 5, true);
	}
	scheduleSave();
	emit();
}
function paintBorder(x, y, mapW, mapH, nationId, radius) {
	stampOwner(ensureTerrain(), x, y, mapW, mapH, nationId, radius);
	scheduleSave();
	emit();
}
function setWorldWrap(wrap) {
	const field = ensureTerrain();
	if (field.wrap === wrap) return;
	field.wrap = wrap;
	scheduleSave();
	emit();
}
function newWorld(seed, sea, extra) {
	replaceTerrain(generateTerrain(seed.trim() || "inkunzi", sea, extra));
}
/** Replace the open world from a pack. Does not generate. */
function loadPack(pack) {
	const field = unpackTerrain(pack);
	if (!field) return false;
	replaceTerrain(field);
	return true;
}
function traceImage(rgba, width, height, cols, rows, wrap = true) {
	const field = current;
	replaceTerrain(traceRaster(rgba, width, height, field?.sea ?? 46, cols ?? field?.cols ?? 360, rows ?? field?.rows ?? 206, wrap));
}
function useTerrainField() {
	const [tick, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const stop = subscribe(() => setTick((t) => t + 1));
		ensureTerrain();
		setTick((t) => t + 1);
		return () => {
			stop();
		};
	}, []);
	return {
		field: current,
		rev: tick
	};
}
function subscribe(fn) {
	listeners$1.add(fn);
	return () => listeners$1.delete(fn);
}
var state = {
	tool: "none",
	brush: 3,
	groundId: 2,
	borderId: ""
};
var listeners = /* @__PURE__ */ new Set();
function getAtlasUi() {
	return state;
}
function setAtlasUi(patch) {
	state = {
		...state,
		...patch
	};
	for (const fn of listeners) fn();
}
function useAtlasUi() {
	const [, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const fn = () => setTick((n) => n + 1);
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	}, []);
	return state;
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
var worldMapPromise = import("./WorldMap-BfISiZNa.mjs");
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
				children: "Raising the ground…"
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
function ActionPanel({ actions, onSubmit, onAccept, onDeny, staff = false }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [detail, setDetail] = (0, import_react.useState)("");
	const pending = actions.filter((a) => a.status === "pending");
	const recent = actions.filter((a) => a.status !== "pending").slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "ink-scroll h-full w-full overflow-y-auto bg-surface p-3 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-display text-xs tracking-[0.16em] text-gold",
				children: "LETTERS"
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
						placeholder: "What the court does",
						value: title,
						onChange: (e) => setTitle(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm",
						placeholder: "For the table",
						value: detail,
						onChange: (e) => setDetail(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "primary",
						className: "h-10 w-full",
						children: "Send"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-2",
				children: [pending.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "Nothing waiting. A letter still reaches the table."
				}), pending.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-sm border border-border bg-raised px-2 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-sm text-fg",
							children: a.title
						}),
						staff && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-gold",
							children: laneLabel(a)
						}),
						a.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-subtle",
							children: a.detail
						}),
						staff && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
function WindowFrame({ win, zIndex, onMove, onClose, onFocus, children }) {
	const drag = (0, import_react.useRef)(null);
	const winRef = (0, import_react.useRef)(win);
	const onMoveRef = (0, import_react.useRef)(onMove);
	winRef.current = win;
	onMoveRef.current = onMove;
	(0, import_react.useEffect)(() => {
		function move(e) {
			const d = drag.current;
			if (!d || e.pointerId !== d.pointerId) return;
			e.preventDefault();
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const x = Math.min(Math.max(8, e.clientX - d.dx), Math.max(8, vw - 48));
			const y = Math.min(Math.max(8, e.clientY - d.dy), Math.max(8, vh - 48));
			onMoveRef.current(winRef.current.id, x, y);
		}
		function up(e) {
			const d = drag.current;
			if (!d || e.pointerId !== d.pointerId) return;
			drag.current = null;
			document.body.classList.remove("ink-dragging-window");
		}
		window.addEventListener("pointermove", move, { passive: false });
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", up);
		return () => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
		};
	}, []);
	const left = typeof window === "undefined" ? win.x : Math.min(Math.max(8, win.x), Math.max(8, window.innerWidth - 48));
	const top = typeof window === "undefined" ? win.y : Math.min(Math.max(8, win.y), Math.max(8, window.innerHeight - 48));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("ink-panel ink-window absolute text-fg", win.kind === "war" || win.kind === "atlas" ? "w-[min(28rem,calc(100vw-1.5rem))]" : "w-[min(22rem,calc(100vw-1.5rem))]"),
		"data-kind": win.kind,
		style: {
			left,
			top,
			zIndex
		},
		onPointerDown: () => onFocus(win.id),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ink-window-title ink-hairline flex cursor-grab items-center justify-between bg-raised px-3 py-2",
			onPointerDown: (e) => {
				if (e.target.closest("button")) return;
				e.preventDefault();
				e.stopPropagation();
				drag.current = {
					pointerId: e.pointerId,
					dx: e.clientX - win.x,
					dy: e.clientY - win.y
				};
				document.body.classList.add("ink-dragging-window");
				onFocus(win.id);
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
			className: cn("max-h-[min(32rem,70vh)] overflow-y-auto text-sm ink-scroll", win.kind === "nation" ? "p-0" : "p-3"),
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
function NationWindow({ nation, pops, characters, session, docked, atWar = false, staffLive = false, onOpenCharacter, onChange, onConvert, onClose }) {
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
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-base tracking-wide",
							children: nation.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-muted tabular",
							children: [
								c?.pops ?? 0,
								" pops · ",
								formatPeople(c?.pops ?? 0, session.popValue),
								" souls"
							]
						}),
						atWar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-gold",
							children: "At war. Letters still go out. Districts wait for the peace."
						})
					]
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
							] }), staffLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-xs text-danger",
								onClick: () => onChange({ districts: nation.districts.filter((x) => x.id !== d.id) }),
								children: "Strip"
							})]
						}, d.id))]
					}),
					(!atWar || staffLive) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
					children: atWar ? "Write from the court" : "Write a conversion"
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
		label: "Fort / urban"
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
function WarWindow({ wars, armies, nations, compact = false, onTerrain, onDeclare, onResolve, onFight, onInconclusive, onToggleArmy, onAdvanceTurn, onOpenReport, audience = "staff" }) {
	const living = armies.filter((a) => a.ownerId !== "unclaimed" && !isGhost(a));
	const [atkId, setAtkId] = (0, import_react.useState)(living[0]?.id ?? "");
	const [defId, setDefId] = (0, import_react.useState)(living[1]?.id ?? living[0]?.id ?? "");
	const nameOf = (nationId) => nations.find((n) => n.id === nationId)?.name ?? nationId;
	const colorOf = (nationId) => nations.find((n) => n.id === nationId)?.color ?? "#c8c4bc";
	const armyOf = (id) => armies.find((a) => a.id === id);
	const open = wars.filter((w) => w.status === "declared");
	const done = wars.filter((w) => w.status === "resolved").slice(0, 6);
	if (audience === "player") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [open.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "No war on the painting."
		}), open.map((war) => {
			const turnsLeft = Math.max(0, war.warTurns - war.warTurn + 1);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
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
								children: "and"
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							"War-turn ",
							Math.min(war.warTurn, war.warTurns),
							"/",
							war.warTurns,
							" · ",
							turnsLeft,
							" left. Banners take the orders. The court may still write."
						]
					}),
					(war.report || war.reel) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-2 h-10 w-full",
						onClick: () => onOpenReport(war.id),
						children: "Read the fight"
					})
				]
			}, war.id);
		})]
	});
	const labelOf = (a) => `${nameOf(a.ownerId)} · ${Math.round(armyStrength(a))} · ${a.units?.[0]?.name ?? "banner"}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Staff clock. Contact is not a battle. One order per banner — lines are not retyped each phase."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-sm border border-border bg-raised p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1 text-[11px] tracking-[0.12em] text-gold",
						children: "Declare"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted",
						children: ["Attacker", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg",
							value: atkId,
							onChange: (e) => setAtkId(e.target.value),
							children: living.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: a.id,
								children: labelOf(a)
							}, a.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-2 block text-xs text-muted",
						children: ["Defender", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg",
							value: defId,
							onChange: (e) => setDefId(e.target.value),
							children: living.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: a.id,
								children: labelOf(a)
							}, a.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "gold",
						className: "mt-2 h-10 w-full",
						disabled: !atkId || !defId || atkId === defId,
						onClick: () => onDeclare(atkId, defId),
						children: "Declare"
					})
				]
			}),
			open.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No open wars. Declare, then order an Attack."
			}),
			open.map((war) => {
				const leadAtk = armyOf(war.attackerArmyId);
				const leadDef = armyOf(war.defenderArmyId);
				const atkIds = war.attackerArmyIds.length ? war.attackerArmyIds : [war.attackerArmyId];
				const defIds = war.defenderArmyIds.length ? war.defenderArmyIds : [war.defenderArmyId];
				const atkEligible = leadAtk ? [leadAtk, ...eligibleJoiners(leadAtk, defIds.map(armyOf).filter((a) => Boolean(a)), armies)] : [];
				const defEligible = leadDef ? [leadDef, ...eligibleJoiners(leadDef, atkIds.map(armyOf).filter((a) => Boolean(a)), armies)] : [];
				const spent = war.warTurn > war.warTurns;
				const turnsLeft = Math.max(0, war.warTurns - war.warTurn + 1);
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
								"War-turn ",
								Math.min(war.warTurn, war.warTurns),
								"/",
								war.warTurns,
								` · ${turnsLeft} left`,
								war.pendingAttack ? " · attack pending" : "",
								war.reel ? " · reel live" : "",
								spent ? " · turns spent" : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 grid grid-cols-2 gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JoinerList, {
								label: "Attacker banners",
								armies: atkEligible,
								selected: atkIds,
								onToggle: (id) => onToggleArmy(war.id, id, "attacker")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JoinerList, {
								label: "Defender banners",
								armies: defEligible,
								selected: defIds,
								onToggle: (id) => onToggleArmy(war.id, id, "defender")
							})]
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-col gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "staff",
									className: "h-10 w-full",
									disabled: !leadAtk || !leadDef,
									onClick: () => onFight(war.id),
									children: "Fight it out"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "h-10 w-full",
									disabled: !leadAtk || !leadDef,
									onClick: () => onResolve(war.id),
									children: war.reel ? "Open reel" : "Step the reel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "h-10 flex-1",
										onClick: () => onInconclusive(war.id),
										children: "Inconclusive"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "h-10 flex-1",
										onClick: () => onAdvanceTurn(war.id),
										disabled: spent,
										children: "Next war-turn"
									})]
								})
							]
						}),
						leadAtk && engagedEnemies(leadAtk, armies).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[11px] text-subtle",
							children: "Lead banner is out of engage radius. Approach first."
						})
					]
				}, war.id);
			}),
			done.map((war) => {
				const grade = war.report?.staffGrade ?? war.report?.grade;
				const label = war.report ? reportHeadline(grade ?? war.report.grade, war.report.winner, war.report.decisivePhase) : `${nameOf(war.attackerNationId)} vs ${nameOf(war.defenderNationId)}`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "block w-full rounded-sm border border-border px-2 py-2 text-left text-xs hover:bg-hover",
					onClick: () => onOpenReport(war.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display tracking-wide text-gold",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-muted",
						children: "View report"
					})]
				}, war.id);
			})
		]
	});
}
function JoinerList({ label, armies, selected, onToggle }) {
	const unique = armies.filter((a, i, all) => all.findIndex((x) => x.id === a.id) === i);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 text-[11px] tracking-[0.12em] text-gold",
			children: label
		}),
		unique.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-subtle",
			children: "None in ZOC."
		}),
		unique.map((army) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex items-center gap-1 py-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				checked: selected.includes(army.id),
				onChange: () => onToggle(army.id)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "truncate",
				children: [
					isGhost(army) ? "ghost" : Math.round(armyStrength(army)),
					" · ",
					army.units?.[0]?.name ?? "banner"
				]
			})]
		}, army.id))
	] });
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
var SHELF_KEY = "inkunzi.shelf.v1";
var SHELF_CAP = 8;
var BUNDLED_SHELF = [
	{
		id: "bundled-earthlike",
		name: "Earthlike",
		layout: "earthlike",
		seed: "inkunzi",
		cols: 360,
		rows: 206,
		savedAt: 0,
		bundled: true
	},
	{
		id: "bundled-pangaea",
		name: "Pangaea",
		layout: "pangaea",
		seed: "inkunzi-pangaea",
		cols: 360,
		rows: 206,
		savedAt: 0,
		bundled: true
	},
	{
		id: "bundled-archipelago",
		name: "Archipelago",
		layout: "archipelago",
		seed: "inkunzi-isles",
		cols: 360,
		rows: 206,
		savedAt: 0,
		bundled: true
	}
];
function readLocal() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(SHELF_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((e) => e && e.pack && e.id) : [];
	} catch {
		return [];
	}
}
function writeLocal(entries) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(SHELF_KEY, JSON.stringify(entries.slice(0, SHELF_CAP)));
}
function listShelf() {
	return [...BUNDLED_SHELF, ...readLocal()];
}
function saveShelf(field, name) {
	const entry = {
		id: `shelf-${Date.now().toString(36)}`,
		name: name.trim() || field.seed || "World",
		layout: field.layout ?? "earthlike",
		seed: field.seed,
		cols: field.cols,
		rows: field.rows,
		savedAt: Date.now(),
		pack: packTerrain(field)
	};
	writeLocal([entry, ...readLocal()].slice(0, SHELF_CAP));
	return entry;
}
function downloadShelfPack(field, name) {
	const blob = new Blob([JSON.stringify(packTerrain(field))], { type: "application/json" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = `${(name.trim() || field.seed || "inkunzi").replace(/\s+/g, "-")}.inkunzi.json`;
	a.click();
	URL.revokeObjectURL(a.href);
}
function fieldFromPackText(text) {
	return readTerrainPack(text);
}
function AtlasWindow({ mapWidth, mapHeight, nations, onGenerate }) {
	const { field } = useTerrainField();
	const ui = useAtlasUi();
	const [seedText, setSeedText] = (0, import_react.useState)("inkunzi");
	const [sea, setSea] = (0, import_react.useState)(46);
	const [warmth, setWarmth] = (0, import_react.useState)(50);
	const [wetness, setWetness] = (0, import_react.useState)(50);
	const [mountains, setMountains] = (0, import_react.useState)(42);
	const [continent, setContinent] = (0, import_react.useState)(58);
	const [layout, setLayout] = (0, import_react.useState)("earthlike");
	const [level, setLevel] = (0, import_react.useState)("standard");
	const [breakup, setBreakup] = (0, import_react.useState)(50);
	const [gap, setGap] = (0, import_react.useState)(70);
	const [shelfName, setShelfName] = (0, import_react.useState)("Earthlike");
	const [shelfRev, setShelfRev] = (0, import_react.useState)(0);
	const [planet, setPlanet] = (0, import_react.useState)(true);
	const [draftW, setDraftW] = (0, import_react.useState)(mapWidth);
	const [draftH, setDraftH] = (0, import_react.useState)(mapHeight);
	(0, import_react.useEffect)(() => {
		setDraftW(mapWidth);
		setDraftH(mapHeight);
	}, [mapWidth, mapHeight]);
	(0, import_react.useEffect)(() => {
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
	function slider(label, min, max, value, set) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex items-center gap-2 text-[11px] text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-16 shrink-0",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min,
					max,
					value,
					"aria-label": label,
					className: "min-w-0 flex-1",
					onChange: (e) => set(Number(e.target.value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-7 text-right tabular text-fg",
					children: value
				})
			]
		});
	}
	function toolBtn(id, label) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": ui.tool === id,
			onClick: () => setAtlasUi({ tool: ui.tool === id ? "none" : id }),
			className: cn("rounded-sm px-2 py-1.5 text-xs", ui.tool === id ? "bg-accent text-accent-fg" : "bg-raised text-fg"),
			children: label
		});
	}
	function traceFile(file) {
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
			traceImage(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, canvas.width, canvas.height, planet);
			setWorldWrap(planet);
			URL.revokeObjectURL(url);
		};
		img.src = url;
	}
	const drawing = ui.tool === "ground" || ui.tool === "border" || ui.tool === "reveal" || ui.tool === "shroud";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ink-scroll max-h-[min(70vh,36rem)] space-y-3 overflow-auto p-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1 text-[11px] tracking-[0.14em] text-gold",
					children: "SIZE"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: MAP_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("rounded-sm px-2 py-1 text-xs", draftW === p.w && draftH === p.h ? "bg-fg text-bg" : "bg-raised text-fg"),
						onClick: () => {
							setDraftW(p.w);
							setDraftH(p.h);
						},
						children: p.label
					}, p.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-w-0 flex-1 flex-col text-[11px] text-muted",
						children: ["Width", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							"aria-label": "Map width",
							className: "mt-0.5 h-8 rounded-sm border border-border bg-raised px-2 text-sm text-fg",
							value: draftW,
							min: 2048,
							onChange: (e) => setDraftW(Number(e.target.value))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-w-0 flex-1 flex-col text-[11px] text-muted",
						children: ["Height", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							"aria-label": "Map height",
							className: "mt-0.5 h-8 rounded-sm border border-border bg-raised px-2 text-sm text-fg",
							value: draftH,
							min: 1176,
							onChange: (e) => setDraftH(Number(e.target.value))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-[11px] text-muted tabular",
					children: [
						grid.cols,
						"×",
						grid.rows,
						" cells · ~",
						cell,
						"px · as large as the table can carry"
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1 text-[11px] tracking-[0.14em] text-gold",
					children: "LAYOUT"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: Object.keys(LAYOUT_RECIPES).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": layout === id,
						className: cn("rounded-sm px-2 py-1 text-xs capitalize", layout === id ? "bg-fg text-bg" : "bg-raised text-fg"),
						onClick: () => {
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
						},
						children: id
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex flex-wrap gap-1",
					children: [
						"compact",
						"standard",
						"scattered"
					].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": level === id,
						className: cn("rounded-sm px-2 py-1 text-xs capitalize", level === id ? "bg-fg text-bg" : "bg-raised text-fg"),
						onClick: () => {
							setLevel(id);
							setBreakup(breakupForLevel(LAYOUT_RECIPES[layout].breakup, id));
						},
						children: id
					}, id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] tracking-[0.14em] text-gold",
						children: "WORLD"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-8 w-full rounded-sm border border-border bg-raised px-2 text-xs text-fg",
						value: seedText,
						"aria-label": "World seed",
						onChange: (e) => setSeedText(e.target.value)
					}),
					slider("Sea", 32, 62, sea, setSea),
					slider("Warmth", 0, 100, warmth, setWarmth),
					slider("Wetness", 0, 100, wetness, setWetness),
					slider("Mountains", 0, 100, mountains, setMountains),
					slider("Scale", 0, 100, continent, setContinent),
					slider("Breakup", 0, 100, breakup, setBreakup),
					(layout === "earthlike" || layout === "continents") && slider("Gap", 0, 100, gap, setGap),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1 pt-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": planet,
								className: cn("h-8 flex-1 rounded-sm px-2 text-xs", planet ? "bg-fg text-bg" : "bg-raised text-fg"),
								onClick: () => {
									setPlanet(true);
									setWorldWrap(true);
								},
								children: "Planet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": !planet,
								className: cn("h-8 flex-1 rounded-sm px-2 text-xs", !planet ? "bg-fg text-bg" : "bg-raised text-fg"),
								onClick: () => {
									setPlanet(false);
									setWorldWrap(false);
								},
								children: "Theater"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-8 flex-1 rounded-sm bg-accent px-2 text-xs text-accent-fg",
								onClick: () => {
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
										mapHeight: size.height
									});
								},
								children: "Generate"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted",
						children: "Generate replaces the world. Pins keep their place on the rectangle."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShelfBlock, {
				name: shelfName,
				setName: setShelfName,
				rev: shelfRev,
				mapWidth: grid.width,
				mapHeight: grid.height,
				onSaved: () => setShelfRev((n) => n + 1),
				onLoadPack: (pack) => loadPack(pack),
				onGenerate
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1 text-[11px] tracking-[0.14em] text-gold",
					children: "PAINT"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [
						toolBtn("pop", "Place pop"),
						toolBtn("node", "Place node"),
						toolBtn("army", "Place army"),
						toolBtn("ground", "Ground"),
						toolBtn("border", "Borders"),
						toolBtn("reveal", "Reveal"),
						toolBtn("shroud", "Shroud"),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "rounded-sm bg-raised px-2 py-1.5 text-xs",
							children: ["Trace", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/*",
								className: "hidden",
								onChange: (e) => {
									const file = e.target.files?.[0];
									if (file) traceFile(file);
									e.target.value = "";
								}
							})]
						})
					]
				}),
				drawing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: [
								1,
								3,
								6,
								12
							].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: cn("h-7 min-w-7 rounded-sm px-2 text-xs", ui.brush === size ? "bg-fg text-bg" : "bg-raised text-fg"),
								onClick: () => setAtlasUi({ brush: size }),
								children: size
							}, size))
						}),
						ui.tool === "ground" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: TERRAINS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								title: t.label,
								"aria-label": t.label,
								"aria-pressed": ui.groundId === t.id,
								className: cn("h-6 w-6 rounded-sm border", ui.groundId === t.id ? "border-fg" : "border-transparent"),
								style: { background: t.color },
								onClick: () => setAtlasUi({ groundId: t.id })
							}, t.id))
						}),
						ui.tool === "border" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-8 w-full rounded-sm border border-border bg-raised px-2 text-xs text-fg",
							value: ui.borderId,
							onChange: (e) => setAtlasUi({ borderId: e.target.value }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Clear border"
							}), nations.filter((n) => n.id !== "unclaimed").map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: n.id,
								children: n.name
							}, n.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: ui.tool === "reveal" || ui.tool === "shroud" ? "Drag writes the fog. It does not change the ground." : "Drag paints. Click the tool again to pan."
						})
					]
				})
			] })
		]
	});
}
function ShelfBlock({ name, setName, rev, mapWidth, mapHeight, onSaved, onLoadPack, onGenerate }) {
	const entries = listShelf();
	function openEntry(entry) {
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
			mapHeight
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 text-[11px] tracking-[0.14em] text-gold",
			children: "SHELF"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "h-8 min-w-0 flex-1 rounded-sm border border-border bg-raised px-2 text-xs text-fg",
					"aria-label": "Shelf name",
					value: name,
					onChange: (e) => setName(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-8 rounded-sm bg-raised px-2 text-xs text-fg",
					onClick: () => {
						const field = getTerrain();
						if (!field) return;
						saveShelf(field, name);
						onSaved();
					},
					children: "Save"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-8 rounded-sm bg-raised px-2 text-xs text-fg",
					onClick: () => {
						const field = getTerrain();
						if (field) downloadShelfPack(field, name);
					},
					children: "Download"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mb-1 inline-block rounded-sm bg-raised px-2 py-1.5 text-xs text-fg",
			children: ["Load pack", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept: "application/json,.json",
				className: "hidden",
				onChange: (e) => {
					const file = e.target.files?.[0];
					if (!file) return;
					const reader = new FileReader();
					reader.onload = () => {
						const text = String(reader.result ?? "");
						if (!fieldFromPackText(text)) return;
						onLoadPack(JSON.parse(text));
					};
					reader.readAsText(file);
					e.target.value = "";
				}
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-1",
			children: entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "flex w-full items-baseline justify-between gap-2 rounded-sm bg-raised px-2 py-1 text-left text-xs text-fg",
				onClick: () => openEntry(entry),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate",
					children: [entry.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [
							" · ",
							entry.layout,
							" · ",
							entry.seed
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "shrink-0 tabular text-muted",
					children: [
						entry.cols,
						"×",
						entry.rows,
						entry.bundled ? " · bundled" : entry.savedAt ? ` · ${new Date(entry.savedAt).toLocaleDateString()}` : ""
					]
				})]
			}) }, entry.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[11px] text-muted",
			children: "A pack is the world, not a picture. Trace stays under Paint."
		})
	] });
}
function TopBar({ session, staffLive, tableMode, openWars, log, onStaffLive, onTableMode, onDay, onSaturday, onClock, onQueue, onExport, onImport, outlinerOpen, onOutliner, onAtlas }) {
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onOutliner,
						"aria-pressed": outlinerOpen,
						children: "Outliner"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-9 items-center gap-2 rounded-sm border border-border bg-raised px-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: staffLive,
							onChange: (e) => onStaffLive(e.target.checked)
						}), "Staff"]
					}),
					staffLive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "gold",
							onClick: onAtlas,
							children: "Atlas"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex overflow-hidden rounded-sm border border-gold-dim",
							role: "group",
							"aria-label": "Staff clock",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": tableMode === "peace",
								className: cn("min-h-9 px-3 text-sm", tableMode === "peace" ? "bg-raised text-gold" : "bg-bg text-muted hover:bg-hover"),
								onClick: () => onTableMode("peace"),
								children: "RP week"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": tableMode === "friday",
								className: cn("min-h-9 px-3 text-sm", tableMode === "friday" ? "bg-raised text-gold" : "bg-bg text-muted hover:bg-hover"),
								onClick: () => onTableMode("friday"),
								children: ["War day", openWars ? ` ${openWars}` : ""]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "staff",
							onClick: onSaturday,
							children: "Tick day"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden items-center gap-1.5 md:flex",
							children: [
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
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onQueue,
						children: "Letters"
					})
				]
			})
		]
	});
}
function Outliner({ nations, pops, armies, characters, wars, session, selectedNationId, onAdd, onOpenNation, onOpenCharacter, onSelectArmy, staffLive = false }) {
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
			staffLive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
								children: [
									"Banner · ",
									a.units?.[0]?.name ?? "host",
									" · ",
									Math.round(a.strength)
								]
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
					children: "AT WAR"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-xs text-muted",
					children: open.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: w.title }, w.id))
				})]
			})
		]
	});
}
var GRADES = [
	"legendary",
	"crushing",
	"hard fought",
	"pyrrhic",
	"narrow",
	"inconclusive"
];
var MAP_ZOOM = .14;
function BattleReport({ report, nations, attackerNationId, defenderNationId, mapWidth = 6145, mapHeight = 3530, mapSrc, reelLive = false, reelDone = false, phaseIndex = 0, staff = false, onContinue, onFightOut, onDismiss, onOverride }) {
	const nameOf = (id) => nations.find((n) => n.id === id)?.name ?? id;
	const grade = report.staffGrade ?? report.grade;
	const atkLines = report.units.filter((u) => report.attackerIds.includes(u.armyId));
	const defLines = report.units.filter((u) => report.defenderIds.includes(u.armyId));
	const atkNations = sideNations(atkLines, attackerNationId);
	const defNations = sideNations(defLines, defenderNationId);
	const headline = reportHeadline(grade, report.winner, report.decisivePhase);
	const total = Math.round(report.attackerLoss + report.defenderLoss);
	const [correct, setCorrect] = (0, import_react.useState)(false);
	const [remains, setRemains] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		setCorrect(false);
		setRemains(Object.fromEntries(report.units.map((u) => [u.unitId, Math.round(u.remain)])));
	}, [report.phases.length, report.decisivePhase]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (e.key !== "Escape") return;
			if (reelLive && staff) return;
			(onDismiss ?? onContinue)();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		onContinue,
		onDismiss,
		reelLive,
		staff
	]);
	function remainsOrUndefined() {
		if (!correct) return void 0;
		return report.units.map((u) => ({
			unitId: u.unitId,
			remain: remains[u.unitId] ?? u.remain
		}));
	}
	function commit() {
		onContinue(remainsOrUndefined());
	}
	function fight() {
		onFightOut?.(remainsOrUndefined());
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "i2-overlay",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": headline,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "i2-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "i2-title",
					children: headline
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "i2-pips",
					"aria-label": "Battle phases",
					children: BATTLE_PHASES.map((id, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: cn("i2-pip", i === phaseIndex && "is-current", i < phaseIndex && "is-done"),
						children: PHASE_LABEL[id]
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "i2-top",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "i2-side-head i2-side-head-atk",
							children: "Attackers"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "i2-map",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapCrop, {
								x: report.x,
								y: report.y,
								mapWidth,
								mapHeight,
								src: mapSrc
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "i2-side-head i2-side-head-def",
							children: "Defenders"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "i2-side-body i2-atk-body",
							children: [atkNations.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "i2-faction",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "i2-faction-bar" }), nameOf(id)]
							}, id)), report.attackerTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "i2-tags",
								children: report.attackerTags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "i2-tag",
									children: t
								}, `a-${t}`))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "i2-side-body i2-def-body i2-faction-def",
							children: [defNations.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "i2-faction i2-faction-def",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "i2-faction-bar" }), nameOf(id)]
							}, id)), report.defenderTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "i2-tags",
								children: report.defenderTags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "i2-tag",
									children: t
								}, `d-${t}`))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "i2-tables",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitTable, {
							title: "Attacker units",
							head: "i2-col-head-atk",
							lines: atkLines,
							frozen: correct,
							remains,
							onRemain: (id, n) => setRemains((cur) => ({
								...cur,
								[id]: n
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitTable, {
							title: "Defender units",
							head: "i2-col-head-def",
							lines: defLines,
							frozen: correct,
							remains,
							onRemain: (id, n) => setRemains((cur) => ({
								...cur,
								[id]: n
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "i2-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "i2-col-head i2-col-head-cas",
								children: "Casualties by faction"
							}), report.casualtiesByNation.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "i2-empty",
								children: "None written."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "i2-sheet",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Faction" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "num",
									children: "Dead"
								})] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.casualtiesByNation.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: nameOf(c.nationId) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "num",
									children: Math.round(c.dead)
								})] }, c.nationId)) })]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "i2-foot",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "i2-stat",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "i2-stat-label",
								children: "Attacker casualties"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "i2-stat-value",
								children: Math.round(report.attackerLoss)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "i2-stat",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "i2-stat-label",
								children: "Defender casualties"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "i2-stat-value",
								children: Math.round(report.defenderLoss)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "i2-stat",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "i2-stat-label",
								children: "Total casualties"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "i2-stat-value",
								children: total
							})]
						}),
						reelLive && staff && onFightOut && !reelDone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "i2-continue",
							onClick: fight,
							children: "Fight it out"
						}),
						reelLive && staff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("i2-continue", !reelDone && "is-quiet"),
							onClick: commit,
							children: reelDone ? "Occupy" : "Next phase"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "i2-continue",
							onClick: () => (onDismiss ?? onContinue)(),
							children: "Close"
						})
					]
				}),
				staff && (onOverride || reelLive) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "i2-staff",
					children: [
						reelLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("i2-freeze", correct && "is-on"),
							"aria-pressed": correct,
							onClick: () => setCorrect((v) => !v),
							children: correct ? "Correcting" : "Correct lines"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lines take their dead. Retype only if the ruling is wrong." }),
						onOverride && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Staff grade", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: grade,
							onChange: (e) => onOverride(e.target.value),
							children: GRADES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: g,
								children: GRADE_LABEL[g]
							}, g))
						})] })
					]
				})
			]
		})
	});
}
function UnitTable({ title, head, lines, frozen, remains, onRemain }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "i2-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: `i2-col-head ${head}`,
			children: title
		}), lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "i2-empty",
			children: "No lines fielded."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "i2-sheet",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Unit type" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "num",
					children: "Fielded"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "num",
					children: "Remain"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: line.name || unitTypeById(line.typeId).label }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "num",
					children: Math.round(line.fielded)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "num",
					children: frozen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "i2-remain",
						type: "number",
						min: 0,
						"aria-label": `${line.name || line.typeId} remain`,
						value: Number.isFinite(remains[line.unitId]) ? remains[line.unitId] : Math.round(line.remain),
						onChange: (e) => onRemain(line.unitId, Math.max(0, Number(e.target.value) || 0))
					}) : Math.round(line.remain)
				})
			] }, `${line.armyId}-${line.unitId}`)) })]
		})]
	});
}
function MapCrop({ x, y, mapWidth, mapHeight, src }) {
	const fx = x ?? mapWidth / 2;
	const fy = mapHeight - (y ?? mapHeight / 2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "i2-map-frame",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "i2-map-shift",
			style: {
				width: mapWidth,
				height: mapHeight,
				transform: `translate(${-fx * MAP_ZOOM}px, ${-fy * MAP_ZOOM}px) scale(${MAP_ZOOM})`
			},
			children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: "",
				width: mapWidth,
				height: mapHeight
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
				width: mapWidth,
				height: mapHeight,
				background: "#1a4f73"
			} })
		})
	});
}
function sideNations(lines, fallback) {
	const ids = [];
	const add = (id) => {
		if (!id || ids.includes(id)) return;
		ids.push(id);
	};
	add(fallback);
	for (const line of lines) add(line.nationId);
	return ids;
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
function migrate$1(raw) {
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
			if (Array.isArray(parsed) && parsed.length) return migrate$1(parsed);
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
		},
		units: [
			{
				id: "u-ves-horse",
				typeId: "cavalry",
				name: "Imperial Horse",
				fielded: 8
			},
			{
				id: "u-ves-bows",
				typeId: "archers",
				name: "Levy Bows",
				fielded: 12
			},
			{
				id: "u-ves-foot",
				typeId: "infantry",
				name: "Vestorial Foot",
				fielded: 20
			}
		],
		posture: "plain"
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
		},
		units: [
			{
				id: "u-tun-riders",
				typeId: "cavalry",
				name: "Speaker's Riders",
				fielded: 10
			},
			{
				id: "u-tun-bows",
				typeId: "archers",
				name: "Hill Bows",
				fielded: 4
			},
			{
				id: "u-tun-spears",
				typeId: "infantry",
				name: "Tunnu Spears",
				fielded: 14
			}
		],
		posture: "plain"
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
		},
		units: [
			{
				id: "u-rek-out",
				typeId: "cavalry",
				name: "Outriders",
				fielded: 2
			},
			{
				id: "u-rek-bows",
				typeId: "archers",
				name: "Rekolian Bows",
				fielded: 6
			},
			{
				id: "u-rek-guard",
				typeId: "infantry",
				name: "Seat Guard",
				fielded: 8
			}
		],
		posture: "plain"
	}
];
var KEY$3 = "inkunzi.armies.v2";
var LEGACY$1 = ["inkunzi.armies.v1"];
function migrateArmy(row) {
	const units = row.units?.length ? row.units : unitsOf(row);
	const strength = units.reduce((n, u) => n + u.fielded, 0) || row.strength;
	return {
		...row,
		units,
		strength,
		posture: row.posture ?? "plain",
		moveUsed: row.moveUsed ?? false,
		actionUsed: row.actionUsed ?? false
	};
}
function loadArmies() {
	if (typeof window === "undefined") return STARTER_ARMIES;
	try {
		for (const key of [KEY$3, ...LEGACY$1]) {
			const raw = window.localStorage.getItem(key);
			if (!raw) continue;
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length) return parsed.map(migrateArmy);
		}
		return STARTER_ARMIES;
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
	const units = [
		{
			id: crypto.randomUUID(),
			typeId: "cavalry",
			name: "Cavalry",
			fielded: 2
		},
		{
			id: crypto.randomUUID(),
			typeId: "archers",
			name: "Archers",
			fielded: 3
		},
		{
			id: crypto.randomUUID(),
			typeId: "infantry",
			name: "Infantry",
			fielded: 5
		}
	];
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
		},
		units,
		posture: "plain",
		moveUsed: false,
		actionUsed: false
	};
}
function updateArmy(armies, id, patch) {
	return armies.map((a) => {
		if (a.id !== id) return a;
		const next = {
			...a,
			...patch
		};
		if (patch.units) next.strength = patch.units.reduce((n, u) => n + u.fielded, 0);
		return next;
	});
}
function removeArmy(armies, id) {
	return armies.filter((a) => a.id !== id);
}
function resetWarTurnFlags(armies, fightingIds) {
	return armies.map((a) => {
		const nextPosture = fightingIds.has(a.id) && a.posture === "entrenched" ? "entrenched" : "plain";
		return {
			...a,
			moveUsed: false,
			actionUsed: false,
			posture: nextPosture
		};
	});
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
	if (kind === "march" || kind === "build" || kind === "entrench" || kind === "forceMarch" || kind === "skirmish") return {
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
var KEY = "inkunzi.wars.v2";
var LEGACY = "inkunzi.wars.v1";
function migrate(row) {
	const attackerArmyIds = row.attackerArmyIds?.length ? row.attackerArmyIds : [row.attackerArmyId];
	const defenderArmyIds = row.defenderArmyIds?.length ? row.defenderArmyIds : [row.defenderArmyId];
	return {
		id: row.id ?? crypto.randomUUID(),
		attackerArmyId: attackerArmyIds[0] ?? row.attackerArmyId,
		defenderArmyId: defenderArmyIds[0] ?? row.defenderArmyId,
		attackerArmyIds,
		defenderArmyIds,
		attackerNationId: row.attackerNationId,
		defenderNationId: row.defenderNationId,
		title: row.title,
		terrain: row.terrain,
		status: row.status,
		warTurns: row.warTurns ?? 4,
		warTurn: row.warTurn ?? 1,
		pendingAttack: row.pendingAttack ?? row.status === "declared",
		report: row.report,
		reel: row.reel
	};
}
function loadWars() {
	if (typeof window === "undefined") return [];
	try {
		for (const key of [KEY, LEGACY]) {
			const raw = window.localStorage.getItem(key);
			if (!raw) continue;
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return parsed.map(migrate);
		}
		return [];
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
function makeWar(attacker, defender, terrain = "open", names, extra) {
	const atk = names?.attacker ?? attacker.ownerId;
	const def = names?.defender ?? defender.ownerId;
	const attackerArmyIds = extra?.attackerIds?.length ? extra.attackerIds : [attacker.id];
	const defenderArmyIds = extra?.defenderIds?.length ? extra.defenderIds : [defender.id];
	return {
		id: crypto.randomUUID(),
		attackerArmyId: attackerArmyIds[0] ?? attacker.id,
		defenderArmyId: defenderArmyIds[0] ?? defender.id,
		attackerArmyIds,
		defenderArmyIds,
		attackerNationId: attacker.ownerId,
		defenderNationId: defender.ownerId,
		title: `${atk} marches on ${def}`,
		terrain,
		status: "declared",
		warTurns: 4,
		warTurn: 1,
		pendingAttack: true
	};
}
function findOpenWar(wars, a, b) {
	return wars.find((w) => w.status === "declared" && (w.attackerArmyIds.includes(a) || w.defenderArmyIds.includes(a) || w.attackerArmyId === a || w.defenderArmyId === a) && (w.attackerArmyIds.includes(b) || w.defenderArmyIds.includes(b) || w.attackerArmyId === b || w.defenderArmyId === b));
}
function warHasArmy(war, armyId) {
	return war.attackerArmyIds.includes(armyId) || war.defenderArmyIds.includes(armyId) || war.attackerArmyId === armyId || war.defenderArmyId === armyId;
}
function updateWar(wars, id, patch) {
	return wars.map((w) => w.id === id ? {
		...w,
		...patch
	} : w);
}
function overrideGrade(war, grade) {
	if (!war.report) return war;
	return {
		...war,
		report: {
			...war.report,
			staffGrade: grade,
			summary: war.report.summary.replace(/^[^.]*/, `${grade[0].toUpperCase()}${grade.slice(1)} (staff)`)
		}
	};
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
	const log = [`Tick day — turn ${session.mechanicalTurn}.`];
	return {
		nations: nations.map((n) => {
			const row = tickNation(n, pops, nodes, armies, session);
			log.push(...row.log);
			return row.nation;
		}),
		log
	};
}
function buildSnapshot(session, nations, pops, nodes, armies, actions = [], characters = [], wars = [], terrain) {
	return {
		version: 1,
		session,
		nations,
		pops,
		nodes,
		armies,
		actions,
		characters,
		wars,
		...terrain ? { terrain } : {}
	};
}
function parseSnapshot(raw) {
	const data = JSON.parse(raw);
	if (!data || data.version !== 1 || !data.session) throw new Error("Not an Inkunzi world file");
	return {
		...data,
		actions: data.actions ?? [],
		characters: data.characters ?? [],
		wars: data.wars ?? [],
		terrain: data.terrain
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
	const [marchMode, setMarchMode] = (0, import_react.useState)("march");
	const [selectedNationId, setSelectedNationId] = (0, import_react.useState)("vestoria");
	const [log, setLog] = (0, import_react.useState)("Order a banner. Write to the court. A war does not need a sign.");
	const [staffLive, setStaffLive] = (0, import_react.useState)(false);
	const [tableMode, setTableMode] = (0, import_react.useState)("peace");
	const [dock, setDock] = (0, import_react.useState)("none");
	const [reportWarId, setReportWarId] = (0, import_react.useState)(null);
	const [outlinerOpen, setOutlinerOpen] = (0, import_react.useState)(false);
	const ready = session && popsState.ready && nationsState.ready && nodesState.ready && armiesState.ready && actionsState.ready && charactersState.ready && warsState.ready;
	(0, import_react.useEffect)(() => {
		if (staffLive) return;
		setWindows((cur) => cur.some((w) => w.kind === "atlas") ? cur.filter((w) => w.kind !== "atlas") : cur);
		setAtlasUi({ tool: "none" });
	}, [staffLive]);
	(0, import_react.useEffect)(() => {
		if (windows.some((w) => w.kind === "atlas")) return;
		if (getAtlasUi().tool !== "none") setAtlasUi({ tool: "none" });
	}, [windows]);
	if (!ready || !session || !setSession) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
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
	const friday = staffLive && tableMode === "friday";
	const atWarIds = warsState.wars.filter((w) => w.status === "declared").flatMap((w) => [w.attackerNationId, w.defenderNationId]);
	function exportWorld() {
		downloadSnapshot(buildSnapshot(current, nations, pops, nodesState.nodes, armiesState.armies, actions, charactersState.characters, warsState.wars, getTerrain() ? packTerrain(getTerrain()) : void 0));
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
		if (snap.terrain) {
			const next = unpackTerrain(snap.terrain);
			if (next) replaceTerrain(next);
		}
		setLog("World imported. If it is not on the sheet, it did not happen — until now.");
	}
	function generateWorld(job) {
		const sx = job.width / current.mapWidth;
		const sy = job.height / current.mapHeight;
		if (sx !== 1 || sy !== 1) {
			const fit = (items) => items.map((p) => ({
				...p,
				x: Math.max(0, Math.min(job.width - 1, p.x * sx)),
				y: Math.max(0, Math.min(job.height - 1, p.y * sy))
			}));
			setPops(fit(pops));
			nodesState.setNodes(fit(nodesState.nodes));
			armiesState.setArmies(fit(armiesState.armies));
		}
		setSession({
			...current,
			mapWidth: job.width,
			mapHeight: job.height
		});
		newWorld(job.seed, job.sea, job);
		setLog(`New world · ${job.width}×${job.height}${job.wrap === false ? " · theater" : " · planet"}.`);
	}
	function pushWindow(kind, title, payload) {
		setWindows((cur) => {
			const existing = cur.find((w) => w.kind === kind && w.payload === payload);
			if (existing) return [...cur.filter((w) => w.id !== existing.id), existing];
			const slot = kind === "war" ? {
				x: 420,
				y: 72
			} : kind === "atlas" ? {
				x: 72,
				y: 72
			} : kind === "nation" ? {
				x: 16,
				y: 64
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
		pushWindow("nation", nations.find((x) => x.id === id)?.name ?? id, id);
	}
	function openCharacter(id) {
		const c = charactersState.characters.find((x) => x.id === id);
		if (!c) return;
		pushWindow("character", c.name, c.id);
	}
	function applyMarch(armyId, x, y, mode = marchMode) {
		const army = armiesState.armies.find((a) => a.id === armyId);
		if (!army) return;
		const open = warsState.wars.find((w) => w.status === "declared" && warHasArmy(w, armyId));
		if (open) {
			if (mode === "skirmish") {
				if (army.moveUsed && army.actionUsed) {
					setLog("No Move or Action left this war-turn.");
					setMarchingArmyId(null);
					return;
				}
			} else if (army.moveUsed) {
				if (army.actionUsed) {
					setLog("Double march would spend Action — already spent.");
					setMarchingArmyId(null);
					return;
				}
			}
		}
		const posture = mode === "force" ? "forceMarched" : mode === "skirmish" ? "skirmish" : army.posture === "entrenched" ? "plain" : army.posture;
		const moveUsed = true;
		const actionUsed = mode === "skirmish" || Boolean(open) && Boolean(army.moveUsed) ? true : army.actionUsed;
		const moved = armiesState.armies.map((a) => a.id === armyId ? {
			...a,
			x,
			y,
			posture,
			moveUsed,
			actionUsed
		} : a);
		armiesState.setArmies(moved);
		setMarchingArmyId(null);
		revealAlong(army.x, army.y, x, y, current.mapWidth, current.mapHeight);
		const next = moved.find((a) => a.id === armyId);
		if (!next) {
			setLog("Marched.");
			return;
		}
		const foe = firstContact(next, moved);
		if (!foe) {
			setLog(mode === "skirmish" ? "Skirmish march. No banner in the disk." : "Peacetime march. Approach is not a battle.");
			return;
		}
		const defName = nations.find((n) => n.id === foe.ownerId)?.name ?? foe.ownerId;
		setLog(`Approached ${defName}. Contact is not a battle — Attack is an order.`);
	}
	function moveArmy(id, x, y) {
		const army = armiesState.armies.find((a) => a.id === id);
		const title = `March ${nations.find((n) => n.id === army?.ownerId)?.name ?? "army"}`;
		const detail = `to ${Math.round(x)}, ${Math.round(y)} (${marchMode})`;
		if (staffLive) {
			addAction({ ...makeAction("march", title, detail, {
				armyId: id,
				toX: x,
				toY: y,
				auto: true,
				status: "accepted",
				marchMode
			}) });
			applyMarch(id, x, y, marchMode);
			return;
		}
		addAction(makeAction("march", title, detail, {
			armyId: id,
			toX: x,
			toY: y,
			marchMode
		}));
		setLog("March queued for staff. Permission is not the outcome.");
		setMarchingArmyId(null);
	}
	function declareWar(attackerId, defenderId) {
		const atk = armiesState.armies.find((a) => a.id === attackerId);
		const def = armiesState.armies.find((a) => a.id === defenderId);
		if (!atk || !def) return;
		if (atk.id === def.id || atk.ownerId === def.ownerId) {
			setLog("Declare needs two enemy banners.");
			return;
		}
		if (findOpenWar(warsState.wars, atk.id, def.id)) {
			setLog("That war is already declared.");
			return;
		}
		const atkJoin = [atk, ...eligibleJoiners(atk, [def], armiesState.armies)];
		const defJoin = [def, ...eligibleJoiners(def, [atk], armiesState.armies)];
		const atkName = nations.find((n) => n.id === atk.ownerId)?.name ?? atk.ownerId;
		const defName = nations.find((n) => n.id === def.ownerId)?.name ?? def.ownerId;
		const war = makeWar(atk, def, suggestTerrain(def, pops), {
			attacker: atkName,
			defender: defName
		}, {
			attackerIds: atkJoin.map((a) => a.id),
			defenderIds: defJoin.map((a) => a.id)
		});
		warsState.add({
			...war,
			pendingAttack: false
		});
		setLog(`Declared — ${war.title}. Attack is still an order.`);
		setTableMode("friday");
	}
	function startFridayReel(warId, armyList = armiesState.armies, warOverride, playOut = false) {
		const war = warOverride ?? warsState.wars.find((w) => w.id === warId);
		if (!war || war.status !== "declared") return;
		if (war.reel) {
			setReportWarId(warId);
			return;
		}
		const atkIds = war.attackerArmyIds.length ? war.attackerArmyIds : [war.attackerArmyId];
		const defIds = war.defenderArmyIds.length ? war.defenderArmyIds : [war.defenderArmyId];
		const attackers = atkIds.map((id) => armyList.find((a) => a.id === id)).filter((a) => a != null).filter((a) => !isGhost(a));
		const defenders = defIds.map((id) => armyList.find((a) => a.id === id)).filter((a) => a != null);
		if (!attackers.length || !defenders.length) {
			setLog("Banners missing. Cannot open the reel.");
			return;
		}
		if (defenders.every(isGhost)) {
			const lead = attackers[0];
			armiesState.setArmies(strikeGhost(armyList, lead.id, defenders[0].id));
			warsState.update(warId, {
				status: "resolved",
				pendingAttack: false,
				reel: void 0
			});
			setLog("Ghost struck. The pin is gone.");
			return;
		}
		const opened = startReel({
			attackers,
			defenders,
			terrain: war.terrain,
			pops
		});
		const reel = playOut ? playOutReel(opened) : opened;
		const merged = mergeReelArmies(armyList, reel).map((a) => a.id === attackers[0].id ? {
			...a,
			actionUsed: true
		} : a);
		if (playOut) {
			const closed = closeReel(reel, merged, pops);
			armiesState.setArmies(closed.armies);
			const patch = {
				status: "resolved",
				pendingAttack: false,
				reel: void 0,
				report: closed.report
			};
			if (warsState.wars.some((w) => w.id === war.id)) warsState.update(war.id, patch);
			else warsState.add({
				...war,
				...patch
			});
			setReportWarId(warId);
			setTableMode("friday");
			setLog(`${closed.report.summary} Occupy.`);
			return;
		}
		armiesState.setArmies(merged);
		if (warsState.wars.some((w) => w.id === war.id)) warsState.update(war.id, {
			reel,
			report: reel.report,
			pendingAttack: false
		});
		else warsState.add({
			...war,
			reel,
			report: reel.report,
			pendingAttack: false
		});
		setReportWarId(warId);
		setTableMode("friday");
		setLog(`Shock. ${reel.report.summary}`);
	}
	function fightOut(staff, warId = reportWarId) {
		const war = warsState.wars.find((w) => w.id === warId);
		if (!war || war.status !== "declared") return;
		if (!war.reel) {
			startFridayReel(war.id, armiesState.armies, war, true);
			return;
		}
		const closed = closeReel(playOutReel(staff?.length ? applyStaffRemain(war.reel, staff) : war.reel), armiesState.armies, pops);
		armiesState.setArmies(closed.armies);
		warsState.update(war.id, {
			status: "resolved",
			pendingAttack: false,
			reel: void 0,
			report: closed.report
		});
		setReportWarId(war.id);
		setLog(`${closed.report.summary} Occupy.`);
	}
	function continueBattle(staff) {
		const war = warsState.wars.find((w) => w.id === reportWarId);
		if (!war?.reel) {
			setReportWarId(null);
			return;
		}
		const next = continueReel(war.reel, armiesState.armies, pops, staff);
		armiesState.setArmies(next.armies);
		if (!next.reel) {
			warsState.update(war.id, {
				status: "resolved",
				pendingAttack: false,
				reel: void 0,
				report: next.report
			});
			setReportWarId(null);
			const leftover = next.report.winner === "attacker" ? war.reel.leftoverAtk : next.report.winner === "defender" ? war.reel.leftoverDef : false;
			setLog(leftover ? `${next.report.summary} Occupy. Move still in hand — Attack is spent.` : `${next.report.summary} Occupy.`);
			return;
		}
		warsState.update(war.id, {
			reel: next.reel,
			report: next.reel.report
		});
		setLog(next.reel.report.summary);
	}
	function issueAttack(attackerId, defenderId, fromQueue = false) {
		const atk = armiesState.armies.find((a) => a.id === attackerId);
		const def = armiesState.armies.find((a) => a.id === defenderId);
		if (!atk || !def) return;
		if (atk.id === def.id || atk.ownerId === def.ownerId) {
			setLog("Attack needs an enemy banner.");
			return;
		}
		if (!staffLive && !armiesInContact(atk, def)) {
			setLog("Out of engage radius. Approach the banner first.");
			return;
		}
		if (isGhost(atk)) {
			setLog("A ghost cannot Attack.");
			return;
		}
		if (isGhost(def)) {
			const next = strikeGhost(armiesState.armies, atk.id, def.id);
			if (next.length === armiesState.armies.length) {
				setLog("That pin is not a ghost, or it has reinforced.");
				return;
			}
			armiesState.setArmies(next);
			const open = findOpenWar(warsState.wars, atk.id, def.id);
			if (open) warsState.update(open.id, {
				status: "resolved",
				pendingAttack: false,
				reel: void 0
			});
			setLog("Ghost struck. The pin is gone.");
			return;
		}
		if (atk.actionUsed) {
			setLog("Action already spent this war-turn.");
			return;
		}
		const atkJoin = [atk, ...eligibleJoiners(atk, [def], armiesState.armies)];
		const defJoin = [def, ...eligibleJoiners(def, [atk], armiesState.armies)];
		const atkName = nations.find((n) => n.id === atk.ownerId)?.name ?? atk.ownerId;
		const defName = nations.find((n) => n.id === def.ownerId)?.name ?? def.ownerId;
		const terrain = suggestTerrain(def, pops);
		const existing = findOpenWar(warsState.wars, atk.id, def.id);
		const commit = () => {
			const spent = armiesState.armies.map((a) => a.id === atk.id ? {
				...a,
				actionUsed: true
			} : a);
			armiesState.setArmies(spent);
			if (existing) {
				const patched = {
					...existing,
					pendingAttack: true,
					attackerArmyId: atk.id,
					defenderArmyId: def.id,
					attackerArmyIds: atkJoin.map((a) => a.id),
					defenderArmyIds: defJoin.map((a) => a.id)
				};
				warsState.update(existing.id, patched);
				if (friday) {
					startFridayReel(existing.id, spent, patched);
					return;
				}
				setLog(`Attack ordered — ${existing.title}. The table will fight it.`);
			} else {
				const war = makeWar(atk, def, terrain, {
					attacker: atkName,
					defender: defName
				}, {
					attackerIds: atkJoin.map((a) => a.id),
					defenderIds: defJoin.map((a) => a.id)
				});
				if (friday) {
					startFridayReel(war.id, spent, war);
					return;
				}
				warsState.add(war);
				setLog(`Attack ordered — ${war.title}. The table will fight it.`);
			}
		};
		if (fromQueue || staffLive) {
			if (!fromQueue) addAction({ ...makeAction("attack", `${atkName} attacks ${defName}`, "Explicit order. Not a kiss.", {
				armyId: atk.id,
				defenderArmyId: def.id,
				auto: false,
				status: "accepted",
				lane: 3
			}) });
			commit();
			return;
		}
		addAction(makeAction("attack", `${atkName} attacks ${defName}`, "Lane 3 — staff gate.", {
			armyId: atk.id,
			defenderArmyId: def.id
		}));
		setLog("Attack queued for staff.");
	}
	function entrenchArmy(id) {
		const army = armiesState.armies.find((a) => a.id === id);
		if (!army) return;
		if (army.actionUsed) {
			setLog("Action already spent.");
			return;
		}
		const doIt = () => armiesState.update(id, {
			posture: "entrenched",
			actionUsed: true
		});
		if (staffLive) {
			addAction({ ...makeAction("entrench", "Entrench", "Tortoise sit.", {
				armyId: id,
				auto: true,
				status: "accepted"
			}) });
			doIt();
			setLog("Entrenched. Sit bonus if attacked.");
			return;
		}
		addAction(makeAction("entrench", "Entrench", "Tortoise sit.", { armyId: id }));
		setLog("Entrench queued for staff.");
	}
	function acceptAction(id) {
		const action = actions.find((a) => a.id === id);
		if (!action) return;
		if (action.kind === "march" && action.armyId != null && action.toX != null && action.toY != null) applyMarch(action.armyId, action.toX, action.toY, action.marchMode ?? "march");
		if (action.kind === "attack" && action.armyId && action.defenderArmyId) issueAttack(action.armyId, action.defenderArmyId, true);
		if (action.kind === "entrench" && action.armyId) armiesState.update(action.armyId, {
			posture: "entrenched",
			actionUsed: true
		});
		if (action.kind === "convert" && action.needsRoll) {
			const ruler = charactersState.characters.find((c) => c.nationId === action.nationId);
			const roll = checkStat(ruler?.stats.charisma ?? 0, action.dc ?? 15);
			actionsState.setResult(id, roll.result);
			setLog(`${ruler?.name ?? "A courtier"} rolls ${roll.roll}+${roll.stat}=${roll.total} vs DC ${roll.dc} — ${roll.result}.`);
			return;
		}
		setStatus(id, "accepted");
	}
	function markInconclusive(id) {
		const war = warsState.wars.find((w) => w.id === id);
		if (!war || war.status !== "declared") return;
		const atk = armiesState.armies.find((a) => a.id === war.attackerArmyId);
		const def = armiesState.armies.find((a) => a.id === war.defenderArmyId);
		warsState.update(id, {
			status: "resolved",
			pendingAttack: false,
			reel: void 0,
			report: {
				attackerIds: war.attackerArmyIds,
				defenderIds: war.defenderArmyIds,
				terrain: war.terrain,
				phases: [],
				winner: "inconclusive",
				wipe: false,
				grade: "inconclusive",
				decisivePhase: null,
				attackerTags: [],
				defenderTags: [],
				units: [],
				casualtiesByNation: [],
				attackerLoss: 0,
				defenderLoss: 0,
				summary: "Inconclusive. Neither side takes the field.",
				x: atk && def ? (atk.x + def.x) / 2 : atk?.x ?? def?.x,
				y: atk && def ? (atk.y + def.y) / 2 : atk?.y ?? def?.y
			}
		});
		setReportWarId(id);
		setLog("Inconclusive. The week writes itself down as a stare.");
	}
	function overrideWarGrade(id, grade) {
		const war = warsState.wars.find((w) => w.id === id);
		if (!war) return;
		warsState.update(id, overrideGrade(war, grade));
	}
	function toggleWarArmy(warId, armyId, side) {
		const war = warsState.wars.find((w) => w.id === warId);
		if (!war) return;
		const key = side === "attacker" ? "attackerArmyIds" : "defenderArmyIds";
		const lead = side === "attacker" ? war.attackerArmyId : war.defenderArmyId;
		if (armyId === lead) return;
		const cur = war[key];
		const next = cur.includes(armyId) ? cur.filter((x) => x !== armyId) : [...cur, armyId];
		warsState.update(warId, { [key]: next.length ? next : [lead] });
	}
	function advanceWarTurn(id) {
		const war = warsState.wars.find((w) => w.id === id);
		if (!war || war.status !== "declared") return;
		const ids = /* @__PURE__ */ new Set([...war.attackerArmyIds, ...war.defenderArmyIds]);
		armiesState.setArmies(resetWarTurnFlags(armiesState.armies, ids));
		warsState.update(id, {
			warTurn: war.warTurn + 1,
			pendingAttack: false
		});
		setLog(`War-turn ${Math.min(war.warTurn + 1, war.warTurns)}/${war.warTurns}. Move and Action refresh.`);
	}
	function runTick() {
		const result = tickAll(nations, pops, nodesState.nodes, armiesState.armies, current);
		setNations(result.nations);
		setSession(advanceTurn(current));
		const fighting = new Set(warsState.wars.filter((w) => w.status === "declared").flatMap((w) => [...w.attackerArmyIds, ...w.defenderArmyIds]));
		armiesState.setArmies(resetWarTurnFlags(armiesState.armies, fighting));
		warsState.setWars(warsState.wars.map((w) => w.status === "declared" ? {
			...w,
			warTurn: w.warTurn + 1,
			pendingAttack: false
		} : w));
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
	function renderWarBoard(audience = "staff") {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarWindow, {
			wars: warsState.wars,
			armies: armiesState.armies,
			nations,
			compact: friday,
			audience,
			onTerrain: (id, terrain) => warsState.update(id, { terrain }),
			onDeclare: declareWar,
			onResolve: (id) => startFridayReel(id),
			onFight: (id) => fightOut(void 0, id),
			onInconclusive: markInconclusive,
			onToggleArmy: toggleWarArmy,
			onAdvanceTurn: advanceWarTurn,
			onOpenReport: setReportWarId
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				session: current,
				staffLive,
				tableMode,
				openWars,
				log,
				onStaffLive: setStaffLive,
				onTableMode: setTableMode,
				onDay: () => setSession(advanceDay(current)),
				onSaturday: runTick,
				onClock: () => pushWindow("session", "Session clock", "session"),
				onQueue: () => pushWindow("queue", "Letters", "queue"),
				onExport: exportWorld,
				onImport: (file) => void importWorld(file),
				outlinerOpen,
				onOutliner: () => setOutlinerOpen((v) => !v),
				onAtlas: () => pushWindow("atlas", "Atlas", "atlas")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 isolate z-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldMapLoader, {
							mapWidth: current.mapWidth,
							mapHeight: current.mapHeight,
							marchRange: turnMarchRange(current) * (marchMode === "skirmish" ? 2 : marchMode === "force" ? 1.5 : 1),
							selectedArmyId,
							marchingArmyId,
							staffLive,
							atWarNationIds: atWarIds,
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
							onStartMarch: (id, mode) => {
								setSelectedArmyId(id);
								setMarchingArmyId(id);
								setMarchMode(mode);
							},
							onAttack: issueAttack,
							onEntrench: entrenchArmy,
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
					outlinerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ink-panel absolute top-3 right-3 z-chrome h-[min(32rem,calc(100%-1.5rem))] w-64 overflow-hidden",
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
							},
							staffLive
						})
					}),
					staffLive && friday && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "friday-dock ink-panel ink-scroll",
						"aria-label": "Staff war day",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "ink-hairline flex items-baseline justify-between bg-raised px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-sm tracking-[0.16em] text-gold",
								children: "War day"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] text-muted tabular",
								children: [
									openWars,
									" war",
									openWars === 1 ? "" : "s",
									" · staff"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-3",
							children: renderWarBoard("staff")
						})]
					}),
					!staffLive && openWars > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "friday-dock ink-panel ink-scroll",
						"aria-label": "Open wars",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "ink-hairline flex items-baseline justify-between bg-raised px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-sm tracking-[0.16em] text-gold",
								children: "At war"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] text-muted tabular",
								children: [
									openWars,
									" war",
									openWars === 1 ? "" : "s"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-3",
							children: renderWarBoard("player")
						})]
					})
				]
			}),
			dock !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-16 z-chrome max-h-[60vh] overflow-hidden border-t border-gold-dim bg-surface md:hidden",
				children: dock === "actions" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionPanel, {
					actions,
					staff: staffLive,
					onSubmit: (title, detail) => addAction(makeAction("flavor", title, detail)),
					onAccept: acceptAction,
					onDeny: (id) => setStatus(id, "denied")
				}) : selectedNation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NationWindow, {
					nation: selectedNation,
					pops,
					characters: charactersState.characters,
					session: current,
					docked: true,
					atWar: atWarIds.includes(selectedNation.id),
					staffLive,
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
						children: "Letters"
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
			windows.map((win, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(WindowFrame, {
				win,
				zIndex: 2e3 + i,
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
							atWar: atWarIds.includes(nation.id),
							staffLive,
							onOpenCharacter: openCharacter,
							onChange: (patch) => nationsState.update(nation.id, patch),
							onConvert: () => queueConvert(nation.id)
						}) : null;
					})(),
					win.kind === "queue" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionPanel, {
						actions,
						staff: staffLive,
						onSubmit: (title, detail) => addAction(makeAction("flavor", title, detail)),
						onAccept: acceptAction,
						onDeny: (id) => setStatus(id, "denied")
					}),
					win.kind === "war" && renderWarBoard(staffLive ? "staff" : "player"),
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
					}),
					win.kind === "atlas" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtlasWindow, {
						mapWidth: current.mapWidth,
						mapHeight: current.mapHeight,
						nations,
						onGenerate: generateWorld
					})
				]
			}, win.id)),
			(() => {
				const war = warsState.wars.find((w) => w.id === reportWarId);
				if (!war?.report) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BattleReport, {
					report: war.reel?.report ?? war.report,
					nations,
					attackerNationId: war.attackerNationId,
					defenderNationId: war.defenderNationId,
					mapWidth: current.mapWidth,
					mapHeight: current.mapHeight,
					mapSrc: getTerrainPreview() || void 0,
					reelLive: Boolean(war.reel),
					reelDone: Boolean(war.reel?.done),
					phaseIndex: war.reel?.index ?? Math.max(0, (war.report.phases.length || 1) - 1),
					staff: staffLive,
					onContinue: continueBattle,
					onFightOut: staffLive ? fightOut : void 0,
					onDismiss: () => setReportWarId(null),
					onOverride: staffLive ? (grade) => overrideWarGrade(war.id, grade) : void 0
				});
			})()
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableApp, {});
}
//#endregion
export { stackedWith as E, stackOffsets as T, compositionOf as _, useAtlasUi as a, unitsOf as b, paintSight as c, TERRAINS as d, cellBrief as f, armyStrength as g, armiesInContact as h, RESOURCES as i, setTerrainPreview as l, seenWindow as m, Button as n, paintBorder as o, renderTerrain as p, cn as r, paintGround as s, routes_exports as t, useTerrainField as u, engagedEnemies as v, setMapWrap as w, unitTypeById as x, isGhost as y };
