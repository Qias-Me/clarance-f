/**
 * Simple Section 20 Navigation Test
 * 
 * Tests that the updated navigation pattern works correctly for Section 20
 */

import { test, expect } from '@playwright/test';

test.describe('Section 20 Navigation Test', () => {
  test('should navigate to Section 20 using correct button selector', async ({ page }) => {
    // Navigate to the form
    await page.goto('http://localhost:5173/startForm');
      // Wait for the form to load
    await page.waitForSelector('[data-testid="centralized-sf86-form"]');
    
    // Expand all sections to make Section 20 visible
    await page.click('[data-testid="toggle-sections-button"]');
    
    // Navigate to Section 20
    await page.click('[data-testid="section-section20-button"]');
    
    // Wait for Section 20 component to load
    await page.waitForSelector('[data-testid="section20-form"]');
    
    // Verify we're on Section 20
    await expect(page.locator('h1, h2, h3')).toContainText(/Section 20|Foreign Activities/i);
    
    console.log('✅ Section 20 navigation test passed');
  });
});
