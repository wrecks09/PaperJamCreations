import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";

interface QuotationCustomerProps {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export function QuotationCustomer({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
}: QuotationCustomerProps) {
  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>CUSTOMER INFORMATION</Text>
      <Text style={pdfStyles.customerLabel}>Bill To:</Text>
      <Text style={pdfStyles.customerName}>{customerName}</Text>
      {customerAddress && (
        <Text style={pdfStyles.customerDetail}>{customerAddress}</Text>
      )}
      {customerEmail && (
        <Text style={pdfStyles.customerDetail}>{customerEmail}</Text>
      )}
      {customerPhone && (
        <Text style={pdfStyles.customerDetail}>{customerPhone}</Text>
      )}
    </View>
  );
}