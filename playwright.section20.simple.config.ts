import { defineConfig, devices } from '@playwright/test';

/**
 * Simple Playwright Configuration for Section 20 Testing
 * This config bypasses the problematic global setup and focuses on Section 20 tests only
 */

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ['line'],
    ['json', { outputFile: 'test-results/section20-results.json' }]
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },
  ],

  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  outputDir: 'test-results/section20/',
});
