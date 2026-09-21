"use client";

import { useState } from "react";
import type { GameWindow } from "@/engine/windows";
import { cn } from "@/lib/cn";

export default function WindowFrame({
  win,
  onMove,
  onClose,
  onFocus,
  children,
}: {
  win: GameWindow;
  onMove: (id: string, x: number, y: number) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  children: React.ReactNode;
}) {
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);

  const left =
    typeof window === "undefined"
      ? win.x
      : Math.min(Math.max(8, win.x), Math.max(8, window.innerWidth - 24));
  const top =
    typeof window === "undefined"
      ? win.y
      : Math.min(Math.max(8, win.y), Math.max(8, window.innerHeight - 72));

  return (
    <div
      className={cn(
        "ink-panel absolute w-[min(22rem,calc(100vw-1.5rem))] text-fg",
      )}
      style={{ left, top, zIndex: 2000 }}
      onPointerDown={() => onFocus(win.id)}
    >
      <div
        className="ink-hairline flex cursor-move items-center justify-between bg-raised px-3 py-2"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag({ dx: e.clientX - win.x, dy: e.clientY - win.y });
        }}
        onPointerMove={(e) => {
          if (!drag) return;
          onMove(win.id, Math.max(8, e.clientX - drag.dx), Math.max(8, e.clientY - drag.dy));
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          setDrag(null);
        }}
      >
        <span className="font-display truncate text-sm tracking-wide text-gold">{win.title}</span>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-sm text-muted hover:bg-hover hover:text-fg"
          onClick={() => onClose(win.id)}
          aria-label="Close window"
        >
          ×
        </button>
      </div>
      <div className="max-h-[min(32rem,70vh)] overflow-y-auto p-3 text-sm ink-scroll">{children}</div>
    </div>
  );
}
