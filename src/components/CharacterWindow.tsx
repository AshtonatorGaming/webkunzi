"use client";

import { useState } from "react";
import type { Army, Character } from "@/engine/types";
import { checkStat, type Check } from "@/engine/roll";
import { Button } from "@/components/ui/button";

const STATS: { key: keyof Character["stats"]; label: string }[] = [
  { key: "rulership", label: "Rulership" },
  { key: "charisma", label: "Charisma" },
  { key: "landTactics", label: "Land tactics" },
  { key: "seaTactics", label: "Sea tactics" },
  { key: "intrigue", label: "Intrigue" },
  { key: "business", label: "Business" },
];

export default function CharacterWindow({
  character,
  armies,
  onChange,
  onRolled,
}: {
  character: Character;
  armies: Army[];
  onChange: (patch: Partial<Character>) => void;
  onRolled?: (line: string) => void;
}) {
  const host = armies.filter((a) => a.ownerId === character.nationId);
  const [stat, setStat] = useState<keyof Character["stats"]>("charisma");
  const [dc, setDc] = useState("15");
  const [last, setLast] = useState<Check | null>(null);

  function roll() {
    const dcN = Number(dc);
    if (!Number.isFinite(dcN)) return;
    const result = checkStat(character.stats[stat], dcN);
    setLast(result);
    const label = STATS.find((s) => s.key === stat)?.label ?? stat;
    onRolled?.(
      `${character.name} rolls ${result.roll}+${result.stat}=${result.total} vs DC ${result.dc} (${label}) — ${result.result}.`,
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="font-display text-base">{character.name}</div>
        <div className="text-xs text-muted tabular">Prestige {character.prestige}</div>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        {STATS.map((s) => (
          <div key={s.key} className="flex justify-between gap-2">
            <dt className="text-muted">{s.label}</dt>
            <dd className="tabular">{character.stats[s.key]}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-sm border border-border bg-raised p-2">
        <div className="mb-2 text-[11px] tracking-[0.14em] text-gold">1d20 + STAT vs DC</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted">
            Stat
            <select
              className="mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg"
              value={stat}
              onChange={(e) => setStat(e.target.value as keyof Character["stats"])}
            >
              {STATS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            DC
            <input
              className="mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm text-fg"
              value={dc}
              onChange={(e) => setDc(e.target.value)}
            />
          </label>
        </div>
        <Button variant="gold" className="mt-2 h-10 w-full" onClick={roll}>
          Roll
        </Button>
        {last && (
          <p className="mt-2 text-xs tabular text-fg">
            {last.roll} + {last.stat} = {last.total} vs {last.dc} · {last.result}
          </p>
        )}
      </div>
      <label className="block text-xs text-muted">
        Attached army
        <select
          className="mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg"
          value={character.armyId ?? ""}
          onChange={(e) => onChange({ armyId: e.target.value || undefined })}
        >
          <option value="">None</option>
          {host.map((a) => (
            <option key={a.id} value={a.id}>
              Banner · str {a.strength}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
