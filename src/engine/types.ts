export type PopId = string;
export type NationId = string;
export type ResourceId = string;
export type NodeId = string;
export type ArmyId = string;
export type CharacterId = string;
export type WarId = string;

export type ResourceMode = "ledger" | "cap";

export type ResourceDef = {
  id: ResourceId;
  label: string;
  kind: "food" | "material" | "wealth" | "military";
  mode?: ResourceMode;
};

export type ResourceLedger = Record<ResourceId, number>;

export type DistrictKind = "farm" | "market" | "port" | "fort" | "admin";

export type District = {
  id: string;
  kind: DistrictKind;
  tier: number;
};

export type Nation = {
  id: NationId;
  name: string;
  color: string;
  treasury: number;
  stability: number;
  warSupport: number;
  infamy: number;
  manpower: number;
  technology: number;
  legitimacy: number;
  centralisation: number;
  districtSlots: number;
  districts: District[];
  resources: ResourceLedger;
};

export type PopKind = "pop" | "town" | "city" | "fort" | "camp";

export type Pop = {
  id: PopId;
  x: number;
  y: number;
  ownerId: NationId;
  culture: string;
  religion: string;
  settled: boolean;
  kind?: PopKind;
};

export type ResourceNode = {
  id: NodeId;
  x: number;
  y: number;
  resourceId: ResourceId;
  ownerId: NationId;
  yield: number;
};

export type Composition = {
  shock: number;
  ranged: number;
  melee: number;
};

export type Army = {
  id: ArmyId;
  x: number;
  y: number;
  ownerId: NationId;
  strength: number;
  composition?: Composition;
};

export type CharacterStats = {
  rulership: number;
  charisma: number;
  landTactics: number;
  seaTactics: number;
  intrigue: number;
  business: number;
};

export type Character = {
  id: CharacterId;
  name: string;
  nationId: NationId;
  prestige: number;
  armyId?: string;
  stats: CharacterStats;
};

export type TerrainId =
  | "open"
  | "fort"
  | "marsh"
  | "hills"
  | "forest"
  | "river"
  | "rain";

export type PhaseId = "shock" | "early" | "late";

export type PhaseResult = {
  id: PhaseId;
  attackerPower: number;
  defenderPower: number;
  winner: "attacker" | "defender";
  attackerLoss: number;
  defenderLoss: number;
};

export type BattleReport = {
  attackerId: ArmyId;
  defenderId: ArmyId;
  terrain: TerrainId;
  phases: PhaseResult[];
  winner: "attacker" | "defender";
  wipe: boolean;
  summary: string;
};

export type WarStatus = "declared" | "resolved";

export type War = {
  id: WarId;
  attackerArmyId: ArmyId;
  defenderArmyId: ArmyId;
  attackerNationId: NationId;
  defenderNationId: NationId;
  title: string;
  terrain: TerrainId;
  status: WarStatus;
  report?: BattleReport;
};

export type Session = {
  name: string;
  mechanicalTurn: number;
  calendarDay: number;
  daysPerTurn: number;
  mapWidth: number;
  mapHeight: number;
  pixelsPerDayMarch: number;
  popValue: number;
  ageId: string;
  workRate: number;
  ration: number;
};

export type WorldSnapshot = {
  version: 1;
  session: Session;
  nations: Nation[];
  pops: Pop[];
  nodes: ResourceNode[];
  armies: Army[];
  actions?: import("./actionTypes").GameAction[];
  characters?: Character[];
  wars?: War[];
};
