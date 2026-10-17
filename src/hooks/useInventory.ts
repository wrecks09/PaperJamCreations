import { useState, useCallback } from "react";
import { Material, MaterialCategory, Project, ProjectMaterial } from "@/types/inventory";

// Mock data for initial state
const mockMaterials: Material[] = [
  {
    id: "1",
    name: "Premium Gloss Paper 130gsm",
    category: "paper",
    sku: "PPG-130",
    unit: "ream",
    quantity: 24,
    unitPrice: 12.50,
    lowStockThreshold: 5,
    supplier: "PaperCo Supplies",
    description: "A4 size, 130gsm gloss photo paper",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Cyan Ink Cartridge",
    category: "ink",
    sku: "INK-CYN",
    unit: "bottle",
    quantity: 8,
    unitPrice: 45.00,
    lowStockThreshold: 2,
    supplier: "InkMaster Inc",
    description: "250ml cyan pigment ink",
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-01-10T08:30:00Z",
  },
  {
    id: "3",
    name: "Clear Vinyl Sticker Paper",
    category: "sticker",
    sku: "STK-CLR",
    unit: "sheet",
    quantity: 150,
    unitPrice: 0.85,
    lowStockThreshold: 50,
    supplier: "StickerSupply Co",
    description: "A4 clear vinyl sticker sheets",
    createdAt: "2024-01-12T14:00:00Z",
    updatedAt: "2024-01-12T14:00:00Z",
  },
  {
    id: "4",
    name: "White Artboard 2mm",
    category: "artboard",
    sku: "ARB-WHT",
    unit: "sheet",
    quantity: 30,
    unitPrice: 3.25,
    lowStockThreshold: 10,
    supplier: "BoardPro",
    description: "60x90cm white artboard, 2mm thick",
    createdAt: "2024-01-08T09:00:00Z",
    updatedAt: "2024-01-08T09:00:00Z",
  },
];

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Business Cards - Acme Corp",
    description: "500 double-sided business cards",
    status: "completed",
    materials: [
      { materialId: "1", materialName: "Premium Gloss Paper 130gsm", quantity: 1, unitPrice: 12.50, totalCost: 12.50 },
    ],
    laborCost: 25.00,
    markup: 50,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
];

export function useInventory() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const addMaterial = useCallback((data: Omit<Material, "id" | "createdAt" | "updatedAt">) => {
    const newMaterial: Material = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMaterials((prev) => [...prev, newMaterial]);
    return newMaterial;
  }, []);

  const updateMaterial = useCallback((id: string, data: Partial<Material>) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      )
    );
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const getMaterialById = useCallback(
    (id: string) => materials.find((m) => m.id === id),
    [materials]
  );

  const addProject = useCallback((data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject: Project = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      )
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProjectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const calculateProjectCost = useCallback(
    (projectMaterials: ProjectMaterial[], laborCost: number, markup: number) => {
      const materialCost = projectMaterials.reduce(
        (sum, pm) => sum + pm.totalCost,
        0
      );
      const subtotal = materialCost + laborCost;
      const markupAmount = subtotal * (markup / 100);
      const total = subtotal + markupAmount;
      return {
        materialCost,
        laborCost,
        subtotal,
        markupAmount,
        total,
      };
    },
    []
  );

  return {
    materials,
    projects,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialById,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    calculateProjectCost,
  };
}