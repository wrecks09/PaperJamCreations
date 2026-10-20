# PDF Quotation Design - Paper Jam Creations

## Overview
Generate professional quotation PDFs from project data for customer presentation.

---

## PDF Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  PAPER JAM CREATIONS                    QUOTATION #Q-001  │  │
│  │  123 Print Street, Manila                  Date: 2026-10-20│  │
│  │  +63 9XX XXX XXXX                        Valid Until: 2026-11-20│  │
│  │  info@paperjamcreations.com                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  CUSTOMER INFO                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Bill To:                                                 │  │
│  │  Acme Corporation                                         │  │
│  │  Jane Smith, Procurement Manager                          │  │
│  │  jane@acme.com | +63 9XX XXX XXXX                         │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  PROJECT DETAILS                                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Project: Business Cards - Acme Corp                      │  │
│  │  Description: 500 double-sided premium business cards     │  │
│  │  Status: Planning                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  LINE ITEMS TABLE                                               │
│  ┌────┬──────────────────────┬────────┬───────┬───────┬────────┐  │
│  │ #  │ Item                 │ Qty    │ Unit  │ Price │ Total  │  │
│  ├────┼──────────────────────┼────────┼───────┼───────┼────────┤  │
│  │ 1  │ Premium Gloss Paper  │ 2      │ ream  │ 12.50 │ 25.00  │  │
│  │    │ 130gsm (A4)          │        │       │       │        │  │
│  │ 2  │ Cyan Ink Cartridge   │ 1      │ bottle│ 45.00 │ 45.00  │  │
│  │    │ 250ml pigment        │        │       │       │        │  │
│  ├────┼──────────────────────┼────────┼───────┼───────┼────────┤  │
│  │    │ Materials Subtotal   │        │       │       │ 70.00  │  │
│  │    │ Labor                │        │       │       │ 25.00  │  │
│  │    │ Overhead             │        │       │       │  0.00  │  │
│  │    │ Waste Buffer (15%)   │        │       │       │  6.75  │  │
│  │    │ Markup (50%)         │        │       │       │ 50.88  │  │
│  ├────┼──────────────────────┼────────┼───────┼───────┼────────┤  │
│  │    │ GRAND TOTAL          │        │       │       │152.63  │  │
│  └────┴──────────────────────┴────────┴───────┴───────┴────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  TERMS & CONDITIONS                                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  • Quotation valid for 30 days from date above           │  │
│  │  • 50% deposit required to begin production              │  │
│  │  • Balance due upon delivery                             │  │
│  │  • Changes after approval may incur additional charges   │  │
│  │  • Print colors may vary slightly from screen proof      │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Thank you for choosing Paper Jam Creations!             │  │
│  │  www.paperjamcreations.com | info@paperjamcreations.com  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Mapping

| PDF Section | Data Source |
|-------------|-------------|
| Company Info | Settings/Config (business name, address, contact) |
| Quotation # | Auto-generated: `Q-{YYYYMMDD}-{sequential}` |
| Date | `new Date().toISOString().split('T')[0]` |
| Valid Until | Date + 30 days |
| Customer | New field in Project model (customerName, customerEmail, customerPhone, customerAddress) |
| Project Name | `project.name` |
| Description | `project.description` |
| Line Items | `project.materials` array + calculated costs |
| Labor | `project.laborCost` |
| Overhead | `project.overheadCost` |
| Waste Buffer | `project.wasteBuffer` % applied to ink materials |
| Markup | `project.markup` % |
| Grand Total | Calculated via `calculateProjectCost()` |

---

## Required Data Model Updates

### Add Customer Fields to Project Type
```typescript
// src/types/inventory.ts
export interface Project {
  // ... existing fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  quotationNumber?: string;
}
```

### Add Company Settings
```typescript
// New type
export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  taxId?: string;
}
```

---

## Component Architecture

```
src/
├── components/
│   ├── quotation/
│   │   ├── QuotationPDF.tsx          # Main PDF document component
│   │   ├── QuotationHeader.tsx       # Company + quotation metadata
│   │   ├── QuotationCustomer.tsx     # Customer info section
│   │   ├── QuotationLineItems.tsx    # Materials table
│   │   ├── QuotationTotals.tsx       # Cost breakdown
│   │   ├── QuotationTerms.tsx        # Terms & conditions
│   │   └── QuotationFooter.tsx       # Footer with contact
│   └── ui/
│       └── QuotationButton.tsx       # Reusable "Generate PDF" button
├── hooks/
│   └── useQuotationPDF.ts            # PDF generation logic
├── lib/
│   └── pdf/
│       ├── styles.ts                 # StyleSheet for @react-pdf/renderer
│       └── utils.ts                  # Number formatting, date helpers
└── pages/
    └── Projects.tsx                  # Add "Generate Quotation" button
```

---

## @react-pdf/renderer Style Guide

```typescript
// Key styles (in lib/pdf/styles.ts)
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: 1, paddingBottom: 10 },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#374151' },
  tableHeader: { backgroundColor: '#f3f4f6', fontWeight: 'bold' },
  tableRow: { borderBottom: 0.5, borderColor: '#e5e7eb' },
  totalRow: { fontWeight: 'bold', backgroundColor: '#f9fafb' },
  grandTotal: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' },
  terms: { fontSize: 8, color: '#6b7280', lineHeight: 1.5 },
});
```

---

## User Flow

1. User opens Project → clicks **"Generate Quotation"**
2. Modal opens with customer info form (pre-filled if exists)
3. User fills/confirms customer details → clicks **"Create PDF"**
4. PDF generates client-side → downloads as `Quotation-{projectName}-{date}.pdf`
5. Quotation number saved to project for tracking

---

## Implementation Phases

| Phase | Tasks |
|-------|-------|
| **1. Data Model** | Add customer fields to Project type, update Supabase schema |
| **2. PDF Components** | Build all @react-pdf/renderer components |
| **3. Generation Hook** | `useQuotationPDF` hook with blob download |
| **4. UI Integration** | Add button to Project page + customer modal |
| **5. Polish** | Page numbers, logo support, print-optimized CSS |

---

## Dependencies to Add

```bash
pnpm add @react-pdf/renderer
# Optional: for fonts
pnpm add @react-pdf/fonts
```

---

## Future Enhancements

- [ ] Email quotation directly from app (Supabase Edge Function + SendGrid/Resend)
- [ ] Quotation history/log per project
- [ ] Convert quotation to invoice on approval
- [ ] Custom templates (formal, minimal, branded)
- [ ] Digital signature field for customer approval
- [ ] Multi-currency support