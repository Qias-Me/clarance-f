# Section 18 - Comprehensive Playwright Tests

This directory contains comprehensive Playwright tests for Section 18 (Relatives and Associates) of the SF-86 form, covering all 964 fields across 6 relative entries.

## Test Coverage

### Section 18.1 - Basic Relative Information
- **File**: `section18-basic-info.test.ts`
- **Coverage**: 
  - Basic relative information (name, relationship, citizenship, birth info)
  - Other names functionality (4 entries per relative)
  - Mother's maiden name
  - Date validation and estimates
  - Field interactions and conditional logic

### Section 18.2 - Current Address
- **File**: `section18-current-address.test.ts`
- **Coverage**:
  - Current address information
  - APO/FPO address support
  - Date ranges and estimates
  - Address validation
  - Multiple relatives address entries

### Section 18.3 - Contact Information and Foreign Relations
- **File**: `section18-contact-foreign-relations.test.ts`
- **Coverage**:
  - Contact methods (Section 18.5 functionality)
  - Contact frequency (Section 18.5 functionality)
  - Documentation types (Section 18.4 functionality)
  - Employment information
  - Foreign government relations
  - Contact dates (Section 18.5 functionality)
  - Field interactions and conditional logic

### Comprehensive Integration Tests
- **File**: `section18-comprehensive-integration.test.ts`
- **Coverage**:
  - Complete workflow for multiple relatives
  - PDF generation with all Section 18 data
  - Console error monitoring
  - Performance testing with all 964 fields
  - Data persistence across subsections

## Features Tested

### Core Functionality
- ✅ All 964 Section 18 fields
- ✅ 6 relative entries support
- ✅ 3 subsections (18.1, 18.2, 18.3)
- ✅ Embedded 18.4 and 18.5 functionality within 18.3
- ✅ Other names (4 entries per relative)
- ✅ APO/FPO address support
- ✅ Date validation and estimates
- ✅ Conditional field logic
- ✅ Data persistence across tabs/sections

### Error Monitoring
- ✅ Console error detection
- ✅ Page error monitoring
- ✅ Request failure tracking
- ✅ Warning detection
- ✅ Performance monitoring

### PDF Generation
- ✅ Complete PDF generation with all field values
- ✅ Field mapping validation
- ✅ PDF download verification

## Running the Tests

### Prerequisites
1. Ensure the application is running on `http://localhost:3000`
2. Install Playwright dependencies:
   ```bash
   npm install @playwright/test
   npx playwright install
   ```

### Quick Start
```bash
# Run all Section 18 tests
npm run test:section18

# Or using the test runner directly
npx ts-node tests/section18/run-section18-tests.ts
```

### Specific Test Suites

#### Run Basic Information Tests (18.1)
```bash
npx ts-node tests/section18/run-section18-tests.ts --basic-info
```

#### Run Current Address Tests (18.2)
```bash
npx ts-node tests/section18/run-section18-tests.ts --current-address
```

#### Run Contact & Foreign Relations Tests (18.3)
```bash
npx ts-node tests/section18/run-section18-tests.ts --contact-foreign
```

#### Run Integration Tests
```bash
npx ts-node tests/section18/run-section18-tests.ts --integration
```

### Browser Options
```bash
# Run in headed mode (visible browser)
npx ts-node tests/section18/run-section18-tests.ts --headed

# Run in debug mode
npx ts-node tests/section18/run-section18-tests.ts --debug

# Run with specific browser
npx ts-node tests/section18/run-section18-tests.ts --browser firefox
npx ts-node tests/section18/run-section18-tests.ts --browser webkit
```

### Advanced Options
```bash
# Run with custom timeout (in milliseconds)
npx ts-node tests/section18/run-section18-tests.ts --timeout 180000

# Run with specific number of workers
npx ts-node tests/section18/run-section18-tests.ts --workers 2

# Run with retries
npx ts-node tests/section18/run-section18-tests.ts --retries 2

# Run specific test pattern
npx ts-node tests/section18/run-section18-tests.ts --grep "should fill out basic relative information"
```

### Using Playwright CLI Directly
```bash
# Run all tests
npx playwright test tests/section18 --config tests/section18/playwright.config.ts

# Run specific test file
npx playwright test tests/section18/section18-basic-info.test.ts

# Run in headed mode
npx playwright test tests/section18 --headed

# Run with HTML reporter
npx playwright test tests/section18 --reporter html
```

## Test Results and Reporting

### Output Directories
- **Test Results**: `test-results/section18/`
- **HTML Report**: `test-results/section18-html-report/`
- **Console Logs**: `test-results/section18/console-logs/`
- **Screenshots**: `test-results/section18/screenshots/`
- **Videos**: `test-results/section18/videos/`

### Generated Reports
- **final-report.json**: Comprehensive test results with performance metrics
- **test-summary.json**: Test execution summary
- **execution-report.json**: Test runner execution details
- **README.md**: Human-readable test results summary

### Viewing Results
```bash
# Open HTML report
npx playwright show-report test-results/section18-html-report

# View JSON results
cat test-results/section18/final-report.json | jq .

# View human-readable summary
cat test-results/section18/README.md
```

## Console Error Monitoring

The tests include comprehensive console error monitoring:

### Error Types Monitored
- **Console Errors**: JavaScript errors logged to console
- **Page Errors**: Unhandled page exceptions
- **Request Failures**: Failed network requests
- **Console Warnings**: Warning messages

### Error Reporting
- All errors are logged in real-time during test execution
- Final error summary is included in test reports
- Critical errors cause test failures
- Non-critical errors (favicon, 404s) are filtered out

### Example Error Output
```
🔴 Console Error: [error] TypeError: Cannot read property 'value' of null
🔴 Page Error: [PAGE ERROR] ReferenceError: undefinedVariable is not defined
🔴 Request Failed: [REQUEST FAILED] http://localhost:3000/api/invalid - net::ERR_FAILED
```

## Performance Testing

### Metrics Collected
- **Total Execution Time**: Time to complete all tests
- **Average Test Time**: Average time per test
- **Field Interaction Time**: Average time per field interaction
- **PDF Generation Time**: Time to generate PDF with all data

### Performance Assertions
- Complete Section 18 workflow should finish within 60 seconds
- Individual field interactions should complete within 30 seconds
- PDF generation should complete within 30 seconds

### Performance Report Example
```
⏱️ Total time to fill Section 18: 45,230ms
📊 Average time per field: 46.92ms
📈 PDF generation time: 8,450ms
```

## Troubleshooting

### Common Issues

#### Application Not Running
```
Error: page.goto: net::ERR_CONNECTION_REFUSED
```
**Solution**: Ensure the application is running on `http://localhost:3000`

#### Timeout Errors
```
Error: Timeout 30000ms exceeded
```
**Solution**: Increase timeout with `--timeout 60000` or check application performance

#### Element Not Found
```
Error: locator.click: Target closed
```
**Solution**: Check if the correct data-testid attributes are present in the UI

#### Browser Not Installed
```
Error: Executable doesn't exist
```
**Solution**: Run `npx playwright install`

### Debug Mode
Run tests in debug mode to step through interactions:
```bash
npx ts-node tests/section18/run-section18-tests.ts --debug
```

### Verbose Logging
Enable verbose console logging by setting environment variable:
```bash
DEBUG=pw:api npx playwright test tests/section18
```

## Contributing

### Adding New Tests
1. Create test files in the `tests/section18/` directory
2. Follow the existing naming convention: `section18-{feature}.test.ts`
3. Include comprehensive console error monitoring
4. Add performance assertions for complex workflows
5. Update this README with new test coverage

### Test Data
- Test data is defined at the top of each test file
- Use realistic but non-sensitive data
- Include edge cases and validation scenarios
- Test both valid and invalid input scenarios

### Best Practices
- Always include console error monitoring
- Use descriptive test names and console logging
- Test both positive and negative scenarios
- Include performance assertions for complex operations
- Verify data persistence across UI interactions
- Test conditional field logic thoroughly

## Architecture

### Test Structure
```
tests/section18/
├── section18-basic-info.test.ts           # Section 18.1 tests
├── section18-current-address.test.ts      # Section 18.2 tests
├── section18-contact-foreign-relations.test.ts # Section 18.3 tests
├── section18-comprehensive-integration.test.ts # Integration tests
├── playwright.config.ts                   # Playwright configuration
├── global-setup.ts                       # Global test setup
├── global-teardown.ts                    # Global test teardown
├── run-section18-tests.ts                # Test runner script
└── README.md                             # This file
```

### Configuration
- **Timeout**: 120 seconds for complex operations
- **Retries**: Configurable (default: 0 for local, 2 for CI)
- **Workers**: Configurable (default: 1 for stability)
- **Browsers**: Chrome, Firefox, Safari, Edge support
- **Mobile**: Mobile Chrome and Safari testing

This comprehensive test suite ensures that all Section 18 functionality works correctly across different browsers and scenarios while monitoring for any console errors or performance issues.
