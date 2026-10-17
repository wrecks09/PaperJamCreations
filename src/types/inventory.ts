export type MaterialCategory =
  | "paper"
  | "ink"
  | "sticker"
  | "artboard"
  | "consumable"
  | "other";

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  sku?: string;
  unit: string; // e.g., "ream", "bottle", "sheet", "roll"
  quantity: number;
  unitPrice: number; // price per unit
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
  status: "planning" | "in-progress" | "completed";
  materials: ProjectMaterial[];
  laborCost: number;
  markup: number; // percentage
  createdAt: string;
  updatedAt: string;
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