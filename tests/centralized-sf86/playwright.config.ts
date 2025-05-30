/**
 * Playwright Configuration for Centralized SF-86 Form Tests
 * 
 * Comprehensive test configuration for the centralized SF-86 form implementation
 * that integrates all sections and validates the complete production-ready system.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory for centralized SF-86 tests
  testDir: '.',
  
  // Global test timeout (increased for complex form operations)
  timeout: 90000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 15000
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 3 : 1,
  
  // Opt out of parallel tests for complex integration scenarios
  workers: process.env.CI ? 2 : 1,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/centralized-sf86-html' }],
    ['json', { outputFile: 'test-results/centralized-sf86-results.json' }],
    ['junit', { outputFile: 'test-results/centralized-sf86-junit.xml' }],
    ['list'],
    ['github'] // For CI integration
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Browser context options
    viewport: { width: 1440, height: 900 },
    
    // Collect trace on failure for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording for failed tests
    video: 'retain-on-failure',
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    
    // Extended timeout for actions (for complex form operations)
    actionTimeout: 20000,
    
    // Extended timeout for navigation (for loading complex forms)
    navigationTimeout: 45000,
    
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
    // SETUP PROJECT
    // ============================================================================
    
    {
      name: 'setup',
      testMatch: '**/setup.ts',
      use: {
        ...devices['Desktop Chrome']
      }
    },

    // ============================================================================
    // CORE BROWSER TESTS
    // ============================================================================
    
    {
      name: 'chromium-centralized-sf86',
      testMatch: '**/centralized-sf86.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome-specific settings for SF-86 form
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
          reducedMotion: 'reduce' // For consistent testing
        }
      },
      dependencies: ['setup']
    },
    
    {
      name: 'firefox-centralized-sf86',
      testMatch: '**/centralized-sf86.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
          reducedMotion: 'reduce'
        }
      },
      dependencies: ['setup']
    },
    
    {
      name: 'webkit-centralized-sf86',
      testMatch: '**/centralized-sf86.spec.ts',
      use: {
        ...devices['Desktop Safari'],
        // Safari-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
          reducedMotion: 'reduce'
        }
      },
      dependencies: ['setup']
    },
    
    // ============================================================================
    // MOBILE BROWSER TESTS
    // ============================================================================
    
    {
      name: 'mobile-chrome-centralized-sf86',
      testMatch: '**/centralized-sf86.spec.ts',
      use: {
        ...devices['Pixel 5'],
        // Mobile Chrome settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      dependencies: ['setup']
    },
    
    {
      name: 'mobile-safari-centralized-sf86',
      testMatch: '**/centralized-sf86.spec.ts',
      use: {
        ...devices['iPhone 12'],
        // Mobile Safari settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      dependencies: ['setup']
    },
    
    // ============================================================================
    // PERFORMANCE TESTS
    // ============================================================================
    
    {
      name: 'performance-centralized-sf86',
      testMatch: '**/centralized-sf86.spec.ts',
      grep: /@performance/,
      use: {
        ...devices['Desktop Chrome'],
        // Performance-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      timeout: 180000, // Extended timeout for performance tests
      dependencies: ['setup']
    },
    
    // ============================================================================
    // ACCESSIBILITY TESTS
    // ============================================================================
    
    {
      name: 'accessibility-centralized-sf86',
      testMatch: '**/centralized-sf86.spec.ts',
      grep: /@accessibility/,
      use: {
        ...devices['Desktop Chrome'],
        // Accessibility-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
          reducedMotion: 'reduce',
          forcedColors: 'none'
        }
      },
      dependencies: ['setup']
    },

    // ============================================================================
    // INTEGRATION TESTS
    // ============================================================================
    
    {
      name: 'integration-centralized-sf86',
      testMatch: '**/centralized-sf86.spec.ts',
      grep: /@integration/,
      use: {
        ...devices['Desktop Chrome'],
        // Integration-specific settings
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      timeout: 120000, // Extended timeout for integration tests
      dependencies: ['setup']
    }
  ],

  // ============================================================================
  // TEST CONFIGURATION
  // ============================================================================
  
  // Output directory for test results
  outputDir: 'test-results/centralized-sf86',
  
  // Test metadata
  metadata: {
    testType: 'centralized-sf86-form',
    version: '1.0.0',
    description: 'Comprehensive tests for centralized SF-86 form implementation'
  },
  
  // Web server configuration for local testing
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180000
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
    slowMo: 200,
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
  retries: 3,
  reporter: [
    ['github'],
    ['html', { outputFolder: 'test-results/centralized-sf86-html' }],
    ['junit', { outputFile: 'test-results/centralized-sf86-junit.xml' }]
  ]
});

// ============================================================================
// TEST TAGS AND ANNOTATIONS
// ============================================================================

/**
 * Test tags for organizing and filtering centralized SF-86 tests
 */
export const CENTRALIZED_SF86_TEST_TAGS = {
  // Core functionality tags
  INITIALIZATION: '@initialization',
  NAVIGATION: '@navigation',
  ACTIONS: '@actions',
  PDF_GENERATION: '@pdf-generation',
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
  SECTION_MANAGEMENT: '@section-management',
  FORM_OPERATIONS: '@form-operations',
  ERROR_HANDLING: '@error-handling',
  USER_EXPERIENCE: '@user-experience'
};

/**
 * Test annotations for metadata and configuration
 */
export const CENTRALIZED_SF86_TEST_ANNOTATIONS = {
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
  DATA_INTEGRITY: { type: 'data-integrity', description: 'Data consistency and integrity' },
  
  // Tests that verify PDF functionality
  PDF_FUNCTIONALITY: { type: 'pdf-functionality', description: 'PDF generation and processing' }
};
