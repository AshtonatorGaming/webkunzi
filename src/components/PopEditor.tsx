"use client";

import type { Nation, Pop, PopKind } from "@/engine/types";

const KINDS: { id: PopKind; label: string }[] = [
  { id: "pop", label: "Pop" },
  { id: "town", label: "Town" },
  { id: "city", label: "City" },
  { id: "fort", label: "Fort" },
  { id: "camp", label: "Camp" },
];

export default function PopEditor({
  pop,
  nations,
  onChange,
  onDelete,
}: {
  pop: Pop;
  nations: Nation[];
  onChange: (patch: Partial<Pop>) => void;
  onDelete: () => void;
}) {
  const known = nations.some((n) => n.id === pop.ownerId);

  return (
    <div className="flex min-w-48 flex-col gap-2 text-sm text-fg">
      <label className="text-muted">
        Owner
        <select
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={pop.ownerId}
          onChange={(e) => onChange({ ownerId: e.target.value })}
        >
          {!known && <option value={pop.ownerId}>{pop.ownerId} (missing)</option>}
          {nations.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-muted">
        Kind
        <select
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={pop.kind ?? "pop"}
          onChange={(e) => {
            const kind = e.target.value as PopKind;
            onChange({ kind, settled: kind !== "camp" });
          }}
        >
          {KINDS.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-muted">
        Culture
        <input
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={pop.culture}
          onChange={(e) => onChange({ culture: e.target.value })}
        />
      </label>
      <label className="text-muted">
        Religion
        <input
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={pop.religion}
          onChange={(e) => onChange({ religion: e.target.value })}
        />
      </label>
      <label className="flex items-center gap-2 text-fg">
        <input
          type="checkbox"
          checked={pop.settled}
          onChange={(e) => onChange({ settled: e.target.checked })}
        />
        Settled
      </label>
      <small className="text-subtle tabular">
        {pop.x.toFixed(0)}, {pop.y.toFixed(0)}
      </small>
      <button type="button" className="mt-1 text-left text-danger" onClick={onDelete}>
        Delete pop
      </button>
    </div>
  );
}
