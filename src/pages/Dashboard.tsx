import { useInventory } from "@/hooks/useInventory";
import { StatCard } from "@/components/inventory/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, FolderKanban, DollarSign } from "lucide-react";
import { categoryColors, categoryLabels } from "@/types/inventory";

export default function Dashboard() {
  const { materials, projects } = useInventory();

  const totalMaterials = materials.length;
  const totalInventoryValue = materials.reduce(
    (sum, m) => sum + m.quantity * m.unitPrice,
    0
  );
  const lowStockItems = materials.filter(
    (m) => m.quantity <= m.lowStockThreshold
  ).length;
  const activeProjects = projects.filter((p) => p.status !== "completed").length;

  const categoryCounts = materials.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentMaterials = [...materials]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your printing inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Materials"
          value={totalMaterials}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          title="Inventory Value"
          value={`$${totalInventoryValue.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockItems}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={
            lowStockItems > 0
              ? { value: "Needs attention", positive: false }
              : undefined
          }
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={<FolderKanban className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Materials by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        categoryColors[category as keyof typeof categoryColors]
                      }
                      variant="secondary"
                    >
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(categoryCounts).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No materials added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Recently Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{material.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {material.quantity} {material.unit}
                    </p>
                  </div>
                  <Badge
                    className={
                      categoryColors[material.category]
                    }
                    variant="secondary"
                  >
                    {categoryLabels[material.category]}
                  </Badge>
                </div>
              ))}
              {recentMaterials.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No materials added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}