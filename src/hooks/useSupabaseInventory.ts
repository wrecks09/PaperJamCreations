import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { Material, Project, ProjectMaterial, Unit, CoverageLevel, MaterialCategory } from "@/types/inventory";
import {
  calculateInkVolume,
  convertToBaseUnit,
  convertFromBaseUnit,
  calculateBaseUnitPrice,
  coverageLevels,
  unitConversions,
} from "@/hooks/useInventory";

// Type aliases for Supabase types
type SupabaseMaterial = Database["public"]["Tables"]["materials"]["Row"];
type SupabaseProject = Database["public"]["Tables"]["projects"]["Row"];

// Transform Supabase material to app Material
const transformMaterial = (m: SupabaseMaterial): Material => ({
  id: m.id,
  name: m.name,
  category: m.category as MaterialCategory,
  sku: m.sku || undefined,
  unit: m.unit as Unit,
  quantity: Number(m.quantity),
  unitPrice: Number(m.unit_price),
  baseUnitPrice: Number(m.base_unit_price),
  lowStockThreshold: Number(m.low_stock_threshold),
  supplier: m.supplier || undefined,
  description: m.description || undefined,
  createdAt: m.created_at,
  updatedAt: m.updated_at,
});

// Transform app Material to Supabase insert
const materialToInsert = (data: Omit<Material, "id" | "createdAt" | "updatedAt">) => ({
  name: data.name,
  category: data.category,
  sku: data.sku || null,
  unit: data.unit,
  quantity: data.quantity,
  unit_price: data.unitPrice,
  base_unit_price: calculateBaseUnitPrice(data.unitPrice, data.unit),
  low_stock_threshold: data.lowStockThreshold,
  supplier: data.supplier || null,
  description: data.description || null,
});

// Transform Supabase project to app Project
const transformProject = (p: SupabaseProject): Project => ({
  id: p.id,
  name: p.name,
  description: p.description || undefined,
  status: p.status as Project["status"],
  materials: p.materials as ProjectMaterial[],
  laborCost: Number(p.labor_cost),
  markup: Number(p.markup),
  overheadCost: Number(p.overhead_cost),
  wasteBuffer: Number(p.waste_buffer),
  pageCount: p.page_count,
  coverageLevel: p.coverage_level as CoverageLevel,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  completedAt: p.completed_at || undefined,
  // Customer fields for quotation
  customerName: p.customer_name || undefined,
  customerEmail: p.customer_email || undefined,
  customerPhone: p.customer_phone || undefined,
  customerAddress: p.customer_address || undefined,
  quotationNumber: p.quotation_number || undefined,
});

// Transform app Project to Supabase insert
const projectToInsert = (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "completedAt">) => ({
  name: data.name,
  description: data.description || null,
  status: data.status,
  materials: data.materials as any,
  labor_cost: data.laborCost,
  markup: data.markup,
  overhead_cost: data.overheadCost,
  waste_buffer: data.wasteBuffer,
  page_count: data.pageCount,
  coverage_level: data.coverageLevel,
  // Customer fields for quotation
  customer_name: data.customerName || null,
  customer_email: data.customerEmail || null,
  customer_phone: data.customerPhone || null,
  customer_address: data.customerAddress || null,
  quotation_number: data.quotationNumber || null,
});

export type InventoryContextValue = ReturnType<typeof useSupabaseInventory>;

export function useSupabaseInventory() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all materials
  const fetchMaterials = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaterials(data.map(transformMaterial));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch materials");
    }
  }, []);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data.map(transformProject));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMaterials(), fetchProjects()]);
      setLoading(false);
    };
    loadData();

    // Subscribe to realtime changes
    const materialsChannel = supabase
      .channel("materials-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "materials" },
        () => fetchMaterials()
      )
      .subscribe();

    const projectsChannel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(materialsChannel);
      supabase.removeChannel(projectsChannel);
    };
  }, [fetchMaterials, fetchProjects]);

  const addMaterial = useCallback(async (data: Omit<Material, "id" | "createdAt" | "updatedAt">) => {
    const insertData = materialToInsert(data);
    const { data: newMaterial, error } = await supabase
      .from("materials")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return transformMaterial(newMaterial);
  }, []);

  const updateMaterial = useCallback(async (id: string, data: Partial<Material>) => {
    const updateData: any = { ...data };
    if (data.unitPrice !== undefined || data.unit !== undefined) {
      const unit = data.unit || materials.find(m => m.id === id)?.unit;
      const unitPrice = data.unitPrice !== undefined ? data.unitPrice : materials.find(m => m.id === id)?.unitPrice;
      if (unit && unitPrice !== undefined) {
        updateData.base_unit_price = calculateBaseUnitPrice(unitPrice, unit);
      }
    }
    if (data.unitPrice !== undefined) updateData.unit_price = data.unitPrice;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.lowStockThreshold !== undefined) updateData.low_stock_threshold = data.lowStockThreshold;

    const { error } = await supabase.from("materials").update(updateData).eq("id", id);
    if (error) throw error;
  }, [materials]);

  const deleteMaterial = useCallback(async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) throw error;
  }, []);

  const getMaterialById = useCallback(
    (id: string) => materials.find((m) => m.id === id),
    [materials]
  );

  const addProject = useCallback(async (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "completedAt">) => {
    const insertData = projectToInsert(data);
    const { data: newProject, error } = await supabase
      .from("projects")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Deduct stock if project is initialized in-progress or completed
    if (newProject.status === "in-progress" || newProject.status === "completed") {
      await deductMaterials(newProject.materials);
    }

    return transformProject(newProject);
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    // Get existing project first
    const existingProject = projects.find((p) => p.id === id);
    if (!existingProject) throw new Error("Project not found");

    const wasDeducted = existingProject.status === "in-progress" || existingProject.status === "completed";
    const isNowDeducted = (data.status ?? existingProject.status) === "in-progress" || (data.status ?? existingProject.status) === "completed";

    // Handle stock deduction/restoration
    if (!wasDeducted && isNowDeducted) {
      const materialsToDeduct = data.materials || existingProject.materials;
      await deductMaterials(materialsToDeduct);
    } else if (wasDeducted && ((data.status === "cancelled") || (data.status === "planning"))) {
      await restoreMaterials(existingProject.materials);
    }

    // Transform camelCase to snake_case for Supabase
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.materials !== undefined) updateData.materials = data.materials;
    if (data.laborCost !== undefined) updateData.labor_cost = data.laborCost;
    if (data.markup !== undefined) updateData.markup = data.markup;
    if (data.overheadCost !== undefined) updateData.overhead_cost = data.overheadCost;
    if (data.wasteBuffer !== undefined) updateData.waste_buffer = data.wasteBuffer;
    if (data.pageCount !== undefined) updateData.page_count = data.pageCount;
    if (data.coverageLevel !== undefined) updateData.coverage_level = data.coverageLevel;
    // Customer fields for quotation
    if (data.customerName !== undefined) updateData.customer_name = data.customerName || null;
    if (data.customerEmail !== undefined) updateData.customer_email = data.customerEmail || null;
    if (data.customerPhone !== undefined) updateData.customer_phone = data.customerPhone || null;
    if (data.customerAddress !== undefined) updateData.customer_address = data.customerAddress || null;
    if (data.quotationNumber !== undefined) updateData.quotation_number = data.quotationNumber || null;

    if (data.status === "completed" && existingProject.status !== "completed") {
      updateData.completed_at = new Date().toISOString();
    } else if (data.status !== "completed" && data.status !== undefined) {
      updateData.completed_at = null;
    }

    const { error } = await supabase.from("projects").update(updateData).eq("id", id);
    if (error) throw error;
  }, [projects]);

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  }, []);

  const getProjectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  // Deduct materials when project moves to in-progress/completed
  const deductMaterials = useCallback(async (projectMaterials: ProjectMaterial[]) => {
    for (const pm of projectMaterials) {
      const material = materials.find((m) => m.id === pm.materialId);
      if (material) {
        const newQty = Math.max(0, material.quantity - pm.quantity);
        await supabase.from("materials").update({ quantity: newQty }).eq("id", pm.materialId);
      }
    }
  }, [materials]);

  // Restore materials when project moves back to planning/cancelled
  const restoreMaterials = useCallback(async (projectMaterials: ProjectMaterial[]) => {
    for (const pm of projectMaterials) {
      const material = materials.find((m) => m.id === pm.materialId);
      if (material) {
        const newQty = material.quantity + pm.quantity;
        await supabase.from("materials").update({ quantity: newQty }).eq("id", pm.materialId);
      }
    }
  }, [materials]);

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
    loading,
    error,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialById,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    calculateProjectCost,
    refetch: () => Promise.all([fetchMaterials(), fetchProjects()]),
  };
}