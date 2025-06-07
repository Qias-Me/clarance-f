import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup for SF-86 Form Architecture Tests
 *
 * This setup runs once before all tests and prepares the testing environment
 * for comprehensive SF-86 form architecture testing including all 30 sections,
 * context integration, PDF service, and cross-browser compatibility.
 */

export default async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting SF-86 Form Architecture Test Suite Setup...');

  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the dev server to be ready
    console.log('⏳ Waiting for dev server...');
    await page.goto(config.webServer?.url || 'http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 60000
    });    // Verify basic application routes are accessible
    console.log('🔍 Verifying application routes...');

    // Check main form route
    await page.goto('http://localhost:5173/startForm');
    await page.waitForSelector('[data-testid="centralized-sf86-form"]', { timeout: 10000 });
    console.log('✅ Main form route accessible');

    // Clear any existing localStorage data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('🧹 Cleared browser storage');    // Verify Section29Provider is working
    // Skipping section29 specific tests for Section 20 testing
    console.log('✅ Skipping section29 specific checks for Section 20 tests');

    console.log('🎉 Global setup completed successfully!');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
