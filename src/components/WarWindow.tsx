"use client";

import { useState } from "react";
import type { Army, Nation, TerrainId, War } from "@/engine/types";
import { armyStrength, eligibleJoiners, engagedEnemies, isGhost, reportHeadline } from "@/engine/battle";
import { Button } from "@/components/ui/button";
import Crest from "@/components/Crest";

const TERRAIN: { id: TerrainId; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "fort", label: "Fort / urban" },
  { id: "marsh", label: "Marsh" },
  { id: "hills", label: "Hills" },
  { id: "forest", label: "Forest" },
  { id: "river", label: "River" },
  { id: "rain", label: "Rain" },
];

export default function WarWindow({
  wars,
  armies,
  nations,
  compact = false,
  onTerrain,
  onDeclare,
  onResolve,
  onFight,
  onInconclusive,
  onToggleArmy,
  onAdvanceTurn,
  onOpenReport,
  audience = "staff",
}: {
  wars: War[];
  armies: Army[];
  nations: Nation[];
  compact?: boolean;
  onTerrain: (id: string, terrain: TerrainId) => void;
  onDeclare: (attackerId: string, defenderId: string) => void;
  onResolve: (id: string) => void;
  onFight: (id: string) => void;
  onInconclusive: (id: string) => void;
  onToggleArmy: (warId: string, armyId: string, side: "attacker" | "defender") => void;
  onAdvanceTurn: (id: string) => void;
  onOpenReport: (id: string) => void;
  audience?: "staff" | "player";
}) {
  const living = armies.filter((a) => a.ownerId !== "unclaimed" && !isGhost(a));
  const [atkId, setAtkId] = useState(living[0]?.id ?? "");
  const [defId, setDefId] = useState(living[1]?.id ?? living[0]?.id ?? "");
  const nameOf = (nationId: string) => nations.find((n) => n.id === nationId)?.name ?? nationId;
  const colorOf = (nationId: string) => nations.find((n) => n.id === nationId)?.color ?? "#c8c4bc";
  const armyOf = (id: string) => armies.find((a) => a.id === id);
  const open = wars.filter((w) => w.status === "declared");
  const done = wars.filter((w) => w.status === "resolved").slice(0, 6);

  if (audience === "player") {
    return (
      <div className="space-y-3">
        {open.length === 0 && <p className="text-sm text-muted">No war on the painting.</p>}
        {open.map((war) => {
          const turnsLeft = Math.max(0, war.warTurns - war.warTurn + 1);
          return (
            <article key={war.id} className="rounded-sm border border-border bg-raised p-2">
              <div className="flex items-center gap-2">
                <Crest color={colorOf(war.attackerNationId)} size={18} />
                <span className="font-medium">{nameOf(war.attackerNationId)}</span>
                <span className="text-subtle">and</span>
                <Crest color={colorOf(war.defenderNationId)} size={18} />
                <span className="font-medium">{nameOf(war.defenderNationId)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                War-turn {Math.min(war.warTurn, war.warTurns)}/{war.warTurns} · {turnsLeft} left. Banners take the orders.
                The court may still write.
              </p>
              {(war.report || war.reel) && (
                <Button className="mt-2 h-10 w-full" onClick={() => onOpenReport(war.id)}>
                  Read the fight
                </Button>
              )}
            </article>
          );
        })}
      </div>
    );
  }

  const labelOf = (a: Army) =>
    `${nameOf(a.ownerId)} · ${Math.round(armyStrength(a))} · ${a.units?.[0]?.name ?? "banner"}`;

  return (
    <div className="space-y-4">
      {!compact && (
        <p className="text-xs text-muted">
          Staff clock. Contact is not a battle. One order per banner — lines are not retyped each phase.
        </p>
      )}
      <div className="rounded-sm border border-border bg-raised p-2">
        <div className="mb-1 text-[11px] tracking-[0.12em] text-gold">Declare</div>
        <label className="block text-xs text-muted">
          Attacker
          <select
            className="mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg"
            value={atkId}
            onChange={(e) => setAtkId(e.target.value)}
          >
            {living.map((a) => (
              <option key={a.id} value={a.id}>
                {labelOf(a)}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-2 block text-xs text-muted">
          Defender
          <select
            className="mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg"
            value={defId}
            onChange={(e) => setDefId(e.target.value)}
          >
            {living.map((a) => (
              <option key={a.id} value={a.id}>
                {labelOf(a)}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="gold"
          className="mt-2 h-10 w-full"
          disabled={!atkId || !defId || atkId === defId}
          onClick={() => onDeclare(atkId, defId)}
        >
          Declare
        </Button>
      </div>
      {open.length === 0 && (
        <p className="text-sm text-muted">No open wars. Declare, then order an Attack.</p>
      )}
      {open.map((war) => {
        const leadAtk = armyOf(war.attackerArmyId);
        const leadDef = armyOf(war.defenderArmyId);
        const atkIds = war.attackerArmyIds.length ? war.attackerArmyIds : [war.attackerArmyId];
        const defIds = war.defenderArmyIds.length ? war.defenderArmyIds : [war.defenderArmyId];
        const atkEligible = leadAtk
          ? [leadAtk, ...eligibleJoiners(leadAtk, defIds.map(armyOf).filter((a): a is Army => Boolean(a)), armies)]
          : [];
        const defEligible = leadDef
          ? [leadDef, ...eligibleJoiners(leadDef, atkIds.map(armyOf).filter((a): a is Army => Boolean(a)), armies)]
          : [];
        const spent = war.warTurn > war.warTurns;
        const turnsLeft = Math.max(0, war.warTurns - war.warTurn + 1);
        return (
          <div key={war.id} className="rounded-sm border border-border bg-raised p-2">
            <div className="flex items-center gap-2">
              <Crest color={colorOf(war.attackerNationId)} size={18} />
              <span className="font-medium">{nameOf(war.attackerNationId)}</span>
              <span className="text-subtle">vs</span>
              <Crest color={colorOf(war.defenderNationId)} size={18} />
              <span className="font-medium">{nameOf(war.defenderNationId)}</span>
            </div>
            <div className="mt-1 text-xs text-muted tabular">
              War-turn {Math.min(war.warTurn, war.warTurns)}/{war.warTurns}
              {` · ${turnsLeft} left`}
              {war.pendingAttack ? " · attack pending" : ""}
              {war.reel ? " · reel live" : ""}
              {spent ? " · turns spent" : ""}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <JoinerList
                label="Attacker banners"
                armies={atkEligible}
                selected={atkIds}
                onToggle={(id) => onToggleArmy(war.id, id, "attacker")}
              />
              <JoinerList
                label="Defender banners"
                armies={defEligible}
                selected={defIds}
                onToggle={(id) => onToggleArmy(war.id, id, "defender")}
              />
            </div>
            <label className="mt-2 block text-xs text-muted">
              Ground
              <select
                className="mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg"
                value={war.terrain}
                onChange={(e) => onTerrain(war.id, e.target.value as TerrainId)}
              >
                {TERRAIN.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-2 flex flex-col gap-1">
              <Button
                variant="staff"
                className="h-10 w-full"
                disabled={!leadAtk || !leadDef}
                onClick={() => onFight(war.id)}
              >
                Fight it out
              </Button>
              <Button
                className="h-10 w-full"
                disabled={!leadAtk || !leadDef}
                onClick={() => onResolve(war.id)}
              >
                {war.reel ? "Open reel" : "Step the reel"}
              </Button>
              <div className="flex gap-1">
                <Button className="h-10 flex-1" onClick={() => onInconclusive(war.id)}>
                  Inconclusive
                </Button>
                <Button className="h-10 flex-1" onClick={() => onAdvanceTurn(war.id)} disabled={spent}>
                  Next war-turn
                </Button>
              </div>
            </div>
            {leadAtk && engagedEnemies(leadAtk, armies).length === 0 && (
              <p className="mt-2 text-[11px] text-subtle">Lead banner is out of engage radius. Approach first.</p>
            )}
          </div>
        );
      })}
      {done.map((war) => {
        const grade = war.report?.staffGrade ?? war.report?.grade;
        const label = war.report
          ? reportHeadline(grade ?? war.report.grade, war.report.winner, war.report.decisivePhase)
          : `${nameOf(war.attackerNationId)} vs ${nameOf(war.defenderNationId)}`;
        return (
          <button
            key={war.id}
            type="button"
            className="block w-full rounded-sm border border-border px-2 py-2 text-left text-xs hover:bg-hover"
            onClick={() => onOpenReport(war.id)}
          >
            <span className="font-display tracking-wide text-gold">{label}</span>
            <span className="mt-0.5 block text-muted">View report</span>
          </button>
        );
      })}
    </div>
  );
}

function JoinerList({
  label,
  armies,
  selected,
  onToggle,
}: {
  label: string;
  armies: Army[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const unique = armies.filter((a, i, all) => all.findIndex((x) => x.id === a.id) === i);
  return (
    <div>
      <div className="mb-1 text-[11px] tracking-[0.12em] text-gold">{label}</div>
      {unique.length === 0 && <p className="text-[11px] text-subtle">None in ZOC.</p>}
      {unique.map((army) => (
        <label key={army.id} className="flex items-center gap-1 py-0.5">
          <input
            type="checkbox"
            checked={selected.includes(army.id)}
            onChange={() => onToggle(army.id)}
          />
          <span className="truncate">
            {isGhost(army) ? "ghost" : Math.round(armyStrength(army))} · {army.units?.[0]?.name ?? "banner"}
          </span>
        </label>
      ))}
    </div>
  );
}
