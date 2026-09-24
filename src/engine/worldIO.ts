import type { GameAction } from "./actionTypes";
import type { TerrainPack } from "./terrain";
import type {
  Army,
  Character,
  Nation,
  Pop,
  ResourceNode,
  Session,
  War,
  WorldSnapshot,
} from "./types";

export function buildSnapshot(
  session: Session,
  nations: Nation[],
  pops: Pop[],
  nodes: ResourceNode[],
  armies: Army[],
  actions: GameAction[] = [],
  characters: Character[] = [],
  wars: War[] = [],
  terrain?: TerrainPack | null,
): WorldSnapshot {
  return {
    version: 1,
    session,
    nations,
    pops,
    nodes,
    armies,
    actions,
    characters,
    wars,
    ...(terrain ? { terrain } : {}),
  };
}

export function parseSnapshot(raw: string): WorldSnapshot {
  const data = JSON.parse(raw) as WorldSnapshot;
  if (!data || data.version !== 1 || !data.session) {
    throw new Error("Not an Inkunzi world file");
  }
  return {
    ...data,
    actions: data.actions ?? [],
    characters: data.characters ?? [],
    wars: data.wars ?? [],
    terrain: data.terrain,
  };
}

export function downloadSnapshot(snap: WorldSnapshot): void {
  const blob = new Blob([JSON.stringify(snap, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${snap.session.name.replace(/\s+/g, "-").toLowerCase()}-t${snap.session.mechanicalTurn}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
