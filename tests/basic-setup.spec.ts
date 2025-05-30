import { test, expect } from '@playwright/test';

/**
 * Basic Setup Test
 *
 * Simple test to verify Playwright configuration and basic functionality
 * before running the full Section29 test suite.
 */

test.describe('Basic Setup Verification', () => {
  test('should load the application successfully', async ({ page }) => {
    try {
      // Navigate to the application
      await page.goto('/');

      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      // Verify the page loaded
      expect(page.url()).toContain('localhost');

      // Check for basic page elements
      const body = await page.locator('body');
      await expect(body).toBeVisible();

      console.log('✅ Application loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load application:', error);
      throw error;
    }
  });

  test('should navigate to test routes', async ({ page }) => {
    // Navigate to basic test route
    await page.goto('/test');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on the test page
    expect(page.url()).toContain('/test');

    // Look for test page indicators
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should handle basic form interactions', async ({ page }) => {
    await page.goto('/test');
    await page.waitForLoadState('networkidle');

    // Try to find any form elements
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();

    // Log what we found for debugging
    console.log(`Found ${forms} forms, ${inputs} inputs, ${buttons} buttons`);

    // Basic assertion that the page has interactive elements
    expect(forms + inputs + buttons).toBeGreaterThan(0);
  });

  test('should verify browser capabilities', async ({ page }) => {
    await page.goto('/test');

    // Test JavaScript execution
    const jsResult = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined'
      };
    });

    expect(jsResult.localStorage).toBe(true);
    expect(jsResult.sessionStorage).toBe(true);
    expect(jsResult.userAgent).toBeTruthy();
  });
});
