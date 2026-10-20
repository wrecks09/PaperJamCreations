import { useState } from "react";
import { useInventoryContext } from "@/hooks/useInventoryContext";
import { MaterialForm } from "@/components/inventory/MaterialForm";
import { MaterialsTable } from "@/components/inventory/MaterialsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

export default function Inventory() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useInventoryContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);

  const editingData = editingMaterial
    ? materials.find((m) => m.id === editingMaterial) || null
    : null;

  const handleSubmit = (data: Parameters<typeof addMaterial>[0]) => {
    if (editingMaterial) {
      updateMaterial(editingMaterial, data);
      setEditingMaterial(null);
    } else {
      addMaterial(data);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventory</h1>
            <p className="text-muted-foreground">Manage your printing materials</p>
          </div>
          <Button
            onClick={() => {
              setEditingMaterial(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>

        <MaterialsTable
          materials={materials}
          onEdit={(material) => {
            setEditingMaterial(material.id);
            setFormOpen(true);
          }}
          onDelete={deleteMaterial}
        />

        <MaterialForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleSubmit}
          initialData={editingData}
        />
      </div>
    </Layout>
  );
}