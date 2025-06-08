# Section 3: Place of Birth - Test Suite

## Overview

This test suite provides comprehensive testing for SF-86 Section 3 (Place of Birth) functionality, including data persistence, field validation, and PDF field mapping.

## Test Coverage

### Fields Tested (Cross-referenced with `api/sections-references/section-3.json`)

| Field | Test ID | PDF Field Name | PDF Field ID | Type |
|-------|---------|----------------|--------------|------|
| City | `city-field` | `form1[0].Sections1-6[0].TextField11[3]` | `9446 0 R` | Text |
| County | `county-field` | `form1[0].Sections1-6[0].TextField11[4]` | `9445 0 R` | Text |
| Country | `country-field` | `form1[0].Sections1-6[0].DropDownList1[0]` | `9444 0 R` | Dropdown |
| State | `state-field` | `form1[0].Sections1-6[0].School6_State[0]` | `9443 0 R` | Dropdown |

### Test Scenarios

1. **Field Visibility and Structure**
   - Verifies all Section 3 fields are present and visible
   - Tests form structure and navigation elements

2. **Basic Data Entry and Persistence**
   - Tests filling all Section 3 fields
   - Verifies data persists after form submission
   - Tests data retrieval and display

3. **Conditional Field Logic**
   - Tests US state field visibility based on country selection
   - Verifies proper field interactions

4. **Field Validation**
   - Tests required field validation
   - Verifies form submission behavior with empty/invalid data

5. **Reset Functionality**
   - Tests clear/reset button functionality
   - Verifies all fields are properly cleared

6. **International Data Handling**
   - Tests non-US place of birth data
   - Verifies international address handling

7. **Complete Workflow Testing**
   - Tests end-to-end data flow
   - Verifies data persistence across multiple operations

8. **Field Mapping Validation**
   - Cross-references fields with `section-3.json`
   - Validates PDF field ID mapping
   - Tests data structure integrity

9. **Console Error Monitoring**
   - Monitors for JavaScript errors during operations
   - Tracks context-related error messages

10. **PDF Data Flow Testing**
    - Tests data flow to PDF generation system
    - Verifies field ID mapping accuracy

## Running the Tests

### Prerequisites

1. Ensure the development server is running on `http://localhost:5173`
2. Install Playwright dependencies: `npm install @playwright/test`

### Run All Section 3 Tests

```bash
# From project root
npx playwright test tests/section3/ --config=tests/section3/playwright.config.ts
```

### Run Specific Test

```bash
# Run comprehensive tests only
npx playwright test tests/section3/section3-comprehensive.test.ts --config=tests/section3/playwright.config.ts
```

### Run with Debug Mode

```bash
# Run with browser visible
npx playwright test tests/section3/ --config=tests/section3/playwright.config.ts --headed

# Run with debug mode
npx playwright test tests/section3/ --config=tests/section3/playwright.config.ts --debug
```

## Test Data

### Primary Test Data
- **City**: New York
- **County**: Manhattan  
- **Country**: United States
- **State**: NY

### Alternative Test Data
- **City**: Los Angeles
- **County**: Los Angeles County
- **Country**: United States
- **State**: CA

### International Test Data
- **City**: Toronto
- **County**: York Region
- **Country**: Canada
- **State**: ON

## Expected Outcomes

### Successful Test Run Should Show:
- ✅ All fields are visible and functional
- ✅ Data persists correctly in Section 3 context
- ✅ Form validation works as expected
- ✅ Reset functionality clears all fields
- ✅ International data is handled properly
- ✅ No console errors during operations
- ✅ PDF field mapping is accurate

### Common Issues to Watch For:
- ❌ Field values not persisting after submission
- ❌ State field not showing/hiding based on country selection
- ❌ Console errors related to context updates
- ❌ PDF field ID mismatches
- ❌ Data not flowing to IndexedDB storage

## Debugging

### Enable Debug Mode
Add `?debug=true` to the URL to see debug information in the Section 3 component.

### Console Monitoring
Tests automatically monitor console messages and will report any errors or warnings.

### Test Artifacts
- Screenshots on failure: `test-results/section3-artifacts/`
- HTML reports: `test-results/section3-html-report/`
- JSON results: `test-results/section3-results.json`

## Integration with CI/CD

These tests are designed to run in CI/CD environments with:
- Automatic retries on failure
- Comprehensive error reporting
- Cross-browser testing support
- Mobile viewport testing

## Related Files

- **Context**: `app/state/contexts/sections2.0/section3.tsx`
- **Component**: `app/components/Rendered2.0/Section3Component.tsx`
- **Interface**: `api/interfaces/sections2.0/section3.ts`
- **Reference Data**: `api/sections-references/section-3.json`
- **Navigation**: `app/routes/startForm.tsx`
