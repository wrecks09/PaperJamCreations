import { Project } from "@/types/inventory";
import { useInventoryContext } from "@/hooks/useInventoryContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2, Calendar, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { unitConversions, Unit } from "@/types/inventory";
import { format } from "date-fns";
import { useQuotationPDF } from "@/hooks/useQuotationPDF";

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  calculateProjectCost: (
    materials: Project["materials"],
    laborCost: number,
    markup: number,
    overheadCost?: number,
    wasteBuffer?: number
  ) => {
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    subtotal: number;
    markupAmount: number;
    total: number;
    inkCost: number;
    wasteBufferAdjustment: number;
  };
}

const statusConfig = {
  planning: { label: "Planning", variant: "secondary" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
};

export function ProjectsTable({ projects, onEdit, onDelete, calculateProjectCost }: ProjectsTableProps) {
  const formatCurrency = (amount: number) => `₱${amount.toFixed(2)}`;
  const { updateProject } = useInventoryContext();
  const { downloadQuotation, isGenerating } = useQuotationPDF();

  // Get company settings from localStorage
  const getCompanySettings = () => {
    const saved = localStorage.getItem("companySettings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse company settings", e);
      }
    }
    return {
      name: "Paper Jam Creations",
      address: "",
      phone: "",
      email: "",
      website: "",
      defaultMarkup: 50,
    };
  };

  const handleGenerateQuotation = (project: Project) => {
    const companySettings = getCompanySettings();
    downloadQuotation(project, {
      name: companySettings.name,
      address: companySettings.address,
      phone: companySettings.phone,
      email: companySettings.email,
      website: companySettings.website,
    });
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead className="text-right">Material Cost</TableHead>
              <TableHead className="text-right">Labor / Overhead</TableHead>
              <TableHead className="text-right">Total Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No projects yet. Create your first project pricing.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => {
                const costs = calculateProjectCost(
                  project.materials,
                  project.laborCost,
                  project.markup,
                  project.overheadCost || 0,
                  project.wasteBuffer || 0
                );
                return (
                  <TableRow key={project.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground">{project.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[project.status].variant}>
                        {statusConfig[project.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(project.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.completedAt ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(project.completedAt), "MMM d, yyyy")}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {project.materials.length} item(s)
                        {project.pageCount ? ` (${project.pageCount} pgs)` : ""}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(costs.materialCost)}
                      {project.wasteBuffer && project.wasteBuffer > 0 ? (
                        <p className="text-[10px] text-muted-foreground">inc. {project.wasteBuffer}% waste</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>{formatCurrency(costs.laborCost)} (Labor)</div>
                      {costs.overheadCost > 0 && (
                        <div className="text-xs text-muted-foreground">{formatCurrency(costs.overheadCost)} (Overhead)</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(costs.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => updateProject(project.id, { status: key as Project["status"] })}
                                  disabled={project.status === key}
                                >
                                  {config.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem onClick={() => handleGenerateQuotation(project)} disabled={isGenerating}>
                            <FileText className="w-4 h-4 mr-2" />
                            {isGenerating ? "Generating..." : "Generate Quotation"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(project)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(project.id)}
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
  );
}