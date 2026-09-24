import type { UnitTypeId } from "../packs/core/units.ts";

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

export type ArmyUnit = {
  id: string;
  typeId: UnitTypeId;
  name?: string;
  fielded: number;
};

export type ArmyPosture = "plain" | "entrenched" | "forceMarched" | "skirmish";
export type ArmyCover = "field" | "garrison" | "covering";
export type MarchMode = "march" | "force" | "skirmish";

export type Army = {
  id: ArmyId;
  x: number;
  y: number;
  ownerId: NationId;
  strength: number;
  composition?: Composition;
  units?: ArmyUnit[];
  posture?: ArmyPosture;
  moveUsed?: boolean;
  actionUsed?: boolean;
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
  winner: "attacker" | "defender" | "draw";
  attackerLoss: number;
  defenderLoss: number;
};

export type BattleGrade =
  | "legendary"
  | "crushing"
  | "hard fought"
  | "pyrrhic"
  | "narrow"
  | "inconclusive";

export type BattleSide = "attacker" | "defender" | "inconclusive";

export type UnitLine = {
  armyId: ArmyId;
  nationId: NationId;
  unitId: string;
  typeId: string;
  name: string;
  fielded: number;
  remain: number;
  dead: number;
};

export type BattleReport = {
  attackerIds: ArmyId[];
  defenderIds: ArmyId[];
  terrain: TerrainId;
  phases: PhaseResult[];
  winner: BattleSide;
  wipe: boolean;
  grade: BattleGrade;
  staffGrade?: BattleGrade;
  decisivePhase: PhaseId | null;
  attackerTags: string[];
  defenderTags: string[];
  units: UnitLine[];
  casualtiesByNation: { nationId: NationId; dead: number }[];
  attackerLoss: number;
  defenderLoss: number;
  summary: string;
  x?: number;
  y?: number;
};

export type StaffRemain = {
  unitId: string;
  remain: number;
};

export type BattleReel = {
  index: number;
  frozen: boolean;
  leftoverAtk: boolean;
  leftoverDef: boolean;
  occupyX: number;
  occupyY: number;
  attackers: Army[];
  defenders: Army[];
  fielded: UnitLine[];
  terrain: TerrainId;
  attackerTags: string[];
  defenderTags: string[];
  phases: PhaseResult[];
  report: BattleReport;
  done: boolean;
};

export type TableMode = "peace" | "friday";

export type WarStatus = "declared" | "resolved";

export type War = {
  id: WarId;
  attackerArmyId: ArmyId;
  defenderArmyId: ArmyId;
  attackerArmyIds: ArmyId[];
  defenderArmyIds: ArmyId[];
  attackerNationId: NationId;
  defenderNationId: NationId;
  title: string;
  terrain: TerrainId;
  status: WarStatus;
  warTurns: number;
  warTurn: number;
  pendingAttack?: boolean;
  report?: BattleReport;
  reel?: BattleReel;
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
  terrain?: import("./terrain").TerrainPack;
};
