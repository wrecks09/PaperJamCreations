import { useState, useMemo } from "react";
import { useInventoryContext } from "@/hooks/useInventoryContext";
import { ProjectForm } from "@/components/pricing/ProjectForm";
import { ProjectsTable } from "@/components/pricing/ProjectsTable";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusConfig = {
  planning: { label: "Planning", variant: "secondary" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
};

export default function Projects() {
  const {
    projects,
    materials,
    addProject,
    updateProject,
    deleteProject,
    calculateProjectCost,
  } = useInventoryContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "updatedAt" | "status">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    setFormOpen(false);
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        if (statusFilter !== "all" && project.status !== statusFilter) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (!project.name.toLowerCase().includes(query)) return false;
          if (project.description?.toLowerCase().includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let aVal: any = a[sortBy];
        let bVal: any = b[sortBy];
        if (sortBy === "createdAt" || sortBy === "updatedAt") {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [projects, searchQuery, statusFilter, sortBy, sortOrder]);

  // Summary stats
  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === "in-progress").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const cancelled = projects.filter((p) => p.status === "cancelled").length;
    const planning = projects.filter((p) => p.status === "planning").length;

    // Calculate total revenue from completed projects
    const totalRevenue = projects
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => {
        const costs = calculateProjectCost(
          p.materials,
          p.laborCost,
          p.markup,
          p.overheadCost || 0,
          p.wasteBuffer || 0
        );
        return sum + costs.total;
      }, 0);

    return { total, inProgress, completed, cancelled, planning, totalRevenue };
  }, [projects, calculateProjectCost]);

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage and track all your print projects</p>
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

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.planning}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => setStatusFilter(val as typeof statusFilter)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(val) => {
                    const [by, order] = val.split("-");
                    setSortBy(by as typeof sortBy);
                    setSortOrder(order as typeof sortOrder);
                  }}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
                    <SelectItem value="updatedAt-asc">Oldest Updated</SelectItem>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="status-asc">Status A-Z</SelectItem>
                    <SelectItem value="status-desc">Status Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredProjects.length} of {projects.length} projects
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <ProjectsTable
          projects={filteredProjects}
          onEdit={(project) => {
            setEditingProject(project.id);
            setFormOpen(true);
          }}
          onDelete={deleteProject}
          calculateProjectCost={calculateProjectCost}
        />

        {/* Project Form Dialog */}
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