import { useCallback, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { QuotationPDF } from "@/components/quotation/QuotationPDF";
import { Project } from "@/types/inventory";
import { formatDate } from "@/lib/pdf/utils";
import { toast } from "sonner";

interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

interface UseQuotationPDFReturn {
  generateQuotation: (
    project: Project,
    companySettings: CompanySettings,
    options?: {
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      customerAddress?: string;
    }
  ) => Promise<Blob | null>;
  downloadQuotation: (
    project: Project,
    companySettings: CompanySettings,
    options?: {
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      customerAddress?: string;
    }
  ) => Promise<void>;
  isGenerating: boolean;
}

export function useQuotationPDF(): UseQuotationPDFReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuotation = useCallback(
    async (
      project: Project,
      companySettings: CompanySettings,
      options?: {
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        customerAddress?: string;
      }
    ): Promise<Blob | null> => {
      setIsGenerating(true);
      try {
        // Create a project copy with customer info from options if provided
        const projectWithCustomer = {
          ...project,
          customerName: options?.customerName || project.customerName,
          customerEmail: options?.customerEmail || project.customerEmail,
          customerPhone: options?.customerPhone || project.customerPhone,
          customerAddress: options?.customerAddress || project.customerAddress,
        };

        const blob = await pdf(
          <QuotationPDF
            project={projectWithCustomer}
            companySettings={companySettings}
          />
        ).toBlob();

        return blob;
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast.error("Failed to generate quotation PDF");
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const downloadQuotation = useCallback(
    async (
      project: Project,
      companySettings: CompanySettings,
      options?: {
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        customerAddress?: string;
      }
    ) => {
      const blob = await generateQuotation(project, companySettings, options);
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = formatDate(new Date());
      const projectName = project.name.replace(/[^a-zA-Z0-9]/g, "-");
      link.download = `Quotation-${projectName}-${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Quotation downloaded successfully");
    },
    [generateQuotation]
  );

  return {
    generateQuotation,
    downloadQuotation,
    isGenerating,
  };
}