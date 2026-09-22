"use client";

import { Suspense, use, type ComponentType } from "react";
import type { Army, MarchMode, Nation, Pop, ResourceNode } from "@/engine/types";

type Props = {
  mapWidth: number;
  mapHeight: number;
  marchRange: number;
  selectedArmyId: string | null;
  marchingArmyId: string | null;
  staffLive: boolean;
  pops: Pop[];
  nodes: ResourceNode[];
  armies: Army[];
  nations: Nation[];
  onSelectArmy: (id: string | null) => void;
  onMoveArmy: (id: string, x: number, y: number) => void;
  onPlacePop: (y: number, x: number) => void;
  onPlaceNode: (y: number, x: number) => void;
  onPlaceArmy: (y: number, x: number) => void;
  onUpdatePop: (id: string, patch: Partial<Pop>) => void;
  onRemovePop: (id: string) => void;
  onUpdateNode: (id: string, patch: Partial<ResourceNode>) => void;
  onRemoveNode: (id: string) => void;
  onUpdateArmy: (id: string, patch: Partial<Army>) => void;
  onRemoveArmy: (id: string) => void;
  onStartMarch: (id: string, mode: MarchMode) => void;
  onAttack: (attackerId: string, defenderId: string) => void;
  onEntrench: (id: string) => void;
};

const worldMapPromise: Promise<{ default: ComponentType<Props> }> = import("./WorldMap");

function PaintingFallback() {
  return (
    <div className="grid h-full place-items-center bg-map text-muted">
      <div className="text-center">
        <p className="font-display tracking-[0.18em] text-gold">INKUNZI</p>
        <p className="mt-2 text-sm">Unrolling the painting…</p>
      </div>
    </div>
  );
}

function WorldMapReady(props: Props) {
  const Map = use(worldMapPromise).default;
  return (
    <div className="h-full w-full">
      <Map {...props} />
    </div>
  );
}

export default function WorldMapLoader(props: Props) {
  return (
    <Suspense fallback={<PaintingFallback />}>
      <WorldMapReady {...props} />
    </Suspense>
  );
}
