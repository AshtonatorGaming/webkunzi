"use client";

import { useState } from "react";
import type { GameAction } from "@/engine/actionTypes";
import { Button } from "@/components/ui/button";

function laneLabel(a: GameAction): string {
  const lane = a.lane ?? 2;
  if (lane === 1) return "Lane 1 · auto";
  if (lane === 2) return `Lane 2 · roll${a.dc ? ` DC ${a.dc}` : ""}`;
  return "Lane 3 · staff gate";
}

export default function ActionPanel({
  actions,
  onSubmit,
  onAccept,
  onDeny,
}: {
  actions: GameAction[];
  onSubmit: (title: string, detail: string) => void;
  onAccept: (id: string) => void;
  onDeny: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const pending = actions.filter((a) => a.status === "pending");
  const recent = actions.filter((a) => a.status !== "pending").slice(0, 8);

  return (
    <aside className="ink-scroll h-full w-full overflow-y-auto bg-surface p-3 text-fg">
      <h2 className="mb-2 font-display text-xs tracking-[0.16em] text-gold">QUEUE</h2>
      <form
        className="mb-3 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          onSubmit(title.trim(), detail.trim());
          setTitle("");
          setDetail("");
        }}
      >
        <input
          className="h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm"
          placeholder="War / RP / claim"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="h-10 w-full rounded-sm border border-border bg-raised px-2 text-sm"
          placeholder="Detail for staff"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <Button type="submit" variant="primary" className="h-10 w-full">
          Queue
        </Button>
      </form>
      <ul className="space-y-2">
        {pending.length === 0 && (
          <li className="text-sm text-muted">No pending actions. Staff live applies peacetime marches now.</li>
        )}
        {pending.map((a) => (
          <li key={a.id} className="rounded-sm border border-border bg-raised px-2 py-2 text-xs">
            <div className="font-medium text-sm text-fg">{a.title}</div>
            <div className="text-gold">{laneLabel(a)}</div>
            {a.detail && <div className="text-subtle">{a.detail}</div>}
            <div className="mt-2 flex gap-1">
              <Button variant="staff" className="h-8 px-2 text-xs" onClick={() => onAccept(a.id)}>
                Accept
              </Button>
              <Button variant="danger" className="h-8 px-2 text-xs" onClick={() => onDeny(a.id)}>
                Deny
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {recent.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-1 text-[11px] tracking-[0.14em] text-subtle">RESOLVED</h3>
          <ul className="space-y-1 text-xs text-muted">
            {recent.map((a) => (
              <li key={a.id}>
                {a.status}
                {a.result && a.result !== "unset" ? `/${a.result}` : ""} · {a.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
