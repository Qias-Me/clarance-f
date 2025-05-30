/**
 * Playwright Configuration for Scalable Architecture Tests
 * 
 * Specialized configuration for testing the scalable SF-86 form architecture
 * including SF86FormContext, section integration, and cross-section functionality.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory for scalable architecture tests
  testDir: './tests/scalable-architecture',
  
  // Global test timeout (increased for complex integration tests)
  timeout: 60000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 10000
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests for complex integration scenarios
  workers: process.env.CI ? 2 : 1,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/scalable-architecture-html' }],
    ['json', { outputFile: 'test-results/scalable-architecture-results.json' }],
    ['junit', { outputFile: 'test-results/scalable-architecture-junit.xml' }],
    ['list']
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),
  
  // Shared settings for all tests
  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    
    // Collect trace on failure for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording for failed tests
    video: 'retain-on-failure',
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    
    // Extended timeout for actions (for complex form operations)
    actionTimeout: 15000,
    
    // Extended timeout for navigation (for loading complex forms)
    navigationTimeout: 30000,
    
    // Locale for testing
    locale: 'en-US',
    
    // Timezone for testing
    timezoneId: 'America/New_York',
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  },

  // Test projects for different scenarios
  projects: [
    // ============================================================================
    // CORE ARCHITECTURE TESTS
    // ============================================================================
    
    {
      name: 'sf86-form-context',
      testMatch: '**/sf86-form-context.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Specific settings for SF86FormContext tests
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      dependencies: ['setup']
    },
    
    {
      name: 'section-integration',
      testMatch: '**/section-integration.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Settings for section integration tests
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      dependencies: ['setup']
    },
    
    {
      name: 'cross-section-functionality',
      testMatch: '**/cross-section-functionality.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Settings for cross-section tests
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      dependencies: ['setup']
    },
    
    // ============================================================================
    // BROWSER COMPATIBILITY TESTS
    // ============================================================================
    
    {
      name: 'chromium-scalable-architecture',
      testMatch: '**/scalable-architecture/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup']
    },
    
    {
      name: 'firefox-scalable-architecture',
      testMatch: '**/scalable-architecture/**/*.spec.ts',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup']
    },
    
    {
      name: 'webkit-scalable-architecture',
      testMatch: '**/scalable-architecture/**/*.spec.ts',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup']
    },
    
    // ============================================================================
    // MOBILE COMPATIBILITY TESTS
    // ============================================================================
    
    {
      name: 'mobile-chrome-scalable-architecture',
      testMatch: '**/scalable-architecture/**/*.spec.ts',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup']
    },
    
    {
      name: 'mobile-safari-scalable-architecture',
      testMatch: '**/scalable-architecture/**/*.spec.ts',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup']
    },
    
    // ============================================================================
    // PERFORMANCE TESTS
    // ============================================================================
    
    {
      name: 'performance-tests',
      testMatch: '**/performance/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Performance-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      timeout: 120000, // Extended timeout for performance tests
      dependencies: ['setup']
    },
    
    // ============================================================================
    // ACCESSIBILITY TESTS
    // ============================================================================
    
    {
      name: 'accessibility-tests',
      testMatch: '**/accessibility/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Accessibility-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      dependencies: ['setup']
    },
    
    // ============================================================================
    // SETUP PROJECT
    // ============================================================================
    
    {
      name: 'setup',
      testMatch: '**/setup/**/*.setup.ts',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  // ============================================================================
  // TEST CONFIGURATION
  // ============================================================================
  
  // Output directory for test results
  outputDir: 'test-results/scalable-architecture',
  
  // Test metadata
  metadata: {
    testType: 'scalable-architecture',
    version: '1.0.0',
    description: 'Comprehensive tests for SF-86 scalable form architecture'
  },
  
  // Web server configuration for local testing
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  
  // Test filtering
  grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,
  grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined,
  
  // Test sharding for CI
  shard: process.env.CI ? {
    current: parseInt(process.env.SHARD_INDEX || '1'),
    total: parseInt(process.env.SHARD_TOTAL || '1')
  } : undefined
});

// ============================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Development environment configuration
 */
export const developmentConfig = defineConfig({
  ...module.exports,
  use: {
    ...module.exports.use,
    // Development-specific settings
    headless: false,
    slowMo: 100,
    video: 'on',
    trace: 'on'
  },
  workers: 1,
  retries: 0
});

/**
 * CI environment configuration
 */
export const ciConfig = defineConfig({
  ...module.exports,
  use: {
    ...module.exports.use,
    // CI-specific settings
    headless: true,
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  workers: 4,
  retries: 2,
  reporter: [
    ['github'],
    ['html', { outputFolder: 'test-results/scalable-architecture-html' }],
    ['junit', { outputFile: 'test-results/scalable-architecture-junit.xml' }]
  ]
});

/**
 * Production testing configuration
 */
export const productionConfig = defineConfig({
  ...module.exports,
  use: {
    ...module.exports.use,
    // Production-specific settings
    baseURL: process.env.PRODUCTION_URL || 'https://sf86-form.production.com',
    headless: true,
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  timeout: 90000,
  expect: {
    timeout: 15000
  },
  workers: 2,
  retries: 3
});

// ============================================================================
// TEST TAGS AND ANNOTATIONS
// ============================================================================

/**
 * Test tags for organizing and filtering tests
 */
export const TEST_TAGS = {
  // Core functionality tags
  CORE: '@core',
  INTEGRATION: '@integration',
  PERFORMANCE: '@performance',
  ACCESSIBILITY: '@accessibility',
  
  // Architecture component tags
  SF86_FORM_CONTEXT: '@sf86-form-context',
  SECTION_INTEGRATION: '@section-integration',
  CROSS_SECTION: '@cross-section',
  
  // Test type tags
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  E2E: '@e2e',
  UNIT: '@unit',
  
  // Browser tags
  CHROME_ONLY: '@chrome-only',
  FIREFOX_ONLY: '@firefox-only',
  WEBKIT_ONLY: '@webkit-only',
  MOBILE_ONLY: '@mobile-only',
  
  // Environment tags
  DEV_ONLY: '@dev-only',
  CI_ONLY: '@ci-only',
  PROD_ONLY: '@prod-only',
  
  // Feature tags
  AUTO_SAVE: '@auto-save',
  VALIDATION: '@validation',
  NAVIGATION: '@navigation',
  EVENT_SYSTEM: '@event-system',
  DEPENDENCY_RESOLUTION: '@dependency-resolution'
};

/**
 * Test annotations for metadata and configuration
 */
export const TEST_ANNOTATIONS = {
  // Slow tests that need extended timeout
  SLOW: { type: 'slow', description: 'Extended timeout for complex operations' },
  
  // Tests that require specific setup
  REQUIRES_SETUP: { type: 'requires-setup', description: 'Needs specific test environment setup' },
  
  // Tests that are known to be flaky
  FLAKY: { type: 'flaky', description: 'May need retry on failure' },
  
  // Tests that are critical for release
  CRITICAL: { type: 'critical', description: 'Must pass for release' },
  
  // Tests that cover security aspects
  SECURITY: { type: 'security', description: 'Security-related functionality' },
  
  // Tests that verify data integrity
  DATA_INTEGRITY: { type: 'data-integrity', description: 'Data consistency and integrity' }
};
