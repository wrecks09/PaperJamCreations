import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Project, ProjectMaterial } from "@/types/inventory";
import { Material } from "@/types/inventory";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  materials: Material[];
  initialData?: Project | null;
}

export function ProjectForm({ open, onOpenChange, onSubmit, materials, initialData }: ProjectFormProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [laborCost, setLaborCost] = useState(0);
  const [markup, setMarkup] = useState(50);
  // Use a map for quantity tracking: materialId -> quantity
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setProjectName(initialData.name);
        setDescription(initialData.description || "");
        setLaborCost(initialData.laborCost);
        setMarkup(initialData.markup);
        const qtyMap: Record<string, number> = {};
        initialData.materials.forEach((pm) => {
          qtyMap[pm.materialId] = pm.quantity;
        });
        setQuantities(qtyMap);
      } else {
        setProjectName("");
        setDescription("");
        setLaborCost(0);
        setMarkup(50);
        setQuantities({});
      }
    }
  }, [open, initialData]);

  // Build selected materials from quantities map
  const getSelectedMaterials = useCallback((): ProjectMaterial[] => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([materialId, qty]) => {
        const material = materials.find((m) => m.id === materialId);
        return {
          materialId,
          materialName: material?.name || "Unknown",
          quantity: qty,
          unitPrice: material?.unitPrice || 0,
          totalCost: qty * (material?.unitPrice || 0),
        };
      });
  }, [quantities, materials]);

  const handleQuantityChange = (materialId: string, value: string) => {
    const qty = parseInt(value) || 0;
    setQuantities((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[materialId];
        return next;
      }
      return { ...prev, [materialId]: qty };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: projectName,
      description,
      status: "planning",
      materials: getSelectedMaterials(),
      laborCost,
      markup,
    });
    setProjectName("");
    setDescription("");
    setLaborCost(0);
    setMarkup(50);
    setQuantities({});
    onOpenChange(false);
  };

  const selectedMaterials = getSelectedMaterials();
  const materialCost = selectedMaterials.reduce((sum, pm) => sum + pm.totalCost, 0);
  const subtotal = materialCost + laborCost;
  const markupAmount = subtotal * (markup / 100);
  const total = subtotal + markupAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Project" : "New Project Pricing"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Business Cards for Acme Corp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="markup">Markup (%)</Label>
              <Input
                id="markup"
                type="number"
                min="0"
                value={markup}
                onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project details..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Labor Cost ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={laborCost}
              onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-medium mb-3">Materials for this Project</h4>
            <div className="space-y-3">
              {materials.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No materials in inventory. Add materials first in the Inventory tab.
                </p>
              ) : (
                materials.map((material) => (
                  <div key={material.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{material.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {material.unit} @ ${material.unitPrice.toFixed(2)} | Available: {material.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Qty"
                        className="w-20"
                        value={quantities[material.id] || ""}
                        onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedMaterials.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">Cost Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Materials:</span>
                  <span>${materialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor:</span>
                  <span>${laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Markup ({markup}%):</span>
                  <span>${markupAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total Price:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}