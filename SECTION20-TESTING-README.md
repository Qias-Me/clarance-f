# Section 20 Comprehensive Testing Suite

## Overview

This comprehensive testing suite validates all **790 fields** in Section 20 (Foreign Activities) of the SF-86 form. The tests ensure proper functionality, data persistence, validation, and user experience across all field types and subsections.

## Field Coverage

### Total Fields: 790
- **PDFTextField**: 1,242 instances (text inputs, dates, numeric fields)
- **PDFCheckBox**: 480 instances (boolean selections, estimates)
- **PDFRadioGroup**: 222 instances (YES/NO selections, multiple choice)
- **PDFDropdown**: 426 instances (country selections, predefined options)

### Subsections Tested
1. **Foreign Financial Interests** (Section20a[0]) - 126 fields
2. **Foreign Business Activities** (Section20a2[0]) - 123 fields  
3. **Foreign Travel** (Section20a2[0]) - Shared with business activities

## Test Files

### Core Test Suites

#### 1. `tests/section20-comprehensive.spec.ts`
- **Purpose**: End-to-end testing of all major functionality
- **Coverage**: Field mapping verification, data persistence, validation
- **Tests**: 15+ comprehensive test scenarios
- **Focus**: Integration testing and user workflows

#### 2. `tests/section20-field-types.spec.ts`
- **Purpose**: Field-type specific testing
- **Coverage**: All 4 field types with specific validation
- **Tests**: 20+ field-type focused tests
- **Focus**: Individual field behavior and edge cases

#### 3. `tests/section20-edge-cases.spec.ts`
- **Purpose**: Error handling and boundary testing
- **Coverage**: Edge cases, performance, accessibility
- **Tests**: 25+ edge case scenarios
- **Focus**: Robustness and error resilience

### Configuration and Utilities

#### 4. `tests/section20-test-config.ts`
- Test data generators for all field types
- Field selector strategies
- Browser configurations
- Performance testing parameters

#### 5. `tests/section20-global-setup.ts`
- Environment validation
- Test data preparation
- Field mapping generation
- Pre-test verification

#### 6. `tests/section20-global-teardown.ts`
- Comprehensive report generation
- Performance analysis
- Issue identification
- Cleanup operations

## Quick Start

### Prerequisites
```bash
# Install dependencies
npm install @playwright/test

# Install browsers
npx playwright install
```

### Running Tests

#### Basic Test Execution
```bash
# Run all Section 20 tests
node run-section20-tests.js

# Run with visible browser
node run-section20-tests.js --headed

# Quick test run (single browser)
node run-section20-tests.js --quick
```

#### Browser-Specific Testing
```bash
# Chrome only
node run-section20-tests.js --browser chromium

# Firefox only  
node run-section20-tests.js --browser firefox

# Safari only
node run-section20-tests.js --browser webkit
```

#### Advanced Options
```bash
# Debug mode
node run-section20-tests.js --debug

# Clean previous results
node run-section20-tests.js --clean

# Generate report only
node run-section20-tests.js --report-only
```

## Test Categories

### 1. Field Mapping Tests
- Verify all 790 fields are properly mapped
- Validate field distribution across subsections
- Check field type consistency
- Ensure PDF field ID mapping accuracy

### 2. Data Persistence Tests
- Test field value persistence across page reloads
- Validate IndexedDB storage integration
- Check SF86FormContext synchronization
- Verify multi-entry data handling

### 3. Field Type Validation Tests

#### Text Fields (1,242 instances)
- Standard text input validation
- Date format validation
- Numeric field constraints
- Maximum length handling

#### Checkboxes (480 instances)
- Toggle functionality
- Estimate field behavior
- Boolean state persistence
- Accessibility compliance

#### Radio Groups (222 instances)
- Single selection enforcement
- YES/NO pattern validation
- Option availability verification
- State change handling

#### Dropdowns (426 instances)
- Option selection validation
- Country dropdown testing
- Multi-option field handling
- Default value verification

### 4. Complex Field Structure Tests
- **DateInfo fields**: `{ date: Field<string>, estimated: Field<boolean> }`
- **ValueInfo fields**: `{ amount: Field<string>, estimated: Field<boolean> }`
- **Address fields**: Nested address components
- **Travel dates**: From/to date ranges

### 5. Performance Tests
- Large dataset handling (20+ entries per subsection)
- Rapid field changes
- Memory stress testing
- Concurrent field updates

### 6. Edge Case Tests
- Invalid input handling
- Boundary value testing
- Network interruption simulation
- Browser compatibility verification

### 7. Accessibility Tests
- Keyboard navigation
- ARIA label verification
- Screen reader compatibility
- Focus management

## Test Data Strategy

### Automated Test Data Generation
```typescript
// Text fields
TestDataGenerators.generateTextData(fieldName, maxLength)

// Numeric fields  
TestDataGenerators.generateNumericData(fieldName)

// Date fields
TestDataGenerators.generateDateData(fieldName)

// Dropdown fields
TestDataGenerators.generateDropdownData(options)
```

### Field Selector Strategies
```typescript
// By field ID
FieldSelectors.byFieldId(fieldId)

// By test ID
FieldSelectors.byTestId(testId)

// Comprehensive (multiple strategies)
FieldSelectors.comprehensive(fieldId, testId, name)
```

## Reporting

### Generated Reports
1. **HTML Report**: Visual test results with charts and graphs
2. **JSON Report**: Machine-readable test data
3. **CSV Export**: Field-by-field results for analysis
4. **Performance Report**: Timing and efficiency metrics

### Report Locations
```
test-results/
├── section20-report.html              # Main HTML report
├── section20-comprehensive-report.json # Detailed JSON results
├── section20-field-results.csv        # CSV data export
├── section20-junit.xml                # JUnit format for CI
└── artifacts/                         # Screenshots, videos, traces
```

### Key Metrics Tracked
- **Pass Rate**: Percentage of successful tests
- **Coverage**: Percentage of fields tested
- **Performance**: Average test execution time
- **Reliability**: Consistency across test runs
- **Browser Compatibility**: Cross-browser success rates

## Troubleshooting

### Common Issues

#### Test Environment
```bash
# Verify Playwright installation
npx playwright --version

# Check browser installation
npx playwright install --dry-run

# Validate test data
node -e "console.log(require('./api/sections-references/section-20.json').metadata)"
```

#### Field Not Found Errors
1. Check field selector strategies in `section20-test-config.ts`
2. Verify field ID mapping in `section20-field-mapping.ts`
3. Ensure component renders field with correct test IDs

#### Performance Issues
1. Reduce parallel workers: `--workers=1`
2. Use quick mode: `--quick`
3. Test single browser: `--browser chromium`

### Debug Mode
```bash
# Run with debug output
node run-section20-tests.js --debug --headed

# Generate verbose logs
DEBUG=pw:api node run-section20-tests.js
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Section 20 Tests
  run: |
    npm install @playwright/test
    npx playwright install
    node run-section20-tests.js --browser chromium
    
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: section20-test-results
    path: test-results/
```

### Test Metrics for CI
- **Pass Rate Threshold**: 95%
- **Performance Threshold**: <30 seconds total
- **Coverage Threshold**: 90% of fields tested

## Contributing

### Adding New Tests
1. Follow existing test patterns in `section20-*.spec.ts`
2. Use `TestDataGenerators` for consistent test data
3. Add field selectors to `FieldSelectors` utilities
4. Update documentation for new test scenarios

### Field Mapping Updates
1. Update `api/sections-references/section-20.json` if needed
2. Regenerate field mappings with global setup
3. Verify field count matches expected 790 total
4. Test new field types with appropriate test strategies

## Support

For issues with the Section 20 testing suite:
1. Check this README for common solutions
2. Review test logs in `test-results/`
3. Run debug mode for detailed output
4. Verify field mapping consistency

---

**Last Updated**: December 2024  
**Test Suite Version**: 1.0  
**Total Fields Covered**: 790/790 (100%)
