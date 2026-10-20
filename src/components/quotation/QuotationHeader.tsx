import { View, Text, StyleProp } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";
import { formatDate, addDays } from "@/lib/pdf/utils";

interface QuotationHeaderProps {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite?: string;
  quotationNumber: string;
  quotationDate?: Date;
  validUntil?: Date;
  style?: StyleProp<View>;
}

export function QuotationHeader({
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  companyWebsite,
  quotationNumber,
  quotationDate,
  validUntil,
  style,
}: QuotationHeaderProps) {
  const date = quotationDate ? formatDate(quotationDate) : formatDate(new Date());
  const valid = validUntil ? formatDate(validUntil) : addDays(new Date(), 30);

  return (
    <View style={[pdfStyles.header, style]}>
      <View style={pdfStyles.headerLeft}>
        <Text style={pdfStyles.companyName}>{companyName}</Text>
        <Text style={pdfStyles.companyAddress}>{companyAddress}</Text>
        <Text style={pdfStyles.companyContact}>
          {companyPhone} | {companyEmail}
        </Text>
        {companyWebsite && (
          <Text style={pdfStyles.companyContact}>{companyWebsite}</Text>
        )}
      </View>
      <View style={pdfStyles.headerRight}>
        <Text style={pdfStyles.quotationLabel}>QUOTATION</Text>
        <Text style={pdfStyles.quotationNumber}>{quotationNumber}</Text>
        <Text style={pdfStyles.quotationDate}>
          Date: {date}
        </Text>
        <Text style={pdfStyles.quotationValid}>
          Valid Until: {valid}
        </Text>
      </View>
    </View>
  );
}