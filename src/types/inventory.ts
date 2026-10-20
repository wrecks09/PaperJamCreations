export type MaterialCategory =
  | "paper"
  | "ink"
  | "sticker"
  | "artboard"
  | "consumable"
  | "other";

export type Unit = "sheet" | "ream" | "bottle" | "roll" | "packet" | "box" | "liter" | "milliliter" | "meter";

export type CoverageLevel = "low" | "medium" | "high" | "full";

export interface UnitConversion {
  baseUnit: Unit;
  conversionFactor: number;
}

export const unitConversions: Record<Unit, UnitConversion> = {
  sheet: { baseUnit: "sheet", conversionFactor: 1 },
  ream: { baseUnit: "sheet", conversionFactor: 500 },
  bottle: { baseUnit: "bottle", conversionFactor: 1 },
  roll: { baseUnit: "roll", conversionFactor: 1 },
  packet: { baseUnit: "packet", conversionFactor: 1 },
  box: { baseUnit: "box", conversionFactor: 1 },
  liter: { baseUnit: "milliliter", conversionFactor: 1000 },
  milliliter: { baseUnit: "milliliter", conversionFactor: 1 },
  meter: { baseUnit: "meter", conversionFactor: 1 },
};

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  sku?: string;
  unit: Unit; // e.g., "ream", "bottle", "sheet", "roll"
  quantity: number;
  unitPrice: number; // price per input unit
  baseUnitPrice: number; // price per base unit (calculated)
  lowStockThreshold: number;
  supplier?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "in-progress" | "completed" | "cancelled";
  materials: ProjectMaterial[];
  laborCost: number;
  markup: number; // percentage
  overheadCost: number;
  wasteBuffer: number; // percentage (e.g., 15 = 15%)
  pageCount: number;
  coverageLevel: CoverageLevel;
  createdAt: string;
  updatedAt: string;
  completedAt?: string; // set when status changes to completed
  // Customer fields for quotation
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  quotationNumber?: string;
}

export interface ProjectMaterial {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export const categoryLabels: Record<MaterialCategory, string> = {
  paper: "Paper",
  ink: "Ink",
  sticker: "Sticker Paper",
  artboard: "Artboard",
  consumable: "Consumable",
  other: "Other",
};

export const categoryColors: Record<MaterialCategory, string> = {
  paper: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ink: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  sticker: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  artboard: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  consumable: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  other: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export const coverageLevels: Record<CoverageLevel, { label: string; percentage: number }> = {
  low: { label: "Low (5%)", percentage: 5 },
  medium: { label: "Medium (25%)", percentage: 25 },
  high: { label: "High (65%)", percentage: 65 },
  full: { label: "Full (100%)", percentage: 100 },
};