import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";

const DEFAULT_TERMS = [
  "Quotation valid for 30 days from date above",
  "50% deposit required to begin production",
  "Balance due upon delivery",
  "Changes after approval may incur additional charges",
  "Print colors may vary slightly from screen proof",
];

interface QuotationTermsProps {
  terms?: string[];
}

export function QuotationTerms({ terms = DEFAULT_TERMS }: QuotationTermsProps) {
  return (
    <View style={pdfStyles.termsContainer}>
      <Text style={pdfStyles.termsTitle}>TERMS & CONDITIONS</Text>
      <View style={pdfStyles.termsList}>
        {terms.map((term, index) => (
          <Text key={index} style={pdfStyles.termItem}>
            <Text>• </Text>
            <Text>{term}</Text>
          </Text>
        ))}
      </View>
    </View>
  );
}