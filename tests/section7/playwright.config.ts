/**
 * Playwright Configuration for Section 7 Tests
 *
 * Specialized configuration for testing Section 7 (Where You Have Lived)
 * implementation with comprehensive browser coverage and performance monitoring.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory for Section 7 tests
  testDir: '.',

  // Global test timeout (increased for complex form operations)
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
    ['html', { outputFolder: 'test-results/section7-html' }],
    ['json', { outputFile: 'test-results/section7-results.json' }],
    ['junit', { outputFile: 'test-results/section7-junit.xml' }],
    ['list']
  ],

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

  // Test projects for different browsers and scenarios
  projects: [
    // ============================================================================
    // CORE BROWSER TESTS
    // ============================================================================

    {
      name: 'chromium-section7',
      testMatch: '**/section7.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      }
    },

    {
      name: 'firefox-section7',
      testMatch: '**/section7.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      }
    },

    {
      name: 'webkit-section7',
      testMatch: '**/section7.spec.ts',
      use: {
        ...devices['Desktop Safari'],
        // Safari-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      }
    },

    // ============================================================================
    // MOBILE BROWSER TESTS
    // ============================================================================

    {
      name: 'mobile-chrome-section7',
      testMatch: '**/section7.spec.ts',
      use: {
        ...devices['Pixel 5'],
        // Mobile Chrome settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      }
    },

    {
      name: 'mobile-safari-section7',
      testMatch: '**/section7.spec.ts',
      use: {
        ...devices['iPhone 12'],
        // Mobile Safari settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      }
    },

    // ============================================================================
    // PERFORMANCE TESTS
    // ============================================================================

    {
      name: 'performance-section7',
      testMatch: '**/section7.spec.ts',
      grep: /@performance/,
      use: {
        ...devices['Desktop Chrome'],
        // Performance-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      timeout: 120000 // Extended timeout for performance tests
    },

    // ============================================================================
    // ACCESSIBILITY TESTS
    // ============================================================================

    {
      name: 'accessibility-section7',
      testMatch: '**/section7.spec.ts',
      grep: /@accessibility/,
      use: {
        ...devices['Desktop Chrome'],
        // Accessibility-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      }
    }
  ],

  // ============================================================================
  // TEST CONFIGURATION
  // ============================================================================

  // Output directory for test results
  outputDir: 'test-results/section7',

  // Test metadata
  metadata: {
    testType: 'section7-residence-history',
    version: '1.0.0',
    description: 'Comprehensive tests for SF-86 Section 7 (Where You Have Lived)'
  },

  // Web server configuration for local testing
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },

  // Test filtering
  grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,
  grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined
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
    ['html', { outputFolder: 'test-results/section7-html' }],
    ['junit', { outputFile: 'test-results/section7-junit.xml' }]
  ]
});

// ============================================================================
// TEST TAGS AND ANNOTATIONS
// ============================================================================

/**
 * Test tags for organizing and filtering Section 7 tests
 */
export const SECTION7_TEST_TAGS = {
  // Core functionality tags
  CRUD: '@crud',
  VALIDATION: '@validation',
  INTEGRATION: '@integration',
  PERFORMANCE: '@performance',
  ACCESSIBILITY: '@accessibility',

  // Test type tags
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  E2E: '@e2e',

  // Browser tags
  CHROME_ONLY: '@chrome-only',
  FIREFOX_ONLY: '@firefox-only',
  WEBKIT_ONLY: '@webkit-only',
  MOBILE_ONLY: '@mobile-only',

  // Feature tags
  RESIDENCE_HISTORY: '@residence-history',
  ADDRESS_FIELDS: '@address-fields',
  DATE_RANGES: '@date-ranges',
  VERIFICATION_CONTACTS: '@verification-contacts',
  CROSS_SECTION: '@cross-section'
};

/**
 * Test annotations for metadata and configuration
 */
export const SECTION7_TEST_ANNOTATIONS = {
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
