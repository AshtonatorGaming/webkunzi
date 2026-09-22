"use client";

import { useEffect, useState } from "react";
import type { Army, ArmyUnit, MarchMode, Nation } from "@/engine/types";
import { armyStrength, compositionOf, engagedEnemies, isGhost, unitsOf } from "@/engine/battle";
import { unitTypeById } from "@/packs/core/units";
import { Button } from "@/components/ui/button";

export default function ArmyEditor({
  army,
  armies,
  nations,
  marching,
  staffLive = false,
  onChange,
  onDelete,
  onMarch,
  onAttack,
  onEntrench,
}: {
  army: Army;
  armies: Army[];
  nations: Nation[];
  marching: boolean;
  staffLive?: boolean;
  onChange: (patch: Partial<Army>) => void;
  onDelete: () => void;
  onMarch: (mode: MarchMode) => void;
  onAttack: (defenderId: string) => void;
  onEntrench: () => void;
}) {
  const comp = compositionOf(army);
  const units = unitsOf(army);
  const foes = staffLive
    ? armies.filter((a) => a.id !== army.id && a.ownerId !== army.ownerId && a.ownerId !== "unclaimed")
    : engagedEnemies(army, armies);
  const [strengthText, setStrengthText] = useState(String(armyStrength(army)));
  const [shock, setShock] = useState(String(Math.round(comp.shock)));
  const [ranged, setRanged] = useState(String(Math.round(comp.ranged)));
  const [melee, setMelee] = useState(String(Math.round(comp.melee)));

  useEffect(() => {
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
    if (![s, r, m].every(Number.isFinite)) return;
    const nextUnits: ArmyUnit[] = (
      [
        { id: `${army.id}-cav`, typeId: "cavalry" as const, name: units.find((u) => u.typeId === "cavalry")?.name ?? "Cavalry", fielded: Math.max(0, s) },
        { id: `${army.id}-bow`, typeId: "archers" as const, name: units.find((u) => u.typeId === "archers")?.name ?? "Archers", fielded: Math.max(0, r) },
        { id: `${army.id}-ft`, typeId: "infantry" as const, name: units.find((u) => u.typeId === "infantry")?.name ?? "Infantry", fielded: Math.max(0, m) },
      ] satisfies ArmyUnit[]
    ).filter((u) => u.fielded > 0);
    onChange({
      composition: { shock: Math.max(0, s), ranged: Math.max(0, r), melee: Math.max(0, m) },
      units: nextUnits,
      strength: Math.max(0, s + r + m),
    });
  }

  return (
    <div className="flex min-w-48 flex-col gap-2 text-sm text-fg">
      {isGhost(army) && (
        <p className="text-[11px] tracking-[0.12em] text-gold">GHOST — 0 on the pin. Attack deletes if not reinforced.</p>
      )}
      <label className="text-muted">
        Owner
        <select
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={army.ownerId}
          onChange={(e) => onChange({ ownerId: e.target.value })}
        >
          {nations.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </label>
      <ul className="space-y-0.5 text-xs">
        {units.map((u) => (
          <li key={u.id} className="flex justify-between gap-2">
            <span>
              {u.name || unitTypeById(u.typeId).label}{" "}
              <span className="text-subtle">({unitTypeById(u.typeId).short})</span>
            </span>
            <span className="tabular">{Math.round(u.fielded)}</span>
          </li>
        ))}
      </ul>
      <label className="text-muted">
        Strength
        <input
          type="text"
          inputMode="numeric"
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={strengthText}
          onChange={(e) => setStrengthText(e.target.value)}
          onBlur={commitStrength}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitStrength();
          }}
        />
      </label>
      <div className="grid grid-cols-3 gap-1">
        <label className="text-xs text-muted">
          Shock
          <input
            className="mt-0.5 w-full rounded-sm border border-border bg-raised px-1 py-1 text-fg"
            value={shock}
            onChange={(e) => setShock(e.target.value)}
            onBlur={commitComp}
          />
        </label>
        <label className="text-xs text-muted">
          Ranged
          <input
            className="mt-0.5 w-full rounded-sm border border-border bg-raised px-1 py-1 text-fg"
            value={ranged}
            onChange={(e) => setRanged(e.target.value)}
            onBlur={commitComp}
          />
        </label>
        <label className="text-xs text-muted">
          Melee
          <input
            className="mt-0.5 w-full rounded-sm border border-border bg-raised px-1 py-1 text-fg"
            value={melee}
            onChange={(e) => setMelee(e.target.value)}
            onBlur={commitComp}
          />
        </label>
      </div>
      <div className="text-[11px] text-subtle">
        {army.posture && army.posture !== "plain" ? army.posture.replace("forceMarched", "force-marched") : "plain"}
        {army.moveUsed ? " · move spent" : ""}
        {army.actionUsed ? " · action spent" : ""}
      </div>
      <Button variant={marching ? "primary" : "ghost"} onClick={() => onMarch("march")}>
        {marching ? "Click map to march" : "March"}
      </Button>
      <div className="grid grid-cols-2 gap-1">
        <Button onClick={() => onMarch("force")}>Force-march</Button>
        <Button onClick={() => onMarch("skirmish")}>Skirmish</Button>
      </div>
      <Button onClick={onEntrench} disabled={army.actionUsed}>
        Entrench
      </Button>
      {foes.length === 0 && (
        <p className="text-[11px] text-subtle">Approach a banner to Attack. Contact is not a battle.</p>
      )}
      {foes.map((foe) => (
        <Button
          key={foe.id}
          variant="gold"
          onClick={() => onAttack(foe.id)}
          disabled={isGhost(army) || (Boolean(army.actionUsed) && !isGhost(foe))}
        >
          {isGhost(foe)
            ? `Strike ghost ${nations.find((n) => n.id === foe.ownerId)?.name ?? foe.ownerId}`
            : `Attack ${nations.find((n) => n.id === foe.ownerId)?.name ?? foe.ownerId}`}
        </Button>
      ))}
      <button type="button" className="text-left text-danger" onClick={onDelete}>
        Delete army
      </button>
    </div>
  );
}
