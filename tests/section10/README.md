# Section 10 Tests - Dual/Multiple Citizenship & Foreign Passport

This directory contains comprehensive Playwright tests for SF-86 Section 10, which covers dual/multiple citizenship and foreign passport information.

## Overview

Section 10 tests verify:
- **122 total fields** across dual citizenship and foreign passport entries
- **Field mapping system** integration and verification
- **Console error monitoring** during form interaction
- **PDF generation** with complete Section 10 data
- **Data persistence** across form navigation

## Test Structure

### Test Files

- **`section10-comprehensive.test.ts`** - Main comprehensive test suite
- **`playwright.config.ts`** - Playwright configuration optimized for Section 10
- **`run-section10-tests.ts`** - Test runner script with reporting

### Reference Photos

- **`10.1.png`** - Dual Citizenship section (Section 10.1)
- **`10.2.png`** - Foreign Passport section (Section 10.2) - Entry 1
- **`10.2-Entry2.png`** - Foreign Passport section - Entry 2

## Field Coverage

### Dual Citizenship Section (23 fields)
- **Main Question**: Has dual citizenship (1 field)
- **Entry 1**: 11 fields (country, how acquired, dates, renunciation, actions)
- **Entry 2**: 11 fields (same structure, different indices)

### Foreign Passport Section (99 fields)
- **Main Question**: Has foreign passport (1 field)
- **Entry 1**: 13 passport fields + 36 travel countries (49 fields)
- **Entry 2**: 13 passport fields + 36 travel countries (49 fields)

### Travel Countries Table (36 fields per passport)
- **6 rows** per passport entry
- **6 fields** per row (country, dates, estimates, present checkbox)
- Special handling for Row 6 with different field patterns

## Running Tests

### Quick Start
```bash
# Navigate to Section 10 tests directory
cd tests/section10

# Run all Section 10 tests
npx playwright test section10-comprehensive.test.ts

# Run with visible browser
npx playwright test section10-comprehensive.test.ts --headed

# Run in debug mode
npx playwright test section10-comprehensive.test.ts --debug
```

### Using Test Runner
```bash
# Run comprehensive test suite with reporting
node run-section10-tests.ts

# Run with options
node run-section10-tests.ts --headed
node run-section10-tests.ts --debug
```

## Test Cases

### 1. Field Mapping Initialization
- Verifies Section 10 field mapping system loads correctly
- Checks for initialization logs and coverage verification
- Validates field generation system integration

### 2. Complete Dual Citizenship Section
- Tests all dual citizenship fields across multiple entries
- Verifies data persistence and form navigation
- Includes estimate checkboxes and present date handling

### 3. Complete Foreign Passport Section
- Tests all foreign passport fields across multiple entries
- Includes comprehensive travel countries table testing
- Verifies passport details and travel history integration

### 4. All 122 Fields Testing
- Comprehensive test of every field in Section 10
- Validates field count and coverage
- Ensures all PDF field mappings work correctly

### 5. PDF Generation
- Tests PDF generation with complete Section 10 data
- Verifies all field values are properly included
- Checks for successful PDF creation and download

### 6. Console Error Monitoring
- Monitors console for errors during form interaction
- Captures Section 10 specific logs and initialization messages
- Validates no critical errors occur during testing

## Field Mapping System

Section 10 uses a sophisticated field mapping system that:

### PDF Field Patterns
- **Dual Citizenship**: `form1[0].Section10\\.1-10\\.2[0].*`
- **Foreign Passport Entry 1**: `form1[0].Section10\\.1-10\\.2[0].*`
- **Foreign Passport Entry 2**: `form1[0].Section10-2[0].*`
- **Travel Countries**: Dynamic row/cell patterns with special Row 6 handling

### Field Types
- **RadioButtonList[0-6]**: Yes/no questions
- **DropDownList[11,13,14]**: Country selections
- **TextField11[0-10]**: Text inputs
- **From_Datefield_Name_2[0-5]**: Date fields
- **#field[3,5,6,11,13,14,20,29]**: Estimate and present checkboxes

## Expected Console Logs

When Section 10 loads, you should see initialization logs like:
```
🔄 Section10: Initializing section data with complete field mapping verification
🎯 Section10: Field mapping verification - 98.4% coverage (120/122 fields)
✅ Section10: All 122 PDF form fields are properly mapped
✅ Section10: Field generation system validated successfully
🔧 Section10: Section initialization complete
```

## Test Data

The tests use comprehensive test data including:

### Dual Citizenship Entries
- **Entry 1**: Canadian citizenship acquired by birth, renounced in 2020
- **Entry 2**: UK citizenship acquired by naturalization, still active

### Foreign Passport Entries
- **Entry 1**: Canadian passport with travel to France, Germany, Italy
- **Entry 2**: UK passport with travel to Spain, Netherlands, Belgium

### Travel Countries
- Multiple travel entries per passport
- Various date ranges and estimate scenarios
- Present date handling for ongoing travel

## Troubleshooting

### Common Issues

1. **Field Not Found Errors**
   - Check that Section 10 component is properly loaded
   - Verify field mapping system is initialized
   - Ensure test data matches actual field structure

2. **Console Errors**
   - Review Section 10 initialization logs
   - Check for field mapping coverage warnings
   - Verify PDF field names match section-10.json

3. **Test Timeouts**
   - Increase timeout values in playwright.config.ts
   - Check server startup time
   - Verify network connectivity

### Debug Mode

Run tests in debug mode to step through interactions:
```bash
npx playwright test section10-comprehensive.test.ts --debug
```

## Integration with SF-86 System

Section 10 tests verify integration with:
- **Field mapping system** (`section10-field-mapping.ts`)
- **Field generation system** (`section10-field-generator.ts`)
- **PDF generation service** for complete form export
- **Section context system** for data persistence

## Reporting

Test results are generated in multiple formats:
- **HTML Report**: `test-results/html-report/index.html`
- **JSON Results**: `test-results/results.json`
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed tests

## Contributing

When adding new tests:
1. Follow the existing test structure and naming conventions
2. Include comprehensive field coverage
3. Add appropriate console monitoring
4. Update this README with new test descriptions
5. Ensure tests work with the field mapping system
