// PDF Utility Functions

/**
 * Format number as Philippine Peso currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date as YYYY-MM-DD
 */
export const formatDate = (date: Date = new Date()): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Add days to a date and return formatted string
 */
export const addDays = (date: Date, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return formatDate(result);
};

/**
 * Generate quotation number: Q-{YYYYMMDD}-{sequential}
 * For now we'll use timestamp-based unique ID
 */
export const generateQuotationNumber = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = now.getTime().toString().slice(-4);
  return `Q-${dateStr}-${timeStr}`;
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone: string): string => {
  // Basic formatting for Philippine numbers
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("63") && cleaned.length === 12) {
    return `+63 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.startsWith("09") && cleaned.length === 11) {
    return `+63 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Truncate text to max length
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

/**
 * Calculate line item total
 */
export const calculateLineTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

/**
 * Check if material is ink-related
 */
export const isInkMaterial = (materialName: string): boolean => {
  return materialName.toLowerCase().includes("ink");
};