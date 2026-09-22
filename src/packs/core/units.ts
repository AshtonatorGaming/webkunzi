export type UnitTypeId = "cavalry" | "archers" | "infantry" | "levy";
export type UnitRole = "shock" | "ranged" | "melee";

export type UnitType = {
  id: UnitTypeId;
  label: string;
  short: string;
  role: UnitRole;
};

export const UNIT_TYPES: UnitType[] = [
  { id: "cavalry", label: "Cavalry", short: "Cav", role: "shock" },
  { id: "archers", label: "Archers", short: "Bow", role: "ranged" },
  { id: "infantry", label: "Infantry", short: "Ft", role: "melee" },
  { id: "levy", label: "Levy", short: "Levy", role: "melee" },
];

export function unitTypeById(id: string): UnitType {
  return UNIT_TYPES.find((t) => t.id === id) ?? UNIT_TYPES[2]!;
}

export function roleOf(typeId: string): UnitRole {
  return unitTypeById(typeId).role;
}
