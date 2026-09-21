import type { ResourceId, ResourceNode } from "./types";
import { STARTER_NODES } from "@/packs/core/starterNodes";

const KEY = "inkunzi.nodes.v1";

export function loadNodes(): ResourceNode[] {
  if (typeof window === "undefined") return STARTER_NODES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return STARTER_NODES;
    const parsed = JSON.parse(raw) as ResourceNode[];
    return Array.isArray(parsed) && parsed.length ? parsed : STARTER_NODES;
  } catch {
    return STARTER_NODES;
  }
}

export function saveNodes(nodes: ResourceNode[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(nodes));
  } catch {
    /* ignore */
  }
}

export function makeNode(
  x: number,
  y: number,
  resourceId: ResourceId = "food",
): ResourceNode {
  return {
    id: crypto.randomUUID(),
    x,
    y,
    resourceId,
    ownerId: "unclaimed",
    yield: 1,
  };
}

export function updateNode(
  nodes: ResourceNode[],
  id: string,
  patch: Partial<ResourceNode>,
): ResourceNode[] {
  return nodes.map((n) => (n.id === id ? { ...n, ...patch } : n));
}

export function removeNode(nodes: ResourceNode[], id: string): ResourceNode[] {
  return nodes.filter((n) => n.id !== id);
}
