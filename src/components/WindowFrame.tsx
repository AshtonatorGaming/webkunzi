"use client";

import { useEffect, useRef } from "react";
import type { GameWindow } from "@/engine/windows";
import { cn } from "@/lib/cn";

export default function WindowFrame({
  win,
  zIndex,
  onMove,
  onClose,
  onFocus,
  children,
}: {
  win: GameWindow;
  zIndex: number;
  onMove: (id: string, x: number, y: number) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  children: React.ReactNode;
}) {
  const drag = useRef<{ pointerId: number; dx: number; dy: number } | null>(null);
  const winRef = useRef(win);
  const onMoveRef = useRef(onMove);
  winRef.current = win;
  onMoveRef.current = onMove;

  useEffect(() => {
    function move(e: PointerEvent) {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      e.preventDefault();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = Math.min(Math.max(8, e.clientX - d.dx), Math.max(8, vw - 48));
      const y = Math.min(Math.max(8, e.clientY - d.dy), Math.max(8, vh - 48));
      onMoveRef.current(winRef.current.id, x, y);
    }
    function up(e: PointerEvent) {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      drag.current = null;
      document.body.classList.remove("ink-dragging-window");
    }
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const left =
    typeof window === "undefined"
      ? win.x
      : Math.min(Math.max(8, win.x), Math.max(8, window.innerWidth - 48));
  const top =
    typeof window === "undefined"
      ? win.y
      : Math.min(Math.max(8, win.y), Math.max(8, window.innerHeight - 48));

  return (
    <div
      className={cn(
        "ink-panel ink-window absolute text-fg",
        win.kind === "war"
          ? "w-[min(28rem,calc(100vw-1.5rem))]"
          : "w-[min(22rem,calc(100vw-1.5rem))]",
      )}
      data-kind={win.kind}
      style={{ left, top, zIndex }}
      onPointerDown={() => onFocus(win.id)}
    >
      <div
        className="ink-window-title ink-hairline flex cursor-grab items-center justify-between bg-raised px-3 py-2"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          e.preventDefault();
          e.stopPropagation();
          drag.current = {
            pointerId: e.pointerId,
            dx: e.clientX - win.x,
            dy: e.clientY - win.y,
          };
          document.body.classList.add("ink-dragging-window");
          onFocus(win.id);
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
      <div
        className={cn(
          "max-h-[min(32rem,70vh)] overflow-y-auto text-sm ink-scroll",
          win.kind === "nation" ? "p-0" : "p-3",
        )}
      >
        {children}
      </div>
    </div>
  );
}
