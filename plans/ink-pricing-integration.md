# Ink Cost & Craft Pricing Integration Plan

This plan details how to integrate the ink calculation model (cost-per-mL, coverage levels, waste buffers, and overhead) into the PrintStock inventory and project pricing calculator.

## Design Decisions & Options

### 1. Ink Volume Unit (`src/types/inventory.ts`)
- **Option A (Recommended):** Add `"milliliter"` (or `"ml"`) to the `Unit` type alongside existing units, with base unit `"milliliter"` and conversion factor `1` (and `liter` converting to `1000 ml`).
- **Option B:** Keep only `"liter"` and handle fractional liters or internal mL conversion.

### 2. Waste Buffer (15–20%)
- **Option A:** Add a global or per-project waste buffer percentage input (defaulting to 15% or 20%).
- **Option B:** Apply a fixed 20% multiplier to all ink/consumable materials in calculations.

### 3. Ink Coverage Levels & Per-Page Estimation
- **Option A:** Add a coverage selector (`5%` / `25%` / `65%` / `100%`) and a page count input in `ProjectForm`, automatically computing total ink volume needed:
  $$\text{Total Ink Volume} = \text{Page Count} \times \text{Volume per Page (based on coverage)} \times (1 + \text{Waste Buffer})$$
- **Option B:** Manual mL entry per project without preset coverage levels.

### 4. Overhead & Profit Margin Formula
- **Option A:** Update the cost summary in `ProjectForm` and `ProjectsTable` to include:
  $$\text{Subtotal} = \text{Materials} + \text{Labor} + \text{Overhead}$$
  $$\text{Selling Price} = (\text{Subtotal}) \times (1 + \text{Markup/Profit Margin})$$
- **Option B:** Keep current formula (`Materials + Labor`) and fold overhead into labor or markup.

---

## Proposed Implementation Steps

1. **Update Types (`src/types/inventory.ts`)**
   - Add `"milliliter"` to `Unit` and update `unitConversions` (`liter` = `1000 milliliters`, `milliliter` = `1 milliliter`).
   - Extend `Project` interface to optionally store `overheadCost`, `coverageLevel`, `pageCount`, and `wasteBuffer`.

2. **Update Core Calculation Hook (`src/hooks/useInventory.ts`)**
   - Update `calculateProjectCost` to factor in overhead, waste buffer, and ink volume calculations.

3. **Update UI Components (`ProjectForm.tsx` & `ProjectsTable.tsx`)**
   - Add inputs for Overhead, Page Count, Coverage Level, and Waste Buffer.
   - Display detailed breakdown including ink cost per mL and waste adjustment.
