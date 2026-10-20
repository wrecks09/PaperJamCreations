import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";

interface QuotationProjectProps {
  projectName: string;
  description?: string;
  status: string;
}

export function QuotationProject({
  projectName,
  description,
  status,
}: QuotationProjectProps) {
  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>PROJECT DETAILS</Text>
      <Text style={pdfStyles.projectName}>{projectName}</Text>
      {description && (
        <Text style={pdfStyles.projectDescription}>{description}</Text>
      )}
      <Text style={pdfStyles.projectStatus}>
        Status: {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </Text>
    </View>
  );
}