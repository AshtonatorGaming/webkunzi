"use client";

import { useState } from "react";
import WorldMapLoader from "@/components/WorldMapLoader";
import ActionPanel from "@/components/ActionPanel";
import WindowFrame from "@/components/WindowFrame";
import NationWindow from "@/components/NationWindow";
import WarWindow from "@/components/WarWindow";
import CharacterWindow from "@/components/CharacterWindow";
import SessionWindow from "@/components/SessionWindow";
import TopBar from "@/components/TopBar";
import Outliner from "@/components/Outliner";
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
import { applyBattleToArmies, firstContact } from "@/engine/battle";
import { makeAction } from "@/engine/actionStore";
import { findOpenWar, makeWar } from "@/engine/warStore";
import { checkStat } from "@/engine/roll";
import type { Session, TerrainId } from "@/engine/types";
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
  const [selectedNationId, setSelectedNationId] = useState<string | null>("vestoria");
  const [log, setLog] = useState("Staffed table. Friday is war. Saturday is numbers.");
  const [staffLive, setStaffLive] = useState(true);
  const [dock, setDock] = useState<Dock>("none");

  const ready =
    session &&
    popsState.ready &&
    nationsState.ready &&
    nodesState.ready &&
    armiesState.ready &&
    actionsState.ready &&
    charactersState.ready &&
    warsState.ready;

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
  }

  function openCharacter(id: string) {
    const c = charactersState.characters.find((x) => x.id === id);
    if (!c) return;
    pushWindow("character", c.name, c.id);
  }

  function applyMarch(armyId: string, x: number, y: number) {
    const moved = armiesState.armies.map((a) => (a.id === armyId ? { ...a, x, y } : a));
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
    const atkName = nations.find((n) => n.id === army.ownerId)?.name ?? army.ownerId;
    const defName = nations.find((n) => n.id === foe.ownerId)?.name ?? foe.ownerId;
    const war = makeWar(army, foe, "open", { attacker: atkName, defender: defName });
    warsState.add(war);
    addAction({
      ...makeAction("war", war.title, "Field battle pending Friday", {
        armyId,
        nationId: army.ownerId,
        defenderArmyId: foe.id,
        warId: war.id,
        lane: 3,
        auto: false,
        status: "accepted",
      }),
    });
    setLog(`Contact — ${war.title}. Friday to resolve.`);
    pushWindow("war", "Friday wars", "board");
  }

  function moveArmy(id: string, x: number, y: number) {
    const army = armiesState.armies.find((a) => a.id === id);
    const title = `March ${nations.find((n) => n.id === army?.ownerId)?.name ?? "army"}`;
    const detail = `to ${Math.round(x)}, ${Math.round(y)}`;
    if (staffLive) {
      addAction({
        ...makeAction("march", title, detail, { armyId: id, toX: x, toY: y, auto: true, status: "accepted" }),
      });
      applyMarch(id, x, y);
      return;
    }
    addAction(makeAction("march", title, detail, { armyId: id, toX: x, toY: y }));
    setLog("March queued for staff. Permission is not the outcome.");
    setMarchingArmyId(null);
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
      applyMarch(action.armyId, action.toX, action.toY);
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

  function resolveWar(id: string) {
    const war = warsState.wars.find((w) => w.id === id);
    if (!war || war.status !== "declared") return;
    const result = applyBattleToArmies(
      armiesState.armies,
      pops,
      war.attackerArmyId,
      war.defenderArmyId,
      war.terrain,
    );
    armiesState.setArmies(result.armies);
    warsState.update(id, { status: "resolved", report: result.report ?? undefined });
    setLog(result.report?.summary ?? "Field resolved.");
  }

  function runTick() {
    const result = tickAll(nations, pops, nodesState.nodes, armiesState.armies, current);
    setNations(result.nations);
    setSession(advanceTurn(current));
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

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <TopBar
        session={current}
        staffLive={staffLive}
        openWars={openWars}
        log={log}
        onStaffLive={setStaffLive}
        onDay={() => setSession(advanceDay(current))}
        onSaturday={runTick}
        onFriday={() => pushWindow("war", "Friday wars", "board")}
        onClock={() => pushWindow("session", "Session clock", "session")}
        onQueue={() => pushWindow("queue", "Action queue", "queue")}
        onExport={exportWorld}
        onImport={(file) => void importWorld(file)}
      />
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <WorldMapLoader
            mapWidth={current.mapWidth}
            mapHeight={current.mapHeight}
            marchRange={turnMarchRange(current)}
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
            onStartMarch={(id) => {
              setSelectedArmyId(id);
              setMarchingArmyId(id);
            }}
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
        {selectedNation && (
          <div className="ink-panel ink-scroll absolute top-3 left-3 z-chrome hidden max-h-[calc(100%-4.5rem)] w-80 overflow-y-auto md:block">
            <NationWindow
              nation={selectedNation}
              pops={pops}
              characters={charactersState.characters}
              session={current}
              docked
              onOpenCharacter={openCharacter}
              onChange={(patch) => nationsState.update(selectedNation.id, patch)}
              onConvert={() => queueConvert(selectedNation.id)}
              onClose={() => setSelectedNationId(null)}
            />
          </div>
        )}
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

      {windows.map((win) => (
        <WindowFrame
          key={win.id}
          win={win}
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
          {win.kind === "war" && (
            <WarWindow
              wars={warsState.wars}
              armies={armiesState.armies}
              nations={nations}
              onTerrain={(id, terrain: TerrainId) => warsState.update(id, { terrain })}
              onResolve={resolveWar}
            />
          )}
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
    </main>
  );
}
