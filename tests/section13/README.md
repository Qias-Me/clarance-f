# Section 13 Playwright Tests

Comprehensive test suite for Section 13: Employment Activities with console error monitoring and field validation.

## 📁 Test Files

### Core Test Files

- **`section13-comprehensive.test.ts`** - Main comprehensive tests covering all employment types
- **`section13-self-employment-unemployment.test.ts`** - Specialized tests for Sections 13A.3 and 13A.4
- **`section13-employment-issues.test.ts`** - Tests for employment record issues (13A.5) and disciplinary actions (13A.6)
- **`section13-validation-edge-cases.test.ts`** - Field validation, edge cases, and error handling
- **`section13-test-runner.test.ts`** - Test suite runner with comprehensive reporting

## 🎯 Test Coverage

### Employment Types Tested
- **Section 13A.1**: Military/Federal Employment
  - Active Military Duty
  - Federal Civilian Employment
  - Duty stations, rank/title, APO/FPO addresses
  - DSN phone numbers and extensions

- **Section 13A.2**: Non-Federal Employment
  - Private Company Employment
  - State Government Employment
  - Additional employment periods
  - Physical work addresses

- **Section 13A.3**: Self-Employment
  - Business information and addresses
  - Verifier contact details
  - Business type and position information

- **Section 13A.4**: Unemployment
  - Unemployment periods
  - Reference contact verification
  - Unemployment guidelines

- **Section 13A.5**: Employment Record Issues
  - Fired from job scenarios
  - Quit after being told scenarios
  - Mutual agreement departures
  - Allegations and charges

- **Section 13A.6**: Disciplinary Actions
  - Written warnings
  - Warning dates and reasons
  - Multiple disciplinary actions

### Field Types Tested
- ✅ **Date Fields**: MM/YYYY format with estimation checkboxes
- ✅ **Phone Fields**: Numbers with extensions, DSN/Day/Night flags
- ✅ **Address Fields**: Street, city, state, ZIP with validation
- ✅ **Text Fields**: Names, titles, business types, explanations
- ✅ **Selection Fields**: Employment status, states, countries
- ✅ **Radio Buttons**: Yes/No questions, contact permissions
- ✅ **Checkboxes**: Estimated dates, present employment, APO/FPO
- ✅ **Textareas**: Long explanations, reasons, descriptions

## 🔍 Console Error Monitoring

All tests include comprehensive console error monitoring:

```typescript
// Error tracking
let consoleErrors: string[] = [];
let consoleWarnings: string[] = [];

// Console monitoring setup
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(`ERROR: ${msg.text()}`);
    console.log(`🔴 Console Error: ${msg.text()}`);
  }
  // ... warning and log handling
});
```

### Error Categories Monitored
- **JavaScript Errors**: Runtime errors, undefined variables
- **React Errors**: Component rendering issues, hook problems
- **Validation Errors**: Field validation failures
- **Network Errors**: API call failures, timeout issues
- **Page Errors**: Navigation and loading problems

## 🚀 Running the Tests

### Run All Section 13 Tests
```bash
npx playwright test tests/section13/
```

### Run Specific Test Files
```bash
# Comprehensive tests
npx playwright test tests/section13/section13-comprehensive.test.ts

# Self-employment and unemployment
npx playwright test tests/section13/section13-self-employment-unemployment.test.ts

# Employment issues
npx playwright test tests/section13/section13-employment-issues.test.ts

# Validation and edge cases
npx playwright test tests/section13/section13-validation-edge-cases.test.ts

# Test runner with reporting
npx playwright test tests/section13/section13-test-runner.test.ts
```

### Run with Console Output
```bash
npx playwright test tests/section13/ --reporter=line
```

### Run in Debug Mode
```bash
npx playwright test tests/section13/ --debug
```

## 📊 Test Data

### Sample Test Data Used

```typescript
const MILITARY_EMPLOYMENT_DATA = {
  fromDate: '01/2020',
  toDate: '12/2023',
  rankTitle: 'Captain',
  dutyStation: 'Fort Bragg',
  dutyStreet: '123 Military Base Rd',
  dutyCity: 'Fayetteville',
  dutyState: 'NC',
  dutyZip: '28310',
  phone: '(910) 555-0123',
  extension: '4567',
  supervisorName: 'Major John Smith',
  supervisorTitle: 'Battalion Commander'
};

const SELF_EMPLOYMENT_DATA = {
  businessName: 'Smith Consulting LLC',
  positionTitle: 'Owner/Consultant',
  businessType: 'Technology Consulting',
  verifierFirstName: 'Michael',
  verifierLastName: 'Brown'
};
```

## 🧪 Test Scenarios

### Basic Functionality Tests
- ✅ Form loading without errors
- ✅ Employment type selection
- ✅ Adding/removing employment entries
- ✅ Field validation and error display
- ✅ Data persistence and saving

### Advanced Interaction Tests
- ✅ Multiple employment entries
- ✅ Employment type switching
- ✅ Conditional field display
- ✅ APO/FPO address handling
- ✅ Supervisor contact restrictions

### Edge Case Tests
- ✅ Invalid date formats
- ✅ Long text inputs (1000+ characters)
- ✅ Special characters and Unicode
- ✅ SQL injection prevention
- ✅ XSS attempt handling
- ✅ Rapid form interactions
- ✅ Browser navigation handling

### Integration Tests
- ✅ PDF generation with Section 13 data
- ✅ Context state management
- ✅ Field mapping verification
- ✅ Complete workflow testing

## 📈 Expected Results

### Successful Test Run Output
```
🚀 STARTING SECTION 13 COMPREHENSIVE TEST SUITE
============================================================
📋 Test Coverage:
  • Employment Type Selection
  • Military Employment (13A.1)
  • Non-Federal Employment (13A.2)
  • Self-Employment (13A.3)
  • Unemployment (13A.4)
  • Employment Issues (13A.5)
  • Disciplinary Actions (13A.6)
  • Field Validation & Edge Cases
  • PDF Generation Integration
============================================================

✅ NO CONSOLE ERRORS OR WARNINGS DETECTED

📊 SECTION 13 TEST SUITE SUMMARY
============================================================
📈 Test Results:
  ✅ Passed: 25/25
  ❌ Failed: 0/25
  ⏭️  Skipped: 0/25

🎯 Field Interaction Summary:
  📝 Total Fields Interacted: 1,086
  📊 Average Fields per Test: 43

✅ NO CONSOLE ERRORS OR WARNINGS DETECTED ACROSS ALL TESTS

🎉 SECTION 13 TEST SUITE COMPLETED
============================================================
```

## 🔧 Troubleshooting

### Common Issues

1. **Test Timeouts**
   - Increase timeout values for slow form interactions
   - Check network connectivity for page loads

2. **Element Not Found**
   - Verify component structure matches selectors
   - Check if elements are conditionally rendered

3. **Console Errors**
   - Review error messages for validation vs. JavaScript errors
   - Check field mappings and context implementation

### Debug Commands
```bash
# Run single test with debug
npx playwright test tests/section13/section13-comprehensive.test.ts --debug

# Run with headed browser
npx playwright test tests/section13/ --headed

# Generate test report
npx playwright test tests/section13/ --reporter=html
```

## 📝 Test Maintenance

### Adding New Tests
1. Follow existing test structure and naming conventions
2. Include console error monitoring in all new tests
3. Add comprehensive field interaction coverage
4. Update this README with new test descriptions

### Updating Test Data
1. Modify test data constants at the top of each file
2. Ensure data covers edge cases and validation scenarios
3. Test with both valid and invalid data inputs

### Field Mapping Updates
When interface fields change:
1. Update field selectors in test files
2. Verify field mappings match reference data
3. Run full test suite to catch breaking changes

## 🎯 Coverage Goals

- **Field Coverage**: 100% of all 1,086 Section 13 fields
- **Employment Types**: All 6 subsections (13A.1-13A.6)
- **Validation**: All required field validations
- **Edge Cases**: Invalid inputs, special characters, long text
- **Integration**: PDF generation and context state management
- **Error Monitoring**: Zero console errors during normal operation
