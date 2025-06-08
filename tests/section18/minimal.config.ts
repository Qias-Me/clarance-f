/**
 * Minimal Playwright Configuration for Section 18 Tests
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/section18',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  
  use: {
    baseURL: 'http://localhost:5173',
    actionTimeout: 30000,
    navigationTimeout: 30000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        channel: 'chrome',
        headless: false,
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/section18-minimal-report' }],
  ],

  outputDir: 'test-results/section18-minimal-artifacts',
});
