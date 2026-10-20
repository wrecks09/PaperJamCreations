import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";
import { formatCurrency } from "@/lib/pdf/utils";

interface QuotationTotalsProps {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  wasteBufferPercent: number;
  markupPercent: number;
  inkCost: number;
}

export function QuotationTotals({
  materialCost,
  laborCost,
  overheadCost,
  wasteBufferPercent,
  markupPercent,
  inkCost,
}: QuotationTotalsProps) {
  const nonInkCost = materialCost - inkCost;
  const adjustedInkCost = inkCost * (1 + wasteBufferPercent / 100);
  const wasteBufferAdjustment = adjustedInkCost - inkCost;
  const adjustedMaterialCost = nonInkCost + adjustedInkCost;
  
  const subtotal = adjustedMaterialCost + laborCost + overheadCost;
  const markupAmount = subtotal * (markupPercent / 100);
  const total = subtotal + markupAmount;

  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>COST BREAKDOWN</Text>
      <View style={pdfStyles.totalsContainer}>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalRowLabel}>Materials Subtotal:</Text>
          <Text style={pdfStyles.totalRowValue}>{formatCurrency(materialCost)}</Text>
        </View>
        
        {inkCost > 0 && wasteBufferPercent > 0 && (
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalRowLabel}>
              Waste Buffer ({wasteBufferPercent}% on ink):
            </Text>
            <Text style={{ ...pdfStyles.totalRowValue, color: pdfStyles.amber }}>
              +{formatCurrency(wasteBufferAdjustment)}
            </Text>
          </View>
        )}
        
        {inkCost > 0 && wasteBufferPercent > 0 && (
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalRowLabel}>Adjusted Materials:</Text>
            <Text style={pdfStyles.totalRowValue}>
              {formatCurrency(adjustedMaterialCost)}
            </Text>
          </View>
        )}
        
        {laborCost > 0 && (
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalRowLabel}>Labor:</Text>
            <Text style={pdfStyles.totalRowValue}>
              {formatCurrency(laborCost)}
            </Text>
          </View>
        )}
        
        {overheadCost > 0 && (
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalRowLabel}>Overhead:</Text>
            <Text style={pdfStyles.totalRowValue}>
              {formatCurrency(overheadCost)}
            </Text>
          </View>
        )}
        
        <View style={[pdfStyles.totalRow, pdfStyles.totalRowSubtotal]}>
          <Text style={pdfStyles.totalRowLabel}>Subtotal:</Text>
          <Text style={pdfStyles.totalRowValue}>{formatCurrency(subtotal)}</Text>
        </View>
        
        <View style={[pdfStyles.totalRow, pdfStyles.totalRowMarkup]}>
          <Text style={pdfStyles.totalRowLabel}>
            Markup ({markupPercent}%):
          </Text>
          <Text style={pdfStyles.totalRowValue}>
            +{formatCurrency(markupAmount)}
          </Text>
        </View>
        
        <View style={[pdfStyles.totalRow, pdfStyles.grandTotal]}>
          <Text style={{ ...pdfStyles.totalRowLabel, ...pdfStyles.grandTotal }}>
            GRAND TOTAL:
          </Text>
          <Text style={{ ...pdfStyles.totalRowValue, ...pdfStyles.grandTotal }}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>
    </View>
  );
}