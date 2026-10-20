import { useState, useCallback, useEffect } from "react";
import {
  Material,
  MaterialCategory,
  Project,
  ProjectMaterial,
  Unit,
  CoverageLevel,
  coverageLevels,
  unitConversions,
} from "@/types/inventory";

// Ink volume per page (mL) at 100% coverage for a standard page
const INK_VOLUME_PER_PAGE_100 = 0.5; // mL per page at full coverage

export const calculateInkVolume = (
  pageCount: number,
  coverageLevel: CoverageLevel,
  wasteBuffer: number = 15
): number => {
  const coverage = coverageLevels[coverageLevel].percentage / 100;
  const baseVolume = pageCount * INK_VOLUME_PER_PAGE_100 * coverage;
  return baseVolume * (1 + wasteBuffer / 100);
};

// Unit conversion utility functions
export const convertToBaseUnit = (quantity: number, unit: Unit): number => {
  const conversion = unitConversions[unit];
  return quantity * conversion.conversionFactor;
};

export const convertFromBaseUnit = (quantity: number, unit: Unit): number => {
  const conversion = unitConversions[unit];
  return quantity / conversion.conversionFactor;
};

export const calculateBaseUnitPrice = (unitPrice: number, unit: Unit): number => {
  const conversion = unitConversions[unit];
  return unitPrice / conversion.conversionFactor;
};

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
    baseUnitPrice: 0.025, // 12.50 / 500
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
    baseUnitPrice: 45.00, // base unit is bottle
    lowStockThreshold: 2,
    supplier: "InkMaster Inc",
    description: "250ml cyan pigment ink",
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-01-10T08:30:00Z",
  },
  {
    id: "9",
    name: "Cyan Pigment Ink",
    category: "ink",
    sku: "INK-CYN-ML",
    unit: "milliliter",
    quantity: 500,
    unitPrice: 0.18,
    baseUnitPrice: 0.18, // base unit is milliliter
    lowStockThreshold: 100,
    supplier: "InkMaster Inc",
    description: "Bulk cyan pigment ink, cost per mL",
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-01-10T08:30:00Z",
  },
  {
    id: "10",
    name: "Magenta Pigment Ink",
    category: "ink",
    sku: "INK-MAG-ML",
    unit: "milliliter",
    quantity: 500,
    unitPrice: 0.22,
    baseUnitPrice: 0.22, // base unit is milliliter
    lowStockThreshold: 100,
    supplier: "InkMaster Inc",
    description: "Bulk magenta pigment ink, cost per mL",
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-01-10T08:30:00Z",
  },
  {
    id: "11",
    name: "Yellow Pigment Ink",
    category: "ink",
    sku: "INK-YEL-ML",
    unit: "milliliter",
    quantity: 500,
    unitPrice: 0.20,
    baseUnitPrice: 0.20, // base unit is milliliter
    lowStockThreshold: 100,
    supplier: "InkMaster Inc",
    description: "Bulk yellow pigment ink, cost per mL",
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-01-10T08:30:00Z",
  },
  {
    id: "12",
    name: "Black Pigment Ink",
    category: "ink",
    sku: "INK-BLK-ML",
    unit: "milliliter",
    quantity: 500,
    unitPrice: 0.15,
    baseUnitPrice: 0.15, // base unit is milliliter
    lowStockThreshold: 100,
    supplier: "InkMaster Inc",
    description: "Bulk black pigment ink, cost per mL",
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
    baseUnitPrice: 0.85, // base unit is sheet
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
    baseUnitPrice: 3.25, // base unit is sheet
    lowStockThreshold: 10,
    supplier: "BoardPro",
    description: "60x90cm white artboard, 2mm thick",
    createdAt: "2024-01-08T09:00:00Z",
    updatedAt: "2024-01-08T09:00:00Z",
  },
  {
    id: "5",
    name: "Red Fabric Roll",
    category: "consumable",
    sku: "FAB-RED",
    unit: "roll",
    quantity: 12,
    unitPrice: 25.00,
    baseUnitPrice: 25.00, // base unit is roll
    lowStockThreshold: 3,
    supplier: "FabricMart",
    description: "Red cotton fabric, 1 meter wide, 10 meters long",
    createdAt: "2024-01-14T11:00:00Z",
    updatedAt: "2024-01-14T11:00:00Z",
  },
  {
    id: "6",
    name: "Glue Stick Packet",
    category: "consumable",
    sku: "GLUE-PKT",
    unit: "packet",
    quantity: 50,
    unitPrice: 2.00,
    baseUnitPrice: 2.00, // base unit is packet
    lowStockThreshold: 15,
    supplier: "OfficeSupplies Inc",
    description: "White glue sticks, 10 packets per box",
    createdAt: "2024-01-11T16:30:00Z",
    updatedAt: "2024-01-11T16:30:00Z",
  },
  {
    id: "7",
    name: "Box of Paper Clips",
    category: "consumable",
    sku: "CLIP-BOX",
    unit: "box",
    quantity: 25,
    unitPrice: 5.50,
    baseUnitPrice: 5.50, // base unit is box
    lowStockThreshold: 5,
    supplier: "StationeryCo",
    description: "Standard metal paper clips, 100 clips per box",
    createdAt: "2024-01-09T13:45:00Z",
    updatedAt: "2024-01-09T13:45:00Z",
  },
  {
    id: "8",
    name: "Cleaning Solution",
    category: "consumable",
    sku: "CLEAN-LIT",
    unit: "liter",
    quantity: 6,
    unitPrice: 12.00,
    baseUnitPrice: 0.012, // 12.00 / 1000 mL
    lowStockThreshold: 2,
    supplier: "CleanPro",
    description: "Multi-surface cleaning solution, 1L bottles",
    createdAt: "2024-01-13T10:15:00Z",
    updatedAt: "2024-01-13T10:15:00Z",
  },
];

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Business Cards - Acme Corp",
    description: "500 double-sided business cards",
    status: "completed",
    materials: [
      { materialId: "1", materialName: "Premium Gloss Paper 130gsm", quantity: 2, unitPrice: 12.50, totalCost: 25.00 }, // 2 reams = 1000 sheets
    ],
    laborCost: 25.00,
    markup: 50,
    overheadCost: 0,
    wasteBuffer: 0,
    pageCount: 0,
    coverageLevel: "medium",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Flyer Printing - Beta Ltd",
    description: "1000 full-color flyers",
    status: "in-progress",
    materials: [
      { materialId: "3", materialName: "Clear Vinyl Sticker Paper", quantity: 5, unitPrice: 0.85, totalCost: 4.25 }, // 5 sheets
      { materialId: "8", materialName: "Cleaning Solution", quantity: 1, unitPrice: 12.00, totalCost: 12.00 }, // 1 liter
    ],
    laborCost: 30.00,
    markup: 40,
    overheadCost: 0,
    wasteBuffer: 0,
    pageCount: 0,
    coverageLevel: "medium",
    createdAt: "2024-01-22T14:30:00Z",
    updatedAt: "2024-01-22T14:30:00Z",
  },
  {
    id: "3",
    name: "Banner Production",
    description: "3 large banners for event",
    status: "planning",
    materials: [
      { materialId: "4", materialName: "White Artboard 2mm", quantity: 3, unitPrice: 3.25, totalCost: 9.75 }, // 3 sheets
      { materialId: "5", materialName: "Red Fabric Roll", quantity: 2, unitPrice: 25.00, totalCost: 50.00 }, // 2 rolls
      { materialId: "7", materialName: "Box of Paper Clips", quantity: 1, unitPrice: 5.50, totalCost: 5.50 }, // 1 box
    ],
    laborCost: 45.00,
    markup: 35,
    overheadCost: 0,
    wasteBuffer: 0,
    pageCount: 0,
    coverageLevel: "medium",
    createdAt: "2024-01-18T09:15:00Z",
    updatedAt: "2024-01-18T09:15:00Z",
  },
];

const STORAGE_KEYS = {
  MATERIALS: "printstock_materials",
  PROJECTS: "printstock_projects",
};

export type InventoryContextValue = ReturnType<typeof useInventory>;

export function useInventory() {
  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return mockMaterials;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return mockProjects;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch {
      // ignore
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  const convertMaterialToBaseUnits = useCallback((material: Material): Material => {
    const baseQuantity = convertToBaseUnit(material.quantity, material.unit);
    const baseUnitPrice = calculateBaseUnitPrice(material.unitPrice, material.unit);
    
    return {
      ...material,
      quantity: baseQuantity,
      unit: "sheet" as Unit, // All materials are converted to sheets (base unit)
      unitPrice: baseUnitPrice,
      baseUnitPrice: baseUnitPrice,
    };
  }, []);

  const convertMaterialFromBaseUnits = useCallback((material: Material, originalUnit: Unit): Material => {
    const originalQuantity = convertFromBaseUnit(material.quantity, originalUnit);
    const originalUnitPrice = material.unitPrice * unitConversions[originalUnit].conversionFactor;
    
    return {
      ...material,
      quantity: originalQuantity,
      unit: originalUnit,
      unitPrice: originalUnitPrice,
    };
  }, []);

  const addMaterial = useCallback((data: Omit<Material, "id" | "createdAt" | "updatedAt">) => {
    // Calculate baseUnitPrice from unitPrice and unit
    const baseUnitPrice = calculateBaseUnitPrice(data.unitPrice, data.unit);
    const newMaterial: Material = {
      ...data,
      baseUnitPrice,
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
        m.id === id ? {
          ...m,
          ...data,
          // Recalculate baseUnitPrice if unitPrice or unit is updated
          baseUnitPrice: data.unitPrice !== undefined || data.unit !== undefined
            ? calculateBaseUnitPrice(
                data.unitPrice !== undefined ? data.unitPrice : m.unitPrice,
                data.unit !== undefined ? data.unit : m.unit
              )
            : m.baseUnitPrice,
          updatedAt: new Date().toISOString()
        } : m
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

  const deductMaterials = useCallback((projectMaterials: ProjectMaterial[]) => {
    setMaterials((prev) =>
      prev.map((m) => {
        const pm = projectMaterials.find((item) => item.materialId === m.id);
        if (pm) {
          // Direct subtraction in purchase unit
          const newQty = Math.max(0, m.quantity - pm.quantity);
          return { ...m, quantity: newQty, updatedAt: new Date().toISOString() };
        }
        return m;
      })
    );
  }, []);

  const restoreMaterials = useCallback((projectMaterials: ProjectMaterial[]) => {
    setMaterials((prev) =>
      prev.map((m) => {
        const pm = projectMaterials.find((item) => item.materialId === m.id);
        if (pm) {
          // Direct addition in purchase unit
          return { ...m, quantity: m.quantity + pm.quantity, updatedAt: new Date().toISOString() };
        }
        return m;
      })
    );
  }, []);

  const addProject = useCallback((data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject: Project = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Deduct stock if project is initialized in-progress or completed
    if (newProject.status === "in-progress" || newProject.status === "completed") {
      deductMaterials(newProject.materials);
    }

    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, [deductMaterials]);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects((prevProjects) => {
      const existingProject = prevProjects.find((p) => p.id === id);
      if (!existingProject) return prevProjects;

      const wasDeducted = existingProject.status === "in-progress" || existingProject.status === "completed";
      const isNowDeducted = data.status === "in-progress" || data.status === "completed";

      // If transitioning to deducted state (in-progress/completed) from non-deducted state (planning/cancelled)
      if (!wasDeducted && isNowDeducted) {
        const materialsToDeduct = data.materials || existingProject.materials;
        deductMaterials(materialsToDeduct);
      }
      // If transitioning from deducted state (in-progress/completed) to cancelled/planning
      else if (wasDeducted && (data.status === "cancelled" || data.status === "planning")) {
        restoreMaterials(existingProject.materials);
      }

      // Set completedAt when status changes to completed
      const newCompletedAt = data.status === "completed" && existingProject.status !== "completed"
        ? new Date().toISOString()
        : existingProject.completedAt;

      // Clear completedAt if status changes away from completed
      const finalCompletedAt = data.status !== "completed" ? undefined : newCompletedAt;

      return prevProjects.map((p) =>
        p.id === id ? { ...p, ...data, completedAt: finalCompletedAt, updatedAt: new Date().toISOString() } : p
      );
    });
  }, [deductMaterials, restoreMaterials]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProjectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const calculateProjectCost = useCallback(
    (
      projectMaterials: ProjectMaterial[],
      laborCost: number,
      markup: number,
      overheadCost: number = 0,
      wasteBuffer: number = 0
    ) => {
      const materialCost = projectMaterials.reduce(
        (sum, pm) => sum + pm.totalCost,
        0
      );

      // Separate ink materials to apply waste buffer
      const inkMaterials = projectMaterials.filter((pm) =>
        pm.materialName.toLowerCase().includes("ink")
      );
      const inkCost = inkMaterials.reduce((sum, pm) => sum + pm.totalCost, 0);
      const nonInkCost = materialCost - inkCost;
      const adjustedInkCost = inkCost * (1 + wasteBuffer / 100);
      const adjustedMaterialCost = nonInkCost + adjustedInkCost;

      const subtotal = adjustedMaterialCost + laborCost + overheadCost;
      const markupAmount = subtotal * (markup / 100);
      const total = subtotal + markupAmount;

      return {
        materialCost: adjustedMaterialCost,
        laborCost,
        overheadCost,
        subtotal,
        markupAmount,
        total,
        inkCost,
        wasteBufferAdjustment: adjustedInkCost - inkCost,
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