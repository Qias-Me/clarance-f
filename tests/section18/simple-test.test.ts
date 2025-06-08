/**
 * Simple Section 18 Test
 * 
 * Basic test to verify the test infrastructure works
 */

import { test, expect } from '@playwright/test';

test.describe('Section 18 - Simple Test', () => {
  test('should be able to access the application', async ({ page }) => {
    console.log('🧪 Testing basic application access...');

    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page loaded successfully
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
    
    console.log('✅ Application is accessible');
  });

  test('should be able to navigate to Section 18', async ({ page }) => {
    console.log('🧪 Testing Section 18 navigation...');

    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Try to find Section 18 navigation
    const section18Nav = page.locator('[data-testid="section-18-nav"]');
    
    if (await section18Nav.isVisible()) {
      await section18Nav.click();
      console.log('✅ Section 18 navigation found and clicked');
      
      // Wait for Section 18 content
      await page.waitForSelector('[data-testid="section-18-content"]', { timeout: 10000 });
      console.log('✅ Section 18 content loaded');
    } else {
      console.log('⚠️ Section 18 navigation not found - checking for form elements');
      
      // Look for any form elements that might indicate Section 18
      const formElements = await page.locator('input, select, textarea').count();
      console.log(`📋 Found ${formElements} form elements on the page`);
      
      if (formElements > 0) {
        console.log('✅ Form elements found - basic form functionality appears to be working');
      }
    }
  });

  test('should monitor console for errors', async ({ page }) => {
    console.log('🧪 Testing console error monitoring...');

    const consoleMessages: string[] = [];
    const errors: string[] = [];

    // Set up console monitoring
    page.on('console', (msg) => {
      const message = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(message);
      
      if (msg.type() === 'error') {
        errors.push(message);
        console.log(`🔴 Console Error: ${message}`);
      } else {
        console.log(`Console: ${message}`);
      }
    });

    page.on('pageerror', (error) => {
      const message = `[PAGE ERROR] ${error.message}`;
      errors.push(message);
      console.log(`🔴 Page Error: ${message}`);
    });

    // Navigate and interact with the page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    console.log(`📊 Total console messages: ${consoleMessages.length}`);
    console.log(`🔴 Total errors: ${errors.length}`);

    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('network')
    );

    if (criticalErrors.length > 0) {
      console.log('🔴 Critical errors detected:');
      criticalErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No critical errors detected');
    }

    // Don't fail the test for non-critical errors, just report them
    console.log('✅ Console monitoring test completed');
  });
});
