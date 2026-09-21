"use client";

import { useEffect, useState } from "react";
import type { Army, Nation } from "@/engine/types";
import { compositionOf } from "@/engine/battle";
import { Button } from "@/components/ui/button";

export default function ArmyEditor({
  army,
  nations,
  marching,
  onChange,
  onDelete,
  onMarch,
}: {
  army: Army;
  nations: Nation[];
  marching: boolean;
  onChange: (patch: Partial<Army>) => void;
  onDelete: () => void;
  onMarch: () => void;
}) {
  const comp = compositionOf(army);
  const [strengthText, setStrengthText] = useState(String(army.strength));
  const [shock, setShock] = useState(String(Math.round(comp.shock)));
  const [ranged, setRanged] = useState(String(Math.round(comp.ranged)));
  const [melee, setMelee] = useState(String(Math.round(comp.melee)));

  useEffect(() => {
    const next = compositionOf(army);
    setStrengthText(String(army.strength));
    setShock(String(Math.round(next.shock)));
    setRanged(String(Math.round(next.ranged)));
    setMelee(String(Math.round(next.melee)));
  }, [army.id, army.strength, army.composition]);

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
    if (![s, r, m].every(Number.isFinite)) return;
    onChange({
      composition: { shock: Math.max(0, s), ranged: Math.max(0, r), melee: Math.max(0, m) },
      strength: Math.max(0, s + r + m) || army.strength,
    });
  }

  return (
    <div className="flex min-w-48 flex-col gap-2 text-sm text-fg">
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
      <Button variant={marching ? "primary" : "ghost"} onClick={onMarch}>
        {marching ? "Click map to march" : "March"}
      </Button>
      <button type="button" className="text-left text-danger" onClick={onDelete}>
        Delete army
      </button>
    </div>
  );
}
