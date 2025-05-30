# Scalable Architecture Testing Guide

Comprehensive guide for testing the scalable SF-86 form architecture including SF86FormContext, section integration, cross-section functionality, and performance validation.

## 🎯 Testing Overview

The scalable architecture testing framework provides comprehensive coverage for:
- **SF86FormContext**: Central form coordinator and global state management
- **Section Integration**: Bidirectional data sync and event-driven communication
- **Cross-Section Functionality**: Navigation, dependencies, and coordination
- **Performance**: Memory management, scalability, and responsiveness
- **Error Handling**: Graceful degradation and recovery mechanisms

## 📋 Test Structure

### Test Categories

```
tests/scalable-architecture/
├── sf86-form-context.spec.ts          # Central form coordinator tests
├── section-integration.spec.ts        # Section integration framework tests
├── cross-section-functionality.spec.ts # Cross-section coordination tests
├── performance/                        # Performance and scalability tests
├── accessibility/                      # Accessibility compliance tests
├── fixtures/                          # Test utilities and fixtures
└── setup/                             # Test environment setup
```

### Test Fixtures

```typescript
import { test, expect } from '../fixtures/scalable-architecture-fixtures';

test('should integrate sections with central form', async ({ 
  sf86FormUtils, 
  sectionIntegrationUtils 
}) => {
  await sf86FormUtils.navigateToTestPage();
  await sectionIntegrationUtils.testBidirectionalSync('section29');
  // Test implementation
});
```

## 🧪 Running Tests

### Basic Test Execution

```bash
# Run all scalable architecture tests
npm run test:scalable-architecture

# Run specific test category
npm run test:sf86-form-context
npm run test:section-integration
npm run test:cross-section

# Run with specific browser
npm run test:scalable-architecture -- --project=chromium-scalable-architecture
npm run test:scalable-architecture -- --project=firefox-scalable-architecture
npm run test:scalable-architecture -- --project=webkit-scalable-architecture
```

### Test Filtering

```bash
# Run tests with specific tags
npm run test:scalable-architecture -- --grep "@core"
npm run test:scalable-architecture -- --grep "@integration"
npm run test:scalable-architecture -- --grep "@performance"

# Run smoke tests only
npm run test:scalable-architecture -- --grep "@smoke"

# Exclude slow tests
npm run test:scalable-architecture -- --grep-invert "@slow"
```

### Environment-Specific Testing

```bash
# Development environment
npm run test:dev

# CI environment
npm run test:ci

# Production environment
npm run test:prod
```

## 🔧 Test Configuration

### Playwright Configuration

```typescript
// tests/scalable-architecture/playwright.config.ts
export default defineConfig({
  testDir: './tests/scalable-architecture',
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: process.env.CI ? 2 : 1,
  
  projects: [
    {
      name: 'sf86-form-context',
      testMatch: '**/sf86-form-context.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'section-integration',
      testMatch: '**/section-integration.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
```

### Test Environment Setup

```typescript
// tests/scalable-architecture/setup/global-setup.ts
export default async function globalSetup() {
  // Initialize test database
  await initializeTestDatabase();
  
  // Set up test data
  await seedTestData();
  
  // Configure test environment
  await configureTestEnvironment();
}
```

## 📊 Test Categories

### 1. SF86FormContext Tests

**Purpose**: Test central form coordinator functionality

**Key Test Areas**:
- Global form state management
- Section registration and coordination
- Data persistence and auto-save
- Global validation coordination
- Navigation and section tracking

**Example Test**:
```typescript
test('should coordinate validation across all sections', async ({ sf86FormUtils }) => {
  await sf86FormUtils.navigateToTestPage();
  
  // Add invalid data to multiple sections
  await sf86FormUtils.addInvalidData(['section7', 'section13', 'section29']);
  
  // Trigger global validation
  const result = await sf86FormUtils.triggerGlobalValidation();
  
  // Should collect errors from all sections
  expect(result.isValid).toBe(false);
  expect(result.errors).toHaveLength(3);
});
```

### 2. Section Integration Tests

**Purpose**: Test section integration framework

**Key Test Areas**:
- Bidirectional data synchronization
- Integration hook functionality
- Event-driven communication
- Change notification system
- Validation integration

**Example Test**:
```typescript
test('should sync section data bidirectionally', async ({ sectionIntegrationUtils }) => {
  await sectionIntegrationUtils.navigateToTestPage();
  
  // Test bidirectional sync
  const syncResult = await sectionIntegrationUtils.testBidirectionalSync('section29');
  
  expect(syncResult.sectionToCentral).toBe(true);
  expect(syncResult.centralToSection).toBe(true);
});
```

### 3. Cross-Section Functionality Tests

**Purpose**: Test cross-section coordination and dependencies

**Key Test Areas**:
- Section navigation and flow
- Cross-section data dependencies
- Event-driven communication
- Global form state coordination
- Performance and scalability

**Example Test**:
```typescript
test('should handle section dependencies correctly', async ({ crossSectionUtils }) => {
  await crossSectionUtils.navigateToTestPage();
  
  // Set up dependency chain
  await crossSectionUtils.setupDependencyChain([
    { from: 'section29', to: 'section30', condition: 'terrorism_associations' }
  ]);
  
  // Check dependencies are enforced
  const dependencies = await crossSectionUtils.checkDependencies('section30');
  expect(dependencies).toContain('section29');
});
```

### 4. Performance Tests

**Purpose**: Test performance and scalability

**Key Test Areas**:
- Memory management
- Rapid update handling
- Large dataset processing
- Multi-section coordination
- Response time validation

**Example Test**:
```typescript
test('should handle rapid updates efficiently', async ({ page }) => {
  const startTime = Date.now();
  
  // Perform 100 rapid updates
  for (let i = 0; i < 100; i++) {
    await page.evaluate(() => window.rapidUpdate());
  }
  
  const endTime = Date.now();
  expect(endTime - startTime).toBeLessThan(3000);
});
```

### 5. Error Handling Tests

**Purpose**: Test error handling and recovery

**Key Test Areas**:
- Integration failure handling
- Communication error recovery
- Data corruption recovery
- Graceful degradation
- Fallback functionality

**Example Test**:
```typescript
test('should handle integration failures gracefully', async ({ page }) => {
  // Mock integration failure
  await page.evaluate(() => {
    window.mockIntegrationFailure = true;
  });
  
  // Try integration operation
  await page.click('[data-testid="integration-operation"]');
  
  // Should handle gracefully
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="fallback-ui"]')).toBeVisible();
});
```

## 🎯 Test Best Practices

### 1. Test Organization

```typescript
test.describe('Feature Group', () => {
  test.beforeEach(async ({ page }) => {
    // Common setup for all tests in group
    await page.goto('/test-page');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Specific Functionality', () => {
    test('should do specific thing', async ({ page }) => {
      // Test implementation
    });
  });
});
```

### 2. Data Management

```typescript
test('should handle test data correctly', async ({ page }) => {
  // Use test fixtures for consistent data
  const testData = SCALABLE_ARCHITECTURE_TEST_DATA.SAMPLE_FORM_DATA;
  
  // Set up test data
  await page.evaluate((data) => {
    window.setTestData(data);
  }, testData);
  
  // Clean up after test
  await page.evaluate(() => {
    window.clearTestData();
  });
});
```

### 3. Assertions

```typescript
test('should validate complex state', async ({ sf86FormUtils }) => {
  // Use specific assertions for complex objects
  const formState = await sf86FormUtils.getGlobalFormState();
  
  expect(formState).toMatchObject({
    isDirty: true,
    isValid: false,
    completedSections: expect.arrayContaining(['section29'])
  });
  
  // Use custom matchers for domain-specific validation
  expect(formState).toHaveValidSectionStructure();
});
```

### 4. Error Handling

```typescript
test('should handle errors appropriately', async ({ page }) => {
  // Test error scenarios explicitly
  await page.route('**/api/save', route => {
    route.fulfill({ status: 500, body: 'Server Error' });
  });
  
  await page.click('[data-testid="save-button"]');
  
  // Verify error handling
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
});
```

### 5. Performance Testing

```typescript
test('should meet performance requirements', async ({ page }) => {
  // Measure performance
  const startTime = Date.now();
  
  await page.click('[data-testid="complex-operation"]');
  await page.waitForSelector('[data-testid="operation-complete"]');
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Assert performance requirements
  expect(duration).toBeLessThan(5000); // 5 second max
  
  // Check memory usage if available
  const memoryInfo = await page.evaluate(() => {
    return (performance as any).memory;
  });
  
  if (memoryInfo) {
    expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // 100MB max
  }
});
```

## 📈 Test Reporting

### HTML Reports

```bash
# Generate HTML report
npm run test:scalable-architecture -- --reporter=html

# Open report
npx playwright show-report test-results/scalable-architecture-html
```

### CI Integration

```yaml
# .github/workflows/scalable-architecture-tests.yml
name: Scalable Architecture Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run scalable architecture tests
        run: npm run test:scalable-architecture
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: scalable-architecture-test-results
          path: test-results/
```

### Test Metrics

```typescript
// Custom test metrics collection
test.afterEach(async ({ page }, testInfo) => {
  // Collect performance metrics
  const metrics = await page.evaluate(() => {
    return {
      memory: (performance as any).memory,
      timing: performance.timing,
      navigation: performance.navigation
    };
  });
  
  // Attach metrics to test results
  await testInfo.attach('performance-metrics', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json'
  });
});
```

## 🔍 Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:scalable-architecture -- --debug

# Run specific test in debug mode
npm run test:scalable-architecture -- --debug --grep "specific test name"
```

### Visual Debugging

```typescript
test('debug visual issues', async ({ page }) => {
  // Take screenshots at key points
  await page.screenshot({ path: 'debug-before.png' });
  
  await page.click('[data-testid="action-button"]');
  
  await page.screenshot({ path: 'debug-after.png' });
  
  // Use trace viewer for detailed debugging
  await page.pause(); // Pauses execution for manual inspection
});
```

### Console Logging

```typescript
test('debug with console logs', async ({ page }) => {
  // Listen to console messages
  page.on('console', msg => {
    console.log(`Browser console: ${msg.text()}`);
  });
  
  // Add custom logging
  await page.evaluate(() => {
    console.log('Test checkpoint reached');
  });
});
```

## ✅ Test Checklist

### Before Running Tests
- [ ] **Environment Setup**: Test environment is properly configured
- [ ] **Dependencies**: All required dependencies are installed
- [ ] **Test Data**: Test data is properly seeded
- [ ] **Browser Installation**: Playwright browsers are installed

### Test Execution
- [ ] **Core Tests**: SF86FormContext tests pass
- [ ] **Integration Tests**: Section integration tests pass
- [ ] **Cross-Section Tests**: Cross-section functionality tests pass
- [ ] **Performance Tests**: Performance requirements are met
- [ ] **Error Handling**: Error scenarios are properly handled

### After Testing
- [ ] **Results Review**: Test results are reviewed and analyzed
- [ ] **Coverage Check**: Code coverage meets requirements
- [ ] **Performance Analysis**: Performance metrics are within limits
- [ ] **Error Investigation**: Any failures are investigated and resolved

## 🚀 Continuous Improvement

### Test Maintenance
- Regularly update test data and scenarios
- Add new tests for new features
- Refactor tests for better maintainability
- Update test documentation

### Performance Monitoring
- Monitor test execution times
- Track memory usage patterns
- Identify and optimize slow tests
- Set up performance regression alerts

### Quality Assurance
- Regular test review and cleanup
- Ensure test reliability and stability
- Maintain high test coverage
- Document test patterns and best practices

This comprehensive testing framework ensures the scalable SF-86 form architecture is thoroughly validated, performant, and reliable across all supported environments and use cases.
