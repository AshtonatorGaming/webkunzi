"use client";

import { Button } from "@/components/ui/button";
import Crest from "@/components/Crest";
import type { Session, TableMode } from "@/engine/types";
import { ageById } from "@/packs/core/ages";
import { cn } from "@/lib/cn";

export default function TopBar({
  session,
  staffLive,
  tableMode,
  openWars,
  log,
  onStaffLive,
  onTableMode,
  onDay,
  onSaturday,
  onClock,
  onQueue,
  onExport,
  onImport,
  outlinerOpen,
  onOutliner,
  onAtlas,
}: {
  session: Session;
  staffLive: boolean;
  tableMode: TableMode;
  openWars: number;
  log: string;
  onStaffLive: (next: boolean) => void;
  onTableMode: (mode: TableMode) => void;
  onDay: () => void;
  onSaturday: () => void;
  onClock: () => void;
  onQueue: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  outlinerOpen: boolean;
  onOutliner: () => void;
  onAtlas: () => void;
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
        <Button onClick={onOutliner} aria-pressed={outlinerOpen}>
          Outliner
        </Button>
        <label className="flex min-h-9 items-center gap-2 rounded-sm border border-border bg-raised px-2 text-xs">
          <input
            type="checkbox"
            checked={staffLive}
            onChange={(e) => onStaffLive(e.target.checked)}
          />
          Staff
        </label>
        {staffLive && (
          <>
            <Button variant="gold" onClick={onAtlas}>
              Atlas
            </Button>
            <div className="flex overflow-hidden rounded-sm border border-gold-dim" role="group" aria-label="Staff clock">
              <button
                type="button"
                aria-pressed={tableMode === "peace"}
                className={cn(
                  "min-h-9 px-3 text-sm",
                  tableMode === "peace" ? "bg-raised text-gold" : "bg-bg text-muted hover:bg-hover",
                )}
                onClick={() => onTableMode("peace")}
              >
                RP week
              </button>
              <button
                type="button"
                aria-pressed={tableMode === "friday"}
                className={cn(
                  "min-h-9 px-3 text-sm",
                  tableMode === "friday" ? "bg-raised text-gold" : "bg-bg text-muted hover:bg-hover",
                )}
                onClick={() => onTableMode("friday")}
              >
                War day{openWars ? ` ${openWars}` : ""}
              </button>
            </div>
            <Button variant="staff" onClick={onSaturday}>
              Tick day
            </Button>
            <div className="hidden items-center gap-1.5 md:flex">
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
          </>
        )}
        <Button onClick={onQueue}>Letters</Button>
      </div>
    </header>
  );
}
