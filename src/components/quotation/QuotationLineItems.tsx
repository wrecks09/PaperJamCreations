import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "@/lib/pdf/styles";
import { formatCurrency, isInkMaterial } from "@/lib/pdf/utils";
import { ProjectMaterial } from "@/types/inventory";

interface QuotationLineItemsProps {
  materials: ProjectMaterial[];
}

export function QuotationLineItems({ materials }: QuotationLineItemsProps) {
  const materialCost = materials.reduce((sum, pm) => sum + pm.totalCost, 0);

  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>LINE ITEMS</Text>
      <View style={pdfStyles.table}>
        {/* Table Header */}
        <View style={pdfStyles.tableHeader}>
          <View style={[pdfStyles.tableCellHeader, pdfStyles.colNum]}>
            <Text>#</Text>
          </View>
          <View style={[pdfStyles.tableCellHeader, pdfStyles.colItem]}>
            <Text>Item</Text>
          </View>
          <View style={[pdfStyles.tableCellHeader, pdfStyles.colQty]}>
            <Text>Qty</Text>
          </View>
          <View style={[pdfStyles.tableCellHeader, pdfStyles.colUnit]}>
            <Text>Unit</Text>
          </View>
          <View style={[pdfStyles.tableCellHeader, pdfStyles.colPrice]}>
            <Text>Price</Text>
          </View>
          <View style={[pdfStyles.tableCellHeader, pdfStyles.colTotal]}>
            <Text>Total</Text>
          </View>
        </View>

        {/* Table Rows */}
        {materials.map((material, index) => {
          const isInk = isInkMaterial(material.materialName);
          const rowStyle = isInk ? pdfStyles.inkItem : {};

          return (
            <View key={material.materialId} style={[pdfStyles.tableRow, rowStyle]}>
              <View style={[pdfStyles.tableCell, pdfStyles.colNum]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[pdfStyles.tableCell, pdfStyles.colItem]}>
                <Text style={{ fontWeight: "bold" }}>
                  {material.materialName}
                </Text>
              </View>
              <View style={[pdfStyles.tableCell, pdfStyles.colQty]}>
                <Text>{material.quantity}</Text>
              </View>
              <View style={[pdfStyles.tableCell, pdfStyles.colUnit]}>
                <Text>{material.unitPrice > 0 ? "unit" : "pcs"}</Text>
              </View>
              <View style={[pdfStyles.tableCell, pdfStyles.colPrice]}>
                <Text>{formatCurrency(material.unitPrice)}</Text>
              </View>
              <View style={[pdfStyles.tableCell, pdfStyles.colTotal]}>
                <Text>{formatCurrency(material.totalCost)}</Text>
              </View>
            </View>
          );
        })}

        {/* Materials Subtotal */}
        <View style={[pdfStyles.tableRow, { fontWeight: "bold", backgroundColor: pdfStyles.lightGray }]}>
          <View style={[pdfStyles.tableCell, pdfStyles.colNum]} />
          <View style={[pdfStyles.tableCell, pdfStyles.colItem]}>
            <Text>Materials Subtotal</Text>
          </View>
          <View style={[pdfStyles.tableCell, pdfStyles.colQty]} />
          <View style={[pdfStyles.tableCell, pdfStyles.colUnit]} />
          <View style={[pdfStyles.tableCell, pdfStyles.colPrice]} />
          <View style={[pdfStyles.tableCell, pdfStyles.colTotal]}>
            <Text>{formatCurrency(materialCost)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}