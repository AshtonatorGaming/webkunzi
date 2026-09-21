export type AgeDef = {
  id: string;
  label: string;
  popValue: number;
  foodMult: number;
  yearsPerSession: number;
};

export const AGES: AgeDef[] = [
  { id: "tribal", label: "Tribal", popValue: 5000, foodMult: 1, yearsPerSession: 5 },
  { id: "bronze", label: "Bronze", popValue: 15000, foodMult: 1.1, yearsPerSession: 10 },
  { id: "classical", label: "Classical", popValue: 27500, foodMult: 1.2, yearsPerSession: 20 },
  { id: "crown", label: "Crown", popValue: 50000, foodMult: 1.25, yearsPerSession: 10 },
  { id: "early-modern", label: "Early Modern", popValue: 100000, foodMult: 1.4, yearsPerSession: 5 },
];

export function ageById(id: string): AgeDef {
  return AGES.find((a) => a.id === id) ?? AGES[1];
}
