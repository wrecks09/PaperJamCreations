# Unit Conversion Implementation Plan

## Overview
This plan implements automatic unit conversion for inventory materials to ensure consistency between different unit systems (e.g., ream ↔ sheet) throughout the application.

## Changes Required

### 1. Type Definitions (`src/types/inventory.ts`)
- Add `Unit` type definition
- Add `UnitConversion` interface for conversion factors
- Add `unitConversions` object with conversion data
- Update `Material` interface:
  - Change `unit: string` to `unit: Unit`
  - Add `baseUnitPrice: number` for consistent pricing
- Update `categoryLabels` and `categoryColors` to TypeScript enums

### 2. Core Logic (`src/hooks/useInventory.ts`)
- Add utility functions:
  - `convertToBaseUnit(quantity: number, unit: Unit): number`
  - `convertFromBaseUnit(quantity: number, unit: Unit): number`
  - `calculateBaseUnitPrice(unitPrice: number, unit: Unit): number`
- Update `addMaterial`, `updateMaterial`, `deleteMaterial` to handle base unit conversions
- Update `deductMaterials` and `restoreMaterials` to work with consistent units
- Ensure all project calculations use base units

### 3. Inventory Management
- Update mock data to use consistent units
- Ensure inventory totals reflect base units
- Implement unit conversion for display purposes

### 4. UI Components
- Update all material input displays to show both forms:
  - `MaterialForm.tsx`: Handle unit selection with conversion hints
  - `MaterialsTable.tsx`: Display quantities in both units
  - `ProjectForm.tsx`: Show material quantities in base units
  - `ProjectTable.tsx`: Display material costs in base units

### 5. Project Management
- Update `ProjectForm.tsx` to:
  - Display material quantities in base units
  - Convert project quantities back to original units when creating projects
  - Ensure accurate cost calculations

### 6. Testing & Validation
- Verify all existing functionality remains intact
- Test unit conversions for various material types
- Ensure UI displays correct values
- Validate calculations across the application

## Key Features
1. **Automatic Conversion**: All internal operations use base units
2. **Display Flexibility**: Users can work with any unit system
3. **Consistent Pricing**: Prices are calculated and stored in base units
4. **Bidirectional Conversion**: Convert to/from base units as needed
5. **Backward Compatible**: Existing mock data and UI experience preserved

## Impact Analysis
- **Minimal Breaking Changes**: Most UI remains the same
- **Improved Accuracy**: Eliminates unit-related calculation errors
- **Better User Experience**: Users can select appropriate units for their workflow
- **Consistent Data**: All internal calculations use standardized units

## Implementation Steps
1. **Phase 1**: Update type definitions and add utility functions
2. **Phase 2**: Modify core inventory hook to handle unit conversions
3. **Phase 3**: Update UI components for unit selection and display
4. **Phase 4**: Test and validate all changes
5. **Phase 5**: Deploy and monitor for any issues

## Risk Mitigation
- Maintain comprehensive test coverage
- Implement gradual rollouts of unit conversions
- Provide clear unit conversion guidance in UI
- Monitor performance impact of conversion calculations