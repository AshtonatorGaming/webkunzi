"use client";

import type { Nation, ResourceNode } from "@/engine/types";
import { RESOURCES } from "@/packs/core/resources";

export default function NodeEditor({
  node,
  nations,
  onChange,
  onDelete,
}: {
  node: ResourceNode;
  nations: Nation[];
  onChange: (patch: Partial<ResourceNode>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex min-w-48 flex-col gap-2 text-sm text-fg">
      <label className="text-muted">
        Resource
        <select
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={node.resourceId}
          onChange={(e) => onChange({ resourceId: e.target.value })}
        >
          {RESOURCES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-muted">
        Owner
        <select
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={node.ownerId}
          onChange={(e) => onChange({ ownerId: e.target.value })}
        >
          {nations.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-muted">
        Yield
        <input
          type="number"
          className="mt-0.5 w-full rounded-sm border border-border bg-raised px-2 py-1 text-fg"
          value={node.yield}
          onChange={(e) => onChange({ yield: Number(e.target.value) })}
        />
      </label>
      <button type="button" className="mt-1 text-left text-danger" onClick={onDelete}>
        Delete node
      </button>
    </div>
  );
}
