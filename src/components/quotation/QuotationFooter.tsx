import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";

interface QuotationFooterProps {
  companyName: string;
  companyWebsite?: string;
  companyEmail?: string;
}

export function QuotationFooter({
  companyName,
  companyWebsite,
  companyEmail,
}: QuotationFooterProps) {
  return (
    <View style={pdfStyles.footer}>
      <Text style={pdfStyles.footerText}>
        <Text>Thank you for choosing </Text>
        <Text>{companyName}</Text>
        <Text>!</Text>
      </Text>
      <Text style={pdfStyles.footerContact}>
        {companyWebsite && (
          <>
            <Text>{companyWebsite}</Text>
            <Text> | </Text>
          </>
        )}
        {companyEmail && <Text>{companyEmail}</Text>}
      </Text>
    </View>
  );
}