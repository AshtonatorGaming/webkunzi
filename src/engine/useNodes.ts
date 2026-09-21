"use client";

import { useEffect, useState } from "react";
import type { ResourceNode } from "./types";
import { loadNodes, saveNodes, makeNode, updateNode, removeNode } from "./nodeStore";

export function useNodes() {
  const [nodes, setNodes] = useState<ResourceNode[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNodes(loadNodes());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveNodes(nodes);
  }, [nodes, ready]);

  return {
    nodes,
    setNodes,
    ready,
    place: (x: number, y: number) => setNodes((cur) => [...cur, makeNode(x, y)]),
    update: (id: string, patch: Partial<ResourceNode>) =>
      setNodes((cur) => updateNode(cur, id, patch)),
    remove: (id: string) => setNodes((cur) => removeNode(cur, id)),
  };
}
