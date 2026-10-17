import { Project } from "@/types/inventory";
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  calculateProjectCost: (
    materials: Project["materials"],
    laborCost: number,
    markup: number
  ) => {
    materialCost: number;
    laborCost: number;
    subtotal: number;
    markupAmount: number;
    total: number;
  };
}

const statusConfig = {
  planning: { label: "Planning", variant: "secondary" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
};

export function ProjectsTable({ projects, onEdit, onDelete, calculateProjectCost }: ProjectsTableProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead className="text-right">Material Cost</TableHead>
              <TableHead className="text-right">Labor</TableHead>
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
                  project.markup
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
                      <span className="text-sm text-muted-foreground">
                        {project.materials.length} item(s)
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(costs.materialCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(costs.laborCost)}
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