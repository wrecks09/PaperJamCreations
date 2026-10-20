import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Material, categoryColors, categoryLabels, unitConversions, Unit } from "@/types/inventory";

interface MaterialsTableProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}

export function MaterialsTable({ materials, onEdit, onDelete }: MaterialsTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sku?.toLowerCase().includes(search.toLowerCase()) ||
      m.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => `₱${amount.toFixed(2)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Categories</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No materials found. Add your first material to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((material) => {
                  const conversion = unitConversions[material.unit];
                  const baseUnit = conversion.baseUnit;
                  const baseQuantity = material.quantity * conversion.conversionFactor;
                  const baseUnitPrice = material.unitPrice / conversion.conversionFactor;

                  return (
                    <TableRow key={material.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{material.name}</p>
                          {material.description && (
                            <p className="text-xs text-muted-foreground">{material.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[material.category]} variant="secondary">
                          {categoryLabels[material.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {material.sku || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {material.quantity <= material.lowStockThreshold && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />
                          )}
                          <span
                            className={
                              material.quantity <= material.lowStockThreshold
                                ? "text-amber-600 font-medium"
                                : ""
                            }
                          >
                            {material.quantity} {material.unit}
                          </span>
                          {conversion.conversionFactor > 1 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({baseQuantity.toFixed(2)} {baseUnit})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(material.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(material.quantity * material.unitPrice)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {material.supplier || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(material)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(material.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}