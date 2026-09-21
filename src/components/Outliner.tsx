"use client";

import { useState } from "react";
import type { Army, Character, Nation, Pop, Session, War } from "@/engine/types";
import { countPopsByOwner, formatPeople } from "@/engine/nationSummary";
import { Button } from "@/components/ui/button";
import Crest from "@/components/Crest";

export default function Outliner({
  nations,
  pops,
  armies,
  characters,
  wars,
  session,
  selectedNationId,
  onAdd,
  onOpenNation,
  onOpenCharacter,
  onSelectArmy,
}: {
  nations: Nation[];
  pops: Pop[];
  armies: Army[];
  characters: Character[];
  wars: War[];
  session: Session;
  selectedNationId: string | null;
  onAdd: (name: string) => void;
  onOpenNation: (id: string) => void;
  onOpenCharacter: (id: string) => void;
  onSelectArmy: (id: string) => void;
}) {
  const counts = countPopsByOwner(pops);
  const [name, setName] = useState("");
  const open = wars.filter((w) => w.status === "declared");

  return (
    <aside className="ink-scroll h-full w-full overflow-y-auto bg-surface p-3 text-fg">
      <h2 className="mb-2 font-display text-xs tracking-[0.16em] text-gold">OUTLINER</h2>
      <form
        className="mb-3 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd(name.trim());
          setName("");
        }}
      >
        <input
          className="h-10 min-w-0 flex-1 rounded-sm border border-border bg-raised px-2 text-sm"
          placeholder="New nation"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" className="h-10 px-3 text-xs">
          Add
        </Button>
      </form>
      <ul className="space-y-1">
        {nations
          .filter((n) => n.id !== "unclaimed")
          .map((n) => {
            const c = counts.get(n.id);
            const host = armies.filter((a) => a.ownerId === n.id);
            const rulers = characters.filter((ch) => ch.nationId === n.id);
            const selected = selectedNationId === n.id;
            return (
              <li
                key={n.id}
                className={selected ? "rounded-sm border border-gold-dim bg-raised p-2" : "rounded-sm p-2 hover:bg-raised"}
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 text-left"
                  onClick={() => onOpenNation(n.id)}
                >
                  <Crest color={n.color} size={18} />
                  <span className="font-medium">{n.name}</span>
                </button>
                <div className="mt-1 pl-7 text-[11px] text-muted tabular">
                  {c?.pops ?? 0} pops · {formatPeople(c?.pops ?? 0, session.popValue)}
                </div>
                <div className="pl-7 text-[11px] text-subtle tabular">
                  ${n.treasury} · stab {n.stability} · WS {n.warSupport}
                </div>
                {host.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="mt-1 block pl-7 text-left text-[11px] text-fg/80"
                    onClick={() => onSelectArmy(a.id)}
                  >
                    Banner · {Math.round(a.strength)}
                  </button>
                ))}
                {rulers.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    className="mt-1 block pl-7 text-left text-[11px] text-gold"
                    onClick={() => onOpenCharacter(ch.id)}
                  >
                    {ch.name}
                  </button>
                ))}
              </li>
            );
          })}
      </ul>
      {open.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-1 text-[11px] tracking-[0.14em] text-gold">FRIDAY</h3>
          <ul className="space-y-1 text-xs text-muted">
            {open.map((w) => (
              <li key={w.id}>{w.title}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
