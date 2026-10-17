import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Material, MaterialCategory, categoryLabels } from "@/types/inventory";

interface MaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Material, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Material | null;
}

export function MaterialForm({ open, onOpenChange, onSubmit, initialData }: MaterialFormProps) {
  const [formData, setFormData] = useState<Omit<Material, "id" | "createdAt" | "updatedAt">>(
    initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          sku: initialData.sku,
          unit: initialData.unit,
          quantity: initialData.quantity,
          unitPrice: initialData.unitPrice,
          lowStockThreshold: initialData.lowStockThreshold,
          supplier: initialData.supplier,
          description: initialData.description,
        }
      : {
          name: "",
          category: "paper",
          sku: "",
          unit: "",
          quantity: 0,
          unitPrice: 0,
          lowStockThreshold: 5,
          supplier: "",
          description: "",
        }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const updateField = <K extends keyof Omit<Material, "id" | "createdAt" | "updatedAt">>(
    field: K,
    value: Omit<Material, "id" | "createdAt" | "updatedAt">[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Material" : "Add New Material"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Material Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Gloss Paper 130gsm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField("category", value as MaterialCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="Optional SKU code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measure *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => updateField("unit", e.target.value)}
                placeholder="e.g., ream, bottle, sheet"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => updateField("quantity", parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price ($) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => updateField("unitPrice", parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => updateField("lowStockThreshold", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => updateField("supplier", e.target.value)}
              placeholder="Supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Save Changes" : "Add Material"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}