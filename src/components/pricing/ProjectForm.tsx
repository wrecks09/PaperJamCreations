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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Project,
  ProjectMaterial,
  Material,
  unitConversions,
  Unit,
  CoverageLevel,
  coverageLevels,
} from "@/types/inventory";
import { calculateInkVolume } from "@/hooks/useInventory";

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
  const [status, setStatus] = useState<Project["status"]>("planning");
  const [laborCost, setLaborCost] = useState(0);
  const [markup, setMarkup] = useState(50);
  const [overheadCost, setOverheadCost] = useState(0);
  const [wasteBuffer, setWasteBuffer] = useState(15);
  const [pageCount, setPageCount] = useState(0);
  const [coverageLevel, setCoverageLevel] = useState<CoverageLevel>("medium");
  // Customer fields for quotation
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  // Use a map for quantity tracking: materialId -> quantity
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Initialize form with existing project data
  useEffect(() => {
    if (open) {
      if (initialData) {
        setProjectName(initialData.name || "");
        setDescription(initialData.description || "");
        setStatus(initialData.status);
        setLaborCost(initialData.laborCost || 0);
        setMarkup(initialData.markup || 50);
        setOverheadCost(initialData.overheadCost || 0);
        setWasteBuffer(initialData.wasteBuffer ?? 15);
        setPageCount(initialData.pageCount || 0);
        setCoverageLevel(initialData.coverageLevel || "medium");
        // Customer fields for quotation
        setCustomerName(initialData.customerName || "");
        setCustomerEmail(initialData.customerEmail || "");
        setCustomerPhone(initialData.customerPhone || "");
        setCustomerAddress(initialData.customerAddress || "");
        // Convert ProjectMaterial quantities to form values (both are in purchase units)
        const quantitiesMap: Record<string, number> = {};
        initialData.materials.forEach((pm) => {
          // Find the material to validate it exists
          const material = materials.find((m) => m.id === pm.materialId);
          if (material) {
            // Quantity is already in purchase units, use directly
            quantitiesMap[material.id] = pm.quantity;
          }
        });
        setQuantities(quantitiesMap);
      } else {
        setProjectName("");
        setDescription("");
        setStatus("planning");
        setLaborCost(0);
        setMarkup(50);
        setOverheadCost(0);
        setWasteBuffer(15);
        setPageCount(0);
        setCoverageLevel("medium");
        // Customer fields for quotation
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCustomerAddress("");
        setQuantities({});
      }
    }
  }, [open, initialData, materials]);

  // Build selected materials from quantities map
  const getSelectedMaterials = useCallback((): ProjectMaterial[] => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([materialId, qty]) => {
        const material = materials.find((m) => m.id === materialId);
        if (!material) return null;
        
        // Use a safe calculation that handles potential missing/invalid unit conversion data
        const unit = material.unit in unitConversions ? (material.unit as Unit) : "sheet";
        const conversion = unitConversions[unit];
        const conversionFactor = conversion?.conversionFactor ?? 1;

        // Ensure we have valid numbers
        const safeUnitPrice = typeof material.unitPrice === 'number' && isFinite(material.unitPrice) ? material.unitPrice : 0;
        const safeBaseUnitPrice = typeof material.baseUnitPrice === 'number' && isFinite(material.baseUnitPrice) ? material.baseUnitPrice : (safeUnitPrice / (conversionFactor || 1));
        
        const baseQuantity = qty * (conversionFactor || 1);

        return {
          materialId,
          materialName: material.name,
          quantity: qty,
          unitPrice: safeUnitPrice,
          totalCost: baseQuantity * safeBaseUnitPrice,
        };
      })
      .filter((item): item is ProjectMaterial => item !== null);
  }, [quantities, materials]);

  const handleQuantityChange = (materialId: string, value: string) => {
    // Handle empty string and invalid numbers
    const parsedValue = parseFloat(value);
    const qty = value === "" || isNaN(parsedValue) ? 0 : parsedValue;
    
    // Validate quantity to prevent negative or invalid values
    const validQty = qty >= 0 && isFinite(qty) ? qty : 0;
    
    setQuantities((prev) => {
      if (validQty <= 0) {
        const next = { ...prev };
        delete next[materialId];
        return next;
      }
      return { ...prev, [materialId]: validQty };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: projectName,
      description,
      status,
      materials: getSelectedMaterials(),
      laborCost,
      markup,
      overheadCost,
      wasteBuffer,
      pageCount,
      coverageLevel,
      // Customer fields for quotation
      customerName: customerName || undefined,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      customerAddress: customerAddress || undefined,
    });
    setProjectName("");
    setDescription("");
    setStatus("planning");
    setLaborCost(0);
    setMarkup(50);
    setOverheadCost(0);
    setWasteBuffer(15);
    setPageCount(0);
    setCoverageLevel("medium");
    // Customer fields for quotation
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setQuantities({});
    onOpenChange(false);
  };

  const selectedMaterials = getSelectedMaterials();
  const materialCost = selectedMaterials.reduce((sum, pm) => sum + pm.totalCost, 0);

  // Separate ink materials to apply waste buffer
  const inkMaterials = selectedMaterials.filter((pm) =>
    pm.materialName.toLowerCase().includes("ink")
  );
  const inkCost = inkMaterials.reduce((sum, pm) => sum + pm.totalCost, 0);
  const nonInkCost = materialCost - inkCost;
  const adjustedInkCost = inkCost * (1 + wasteBuffer / 100);
  const wasteBufferAdjustment = adjustedInkCost - inkCost;
  const adjustedMaterialCost = nonInkCost + adjustedInkCost;

  const subtotal = adjustedMaterialCost + laborCost + overheadCost;
  const markupAmount = subtotal * (markup / 100);
  const total = subtotal + markupAmount;

  // Calculate estimated ink volume based on page count and coverage
  const estimatedInkVolume =
    pageCount > 0 ? calculateInkVolume(pageCount, coverageLevel, wasteBuffer) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Project" : "New Project Pricing"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="status">Status *</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as Project["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="markup">Markup (%)</Label>
              <Input
                id="markup"
                type="number"
                min="0"
                value={markup}
                onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
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

          <div className="border-t border-border pt-4">
            <h4 className="font-medium mb-3">Customer Information (for Quotation)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g., jane@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g., +63 9XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Input
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g., 123 Business Ave, Manila"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Labor Cost (₱)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={laborCost}
                onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overheadCost">Overhead Cost (₱)</Label>
              <Input
                id="overheadCost"
                type="number"
                min="0"
                step="0.01"
                value={overheadCost}
                onChange={(e) => setOverheadCost(parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pageCount">Page Count</Label>
              <Input
                id="pageCount"
                type="number"
                min="0"
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverageLevel">Ink Coverage</Label>
              <Select
                value={coverageLevel}
                onValueChange={(val) => setCoverageLevel(val as CoverageLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(coverageLevels).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wasteBuffer">Waste Buffer (%)</Label>
              <Input
                id="wasteBuffer"
                type="number"
                min="0"
                max="100"
                value={wasteBuffer}
                onChange={(e) => setWasteBuffer(parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>

          {pageCount > 0 && (
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <span className="font-medium">Estimated Ink Volume:</span>{" "}
                {estimatedInkVolume.toFixed(2)} mL for {pageCount} pages at{" "}
                {coverageLevels[coverageLevel].percentage}% coverage
                {wasteBuffer > 0 && (
                  <span> (includes {wasteBuffer}% waste buffer)</span>
                )}
              </p>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <h4 className="font-medium mb-3">Materials for this Project</h4>
            <div className="space-y-3">
              {materials.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No materials in inventory. Add materials first in the Inventory tab.
                </p>
              ) : (
                materials.map((material) => {
                  const unit = material.unit in unitConversions ? (material.unit as Unit) : "sheet";
                  const conversion = unitConversions[unit] || { baseUnit: "sheet", conversionFactor: 1 };
                  const baseUnit = conversion.baseUnit;
                  const baseQuantity = material.quantity * conversion.conversionFactor;
                  const baseUnitPrice = material.unitPrice / conversion.conversionFactor;

                  return (
                    <div key={material.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{material.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {baseUnit} @ ₱{baseUnitPrice.toFixed(4)}
                          {conversion.conversionFactor !== 1 && (
                            <span> | {material.unit} @ ₱{material.unitPrice.toFixed(2)}</span>
                          )}
                          | Available: {material.quantity}
                          {conversion.conversionFactor > 1 && (
                            <span> ({baseQuantity.toFixed(2)} {baseUnit})</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="Qty"
                          className="w-20"
                          value={quantities[material.id] ?? 0}
                          onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedMaterials.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">Cost Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Materials:</span>
                  <span>₱{materialCost.toFixed(2)}</span>
                </div>
                {inkCost > 0 && (
                  <div className="flex justify-between text-muted-foreground pl-4">
                    <span>Ink subtotal:</span>
                    <span>₱{inkCost.toFixed(2)}</span>
                  </div>
                )}
                {wasteBuffer > 0 && inkCost > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 pl-4">
                    <span>Waste buffer ({wasteBuffer}%):</span>
                    <span>+₱{wasteBufferAdjustment.toFixed(2)}</span>
                  </div>
                )}
                {wasteBuffer > 0 && inkCost > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Adjusted Materials:</span>
                    <span>₱{adjustedMaterialCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Labor:</span>
                  <span>₱{laborCost.toFixed(2)}</span>
                </div>
                {overheadCost > 0 && (
                  <div className="flex justify-between">
                    <span>Overhead:</span>
                    <span>₱{overheadCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Subtotal:</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Markup ({markup}%):</span>
                  <span>₱{markupAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total Price:</span>
                  <span>₱{total.toFixed(2)}</span>
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