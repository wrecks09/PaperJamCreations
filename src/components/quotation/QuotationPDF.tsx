import {
  Document,
  Page,
  View,
  Text,
  Font,
} from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";
import { formatCurrency, generateQuotationNumber } from "@/lib/pdf/utils";
import { Project } from "@/types/inventory";
import { QuotationHeader } from "./QuotationHeader";
import { QuotationCustomer } from "./QuotationCustomer";
import { QuotationProject } from "./QuotationProject";
import { QuotationLineItems } from "./QuotationLineItems";
import { QuotationTotals } from "./QuotationTotals";
import { QuotationTerms } from "./QuotationTerms";
import { QuotationFooter } from "./QuotationFooter";

// Register fonts (using built-in Helvetica for now)
// For custom fonts, you would use:
// Font.register({ family: "CustomFont", src: "/path/to/font.ttf" });

interface QuotationPDFProps {
  project: Project;
  companySettings: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
  quotationNumber?: string;
}

export function QuotationPDF({
  project,
  companySettings,
  quotationNumber,
}: QuotationPDFProps) {
  // Use project's quotation number or generate new one
  const qNumber = quotationNumber || project.quotationNumber || generateQuotationNumber();
  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + 30);

  // Calculate costs using same logic as ProjectForm
  const materialCost = project.materials.reduce((sum, pm) => sum + pm.totalCost, 0);
  
  // Separate ink materials to apply waste buffer
  const inkMaterials = project.materials.filter((pm) =>
    pm.materialName.toLowerCase().includes("ink")
  );
  const inkCost = inkMaterials.reduce((sum, pm) => sum + pm.totalCost, 0);
  const nonInkCost = materialCost - inkCost;
  const adjustedInkCost = inkCost * (1 + project.wasteBuffer / 100);
  const wasteBufferAdjustment = adjustedInkCost - inkCost;
  const adjustedMaterialCost = nonInkCost + adjustedInkCost;

  const subtotal = adjustedMaterialCost + project.laborCost + project.overheadCost;
  const markupAmount = subtotal * (project.markup / 100);
  const total = subtotal + markupAmount;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View>
          {/* Header */}
          <QuotationHeader
            companyName={companySettings.name}
            companyAddress={companySettings.address}
            companyPhone={companySettings.phone}
            companyEmail={companySettings.email}
            companyWebsite={companySettings.website}
            quotationNumber={qNumber}
            quotationDate={now}
            validUntil={validUntil}
          />

          {/* Customer Info */}
          <QuotationCustomer
            customerName={project.customerName || "N/A"}
            customerEmail={project.customerEmail}
            customerPhone={project.customerPhone}
            customerAddress={project.customerAddress}
          />

          {/* Project Details */}
          <QuotationProject
            projectName={project.name}
            description={project.description}
            status={project.status}
          />

          {/* Line Items */}
          <QuotationLineItems materials={project.materials} />

          {/* Totals */}
          <QuotationTotals
            materialCost={materialCost}
            laborCost={project.laborCost}
            overheadCost={project.overheadCost}
            wasteBufferPercent={project.wasteBuffer}
            markupPercent={project.markup}
            inkCost={inkCost}
          />

          {/* Terms & Conditions */}
          <QuotationTerms />

          {/* Footer */}
          <QuotationFooter
            companyName={companySettings.name}
            companyWebsite={companySettings.website}
            companyEmail={companySettings.email}
          />
        </View>
      </Page>
    </Document>
  );
}

// Helper hook for generating and downloading PDF
export function useQuotationPDF() {
  const generatePDF = async (
    project: Project,
    companySettings: QuotationPDFProps["companySettings"]
  ): Promise<Blob> => {
    const { renderToStream } = await import("@react-pdf/renderer");
    const stream = await renderToStream(
      <QuotationPDF project={project} companySettings={companySettings} />
    );
    
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    return new Blob(chunks, { type: "application/pdf" });
  };

  const downloadPDF = async (
    project: Project,
    companySettings: QuotationPDFProps["companySettings"],
    filename?: string
  ) => {
    const blob = await generatePDF(project, companySettings);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `Quotation-${project.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { generatePDF, downloadPDF };
}