import { useState, useEffect } from "react";
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
import { Material, MaterialCategory, Unit, categoryLabels, unitConversions } from "@/types/inventory";

interface MaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Material, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Material | null;
}

const emptyForm: Omit<Material, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  category: "paper",
  sku: "",
  unit: "sheet",
  quantity: 0,
  unitPrice: 0,
  lowStockThreshold: 5,
  supplier: "",
  description: "",
};

export function MaterialForm({ open, onOpenChange, onSubmit, initialData }: MaterialFormProps) {
  const [formData, setFormData] = useState<Omit<Material, "id" | "createdAt" | "updatedAt">>(emptyForm);

  // Calculate base unit conversion for display
  const [baseUnit, setBaseUnit] = useState<Unit>("sheet");
  const [conversionFactor, setConversionFactor] = useState<number>(1);
  const [baseUnitQuantity, setBaseUnitQuantity] = useState<number>(0);

  useEffect(() => {
    try {
      // Safely access unitConversions
      if (formData.unit && unitConversions && typeof unitConversions === 'object') {
        // Check if the unit exists in our conversions map
        if (unitConversions.hasOwnProperty(formData.unit)) {
          const conversion = unitConversions[formData.unit as Unit];
          setBaseUnit(conversion.baseUnit);
          setConversionFactor(conversion.conversionFactor);
          
          // Safely parse quantity
          const quantityValue = typeof formData.quantity === 'number' && !isNaN(formData.quantity)
            ? formData.quantity
            : 0;
            
          setBaseUnitQuantity(quantityValue * conversion.conversionFactor);
        } else {
          // Unit not found in conversions
          setBaseUnit("sheet");
          setConversionFactor(1);
          const quantityValue = typeof formData.quantity === 'number' && !isNaN(formData.quantity)
            ? formData.quantity
            : 0;
          setBaseUnitQuantity(quantityValue);
        }
      } else {
        // Fallback if unitConversions is not available
        setBaseUnit("sheet");
        setConversionFactor(1);
        const quantityValue = typeof formData.quantity === 'number' && !isNaN(formData.quantity)
          ? formData.quantity
          : 0;
        setBaseUnitQuantity(quantityValue);
      }
    } catch (error) {
      // Error fallback - prevents blank page
      console.error('Error in MaterialForm useEffect:', error);
      setBaseUnit("sheet");
      setConversionFactor(1);
      const quantityValue = typeof formData.quantity === 'number' && !isNaN(formData.quantity)
        ? formData.quantity
        : 0;
      setBaseUnitQuantity(quantityValue);
    }
  }, [formData.unit, formData.quantity, unitConversions]);

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        try {
          setFormData({
            name: initialData.name ?? "",
            category: initialData.category ?? "paper",
            sku: initialData.sku ?? "",
            unit: initialData.unit ?? "sheet",
            quantity: typeof initialData.quantity === 'number' ? initialData.quantity : 0,
            unitPrice: typeof initialData.unitPrice === 'number' ? initialData.unitPrice : 0,
            lowStockThreshold: typeof initialData.lowStockThreshold === 'number' ? initialData.lowStockThreshold : 5,
            supplier: initialData.supplier ?? "",
            description: initialData.description ?? "",
          });
        } catch (error) {
          console.error('Error setting initial data:', error);
          setFormData(emptyForm);
        }
      } else {
        setFormData(emptyForm);
      }
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    setFormData(emptyForm);
    onOpenChange(false);
  };

  const updateField = <K extends keyof Omit<Material, "id" | "createdAt" | "updatedAt">>(
    field: K,
    value: Omit<Material, "id" | "createdAt" | "updatedAt">[K]
  ) => {
    try {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error('Error updating field:', error);
    }
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
                value={formData.name ?? ''}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Gloss Paper 130gsm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category ?? 'paper'}
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
                value={formData.sku ?? ''}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="Optional SKU code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measure *</Label>
              <Select
                value={formData.unit ?? 'sheet'}
                onValueChange={(value) => updateField("unit", value as Unit)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sheet">Sheet</SelectItem>
                  <SelectItem value="ream">Ream (500 sheets)</SelectItem>
                  <SelectItem value="bottle">Bottle</SelectItem>
                  <SelectItem value="roll">Roll</SelectItem>
                  <SelectItem value="packet">Packet</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="meter">Meter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity ?? 0}
                onChange={(e) => {
                  const value = e.target.value;
                  let parsed = parseInt(value);
                  if (isNaN(parsed)) {
                    parsed = 0;
                  }
                  updateField("quantity", parsed);
                }}
                required
              />
              {/* Safely display conversion */}
              {(conversionFactor ?? 1) > 1 && (
                <p className="text-xs text-muted-foreground">
                  = {(baseUnitQuantity ?? 0).toFixed(2)} {(baseUnit ?? 'sheet')}s
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (₱) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice ?? 0}
                onChange={(e) => {
                  const value = e.target.value;
                  let parsed = parseFloat(value);
                  if (isNaN(parsed)) {
                    parsed = 0;
                  }
                  updateField("unitPrice", parsed);
                }}
                required
              />
              {/* Safely display price per base unit */}
              {(conversionFactor ?? 1) !== 1 && (
                <p className="text-xs text-muted-foreground">
                  ₱{((formData.unitPrice ?? 0) / (conversionFactor ?? 1)).toFixed(4)} per {(baseUnit ?? 'sheet')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold ?? 5}
                onChange={(e) => {
                  const value = e.target.value;
                  let parsed = parseInt(value);
                  if (isNaN(parsed)) {
                    parsed = 0;
                  }
                  updateField("lowStockThreshold", parsed);
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier ?? ''}
              onChange={(e) => updateField("supplier", e.target.value)}
              placeholder="Supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description ?? ''}
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