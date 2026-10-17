import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { ProjectForm } from "@/components/pricing/ProjectForm";
import { ProjectsTable } from "@/components/pricing/ProjectsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

export default function Pricing() {
  const { projects, materials, addProject, updateProject, deleteProject, calculateProjectCost } = useInventory();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const editingData = editingProject
    ? projects.find((p) => p.id === editingProject) || null
    : null;

  const handleSubmit = (data: Parameters<typeof addProject>[0]) => {
    if (editingProject) {
      updateProject(editingProject, data);
      setEditingProject(null);
    } else {
      addProject(data);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Project Pricing</h1>
            <p className="text-muted-foreground">Calculate project costs and pricing</p>
          </div>
          <Button
            onClick={() => {
              setEditingProject(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <ProjectsTable
          projects={projects}
          onEdit={(project) => {
            setEditingProject(project.id);
            setFormOpen(true);
          }}
          onDelete={deleteProject}
          calculateProjectCost={calculateProjectCost}
        />

        <ProjectForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleSubmit}
          materials={materials}
          initialData={editingData}
        />
      </div>
    </Layout>
  );
}