"use client";

import { Button } from "@/components/ui/button";
import Crest from "@/components/Crest";
import type { Session } from "@/engine/types";
import { ageById } from "@/packs/core/ages";

export default function TopBar({
  session,
  staffLive,
  openWars,
  log,
  onStaffLive,
  onDay,
  onSaturday,
  onFriday,
  onClock,
  onQueue,
  onExport,
  onImport,
}: {
  session: Session;
  staffLive: boolean;
  openWars: number;
  log: string;
  onStaffLive: (next: boolean) => void;
  onDay: () => void;
  onSaturday: () => void;
  onFriday: () => void;
  onClock: () => void;
  onQueue: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  const age = ageById(session.ageId);

  return (
    <header className="ink-hairline relative z-chrome flex shrink-0 items-center gap-2 bg-surface px-2 py-1.5 sm:px-3 sm:py-2">
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <Crest color="#4d8a3a" size={26} title="Inkunzi" />
        <div className="hidden min-w-0 sm:block">
          <h1 className="font-display text-sm leading-none tracking-[0.18em] text-gold">INKUNZI</h1>
          <p className="truncate text-[11px] text-muted">{session.name}</p>
        </div>
      </div>

      <div className="mx-auto flex min-w-0 flex-col items-center rounded-sm border border-gold-dim bg-bg px-3 py-1 sm:px-4">
        <div className="font-display text-sm tracking-widest text-fg tabular">
          TURN {session.mechanicalTurn}
        </div>
        <div className="hidden text-[11px] text-muted tabular sm:block">
          {age.label} · Day {session.calendarDay} · {session.popValue.toLocaleString()} / pop
        </div>
      </div>

      <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        <p className="hidden max-w-xs truncate text-[11px] text-muted xl:block">{log}</p>
        <label className="flex min-h-9 items-center gap-2 rounded-sm border border-border bg-raised px-2 text-xs">
          <input
            type="checkbox"
            checked={staffLive}
            onChange={(e) => onStaffLive(e.target.checked)}
          />
          Staff
        </label>
        <Button variant="gold" onClick={onFriday}>
          Friday{openWars ? ` ${openWars}` : ""}
        </Button>
        <Button variant="staff" onClick={onSaturday}>
          Saturday
        </Button>
        <div className="hidden items-center gap-1.5 md:flex">
          <Button onClick={onQueue}>Queue</Button>
          <Button onClick={onDay}>+Day</Button>
          <Button onClick={onClock}>Clock</Button>
          <Button onClick={onExport}>Export</Button>
          <label className="inline-flex min-h-9 cursor-pointer items-center rounded-sm border border-border bg-raised px-3 text-sm">
            Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </header>
  );
}
