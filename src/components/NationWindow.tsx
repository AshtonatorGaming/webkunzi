"use client";

import type { Character, DistrictKind, Nation, Pop, Session } from "@/engine/types";
import { countPopsByOwner, districtCap, formatPeople } from "@/engine/nationSummary";
import { RESOURCES } from "@/packs/core/resources";
import { Button } from "@/components/ui/button";
import Crest from "@/components/Crest";

const DISTRICT_KINDS: { id: DistrictKind; label: string }[] = [
  { id: "farm", label: "Farm" },
  { id: "market", label: "Market" },
  { id: "port", label: "Port" },
  { id: "fort", label: "Fort" },
  { id: "admin", label: "Admin" },
];

export default function NationWindow({
  nation,
  pops,
  characters,
  session,
  docked,
  atWar = false,
  staffLive = false,
  onOpenCharacter,
  onChange,
  onConvert,
  onClose,
}: {
  nation: Nation;
  pops: Pop[];
  characters: Character[];
  session: Session;
  docked?: boolean;
  atWar?: boolean;
  staffLive?: boolean;
  onOpenCharacter: (id: string) => void;
  onChange: (patch: Partial<Nation>) => void;
  onConvert: () => void;
  onClose?: () => void;
}) {
  const c = countPopsByOwner(pops).get(nation.id);
  const slots = districtCap(nation.districtSlots, c?.settled ?? 0);
  const rulers = characters.filter((ch) => ch.nationId === nation.id);

  function addDistrict(kind: DistrictKind) {
    const same = nation.districts.filter((d) => d.kind === kind).length;
    if (same >= 3) return;
    if (nation.districts.length >= slots) return;
    onChange({
      districts: [...nation.districts, { id: crypto.randomUUID(), kind, tier: 1 }],
    });
  }

  return (
    <div className={docked ? "flex h-full flex-col" : "space-y-3"}>
      <div
        className="flex items-center gap-3 px-3 py-3"
        style={{ background: `linear-gradient(90deg, ${nation.color} 0 8px, transparent 8px)` }}
      >
        <Crest color={nation.color} size={36} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-base tracking-wide">{nation.name}</div>
          <div className="text-[11px] text-muted tabular">
            {c?.pops ?? 0} pops · {formatPeople(c?.pops ?? 0, session.popValue)} souls
          </div>
          {atWar && (
            <p className="mt-1 text-[11px] text-gold">
              At war. Letters still go out. Districts wait for the peace.
            </p>
          )}
        </div>
        {docked && onClose && (
          <button type="button" className="grid size-8 place-items-center text-muted" onClick={onClose} aria-label="Close country">
            ×
          </button>
        )}
      </div>
      <div className="space-y-3 px-3 pb-3">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs tabular">
          <Row k="Treasury" v={`$${nation.treasury}`} />
          <Row k="Stability" v={String(nation.stability)} />
          <Row k="War support" v={String(nation.warSupport)} />
          <Row k="Infamy" v={String(nation.infamy)} />
          <Row k="Manpower" v={nation.manpower.toLocaleString()} />
          <Row k="Legitimacy" v={String(nation.legitimacy)} />
        </dl>
        <div>
          <h3 className="mb-1 text-[11px] tracking-[0.14em] text-gold">LEDGER</h3>
          <ul className="space-y-0.5 text-sm">
            {RESOURCES.map((r) => (
              <li key={r.id} className="flex justify-between text-muted">
                <span>
                  {r.label}
                  <span className="ml-1 text-[10px] text-subtle">
                    {r.mode === "cap" ? " cap" : " stock"}
                  </span>
                </span>
                <span className="tabular text-fg">{nation.resources[r.id] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-[11px] tracking-[0.14em] text-gold">
            DISTRICTS {nation.districts.length}/{slots}
          </h3>
          <ul className="mb-2 space-y-1 text-sm">
            {nation.districts.length === 0 && <li className="text-muted">Empty slots. One building each.</li>}
            {nation.districts.map((d) => (
              <li key={d.id} className="flex items-center justify-between">
                <span>
                  {d.kind} <span className="text-muted">T{d.tier}</span>
                </span>
                {staffLive && (
                  <button
                    type="button"
                    className="text-xs text-danger"
                    onClick={() => onChange({ districts: nation.districts.filter((x) => x.id !== d.id) })}
                  >
                    Strip
                  </button>
                )}
              </li>
            ))}
          </ul>
          {(!atWar || staffLive) && (
          <div className="flex flex-wrap gap-1">
            {DISTRICT_KINDS.map((k) => (
              <Button
                key={k.id}
                className="h-8 px-2 text-xs"
                disabled={nation.districts.length >= slots || nation.districts.filter((d) => d.kind === k.id).length >= 3}
                onClick={() => addDistrict(k.id)}
              >
                {k.label}
              </Button>
            ))}
          </div>
          )}
        </div>
        {rulers.length > 0 && (
          <div>
            <h3 className="mb-1 text-[11px] tracking-[0.14em] text-gold">COURT</h3>
            <ul className="space-y-1">
              {rulers.map((ch) => (
                <li key={ch.id}>
                  <button type="button" className="text-gold" onClick={() => onOpenCharacter(ch.id)}>
                    {ch.name}
                  </button>
                  <span className="ml-2 text-[11px] text-muted">prestige {ch.prestige}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button variant="gold" className="h-10 w-full" onClick={onConvert}>
          {atWar ? "Write from the court" : "Write a conversion"}
        </Button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted">{k}</dt>
      <dd className="text-fg">{v}</dd>
    </div>
  );
}
