# Section 2: Date of Birth - Test Suite

## Overview

Comprehensive Playwright test suite for Section 2 of the SF-86 form, focusing on date of birth functionality, data persistence, and integration testing.

## Test Coverage

### Core Functionality
- ✅ Field presence and visibility
- ✅ Date selection (month/day/year dropdowns)
- ✅ Estimated checkbox functionality
- ✅ Age calculation
- ✅ Form submission and validation

### Data Persistence
- ✅ Context state management
- ✅ Navigation persistence
- ✅ IndexedDB storage
- ✅ PDF generation integration

### Field Mappings (from section-2.json)
- **Date Field**: `form1[0].Sections1-6[0].From_Datefield_Name_2[0]` (ID: 9432 0 R)
- **Estimated Checkbox**: `form1[0].Sections1-6[0].#field[18]` (ID: 9431 0 R)

## Running Tests

### Prerequisites
```bash
npm install
npm run dev  # Start development server
```

### Run Section 2 Tests
```bash
# Run all Section 2 tests
npx playwright test tests/section2/ --config=tests/section2/playwright.config.ts

# Run with debug mode
npx playwright test tests/section2/ --config=tests/section2/playwright.config.ts --debug

# Run specific test
npx playwright test tests/section2/section2-comprehensive.spec.ts

# Run with headed browser
npx playwright test tests/section2/ --headed
```

### Debug Mode
Add `?debug=true` to URL for enhanced console logging:
```typescript
await page.goto('/startForm?debug=true');
```

## Test Structure

### section2-comprehensive.spec.ts
- **Field Loading**: Verifies all Section 2 fields are present
- **Data Updates**: Tests date selection and estimated checkbox
- **Persistence**: Validates data survives navigation
- **PDF Generation**: Tests integration with PDF generation
- **Validation**: Checks form validation logic
- **Clear Functionality**: Tests section reset

## Key Test Scenarios

### 1. Basic Field Interaction
```typescript
await page.selectOption('#monthSelect', '03');
await page.selectOption('#daySelect', '15');
await page.selectOption('#yearSelect', '1990');
await page.check('[data-testid="estimated-checkbox"]');
```

### 2. Data Persistence Verification
```typescript
// Fill data, navigate away, return, verify data persists
await page.click('[data-testid="section1-nav-button"]');
await page.click('[data-testid="section2-nav-button"]');
expect(await page.locator('#monthSelect').inputValue()).toBe('03');
```

### 3. Console Log Monitoring
```typescript
page.on('console', msg => {
  if (msg.text().includes('Section2:')) {
    consoleLogs.push(msg.text());
  }
});
```

## Expected Behavior

### Before Fix
- ❌ Data not persisting in context
- ❌ Silent failures in updateFieldValue
- ❌ PDF generation missing Section 2 data

### After Fix
- ✅ Data persists correctly
- ✅ updateFieldValue handles all path formats
- ✅ PDF generation includes Section 2 data
- ✅ Console logs show proper data flow

## Debugging

### Common Issues
1. **Fields not updating**: Check console for updateFieldValue logs
2. **Data not persisting**: Verify SF86FormContext integration
3. **PDF missing data**: Check field mapping and data collection

### Debug Commands
```bash
# Run with verbose logging
DEBUG=pw:api npx playwright test tests/section2/

# Generate trace
npx playwright test tests/section2/ --trace on

# Show browser
npx playwright test tests/section2/ --headed --slowMo=1000
```

## Integration Points

### Context Integration
- `useSection2()` hook
- `useSection86FormIntegration()` 
- `useSF86Form()` main context

### Data Flow
1. User input → Section2Component
2. Component → Section2Context (updateFieldValue)
3. Context → SF86FormContext (integration)
4. SF86FormContext → IndexedDB (persistence)
5. SF86FormContext → PDF generation

## Test Results

Results are saved to:
- `test-results/section2-html-report/` - HTML report
- `test-results/section2-results.json` - JSON results
- `test-results/section2-artifacts/` - Screenshots/videos
