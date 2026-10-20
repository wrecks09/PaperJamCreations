import { StyleSheet } from "@react-pdf/renderer";

// Color palette
const colors = {
  primary: "#1e3a8a", // Dark blue
  secondary: "#374151", // Dark gray
  accent: "#f97316", // Orange
  lightGray: "#f3f4f6",
  mediumGray: "#e5e7eb",
  darkGray: "#6b7280",
  white: "#ffffff",
  black: "#111827",
  amber: "#f59e0b",
  green: "#10b981",
};

export const pdfStyles = StyleSheet.create({
  // Page
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.black,
    lineHeight: 1.4,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerLeft: {
    width: "60%",
  },
  headerRight: {
    width: "35%",
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 9,
    color: colors.darkGray,
    marginBottom: 2,
  },
  companyContact: {
    fontSize: 9,
    color: colors.darkGray,
    marginBottom: 2,
  },
  quotationLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 4,
  },
  quotationNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 6,
  },
  quotationDate: {
    fontSize: 9,
    color: colors.darkGray,
    marginBottom: 2,
  },
  quotationValid: {
    fontSize: 9,
    color: colors.darkGray,
  },

  // Section
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },

  // Customer Info
  customerLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.darkGray,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 2,
  },
  customerDetail: {
    fontSize: 9,
    color: colors.darkGray,
    marginBottom: 1,
  },

  // Project Details
  projectName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 9,
    color: colors.darkGray,
    marginBottom: 2,
  },
  projectStatus: {
    fontSize: 9,
    color: colors.darkGray,
  },

  // Table
  table: {
    width: "100%",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.mediumGray,
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
  },
  tableCellHeader: {
    padding: 6,
    fontSize: 9,
    fontWeight: "bold",
    color: colors.secondary,
  },
  colNum: { width: "8%", textAlign: "center" },
  colItem: { width: "38%" },
  colQty: { width: "12%", textAlign: "center" },
  colUnit: { width: "12%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },

  // Totals
  totalsContainer: {
    width: "100%",
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    fontSize: 10,
  },
  totalRowLabel: {
    color: colors.secondary,
  },
  totalRowValue: {
    color: colors.black,
    fontWeight: "500",
  },
  totalRowSubtotal: {
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    paddingTop: 8,
    fontWeight: "bold",
  },
  totalRowMarkup: {
    color: colors.darkGray,
  },
  grandTotal: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    paddingTop: 8,
  },

  // Terms
  termsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 8,
  },
  termsList: {
    fontSize: 8,
    color: colors.darkGray,
    lineHeight: 1.6,
  },
  termItem: {
    marginBottom: 4,
  },

  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: colors.darkGray,
    marginBottom: 2,
  },
  footerContact: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: "500",
  },

  // Material detail (sub-item)
  materialDetail: {
    fontSize: 8,
    color: colors.darkGray,
    marginLeft: 4,
    marginTop: 1,
  },

  // Ink item indicator
  inkItem: {
    backgroundColor: "#fef3c7",
  },
});