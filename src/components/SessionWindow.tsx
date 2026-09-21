"use client";

import type { Session } from "@/engine/types";
import { AGES } from "@/packs/core/ages";
import { setAge } from "@/engine/sessionStore";

export default function SessionWindow({
  session,
  onChange,
}: {
  session: Session;
  onChange: (next: Session) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted">
        Table name
        <input
          className="mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg"
          value={session.name}
          onChange={(e) => onChange({ ...session, name: e.target.value })}
        />
      </label>
      <label className="block text-xs text-muted">
        Age
        <select
          className="mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg"
          value={session.ageId}
          onChange={(e) => onChange(setAge(session, e.target.value))}
        >
          {AGES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label} · {a.popValue.toLocaleString()} / pop
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-muted tabular">
        People per painted dot: {session.popValue.toLocaleString()}. New dots stay rare; the value jumps when the age advances.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted">
          Days / tick
          <input
            className="mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg"
            value={session.daysPerTurn}
            onChange={(e) => onChange({ ...session, daysPerTurn: Number(e.target.value) || session.daysPerTurn })}
          />
        </label>
        <label className="text-xs text-muted">
          Px / day march
          <input
            className="mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg"
            value={session.pixelsPerDayMarch}
            onChange={(e) =>
              onChange({
                ...session,
                pixelsPerDayMarch: Number(e.target.value) || session.pixelsPerDayMarch,
              })
            }
          />
        </label>
        <label className="text-xs text-muted">
          Work rate
          <input
            className="mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg"
            value={session.workRate}
            onChange={(e) => onChange({ ...session, workRate: Number(e.target.value) || session.workRate })}
          />
        </label>
        <label className="text-xs text-muted">
          Ration
          <input
            className="mt-1 h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm text-fg"
            value={session.ration}
            onChange={(e) => onChange({ ...session, ration: Number(e.target.value) || session.ration })}
          />
        </label>
      </div>
    </div>
  );
}
