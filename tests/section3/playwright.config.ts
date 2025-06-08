/**
 * Playwright Configuration for Section 3 Tests
 * 
 * Specialized configuration for comprehensive Section 3 (Place of Birth) testing
 * with enhanced error monitoring and reporting.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/section3',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/section3-html-report' }],
    ['json', { outputFile: 'test-results/section3-results.json' }],
    ['junit', { outputFile: 'test-results/section3-junit.xml' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Extended timeout for Section 3 operations */
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable console API for better error monitoring
        launchOptions: {
          args: ['--enable-logging', '--log-level=0']
        }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Test timeout */
  timeout: 60000, // 1 minute for Section 3 tests

  /* Expect timeout */
  expect: {
    timeout: 5000
  },

  /* Output directory */
  outputDir: 'test-results/section3-artifacts',
});
