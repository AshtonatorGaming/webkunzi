"use client";

import { useEffect, useRef, useState } from "react";
import WorldMapLoader from "@/components/WorldMapLoader";
import ActionPanel from "@/components/ActionPanel";
import WindowFrame from "@/components/WindowFrame";
import NationWindow from "@/components/NationWindow";
import WarWindow from "@/components/WarWindow";
import CharacterWindow from "@/components/CharacterWindow";
import SessionWindow from "@/components/SessionWindow";
import TopBar from "@/components/TopBar";
import Outliner from "@/components/Outliner";
import BattleReport from "@/components/BattleReport";
import { usePops } from "@/engine/usePops";
import { useNations } from "@/engine/useNations";
import { useNodes } from "@/engine/useNodes";
import { useArmies } from "@/engine/useArmies";
import { useSession } from "@/engine/useSession";
import { useActions } from "@/engine/useActions";
import { useCharacters } from "@/engine/useCharacters";
import { useWars } from "@/engine/useWars";
import { tickAll } from "@/engine/tick";
import { advanceDay, advanceTurn } from "@/engine/sessionStore";
import { buildSnapshot, downloadSnapshot, parseSnapshot } from "@/engine/worldIO";
import { makeWindow, type GameWindow } from "@/engine/windows";
import { turnMarchRange } from "@/engine/movement";
import {
  armiesInContact,
  continueReel,
  eligibleJoiners,
  firstContact,
  isGhost,
  mergeReelArmies,
  startReel,
  strikeGhost,
  suggestTerrain,
} from "@/engine/battle";
import { makeAction } from "@/engine/actionStore";
import { findOpenWar, makeWar, overrideGrade, warHasArmy } from "@/engine/warStore";
import { resetWarTurnFlags } from "@/engine/armyStore";
import { checkStat } from "@/engine/roll";
import type { Army, BattleGrade, MarchMode, Session, StaffRemain, TableMode, TerrainId, War } from "@/engine/types";
import { cn } from "@/lib/cn";

type Dock = "none" | "actions" | "nations";

export default function TableApp() {
  const popsState = usePops();
  const nationsState = useNations();
  const nodesState = useNodes();
  const armiesState = useArmies();
  const { session, setSession } = useSession();
  const actionsState = useActions();
  const charactersState = useCharacters();
  const warsState = useWars();
  const [windows, setWindows] = useState<GameWindow[]>([]);
  const [selectedArmyId, setSelectedArmyId] = useState<string | null>(null);
  const [marchingArmyId, setMarchingArmyId] = useState<string | null>(null);
  const [marchMode, setMarchMode] = useState<MarchMode>("march");
  const [selectedNationId, setSelectedNationId] = useState<string | null>("vestoria");
  const [log, setLog] = useState("Staffed table. Friday is war. Saturday is numbers.");
  const [staffLive, setStaffLive] = useState(true);
  const [tableMode, setTableMode] = useState<TableMode>("peace");
  const [dock, setDock] = useState<Dock>("none");
  const [reportWarId, setReportWarId] = useState<string | null>(null);
  const seededNation = useRef(false);

  const ready =
    session &&
    popsState.ready &&
    nationsState.ready &&
    nodesState.ready &&
    armiesState.ready &&
    actionsState.ready &&
    charactersState.ready &&
    warsState.ready;

  useEffect(() => {
    if (!ready || seededNation.current) return;
    const n =
      nationsState.nations.find((x) => x.id === "vestoria") ??
      nationsState.nations.find((x) => x.id !== "unclaimed");
    if (!n) return;
    seededNation.current = true;
    setWindows((cur) => {
      if (cur.some((w) => w.kind === "nation")) return cur;
      return [makeWindow("nation", n.name, n.id, 16, 64), ...cur];
    });
  }, [ready, nationsState.nations]);

  if (!ready || !session || !setSession) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg text-fg">
        <div className="text-center">
          <h1 className="font-display tracking-[0.22em] text-gold">INKUNZI</h1>
          <p className="mt-2 text-sm text-muted">Laying out the table…</p>
        </div>
      </main>
    );
  }

  const current: Session = session;
  const { pops, setPops } = popsState;
  const { nations, setNations } = nationsState;
  const { actions, add: addAction, setStatus, setActions } = actionsState;
  const selectedNation = nations.find((n) => n.id === selectedNationId) ?? null;
  const openWars = warsState.wars.filter((w) => w.status === "declared").length;
  const friday = tableMode === "friday";

  function exportWorld() {
    downloadSnapshot(
      buildSnapshot(
        current,
        nations,
        pops,
        nodesState.nodes,
        armiesState.armies,
        actions,
        charactersState.characters,
        warsState.wars,
      ),
    );
  }

  async function importWorld(file: File) {
    const text = await file.text();
    const snap = parseSnapshot(text);
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

  function pushWindow(kind: GameWindow["kind"], title: string, payload: string) {
    setWindows((cur) => {
      const existing = cur.find((w) => w.kind === kind && w.payload === payload);
      if (existing) return [...cur.filter((w) => w.id !== existing.id), existing];
      const slot =
        kind === "war"
          ? { x: 420, y: 72 }
          : kind === "nation"
            ? { x: 16, y: 64 }
            : kind === "queue"
              ? { x: 92, y: 72 }
              : kind === "session"
                ? { x: 360, y: 72 }
                : { x: 460, y: 96 + cur.length * 16 };
      const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
      const vh = typeof window === "undefined" ? 800 : window.innerHeight;
      const width = Math.min(22 * 16, vw - 24);
      const x = Math.min(Math.max(8, slot.x), Math.max(8, vw - width - 8));
      const y = Math.min(Math.max(52, slot.y), Math.max(52, vh - 160));
      return [...cur, makeWindow(kind, title, payload, x, y)];
    });
  }

  function openNation(id: string) {
    setSelectedNationId(id);
    const n = nations.find((x) => x.id === id);
    pushWindow("nation", n?.name ?? id, id);
  }

  function openCharacter(id: string) {
    const c = charactersState.characters.find((x) => x.id === id);
    if (!c) return;
    pushWindow("character", c.name, c.id);
  }

  function applyMarch(armyId: string, x: number, y: number, mode: MarchMode = marchMode) {
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
    const posture =
      mode === "force" ? "forceMarched" : mode === "skirmish" ? "skirmish" : army.posture === "entrenched" ? "plain" : army.posture;
    const moveUsed = true;
    const actionUsed =
      mode === "skirmish" || (Boolean(open) && Boolean(army.moveUsed)) ? true : army.actionUsed;
    const moved = armiesState.armies.map((a) =>
      a.id === armyId ? { ...a, x, y, posture, moveUsed, actionUsed } : a,
    );
    armiesState.setArmies(moved);
    setMarchingArmyId(null);
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

  function moveArmy(id: string, x: number, y: number) {
    const army = armiesState.armies.find((a) => a.id === id);
    const title = `March ${nations.find((n) => n.id === army?.ownerId)?.name ?? "army"}`;
    const detail = `to ${Math.round(x)}, ${Math.round(y)} (${marchMode})`;
    if (staffLive) {
      addAction({
        ...makeAction("march", title, detail, {
          armyId: id,
          toX: x,
          toY: y,
          auto: true,
          status: "accepted",
          marchMode,
        }),
      });
      applyMarch(id, x, y, marchMode);
      return;
    }
    addAction(makeAction("march", title, detail, { armyId: id, toX: x, toY: y, marchMode }));
    setLog("March queued for staff. Permission is not the outcome.");
    setMarchingArmyId(null);
  }

  function declareWar(attackerId: string, defenderId: string) {
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
    const war = makeWar(atk, def, suggestTerrain(def, pops), { attacker: atkName, defender: defName }, {
      attackerIds: atkJoin.map((a) => a.id),
      defenderIds: defJoin.map((a) => a.id),
    });
    warsState.add({ ...war, pendingAttack: false });
    setLog(`Declared — ${war.title}. Attack is still an order.`);
    setTableMode("friday");
  }

  function startFridayReel(warId: string, armyList: Army[] = armiesState.armies, warOverride?: War) {
    const war = warOverride ?? warsState.wars.find((w) => w.id === warId);
    if (!war || war.status !== "declared") return;
    if (war.reel) {
      setReportWarId(warId);
      return;
    }
    const atkIds = war.attackerArmyIds.length ? war.attackerArmyIds : [war.attackerArmyId];
    const defIds = war.defenderArmyIds.length ? war.defenderArmyIds : [war.defenderArmyId];
    const attackers = atkIds
      .map((id) => armyList.find((a) => a.id === id))
      .filter((a): a is Army => a != null)
      .filter((a) => !isGhost(a));
    const defenders = defIds
      .map((id) => armyList.find((a) => a.id === id))
      .filter((a): a is Army => a != null);
    if (!attackers.length || !defenders.length) {
      setLog("Banners missing. Cannot open the reel.");
      return;
    }
    if (defenders.every(isGhost)) {
      const lead = attackers[0]!;
      armiesState.setArmies(strikeGhost(armyList, lead.id, defenders[0]!.id));
      warsState.update(warId, { status: "resolved", pendingAttack: false, reel: undefined });
      setLog("Ghost struck. The pin is gone.");
      return;
    }
    const reel = startReel({ attackers, defenders, terrain: war.terrain, pops });
    const merged = mergeReelArmies(armyList, reel).map((a) =>
      a.id === attackers[0]!.id ? { ...a, actionUsed: true } : a,
    );
    armiesState.setArmies(merged);
    if (warsState.wars.some((w) => w.id === war.id)) {
      warsState.update(war.id, { reel, report: reel.report, pendingAttack: false });
    } else {
      warsState.add({ ...war, reel, report: reel.report, pendingAttack: false });
    }
    setReportWarId(warId);
    setTableMode("friday");
    setLog(`Shock. ${reel.report.summary}`);
  }

  function continueBattle(staff?: StaffRemain[]) {
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
        reel: undefined,
        report: next.report,
      });
      setReportWarId(null);
      const leftover =
        next.report.winner === "attacker"
          ? war.reel.leftoverAtk
          : next.report.winner === "defender"
            ? war.reel.leftoverDef
            : false;
      setLog(
        leftover
          ? `${next.report.summary} Occupy. Move still in hand — Attack is spent.`
          : `${next.report.summary} Occupy.`,
      );
      return;
    }
    warsState.update(war.id, { reel: next.reel, report: next.reel.report });
    setLog(next.reel.report.summary);
  }

  function issueAttack(attackerId: string, defenderId: string, fromQueue = false) {
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
      if (open) warsState.update(open.id, { status: "resolved", pendingAttack: false, reel: undefined });
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
      const spent = armiesState.armies.map((a) => (a.id === atk.id ? { ...a, actionUsed: true } : a));
      armiesState.setArmies(spent);
      if (existing) {
        const patched = {
          ...existing,
          pendingAttack: true,
          attackerArmyId: atk.id,
          defenderArmyId: def.id,
          attackerArmyIds: atkJoin.map((a) => a.id),
          defenderArmyIds: defJoin.map((a) => a.id),
        };
        warsState.update(existing.id, patched);
        if (friday) {
          startFridayReel(existing.id, spent, patched);
          return;
        }
        setLog(`Attack ordered — ${existing.title}. Friday to resolve.`);
      } else {
        const war = makeWar(atk, def, terrain, { attacker: atkName, defender: defName }, {
          attackerIds: atkJoin.map((a) => a.id),
          defenderIds: defJoin.map((a) => a.id),
        });
        if (friday) {
          startFridayReel(war.id, spent, war);
          return;
        }
        warsState.add(war);
        setLog(`Attack ordered — ${war.title}. Friday to resolve.`);
      }
    };
    if (fromQueue || staffLive) {
      if (!fromQueue) {
        addAction({
          ...makeAction("attack", `${atkName} attacks ${defName}`, "Explicit order. Not a kiss.", {
            armyId: atk.id,
            defenderArmyId: def.id,
            auto: false,
            status: "accepted",
            lane: 3,
          }),
        });
      }
      commit();
      return;
    }
    addAction(
      makeAction("attack", `${atkName} attacks ${defName}`, "Lane 3 — staff gate.", {
        armyId: atk.id,
        defenderArmyId: def.id,
      }),
    );
    setLog("Attack queued for staff.");
  }

  function entrenchArmy(id: string) {
    const army = armiesState.armies.find((a) => a.id === id);
    if (!army) return;
    if (army.actionUsed) {
      setLog("Action already spent.");
      return;
    }
    const doIt = () => armiesState.update(id, { posture: "entrenched", actionUsed: true });
    if (staffLive) {
      addAction({
        ...makeAction("entrench", "Entrench", "Tortoise sit.", { armyId: id, auto: true, status: "accepted" }),
      });
      doIt();
      setLog("Entrenched. Sit bonus if attacked.");
      return;
    }
    addAction(makeAction("entrench", "Entrench", "Tortoise sit.", { armyId: id }));
    setLog("Entrench queued for staff.");
  }

  function acceptAction(id: string) {
    const action = actions.find((a) => a.id === id);
    if (!action) return;
    if (
      action.kind === "march" &&
      action.armyId != null &&
      action.toX != null &&
      action.toY != null
    ) {
      applyMarch(action.armyId, action.toX, action.toY, action.marchMode ?? "march");
    }
    if (action.kind === "attack" && action.armyId && action.defenderArmyId) {
      issueAttack(action.armyId, action.defenderArmyId, true);
    }
    if (action.kind === "entrench" && action.armyId) {
      armiesState.update(action.armyId, { posture: "entrenched", actionUsed: true });
    }
    if (action.kind === "convert" && action.needsRoll) {
      const ruler = charactersState.characters.find((c) => c.nationId === action.nationId);
      const roll = checkStat(ruler?.stats.charisma ?? 0, action.dc ?? 15);
      actionsState.setResult(id, roll.result);
      setLog(
        `${ruler?.name ?? "A courtier"} rolls ${roll.roll}+${roll.stat}=${roll.total} vs DC ${roll.dc} — ${roll.result}.`,
      );
      return;
    }
    setStatus(id, "accepted");
  }

  function markInconclusive(id: string) {
    const war = warsState.wars.find((w) => w.id === id);
    if (!war || war.status !== "declared") return;
    const atk = armiesState.armies.find((a) => a.id === war.attackerArmyId);
    const def = armiesState.armies.find((a) => a.id === war.defenderArmyId);
    warsState.update(id, {
      status: "resolved",
      pendingAttack: false,
      reel: undefined,
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
        y: atk && def ? (atk.y + def.y) / 2 : atk?.y ?? def?.y,
      },
    });
    setReportWarId(id);
    setLog("Inconclusive. The week writes itself down as a stare.");
  }

  function overrideWarGrade(id: string, grade: BattleGrade) {
    const war = warsState.wars.find((w) => w.id === id);
    if (!war) return;
    warsState.update(id, overrideGrade(war, grade));
  }

  function toggleWarArmy(warId: string, armyId: string, side: "attacker" | "defender") {
    const war = warsState.wars.find((w) => w.id === warId);
    if (!war) return;
    const key = side === "attacker" ? "attackerArmyIds" : "defenderArmyIds";
    const lead = side === "attacker" ? war.attackerArmyId : war.defenderArmyId;
    if (armyId === lead) return;
    const cur = war[key];
    const next = cur.includes(armyId) ? cur.filter((x) => x !== armyId) : [...cur, armyId];
    warsState.update(warId, { [key]: next.length ? next : [lead] });
  }

  function advanceWarTurn(id: string) {
    const war = warsState.wars.find((w) => w.id === id);
    if (!war || war.status !== "declared") return;
    const ids = new Set([...war.attackerArmyIds, ...war.defenderArmyIds]);
    armiesState.setArmies(resetWarTurnFlags(armiesState.armies, ids));
    warsState.update(id, { warTurn: war.warTurn + 1, pendingAttack: false });
    setLog(`War-turn ${Math.min(war.warTurn + 1, war.warTurns)}/${war.warTurns}. Move and Action refresh.`);
  }

  function runTick() {
    const result = tickAll(nations, pops, nodesState.nodes, armiesState.armies, current);
    setNations(result.nations);
    setSession(advanceTurn(current));
    const fighting = new Set(
      warsState.wars.filter((w) => w.status === "declared").flatMap((w) => [...w.attackerArmyIds, ...w.defenderArmyIds]),
    );
    armiesState.setArmies(resetWarTurnFlags(armiesState.armies, fighting));
    warsState.setWars(
      warsState.wars.map((w) =>
        w.status === "declared" ? { ...w, warTurn: w.warTurn + 1, pendingAttack: false } : w,
      ),
    );
    setLog(result.log.join(" "));
  }

  function queueConvert(nationId: string) {
    const n = nations.find((x) => x.id === nationId);
    addAction(
      makeAction("convert", `Convert in ${n?.name ?? nationId}`, "A priest writes. Staff will roll.", {
        nationId,
        needsRoll: true,
        dc: 15,
        lane: 2,
      }),
    );
    setLog("Conversion queued. Lane 2 — the dice color the result.");
    setDock("actions");
  }

  function renderWarBoard() {
    return (
      <WarWindow
        wars={warsState.wars}
        armies={armiesState.armies}
        nations={nations}
        compact={friday}
        onTerrain={(id, terrain: TerrainId) => warsState.update(id, { terrain })}
        onDeclare={declareWar}
        onResolve={startFridayReel}
        onInconclusive={markInconclusive}
        onToggleArmy={toggleWarArmy}
        onAdvanceTurn={advanceWarTurn}
        onOpenReport={setReportWarId}
      />
    );
  }

  return (
    <main className={cn("relative flex h-dvh flex-col overflow-hidden bg-bg text-fg", friday && "ink-friday")}>
      <TopBar
        session={current}
        staffLive={staffLive}
        tableMode={tableMode}
        openWars={openWars}
        log={log}
        onStaffLive={setStaffLive}
        onTableMode={setTableMode}
        onDay={() => setSession(advanceDay(current))}
        onSaturday={runTick}
        onClock={() => pushWindow("session", "Session clock", "session")}
        onQueue={() => pushWindow("queue", "Action queue", "queue")}
        onExport={exportWorld}
        onImport={(file) => void importWorld(file)}
      />
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 isolate z-0">
          <WorldMapLoader
            mapWidth={current.mapWidth}
            mapHeight={current.mapHeight}
            marchRange={
              turnMarchRange(current) *
              (marchMode === "skirmish" ? 2 : marchMode === "force" ? 1.5 : 1)
            }
            selectedArmyId={selectedArmyId}
            marchingArmyId={marchingArmyId}
            staffLive={staffLive}
            pops={pops}
            nodes={nodesState.nodes}
            armies={armiesState.armies}
            nations={nations}
            onSelectArmy={(id) => {
              setSelectedArmyId(id);
              setMarchingArmyId(null);
              if (id) {
                const army = armiesState.armies.find((a) => a.id === id);
                if (army) setSelectedNationId(army.ownerId);
              }
            }}
            onStartMarch={(id, mode) => {
              setSelectedArmyId(id);
              setMarchingArmyId(id);
              setMarchMode(mode);
            }}
            onAttack={issueAttack}
            onEntrench={entrenchArmy}
            onMoveArmy={moveArmy}
            onPlacePop={(y, x) => popsState.place(x, y)}
            onPlaceNode={(y, x) => nodesState.place(x, y)}
            onPlaceArmy={(y, x) => armiesState.place(x, y)}
            onUpdatePop={popsState.update}
            onRemovePop={popsState.remove}
            onUpdateNode={nodesState.update}
            onRemoveNode={nodesState.remove}
            onUpdateArmy={armiesState.update}
            onRemoveArmy={armiesState.remove}
          />
        </div>
        <div className="ink-panel absolute top-3 right-3 z-chrome hidden h-[calc(100%-4.5rem)] w-64 overflow-hidden lg:block">
          <Outliner
            nations={nations}
            pops={pops}
            armies={armiesState.armies}
            characters={charactersState.characters}
            wars={warsState.wars}
            session={current}
            selectedNationId={selectedNationId}
            onAdd={nationsState.add}
            onOpenNation={openNation}
            onOpenCharacter={openCharacter}
            onSelectArmy={(id) => {
              setSelectedArmyId(id);
              setMarchingArmyId(null);
            }}
          />
        </div>
        {friday && (
          <aside className="friday-dock ink-panel ink-scroll" aria-label="Friday war dock">
            <header className="ink-hairline flex items-baseline justify-between bg-raised px-3 py-2">
              <h2 className="font-display text-sm tracking-[0.16em] text-gold">Friday</h2>
              <span className="text-[11px] text-muted tabular">
                {openWars} war{openWars === 1 ? "" : "s"} · turns ~4
              </span>
            </header>
            <div className="p-3">{renderWarBoard()}</div>
          </aside>
        )}
      </div>

      {dock !== "none" && (
        <div className="absolute inset-x-0 bottom-16 z-chrome max-h-[60vh] overflow-hidden border-t border-gold-dim bg-surface md:hidden">
          {dock === "actions" ? (
            <ActionPanel
              actions={actions}
              onSubmit={(title, detail) => addAction(makeAction("flavor", title, detail))}
              onAccept={acceptAction}
              onDeny={(id) => setStatus(id, "denied")}
            />
          ) : selectedNation ? (
            <NationWindow
              nation={selectedNation}
              pops={pops}
              characters={charactersState.characters}
              session={current}
              docked
              onOpenCharacter={openCharacter}
              onChange={(patch) => nationsState.update(selectedNation.id, patch)}
              onConvert={() => queueConvert(selectedNation.id)}
              onClose={() => setDock("none")}
            />
          ) : (
            <p className="p-3 text-sm text-muted">Pick a nation from the outliner.</p>
          )}
        </div>
      )}

      <nav className="relative z-chrome flex shrink-0 border-t border-gold-dim bg-surface md:hidden">
        <button
          type="button"
          className={cn("min-h-12 flex-1", dock === "actions" && "bg-raised")}
          onClick={() => setDock((d) => (d === "actions" ? "none" : "actions"))}
        >
          Queue
        </button>
        <button type="button" className="min-h-12 flex-1" onClick={() => setDock("none")}>
          Map
        </button>
        <button
          type="button"
          className={cn("min-h-12 flex-1", dock === "nations" && "bg-raised")}
          onClick={() => setDock((d) => (d === "nations" ? "none" : "nations"))}
        >
          Court
        </button>
      </nav>

      <p className="hidden border-t border-gold-dim bg-bg px-3 py-1 text-[11px] text-muted md:block">
        {log}
      </p>

      {windows.map((win, i) => (
        <WindowFrame
          key={win.id}
          win={win}
          zIndex={2000 + i}
          onFocus={(id) =>
            setWindows((cur) => {
              const w = cur.find((x) => x.id === id);
              if (!w) return cur;
              return [...cur.filter((x) => x.id !== id), w];
            })
          }
          onMove={(id, x, y) =>
            setWindows((cur) => cur.map((w) => (w.id === id ? { ...w, x, y } : w)))
          }
          onClose={(id) => setWindows((cur) => cur.filter((w) => w.id !== id))}
        >
          {win.kind === "nation" &&
            (() => {
              const nation = nations.find((n) => n.id === win.payload);
              return nation ? (
                <NationWindow
                  nation={nation}
                  pops={pops}
                  characters={charactersState.characters}
                  session={current}
                  onOpenCharacter={openCharacter}
                  onChange={(patch) => nationsState.update(nation.id, patch)}
                  onConvert={() => queueConvert(nation.id)}
                />
              ) : null;
            })()}
          {win.kind === "queue" && (
            <ActionPanel
              actions={actions}
              onSubmit={(title, detail) => addAction(makeAction("flavor", title, detail))}
              onAccept={acceptAction}
              onDeny={(id) => setStatus(id, "denied")}
            />
          )}
          {win.kind === "war" && renderWarBoard()}
          {win.kind === "character" &&
            (() => {
              const ch = charactersState.characters.find((c) => c.id === win.payload);
              return ch ? (
                <CharacterWindow
                  character={ch}
                  armies={armiesState.armies}
                  onChange={(patch) => charactersState.update(ch.id, patch)}
                  onRolled={setLog}
                />
              ) : null;
            })()}
          {win.kind === "session" && (
            <SessionWindow session={current} onChange={setSession} />
          )}
        </WindowFrame>
      ))}
      {(() => {
        const war = warsState.wars.find((w) => w.id === reportWarId);
        if (!war?.report) return null;
        return (
          <BattleReport
            report={war.reel?.report ?? war.report}
            nations={nations}
            attackerNationId={war.attackerNationId}
            defenderNationId={war.defenderNationId}
            mapWidth={current.mapWidth}
            mapHeight={current.mapHeight}
            reelLive={Boolean(war.reel)}
            phaseIndex={war.reel?.index ?? Math.max(0, (war.report.phases.length || 1) - 1)}
            onContinue={continueBattle}
            onOverride={staffLive ? (grade) => overrideWarGrade(war.id, grade) : undefined}
          />
        );
      })()}
    </main>
  );
}
