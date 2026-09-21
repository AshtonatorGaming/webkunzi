"use client";

import type { Army, Nation, TerrainId, War } from "@/engine/types";
import { Button } from "@/components/ui/button";
import Crest from "@/components/Crest";

const TERRAIN: { id: TerrainId; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "fort", label: "Fort" },
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
  onTerrain,
  onResolve,
}: {
  wars: War[];
  armies: Army[];
  nations: Nation[];
  onTerrain: (id: string, terrain: TerrainId) => void;
  onResolve: (id: string) => void;
}) {
  const nameOf = (nationId: string) => nations.find((n) => n.id === nationId)?.name ?? nationId;
  const colorOf = (nationId: string) => nations.find((n) => n.id === nationId)?.color ?? "#c8c4bc";
  const armyOf = (id: string) => armies.find((a) => a.id === id);
  const open = wars.filter((w) => w.status === "declared");
  const done = wars.filter((w) => w.status === "resolved").slice(0, 6);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Friday field. Shock loves cavalry, Early loves bows, Late loves melee. Best two of three. Loser retreats toward a city, town, or fort — not a camp.
      </p>
      {open.length === 0 && (
        <p className="text-sm text-muted">No declared wars. March a banner into an enemy zone of control.</p>
      )}
      {open.map((war) => {
        const atk = armyOf(war.attackerArmyId);
        const def = armyOf(war.defenderArmyId);
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
              {atk ? `Atk ${Math.round(atk.strength)}` : "Attacker gone"} ·{" "}
              {def ? `Def ${Math.round(def.strength)}` : "Defender gone"}
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
            <Button
              variant="staff"
              className="mt-2 h-10 w-full"
              disabled={!atk || !def}
              onClick={() => onResolve(war.id)}
            >
              Resolve field
            </Button>
          </div>
        );
      })}
      {done.map((war) => (
        <div key={war.id} className="rounded-sm border border-border p-2 text-xs">
          <div className="text-muted">
            Resolved · {nameOf(war.attackerNationId)} vs {nameOf(war.defenderNationId)}
          </div>
          {war.report && (
            <>
              <div className="mt-1 text-fg">{war.report.summary}</div>
              <ol className="mt-1 space-y-0.5 text-subtle">
                {war.report.phases.map((p) => (
                  <li key={p.id} className="capitalize">
                    {p.id}: {p.winner} ({p.attackerPower} / {p.defenderPower}) −{p.attackerLoss}/−
                    {p.defenderLoss}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
