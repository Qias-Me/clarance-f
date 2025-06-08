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
    });

    // Verify test routes are accessible
    console.log('🔍 Verifying test routes...');

    // Check basic test route
    await page.goto('http://localhost:5173/test');
    await page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });
    console.log('✅ Basic test route accessible');

    // Check advanced test route
    await page.goto('http://localhost:5173/test');
    await page.waitForSelector('[data-testid="advanced-test-navigation"]', { timeout: 10000 });
    console.log('✅ Advanced test route accessible');

    // Clear any existing localStorage data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('🧹 Cleared browser storage');

    // Verify Section29Provider is working
    await page.goto('http://localhost:5173/test');
    await page.waitForSelector('[data-testid="section29-basic-form"]', { timeout: 10000 });

    // Check if context is properly initialized
    const contextInitialized = await page.evaluate(() => {
      // Check if the form status elements are present (indicates context is working)
      const formStatus = document.querySelector('[data-testid="form-status"]');
      const isDirtyElement = document.querySelector('[data-testid="is-dirty"]');
      return formStatus && isDirtyElement;
    });

    if (contextInitialized) {
      console.log('✅ Section29Provider context initialized successfully');
    } else {
      throw new Error('❌ Section29Provider context failed to initialize');
    }

    console.log('🎉 Global setup completed successfully!');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
