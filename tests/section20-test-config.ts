/**
 * Section 20 Test Configuration
 * 
 * Configuration and utilities for testing all 790 fields in Section 20
 */

import { PlaywrightTestConfig, devices } from '@playwright/test';

// Test data generators for different field types
export const TestDataGenerators = {
  
  // Generate test data for text fields
  generateTextData: (fieldName: string, maxLength?: number): string => {
    const baseTexts = {
      description: 'Comprehensive test description for foreign activity field validation and data persistence verification',
      name: 'Test Name',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      relationship: 'Business Partner',
      circumstances: 'Detailed circumstances explaining the nature and context of this foreign activity',
      purpose: 'Business development and international expansion activities',
      default: 'Test value for field validation'
    };
    
    let text = baseTexts.default;
    
    // Match field type to appropriate text
    for (const [key, value] of Object.entries(baseTexts)) {
      if (fieldName.toLowerCase().includes(key)) {
        text = value;
        break;
      }
    }
    
    // Truncate if maxLength specified
    if (maxLength && text.length > maxLength) {
      text = text.substring(0, maxLength - 3) + '...';
    }
    
    return text;
  },

  // Generate test data for numeric fields
  generateNumericData: (fieldName: string): string => {
    const numericValues = {
      value: '50000',
      amount: '75000.50',
      cost: '25000',
      days: '30',
      count: '5',
      default: '1000'
    };
    
    for (const [key, value] of Object.entries(numericValues)) {
      if (fieldName.toLowerCase().includes(key)) {
        return value;
      }
    }
    
    return numericValues.default;
  },

  // Generate test data for date fields
  generateDateData: (fieldName: string): string => {
    const dates = {
      acquired: '2022-03-15',
      from: '2023-01-01',
      to: '2023-12-31',
      start: '2023-06-01',
      end: '2023-08-31',
      default: '2023-06-15'
    };
    
    for (const [key, value] of Object.entries(dates)) {
      if (fieldName.toLowerCase().includes(key)) {
        return value;
      }
    }
    
    return dates.default;
  },

  // Generate test data for dropdown fields
  generateDropdownData: (options: string[]): string => {
    if (!options || options.length === 0) return '';
    
    // Prefer non-default options for better testing
    const preferredOptions = ['Canada', 'United Kingdom', 'Germany', 'Japan', 'Australia'];
    
    for (const preferred of preferredOptions) {
      if (options.includes(preferred)) {
        return preferred;
      }
    }
    
    // Return second option if available, otherwise first
    return options.length > 1 ? options[1] : options[0];
  }
};

// Field selector strategies for different field types
export const FieldSelectors = {
  
  // Get selector for field by ID
  byFieldId: (fieldId: string): string => {
    const cleanId = fieldId.replace(' 0 R', '');
    return `[data-field-id="${cleanId}"]`;
  },

  // Get selector for field by test ID
  byTestId: (testId: string): string => {
    return `[data-testid="${testId}"]`;
  },

  // Get selector for field by name attribute
  byName: (name: string): string => {
    return `[name="${name}"]`;
  },

  // Get comprehensive selector (tries multiple strategies)
  comprehensive: (fieldId: string, testId?: string, name?: string): string => {
    const selectors = [];
    
    if (fieldId) {
      selectors.push(FieldSelectors.byFieldId(fieldId));
    }
    
    if (testId) {
      selectors.push(FieldSelectors.byTestId(testId));
    }
    
    if (name) {
      selectors.push(FieldSelectors.byName(name));
    }
    
    return selectors.join(', ');
  }
};

// Test execution strategies
export const TestStrategies = {
  
  // Strategy for testing large numbers of fields efficiently
  batchTesting: {
    batchSize: 50,
    delayBetweenBatches: 1000,
    timeoutPerField: 2000
  },

  // Strategy for comprehensive field validation
  comprehensiveTesting: {
    testAllFieldTypes: true,
    testDataPersistence: true,
    testValidation: true,
    testAccessibility: true
  },

  // Strategy for performance testing
  performanceTesting: {
    maxEntriesPerSubsection: 20,
    rapidChangeInterval: 50,
    memoryStressEntries: 100
  }
};

// Browser configurations for cross-browser testing
export const BrowserConfigs = {
  
  // Desktop browsers
  desktop: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],

  // Mobile browsers
  mobile: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
};

// Test reporting configuration
export const ReportingConfig = {
  
  // Generate detailed field-by-field report
  generateFieldReport: true,
  
  // Include performance metrics
  includePerformanceMetrics: true,
  
  // Include accessibility audit results
  includeAccessibilityAudit: true,
  
  // Export results to JSON for analysis
  exportToJson: true,
  
  // Report file paths
  reportPaths: {
    html: 'test-results/section20-report.html',
    json: 'test-results/section20-results.json',
    fieldDetails: 'test-results/section20-field-details.json'
  }
};

// Playwright configuration for Section 20 tests
export const section20PlaywrightConfig: PlaywrightTestConfig = {
  testDir: './tests',
  
  // Test files to include
  testMatch: [
    'section20-comprehensive.spec.ts',
    'section20-field-types.spec.ts',
    'section20-edge-cases.spec.ts'
  ],
  
  // Global timeout settings
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  
  // Retry configuration
  retries: process.env.CI ? 2 : 1,
  
  // Parallel execution
  workers: process.env.CI ? 2 : 4,
  
  // Browser projects
  projects: [
    ...BrowserConfigs.desktop,
    // Uncomment for mobile testing
    // ...BrowserConfigs.mobile
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./section20-global-setup.ts'),
  globalTeardown: require.resolve('./section20-global-teardown.ts'),
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: ReportingConfig.reportPaths.html }],
    ['json', { outputFile: ReportingConfig.reportPaths.json }],
    ['list'],
    ['junit', { outputFile: 'test-results/section20-junit.xml' }]
  ],
  
  // Use configuration
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Tracing
    trace: 'retain-on-failure'
  },
  
  // Output directory
  outputDir: 'test-results/section20-artifacts'
};

// Utility functions for test execution
export const TestUtils = {
  
  // Wait for field to be ready for interaction
  waitForFieldReady: async (page: any, selector: string, timeout = 5000): Promise<boolean> => {
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      await page.waitForFunction(
        (sel) => {
          const element = document.querySelector(sel);
          return element && !element.disabled && !element.readOnly;
        },
        selector,
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  },

  // Safely interact with field
  safeFieldInteraction: async (page: any, selector: string, action: string, value?: any): Promise<boolean> => {
    try {
      const isReady = await TestUtils.waitForFieldReady(page, selector);
      if (!isReady) return false;

      const element = page.locator(selector).first();
      
      switch (action) {
        case 'fill':
          await element.fill(value);
          break;
        case 'select':
          await element.selectOption(value);
          break;
        case 'check':
          await element.check();
          break;
        case 'uncheck':
          await element.uncheck();
          break;
        case 'click':
          await element.click();
          break;
        default:
          return false;
      }
      
      return true;
    } catch {
      return false;
    }
  },

  // Generate test report for field
  generateFieldTestReport: (fieldId: string, fieldName: string, testResults: any): any => {
    return {
      fieldId,
      fieldName,
      timestamp: new Date().toISOString(),
      testResults,
      success: testResults.every((result: any) => result.success),
      duration: testResults.reduce((total: number, result: any) => total + (result.duration || 0), 0)
    };
  }
};

export default section20PlaywrightConfig;
