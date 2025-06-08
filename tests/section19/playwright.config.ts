/**
 * Playwright Configuration for Section 19 Tests
 * 
 * Optimized configuration for testing all 277 fields across 4 subsections
 * with comprehensive console monitoring and error detection
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  
  // Test execution settings
  fullyParallel: false, // Run tests sequentially to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 1, // Single worker for stability
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/section19-html-report' }],
    ['json', { outputFile: 'test-results/section19-results.json' }],
    ['list'],
    ['junit', { outputFile: 'test-results/section19-junit.xml' }]
  ],
  
  // Global test settings
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Browser settings
    headless: process.env.CI ? true : false,
    viewport: { width: 1920, height: 1080 },
    
    // Interaction settings
    actionTimeout: 30000,
    navigationTimeout: 60000,
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Console and network monitoring
    launchOptions: {
      slowMo: process.env.CI ? 0 : 100, // Slow down for better observation
    }
  },

  // Test timeout settings
  timeout: 300000, // 5 minutes per test (comprehensive field testing)
  expect: {
    timeout: 10000
  },

  // Project configurations
  projects: [
    {
      name: 'section19-comprehensive',
      testMatch: 'section19-comprehensive.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // Extended timeout for comprehensive tests
        actionTimeout: 45000,
      },
    },
    {
      name: 'section19-pdf-generation',
      testMatch: 'section19-pdf-generation.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // Even longer timeout for PDF generation
        actionTimeout: 60000,
      },
    },
    {
      name: 'section19-field-validation',
      testMatch: 'section19-field-*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        actionTimeout: 30000,
      },
    }
  ],

  // Output directories
  outputDir: 'test-results/section19-artifacts',
  
  // Global setup and teardown
  globalSetup: require.resolve('./section19-global-setup.ts'),
  globalTeardown: require.resolve('./section19-global-teardown.ts'),
});
