# Section 2 Data Flow Issue - Debug Analysis

## Issue Summary
Section 2 form input values are not being processed and sent to the context during PDF generation.

## Root Cause Analysis

Based on my comprehensive code analysis, I've identified the root cause:

### The Problem
The issue is in **data synchronization timing** between the Section 2 context and the SF86FormContext during PDF generation. Specifically:

1. **Section 2 uses Enhanced Section Template**: Section 2 uses `createEnhancedSectionContext` which properly registers with SF86FormContext via `useSection86FormIntegration`

2. **Custom Actions Work Correctly**: The `updateDateOfBirth` and `updateEstimated` custom actions properly update the section context data

3. **Manual Data Push**: Section2Component manually calls `sf86Form.updateSectionData('section2', currentSectionData)` on submit

4. **Data Collection Conflict**: During PDF generation, `collectAllSectionData()` reads from `registeredSections` but may get stale data instead of the manually updated data

### Evidence from Code

#### Section 2 Component Submit Handler
```typescript
// Section2Component manually pushes data to SF86FormContext
const currentSectionData = sectionData;
sf86Form.updateSectionData('section2', currentSectionData);
await sf86Form.saveForm();
```

#### SF86FormContext Data Collection
```typescript
// collectAllSectionData() reads from registeredSections
registeredSections.forEach((registration, index) => {
  if (registration.context?.sectionData) {
    const sectionData = registration.context.sectionData; // This might be stale!
    set(collectedData, registration.sectionId, sectionData);
  }
});
```

#### The Conflict
- Section 2 data is updated in section context ✅
- Section 2 data is manually pushed to SF86FormContext via `updateSectionData()` ✅  
- But `collectAllSectionData()` reads from `registration.context.sectionData` instead of the manually updated data ❌

## Test Plan

To confirm this issue, we need to:

1. **Fill Section 2 data** using the test page
2. **Trigger data collection** (simulate PDF generation)
3. **Compare data sources**:
   - Data from `registration.context.sectionData` 
   - Data from `formData.section2` (manually updated)
   - Data from `sf86Form.exportForm()` (uses collectAllSectionData)

## Expected Behavior vs Actual Behavior

### Expected
- Section 2 data flows: User Input → Section Context → SF86FormContext → PDF Generation
- `collectAllSectionData()` should get the most current Section 2 data

### Actual  
- Section 2 data flows: User Input → Section Context → Manual Push to SF86FormContext
- But `collectAllSectionData()` reads from registration (potentially stale) instead of manually updated data

## Proposed Fix

The fix should ensure that `collectAllSectionData()` prioritizes manually updated data over registration data, or ensures that registration data is always current.

### Option 1: Prioritize Manual Updates
```typescript
// In collectAllSectionData(), check formData first, then registration
const manuallyUpdatedData = get(formData, registration.sectionId);
const registrationData = registration.context?.sectionData;
const sectionData = manuallyUpdatedData || registrationData;
```

### Option 2: Keep Registration Current
Ensure that when `updateSectionData()` is called, it also updates the registration context data.

### Option 3: Single Source of Truth
Remove the manual `updateSectionData()` calls and rely entirely on the registration system.
